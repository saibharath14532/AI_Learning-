// ─── Loader Component ────────────────────────────────────────────────────────
// Types: spinner | skeleton | ai-thinking | page | card

import { Loader2 } from 'lucide-react';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-indigo-600 ${className}`}
    />
  );
}

// ─── AI Thinking Loader ───────────────────────────────────────────────────────
export function AIThinkingLoader({ message = 'AI is thinking...' }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
      <div className="flex items-center gap-1">
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </div>
      <span className="text-sm text-indigo-600 font-medium">{message}</span>
    </div>
  );
}

// ─── Skeleton Line ────────────────────────────────────────────────────────────
export function SkeletonLine({ width = 'full', height = 'h-4', className = '' }) {
  const widthMap = {
    full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3', '2/3': 'w-2/3',
  };
  return (
    <div className={`skeleton ${height} ${widthMap[width] || 'w-full'} ${className}`} />
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="3/4" />
          <SkeletonLine width="1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine />
        <SkeletonLine width="3/4" />
        <SkeletonLine width="1/2" height="h-3" />
      </div>
    </div>
  );
}

// ─── Page Loader ──────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

// ─── Default export ───────────────────────────────────────────────────────────
export default function Loader({ type = 'spinner', ...props }) {
  if (type === 'ai')       return <AIThinkingLoader {...props} />;
  if (type === 'skeleton') return <SkeletonCard {...props} />;
  if (type === 'page')     return <PageLoader {...props} />;
  return <Spinner {...props} />;
}
