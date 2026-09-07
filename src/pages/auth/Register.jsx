import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Strength Logic
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-800', percent: 'w-0' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', percent: 'w-1/3' };
    if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', percent: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 'w-full' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Registration successful! Please check your email for the verification code.');
      navigate('/verify-email', { state: { email } });
    } else {
      setError(res.error || 'Registration failed');
      toast.error(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative font-sans">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Learning Platform</h1>
            <p className="text-slate-400 text-xs mt-1">Final Year MCA Project Evaluation</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-100 mb-1">Create Account</h2>
          <p className="text-slate-400 text-xs mb-6">Create a free student profile to get personalized roadmaps.</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-5">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="Arjun Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input bg-slate-900 border-slate-800 text-white !pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <User size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

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
                {password && (
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded text-white ${strength.color}`}>
                    {strength.label}
                  </span>
                )}
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

              {/* Password strength bar */}
              <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.color} ${strength.percent}`} />
              </div>
            </div>

            <Button type="submit" variant="gradient" fullWidth isLoading={loading} className="mt-4 py-3 text-sm">
              Register Account
            </Button>
          </form>
        </div>

        {/* Login redirect */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
