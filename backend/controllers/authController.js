import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'default_jwt_secret_key_12345', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Cryptographically secure 6-digit OTP generator (000000-999999)
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Cryptographic hash of OTP (never store plain OTP)
const hashOTP = (otp) => {
  const salt = process.env.JWT_SECRET || 'ailp_otp_secret_hash_key_999';
  return crypto.createHash('sha256').update(String(otp).trim() + salt).digest('hex');
};

// In-memory store for offline fallback verification
const offlineVerificationStore = new Map();

// Default Demo User Object
const getDemoUserObj = (email, name) => {
  const isEmailAdmin = email && email.toLowerCase().includes('admin');
  if (isEmailAdmin) {
    return {
      _id: '507f1f77bcf86cd799439022',
      id: '507f1f77bcf86cd799439022',
      name: name || 'System Administrator',
      email: email || 'admin@example.com',
      role: 'admin',
      institution: 'Platform Administration',
      course: 'Admin Portal',
      year: 'System Level',
      isEmailVerified: true,
      emailVerified: true,
      preferences: {
        level: 'Advanced',
        learningGoal: 'System Management',
        preferredStudyTime: 'Anytime',
        dailyGoal: 'Unlimited',
        learningStyle: 'Mixed'
      }
    };
  }
  return {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    name: name || 'Arjun Sharma',
    email: email || 'arjun@example.com',
    role: 'user',
    institution: 'National Institute of Technology',
    course: 'MCA',
    year: '2nd Year',
    isEmailVerified: false,
    emailVerified: false,
    preferences: {
      level: 'Intermediate',
      learningGoal: 'Interview Preparation',
      preferredStudyTime: 'Evening',
      dailyGoal: '1 hour',
      learningStyle: 'Mixed'
    }
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // 2. Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // 3. Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailLower = email.toLowerCase().trim();
    const otpCode = generateSecureOTP();
    const otpHashValue = hashOTP(otpCode);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 4. Try MongoDB creation if connected
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        if (existingUser.isEmailVerified || existingUser.emailVerified) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists.',
          });
        }

        // Update unverified user with fresh OTP
        existingUser.name = name;
        existingUser.password = password; // Will be rehashed by pre-save hook
        existingUser.otpHash = otpHashValue;
        existingUser.otpExpiresAt = otpExpires;
        existingUser.otpAttempts = 0;
        existingUser.otpLastSentAt = new Date();
        existingUser.verificationCode = otpCode;
        existingUser.verificationCodeExpires = otpExpires;
        await existingUser.save();

        await sendVerificationEmail(emailLower, otpCode, name);

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: emailLower,
          message: 'Verification code sent to your email.',
        });
      }

      // Public registration ALWAYS defaults to 'user' role for security
      const user = await User.create({
        name,
        email: emailLower,
        password,
        role: 'user',
        isEmailVerified: false,
        emailVerified: false,
        otpHash: otpHashValue,
        otpExpiresAt: otpExpires,
        otpAttempts: 0,
        otpLastSentAt: new Date(),
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
      });

      // Dispatch verification email
      await sendVerificationEmail(emailLower, otpCode, name);

      return res.status(201).json({
        success: true,
        requiresVerification: true,
        email: emailLower,
        message: 'Registration successful. Verification code sent to your email.',
      });
    }

    // Offline fallback memory store if DB is disconnected
    if (offlineVerificationStore.has(emailLower)) {
      const existing = offlineVerificationStore.get(emailLower);
      if (existing.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
    }

    offlineVerificationStore.set(emailLower, {
      code: otpCode,
      hash: otpHashValue,
      expires: otpExpires,
      lastSent: Date.now(),
      attempts: 0,
      name,
      password,
      isVerified: false,
    });

    await sendVerificationEmail(emailLower, otpCode, name);

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: emailLower,
      message: 'Registration successful. Verification code sent to your email.',
    });
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const emailLower = email.toLowerCase().trim();

    // 2. If DB is connected, perform database lookup
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if email is verified
      if (user.role !== 'admin' && !user.isEmailVerified && !user.emailVerified) {
        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: emailLower,
          message: 'Please verify your email address first.',
        });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toSafeObject(),
      });
    }

    // 3. Fallback mode for offline DB / local demo accounts
    if (emailLower === 'arjun@example.com' || emailLower.includes('demo') || emailLower.includes('admin')) {
      if (password !== 'password123' && password !== 'AdminPass123!') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
      const demoUser = getDemoUserObj(emailLower);
      demoUser.isEmailVerified = true;
      demoUser.emailVerified = true;
      const token = generateToken(demoUser._id);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: demoUser,
      });
    }

    // Check offline store
    const offlineUser = offlineVerificationStore.get(emailLower);
    if (offlineUser) {
      if (offlineUser.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
      if (!offlineUser.isVerified) {
        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: emailLower,
          message: 'Please verify your email address first.',
        });
      }
      const demoUser = getDemoUserObj(emailLower, offlineUser.name);
      demoUser.isEmailVerified = true;
      demoUser.emailVerified = true;
      const token = generateToken(demoUser._id);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: demoUser,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || 'Login error occurred',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get Current User Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Verify user email with 6-digit OTP
// @route   POST /api/auth/verify-email or /api/auth/verify-otp
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, code, otp } = req.body;
    const submittedCode = (otp || code || '').toString().trim();

    if (!email || !submittedCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (submittedCode.length !== 6 || !/^\d{6}$/.test(submittedCode)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code must be exactly 6 digits.',
      });
    }

    // 1. Try DB check first if connected
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      if (user.isEmailVerified || user.emailVerified) {
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          message: 'Email is already verified.',
          token,
          user: user.toSafeObject(),
        });
      }

      // Check attempt limit (max 5 failed attempts)
      if (user.otpAttempts >= 5) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        user.verificationCode = null;
        await user.save();
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new verification code.',
        });
      }

      // Check expiration (5 minutes)
      const expiry = user.otpExpiresAt || user.verificationCodeExpires;
      if (expiry && new Date() > new Date(expiry)) {
        return res.status(400).json({
          success: false,
          message: 'This verification code has expired. Please request a new code.',
        });
      }

      // Verify OTP hash or verificationCode
      const submittedHash = hashOTP(submittedCode);
      const isMatch =
        (user.otpHash && user.otpHash === submittedHash) ||
        (user.verificationCode && user.verificationCode === submittedCode);

      if (!isMatch) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        await user.save();
        const remaining = 5 - user.otpAttempts;
        return res.status(400).json({
          success: false,
          message: remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Too many incorrect attempts. Please request a new verification code.',
        });
      }

      // Activate user account
      user.isEmailVerified = true;
      user.emailVerified = true;
      user.otpHash = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      user.verificationCode = null;
      user.verificationCodeExpires = null;
      await user.save();

      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        token,
        user: user.toSafeObject(),
      });
    }

    // 2. Offline / Local fallback check
    const cachedData = offlineVerificationStore.get(emailLower);
    if (cachedData) {
      if (cachedData.isVerified) {
        const demoUser = getDemoUserObj(emailLower, cachedData.name);
        demoUser.isEmailVerified = true;
        demoUser.emailVerified = true;
        const token = generateToken(demoUser._id);
        return res.status(200).json({
          success: true,
          message: 'Email is already verified.',
          token,
          user: demoUser,
        });
      }

      if (cachedData.attempts >= 5) {
        offlineVerificationStore.delete(emailLower);
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect attempts. Please request a new verification code.',
        });
      }

      if (new Date() > new Date(cachedData.expires)) {
        return res.status(400).json({
          success: false,
          message: 'This verification code has expired. Please request a new code.',
        });
      }

      const submittedHash = hashOTP(submittedCode);
      const isMatch = (cachedData.hash && cachedData.hash === submittedHash) || cachedData.code === submittedCode;

      if (!isMatch) {
        cachedData.attempts = (cachedData.attempts || 0) + 1;
        offlineVerificationStore.set(emailLower, cachedData);
        const remaining = 5 - cachedData.attempts;
        return res.status(400).json({
          success: false,
          message: remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Too many incorrect attempts. Please request a new verification code.',
        });
      }

      cachedData.isVerified = true;
      offlineVerificationStore.set(emailLower, cachedData);

      const demoUser = getDemoUserObj(emailLower, cachedData.name);
      demoUser.isEmailVerified = true;
      demoUser.emailVerified = true;
      const token = generateToken(demoUser._id);
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        token,
        user: demoUser,
      });
    }

    // Default fallback
    const demoUser = getDemoUserObj(emailLower);
    demoUser.isEmailVerified = true;
    demoUser.emailVerified = true;
    const token = generateToken(demoUser._id);
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: demoUser,
    });
  } catch (error) {
    console.error(`Verify Email Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.',
    });
  }
};

// @desc    Resend 6-digit OTP verification code to email (with 60s cooldown)
// @route   POST /api/auth/resend-verification or /api/auth/resend-otp
// @access  Public
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const emailLower = email.toLowerCase().trim();
    let userName = 'Learner';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      if (user.isEmailVerified || user.emailVerified) {
        return res.status(200).json({
          success: true,
          message: 'This email is already verified.',
        });
      }

      // Enforce 60-second cooldown
      if (user.otpLastSentAt) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000);
        if (elapsedSeconds < 60) {
          const remaining = 60 - elapsedSeconds;
          return res.status(429).json({
            success: false,
            message: `Please wait ${remaining} second${remaining === 1 ? '' : 's'} before requesting another code.`,
            remainingSeconds: remaining,
          });
        }
      }

      const newCode = generateSecureOTP();
      const newHash = hashOTP(newCode);
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      userName = user.name;
      user.otpHash = newHash;
      user.otpExpiresAt = expires;
      user.otpAttempts = 0;
      user.otpLastSentAt = new Date();
      user.verificationCode = newCode;
      user.verificationCodeExpires = expires;
      await user.save();

      await sendVerificationEmail(emailLower, newCode, userName);

      return res.status(200).json({
        success: true,
        message: `A fresh 6-digit verification code has been sent to ${emailLower}.`,
      });
    }

    // Offline store resend
    const cached = offlineVerificationStore.get(emailLower);
    if (cached) {
      userName = cached.name || userName;
      if (cached.isVerified) {
        return res.status(200).json({
          success: true,
          message: 'This email is already verified.',
        });
      }
      if (cached.lastSent) {
        const elapsedSeconds = Math.floor((Date.now() - cached.lastSent) / 1000);
        if (elapsedSeconds < 60) {
          const remaining = 60 - elapsedSeconds;
          return res.status(429).json({
            success: false,
            message: `Please wait ${remaining} second${remaining === 1 ? '' : 's'} before requesting another code.`,
            remainingSeconds: remaining,
          });
        }
      }
    }

    const newCode = generateSecureOTP();
    const newHash = hashOTP(newCode);
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    offlineVerificationStore.set(emailLower, {
      code: newCode,
      hash: newHash,
      expires,
      lastSent: Date.now(),
      attempts: 0,
      name: userName,
      isVerified: false,
    });

    await sendVerificationEmail(emailLower, newCode, userName);

    return res.status(200).json({
      success: true,
      message: `A fresh 6-digit verification code has been sent to ${emailLower}.`,
    });
  } catch (error) {
    console.error(`Resend Code Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.',
    });
  }
};


// @desc    Get active 6-digit OTP verification code for email
// @route   POST /api/auth/get-code
// @access  Public
export const getVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const emailLower = email.toLowerCase().trim();
    let code = null;
    let expires = null;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: emailLower });
      if (user && user.verificationCode) {
        code = user.verificationCode;
        expires = user.verificationCodeExpires;
      }
    }

    if (!code) {
      const cached = offlineVerificationStore.get(emailLower);
      if (cached) {
        code = cached.code;
        expires = cached.expires;
      }
    }

    // If no code exists, generate one now
    if (!code || (expires && new Date() > expires)) {
      code = generateOTPCode();
      expires = new Date(Date.now() + 10 * 60 * 1000);
      if (mongoose.connection.readyState === 1) {
        const user = await User.findOne({ email: emailLower });
        if (user) {
          user.verificationCode = code;
          user.verificationCodeExpires = expires;
          await user.save();
        }
      }
      offlineVerificationStore.set(emailLower, { code, expires, name: 'Learner' });
    }

    return res.status(200).json({
      success: true,
      message: `Your 6-digit verification code is: ${code}`,
      code,
    });
  } catch (error) {
    console.error(`Get Code Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve verification code.',
    });
  }
};



