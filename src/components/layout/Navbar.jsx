// ─── Navbar Component ────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, Search, Bell, ChevronDown, User, Settings, LogOut,
  BookOpen, X, Sparkles,
} from 'lucide-react';

const QUICK_SEARCH = [
  { label: 'Binary Trees', type: 'Topic', path: '/ai-tutor' },
  { label: 'Dynamic Programming', type: 'Topic', path: '/ai-tutor' },
  { label: 'Data Structures Quiz', type: 'Quiz', path: '/quiz' },
  { label: 'Full Stack Roadmap', type: 'Roadmap', path: '/roadmap' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Quiz Reminder', message: 'You haven\'t practiced today!', time: '5m ago', read: false },
  { id: 2, title: 'Streak Alert', message: 'Keep your 7-day streak alive!', time: '1h ago', read: false },
  { id: 3, title: 'New Certificate', message: 'DSA Certificate is ready to download.', time: '2h ago', read: true },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]     = useState('');
  const [showSearch, setShowSearch]       = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [showProfile, setShowProfile]     = useState(false);

  const notifsRef  = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = QUICK_SEARCH.filter((q) =>
    q.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header
      className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30 shadow-sm"
      role="banner"
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search topics, quizzes, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            aria-label="Search"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {showSearch && searchQuery && (
          <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setShowSearch(false); setSearchQuery(''); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <BookOpen size={15} className="text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">No results for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              {MOCK_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                    <div className={!n.read ? '' : 'ml-4'}>
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Profile menu"
            aria-expanded={showProfile}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.initials || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700">
              {user?.firstName || 'Student'}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Admin
                  </span>
                )}
              </div>
              <div className="py-1.5">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => { navigate('/admin'); setShowProfile(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50/50 hover:bg-amber-100/60 transition-colors"
                  >
                    <Sparkles size={15} className="text-amber-500" /> Admin Console
                  </button>
                )}
                <button
                  onClick={() => { navigate('/profile'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={15} className="text-slate-400" /> My Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={15} className="text-slate-400" /> Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
