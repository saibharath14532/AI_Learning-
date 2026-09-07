// ─── Sidebar Component ───────────────────────────────────────────────────────

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Brain, Zap, Map, Layers, FileText,
  BarChart2, Flame, Award, User, Settings, LogOut, Sparkles,
  ChevronRight, ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
  { label: 'AI Tutor',      icon: Brain,           path: '/ai-tutor' },
  { label: 'Doubt Solver',  icon: Sparkles,        path: '/doubt-solver' },
  { label: 'Quiz',          icon: Zap,             path: '/quiz' },
  { label: 'Roadmap',       icon: Map,             path: '/roadmap' },
  { label: 'Flashcards',    icon: Layers,          path: '/flashcards' },
  { label: 'Notes',         icon: FileText,        path: '/notes' },
  { label: 'Progress',      icon: BarChart2,       path: '/progress' },
  { label: 'Streak',        icon: Flame,           path: '/streak' },
  { label: 'Certificates',  icon: Award,           path: '/certificates' },
  { label: 'Profile',       icon: User,            path: '/profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navList = user?.role === 'admin' 
    ? [...NAV_ITEMS, { label: 'Admin Portal', icon: ShieldAlert, path: '/admin' }]
    : NAV_ITEMS;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay lg:hidden ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Navigation">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm leading-none block">AI Learning</span>
            <span className="text-indigo-300 text-[10px] leading-none">Platform</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.initials || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name || 'Student'}</p>
              <p className="text-indigo-300 text-[10px] truncate">
                {user?.role === 'admin' ? 'System Admin' : (user?.level || 'Intermediate')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navList.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${label === 'Admin Portal' ? 'text-amber-300 font-semibold' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
