// ─── PageHeader Component ────────────────────────────────────────────────────

import { ChevronRight } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  breadcrumb = [],   // [{ label, href? }]
  action = null,     // JSX to render in top-right
  className = '',
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight size={12} className="text-slate-400" />}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-indigo-600 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className={idx === breadcrumb.length - 1 ? 'text-slate-700 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
