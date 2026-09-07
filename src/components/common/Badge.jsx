// ─── Badge Component ─────────────────────────────────────────────────────────

const colorMap = {
  indigo:  'bg-indigo-100 text-indigo-700',
  violet:  'bg-violet-100 text-violet-700',
  blue:    'bg-blue-100 text-blue-700',
  purple:  'bg-purple-100 text-purple-700',
  green:   'bg-green-100 text-green-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  red:     'bg-red-100 text-red-700',
  orange:  'bg-orange-100 text-orange-700',
  slate:   'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-sky-100 text-sky-700',
};

const difficultyMap = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced:     'bg-red-100 text-red-700',
};

export default function Badge({
  children,
  color = 'indigo',
  size = 'sm',
  dot = false,
  className = '',
}) {
  const isDifficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(children);
  const colorClass = isDifficulty
    ? difficultyMap[children]
    : (colorMap[color] || colorMap.slate);

  const sizeClass = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <span className={`badge font-semibold ${colorClass} ${sizeClass} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${colorClass.includes('indigo') ? 'bg-indigo-500' : 'bg-current'}`} />
      )}
      {children}
    </span>
  );
}
