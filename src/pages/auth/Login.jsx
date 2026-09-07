import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, demoCredentials, demoAdminCredentials } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setRequiresVerification(false);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in successfully!');
      if (res.user?.role === 'admin' || email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      if (res.requiresVerification || res.error?.includes('verify')) {
        setRequiresVerification(true);
        setError('Please verify your email address first before logging in.');
        toast.error('Email verification required.');
      } else {
        setError(res.error || 'Invalid credentials');
        toast.error(res.error || 'Login failed.');
      }
    }
  };

  const handleDemoFill = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError('');
    setRequiresVerification(false);
  };

  const handleAdminDemoFill = () => {
    setEmail(demoAdminCredentials?.email || 'admin@example.com');
    setPassword(demoAdminCredentials?.password || 'password123');
    setError('');
    setRequiresVerification(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative font-sans">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Learning Platform</h1>
            <p className="text-slate-400 text-xs mt-1">Final Year MCA Project Evaluation</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-100 mb-1">Sign In</h2>
          <p className="text-slate-400 text-xs mb-6">Enter your details to access the platform.</p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-5 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {requiresVerification && (
                <button
                  type="button"
                  onClick={() => navigate('/verify-email', { state: { email } })}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors mt-2"
                >
                  Verify Email Address Now
                </button>
              )}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="arjun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input bg-slate-900 border-slate-800 text-white !pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Mail size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-300 text-xs font-semibold" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input bg-slate-900 border-slate-800 text-white !pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Lock size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button type="submit" variant="gradient" fullWidth isLoading={loading} className="mt-2 py-3 text-sm">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <span className="text-slate-500 text-[11px] block mb-2.5">Testing or Grading the Project?</span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <Sparkles size={13} className="text-indigo-400" /> Student Demo
              </button>
              <button
                type="button"
                onClick={handleAdminDemoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-all active:scale-[0.98]"
              >
                <Sparkles size={13} className="text-amber-400" /> Admin Demo
              </button>
            </div>
          </div>

        </div>

        {/* Register Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
