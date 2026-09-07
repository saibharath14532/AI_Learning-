import React from 'react';
import { KeyRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

export default function ForgotPassword() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Forgot Password" 
        subtitle="AI-Powered Personalized Learning Platform" 
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'ForgotPassword' }]}
      />
      <Card className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <KeyRound size={32} className="text-indigo-600 animate-pulse-glow" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password</h2>
        <p className="text-slate-500 max-w-md">Reset your password to resume learning.</p>
      </Card>
    </div>
  );
}
