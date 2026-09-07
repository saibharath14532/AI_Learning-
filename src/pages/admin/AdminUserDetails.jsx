import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Map, Zap, Layers, FileText, Award,
  Flame, Calendar, Clock, BookOpen, ShieldAlert
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminUserDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        setLoading(true);
        const res = await adminAPI.getUserDetails(id);
        if (isMounted) {
          if (res?.success) {
            setData(res);
          } else {
            setError(res?.message || 'Failed to load user details');
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching admin user details:', err);
          setError(err.message || 'User not found');
          setLoading(false);
        }
      }
    }
    loadUser();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading student learning metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
          <ArrowLeft size={14} /> Back to Users List
        </Link>
        <div className="card p-6 bg-red-50 text-red-700 border border-red-200">
          <p className="font-bold text-sm">User Details Error</p>
          <p className="text-xs mt-1">{error || 'Could not find user'}</p>
        </div>
      </div>
    );
  }

  const user = data?.user || {};
  const statistics = data?.statistics || {
    roadmaps: 0,
    completedRoadmaps: 0,
    quizzesTaken: 0,
    averageQuizScore: 0,
    flashcardSets: 0,
    notes: 0,
    currentStreak: 0,
    longestStreak: 0,
    certificates: 0,
  };
  const recentActivity = Array.isArray(data?.recentActivity)
    ? data.recentActivity
    : Array.isArray(data?.activity)
    ? data.activity
    : [];

  const statCards = [
    { label: 'Total Roadmaps', val: `${statistics.completedRoadmaps || 0} / ${statistics.roadmaps || 0} completed`, icon: Map, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Quizzes Taken', val: `${statistics.quizzesTaken || 0} attempts (${statistics.averageQuizScore || 0}% avg)`, icon: Zap, color: 'text-amber-600 bg-amber-50' },
    { label: 'Flashcard Sets', val: `${statistics.flashcardSets || 0} sets`, icon: Layers, color: 'text-purple-600 bg-purple-50' },
    { label: 'Study Notes', val: `${statistics.notes || 0} generated`, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Study Streak', val: `${statistics.currentStreak || 0} day streak (${statistics.longestStreak || 0} max)`, icon: Flame, color: 'text-orange-600 bg-orange-50' },
    { label: 'Certificates', val: `${statistics.certificates || 0} earned`, icon: Award, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Users Management</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">User ID: {user.id || user._id || id}</span>
      </div>

      {/* User Info Header Card */}
      <div className="card p-6 bg-white border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {user.initials || user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user.name || 'Student Account'}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                user.role === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {user.role === 'admin' ? 'Admin User' : 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email || 'No email registered'}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
              <span>📚 {user.course || 'MCA'}</span>
              <span>•</span>
              <span>🏫 {user.institution || 'Engineering College'}</span>
              <span>•</span>
              <span>🎯 Goal: {user.learningGoal || 'General'}</span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 text-xs text-slate-400 space-y-1">
          <p><span className="font-semibold text-slate-600">Level:</span> {user.level || 'Intermediate'}</p>
          <p><span className="font-semibold text-slate-600">Registered:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      {/* Learning Statistics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{card.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified User Activity Stream */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Real Learning Activity History</h3>
        <p className="text-xs text-slate-500">Aggregated timeline of quizzes completed, notes generated, roadmaps updated, and certificates earned.</p>

        <div className="space-y-3 mt-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((act, index) => (
              <div key={act.id || act._id || index} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] uppercase">
                    {act.type ? String(act.type).slice(0, 2) : 'AC'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{act.description || act.action || 'Learning Activity'}</p>
                    <span className="text-[10px] text-slate-400 font-medium">Type: {act.type || 'Activity'}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {act.date || act.timestamp ? new Date(act.date || act.timestamp).toLocaleString() : 'Recently'}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent learning activities recorded for this student yet.
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
