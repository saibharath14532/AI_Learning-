import { Brain } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

export default function AITutor() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI Tutor" subtitle="Interactive subject summaries and topic breakdowns" />
      <div className="card py-16">
        <EmptyState
          icon={Brain}
          title="AI Tutor Module"
          description="Synthesize topics, request real-world analogies, and view code diagrams. Built in Stage 3."
          actionText="Coming in Stage 3"
        />
      </div>
    </div>
  );
}
