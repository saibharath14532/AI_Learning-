import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Map, Zap, Layers, FileText,
  Award, BarChart2, ShieldCheck
} from 'lucide-react';

const ADMIN_TABS = [
  { label: 'Overview',  icon: LayoutDashboard, path: '/admin' },
  { label: 'Users',     icon: Users,           path: '/admin/users' },
  { label: 'Analytics', icon: BarChart2,       path: '/admin/analytics' },
];

export default function AdminLayout() {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">System Admin Console</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                  Administrator
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Monitor user accounts, learning progress aggregations, and platform analytics in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-white/10 no-scrollbar">
          {ADMIN_TABS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-indigo-950 shadow-md scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={14} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Admin Sub-Page Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
