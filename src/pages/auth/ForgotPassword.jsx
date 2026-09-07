import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSuccess(true);
    toast.success('Reset link dispatched!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative font-sans">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Learning Platform</h1>
            <p className="text-slate-400 text-xs mt-1">Final Year MCA Project Evaluation</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          {!success ? (
            <>
              <h2 className="text-lg font-bold text-slate-100 mb-1">Reset Password</h2>
              <p className="text-slate-400 text-xs mb-6">Enter your email and we'll dispatch a link to reset your password.</p>

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
                      required
                    />
                    <Mail size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <Button type="submit" variant="gradient" fullWidth isLoading={loading} className="mt-2 py-3 text-sm">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-100 mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                We have dispatched a password reset link to <strong className="text-slate-200">{email}</strong>.
              </p>
              <Button onClick={() => setSuccess(false)} variant="outline" className="w-full text-slate-300 border-slate-800 hover:bg-slate-900">
                Resend Link
              </Button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-semibold">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
