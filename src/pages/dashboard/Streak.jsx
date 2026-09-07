import { Flame } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

export default function Streak() {
  return (
    <div className="space-y-6">
      <PageHeader title="Gamified Streaks" subtitle="Build consistent daily habits to earn rewards" />
      <div className="card py-16">
        <EmptyState
          icon={Flame}
          title="Daily Study Streak"
          description="Log daily activity, maintain hot streaks, and unlock unique profile titles. Built in Stage 6."
          actionText="Coming in Stage 6"
        />
      </div>
    </div>
  );
}
