import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading, switchToAdmin } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    const handleSwitch = () => {
      switchToAdmin();
      toast.success('Switched to System Administrator role!');
    };

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500" />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400 text-sm mb-6">
            You are currently signed in as <span className="text-slate-200 font-semibold">{user?.name || user?.email}</span> ({user?.role || 'student'}). Administrator privileges are required to access the System Admin Console.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="gradient"
              onClick={handleSwitch}
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              <UserCheck size={18} /> Switch to Admin Account (Demo)
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-300"
            >
              <ArrowLeft size={16} /> Return to Student Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

