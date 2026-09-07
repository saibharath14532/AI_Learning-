import React from 'react';
import { LogIn } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

export default function Login() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Login" 
        subtitle="AI-Powered Personalized Learning Platform" 
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Login' }]}
      />
      <Card className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <LogIn size={32} className="text-indigo-600 animate-pulse-glow" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Login</h2>
        <p className="text-slate-500 max-w-md">Sign in to access your customized learning space.</p>
      </Card>
    </div>
  );
}
