// ─── EmptyState Component ────────────────────────────────────────────────────

import { BookOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
