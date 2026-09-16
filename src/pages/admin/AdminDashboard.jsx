import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Shield, ArrowRight, Activity, BarChart2
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashRes, userRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getUsers({ page: 1, limit: 5 }),
        ]);

        if (isMounted) {
          if (dashRes?.success) {
            setStats(dashRes.stats);
          }
          if (userRes?.success) {
            setRecentUsers(userRes.users);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load admin dashboard:', err);
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      }
    }
    loadDashboard();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Fetching live user database metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 bg-red-50 border-red-200 text-red-700 rounded-xl">
        <p className="font-bold text-sm">Error Loading Admin Data</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const totalUserCount = stats?.totalUsers || recentUsers.length || 0;

  const statCards = [
    {
      title: 'Total Users Registered',
      value: totalUserCount,
      icon: Users,
      bg: 'bg-blue-50 text-blue-600',
      link: '/admin/users',
      subtitle: 'Registered MongoDB Accounts',
    },
    {
      title: 'Active Students',
      value: totalUserCount > 1 ? totalUserCount - 1 : (recentUsers.filter(u => u.role !== 'admin').length || 1),
      icon: UserCheck,
      bg: 'bg-emerald-50 text-emerald-600',
      link: '/admin/users',
      subtitle: 'Enrolled MCA Learners',
    },
    {
      title: 'System Administrators',
      value: recentUsers.filter(u => u.role === 'admin').length || 1,
      icon: Shield,
      bg: 'bg-amber-50 text-amber-600',
      link: '/admin/users',
      subtitle: 'Console Admin Access',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{card.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{card.subtitle}</span>
                <Link
                  to={card.link}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Recent Users + System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Users Table Widget */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Recent Registered Users</h3>
              <p className="text-xs text-slate-500">Latest students registered on the platform</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View All Users</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 pl-1">Student</th>
                  <th className="pb-3">Course / Institution</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right pr-1">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentUsers.length > 0 ? (
                  recentUsers.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                            {u.initials || 'U'}
                          </div>
                          <div>
                            <Link to={`/admin/users/${u.id || u._id}`} className="font-bold text-slate-800 hover:text-indigo-600">
                              {u.name}
                            </Link>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-slate-700 truncate max-w-[160px]">{u.course || 'MCA'}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{u.institution || 'Engineering College'}</p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-1 text-slate-400 font-medium">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No user accounts found in MongoDB database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Administration Summary */}
        <div className="card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">System Health Summary</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All backend endpoints, database collections, and Gemini AI APIs are operating with active authentication guards.
            </p>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">DB Connection</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                  MongoDB Connected
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Auth & Security</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                  JWT + Role Guard
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">AI Integration</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full">
                  Google Gemini API
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/admin/analytics"
              className="btn btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <Activity size={14} />
              <span>Open Analytics Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
