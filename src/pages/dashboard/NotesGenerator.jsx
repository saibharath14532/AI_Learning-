import { FileText } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

export default function NotesGenerator() {
  return (
    <div className="space-y-6">
      <PageHeader title="Study Notes" subtitle="AI-generated summaries and documentation" />
      <div className="card py-16">
        <EmptyState
          icon={FileText}
          title="Notes Generator"
          description="Download PDF outlines, syntax summaries, and reference sheets. Coming in Stage 5."
          actionText="Coming in Stage 5"
        />
      </div>
    </div>
  );
}
