import React from 'react';
import { BarChart2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

export default function Progress() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Progress" 
        subtitle="AI-Powered Personalized Learning Platform" 
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Progress' }]}
      />
      <Card className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <BarChart2 size={32} className="text-indigo-600 animate-pulse-glow" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Progress</h2>
        <p className="text-slate-500 max-w-md">Track your study hours, quiz scores, and subject competencies.</p>
      </Card>
    </div>
  );
}
