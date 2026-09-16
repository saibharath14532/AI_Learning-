// ─── MobileNavigation Component ──────────────────────────────────────────────
// Bottom tab bar for mobile viewports

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Brain, Zap, Map, BarChart2, Users,
} from 'lucide-react';

const USER_MOBILE_TABS = [
  { label: 'Home',     icon: LayoutDashboard, path: '/dashboard' },
  { label: 'AI Tutor', icon: Brain,           path: '/ai-tutor' },
  { label: 'Quiz',     icon: Zap,             path: '/quiz' },
  { label: 'Roadmap',  icon: Map,             path: '/roadmap' },
  { label: 'Progress', icon: BarChart2,       path: '/progress' },
];

const ADMIN_MOBILE_TABS = [
  { label: 'Admin',     icon: LayoutDashboard, path: '/admin' },
  { label: 'Users',     icon: Users,           path: '/admin/users' },
  { label: 'Analytics', icon: BarChart2,       path: '/admin/analytics' },
];

export default function MobileNavigation() {
  const { user } = useAuth();
  const tabs = user?.role === 'admin' ? ADMIN_MOBILE_TABS : USER_MOBILE_TABS;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg"
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {tabs.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-indigo-600' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
