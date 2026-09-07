import { Zap } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

export default function Quiz() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI Quizzes" subtitle="Test your understanding with dynamically generated tests" />
      <div className="card py-16">
        <EmptyState
          icon={Zap}
          title="Quiz Generator"
          description="Evaluate subject progress, track scores, and identify key learning gaps. Built in Stage 4."
          actionText="Coming in Stage 4"
        />
      </div>
    </div>
  );
}
