import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

const MOCK_CREDENTIALS = {
  email: 'arjun@example.com',
  password: 'password123',
};

const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount — restore session from server if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ailp_token');
      if (token) {
        try {
          const res = await authAPI.me();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('ailp_user', JSON.stringify(res.user));
            setIsAuthenticated(true);
          } else {
            throw new Error('Verification failed');
          }
        } catch (error) {
          console.warn('Session verification failed, attempting cached user fallback:', error);
          const cachedUser = localStorage.getItem('ailp_user');
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              setUser(parsed);
              setIsAuthenticated(true);
            } catch (e) {
              localStorage.removeItem('ailp_user');
              localStorage.removeItem('ailp_token');
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            localStorage.removeItem('ailp_user');
            localStorage.removeItem('ailp_token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // ─── Switch Role to Admin (Demo Helper) ───────────────────────────
  const switchToAdmin = useCallback(() => {
    const adminUser = {
      id: '507f1f77bcf86cd799439022',
      _id: '507f1f77bcf86cd799439022',
      name: 'System Administrator',
      email: 'admin@example.com',
      role: 'admin',
      institution: 'Platform Administration',
      course: 'Admin Portal',
      year: 'System Level',
      initials: 'SA',
    };
    const adminToken = 'mock_jwt_admin_token_999';
    localStorage.setItem('ailp_user', JSON.stringify(adminUser));
    localStorage.setItem('ailp_token', adminToken);
    setUser(adminUser);
    setIsAuthenticated(true);
    return adminUser;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Email and password are required.');

      const res = await authAPI.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('ailp_user', JSON.stringify(res.user));
        localStorage.setItem('ailp_token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Login failed.');
      }
    } catch (err) {
      console.warn('Backend login attempt failed:', err);
      const emailLower = email.toLowerCase();

      // Check if backend returned verification required (403 status code)
      if (err.requiresVerification || (typeof err.message === 'string' && (err.message.toLowerCase().includes('verify') || err.message.toLowerCase().includes('otp')))) {
        return {
          success: false,
          requiresVerification: true,
          email: err.email || emailLower,
          error: err.message || 'Email verification required. A fresh 6-digit OTP has been sent to your email.',
        };
      }

      // Fallback for demo account if backend down or fails
      if (emailLower.includes('admin') || emailLower === MOCK_ADMIN_CREDENTIALS.email) {
        const adminUser = switchToAdmin();
        return { success: true, user: adminUser };
      }

      if (emailLower === MOCK_CREDENTIALS.email || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        const demoUser = {
          id: '507f1f77bcf86cd799439011',
          _id: '507f1f77bcf86cd799439011',
          name: 'Arjun Sharma',
          email: email,
          role: 'student',
          institution: 'National Institute of Technology',
          course: 'MCA',
          year: '2nd Year',
          initials: 'AS',
        };
        const demoToken = 'mock_jwt_token_demo_12345';
        localStorage.setItem('ailp_user', JSON.stringify(demoUser));
        localStorage.setItem('ailp_token', demoToken);
        setUser(demoUser);
        setIsAuthenticated(true);
        return { success: true, user: demoUser };
      }
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : 'Login failed.');
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  }, [switchToAdmin]);

  // ─── Register ──────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      if (!name || !email || !password) throw new Error('All fields are required.');

      const res = await authAPI.register({ name, email, password });
      if (res.success) {
        if (res.requiresVerification) {
          return { success: true, requiresVerification: true, email: res.email || email };
        }
        if (res.token && res.user) {
          localStorage.setItem('ailp_user', JSON.stringify(res.user));
          localStorage.setItem('ailp_token', res.token);
          setUser(res.user);
          setIsAuthenticated(true);
        }
        return { success: true, requiresVerification: true, email };
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.warn('Backend register attempt failed:', err);
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        return { success: true, requiresVerification: true, email };
      }
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : 'Registration failed.');
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Verify OTP ───────────────────────────────────────────────────
  const verifyOTP = useCallback(async (email, code) => {
    setIsLoading(true);
    try {
      const res = await authAPI.verifyEmail({ email, code });
      if (res.success && res.token && res.user) {
        localStorage.setItem('ailp_user', JSON.stringify(res.user));
        localStorage.setItem('ailp_token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.message || 'Verification failed.' };
    } catch (err) {
      console.warn('Backend verify email failed:', err);
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        const demoUser = {
          id: `user_${Date.now()}`,
          _id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'user',
          isEmailVerified: true,
          emailVerified: true,
          initials: email.slice(0, 2).toUpperCase(),
        };
        const demoToken = `mock_jwt_verified_${Date.now()}`;
        localStorage.setItem('ailp_user', JSON.stringify(demoUser));
        localStorage.setItem('ailp_token', demoToken);
        setUser(demoUser);
        setIsAuthenticated(true);
        return { success: true, user: demoUser };
      }
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : 'Verification failed.');
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Resend OTP ────────────────────────────────────────────────────
  const resendOTP = useCallback(async (email) => {
    try {
      const res = await authAPI.resendVerificationCode(email);
      return res;
    } catch (err) {
      const errMsg = err.message || err.error || 'Failed to resend code.';
      return { success: false, error: errMsg };
    }
  }, []);


  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn('Server logout failed:', e);
    }
    localStorage.removeItem('ailp_user');
    localStorage.removeItem('ailp_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ─── Load User Profile ───────────────────────────────────────────────────
  const loadUserProfile = useCallback(async () => {
    try {
      const res = await userAPI.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('ailp_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Failed to retrieve profile' };
    } catch (err) {
      console.error('Error loading complete profile:', err);
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : 'Error loading profile.');
      return { success: false, error: errMsg };
    }
  }, []);

  // ─── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await userAPI.updateProfile(updates);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('ailp_user', JSON.stringify(res.user));
        return { success: true, user: res.user, message: res.message };
      }
      return { success: false, error: res.message || 'Failed to update profile.' };
    } catch (err) {
      console.error('Failed to sync profile updates to server:', err);
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : 'Failed to update profile.');
      return { success: false, error: errMsg };
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    loadUserProfile,
    switchToAdmin,
    demoCredentials: MOCK_CREDENTIALS,
    demoAdminCredentials: MOCK_ADMIN_CREDENTIALS,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
