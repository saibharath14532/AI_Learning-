// ─── ProgressBar Component ───────────────────────────────────────────────────

export default function ProgressBar({
  value = 0,        // 0–100
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'primary',
  className = '',
  animated = true,
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  const colors = {
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    success: 'bg-gradient-to-r from-emerald-400 to-green-500',
    warning: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    error:   'bg-gradient-to-r from-red-400 to-rose-500',
    blue:    'bg-gradient-to-r from-blue-400 to-indigo-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-slate-700 ml-auto">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar-track ${heights[size] || heights.md}`}>
        <div
          className={`progress-bar-fill ${colors[color] || colors.primary}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
