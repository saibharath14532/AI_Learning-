import { Settings as SettingsIcon } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="Configure system and API keys" />
      <div className="card py-16">
        <EmptyState
          icon={SettingsIcon}
          title="Account Settings"
          description="Adjust theme parameters, dark mode preferences, and Gemini API keys. Built in Stage 6."
          actionText="Coming in Stage 6"
        />
      </div>
    </div>
  );
}
