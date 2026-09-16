import React, { useState, useEffect } from 'react';
import { Activity, Users, Zap, Map, Award, TrendingUp, Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await adminAPI.getAnalytics();
        if (isMounted && res?.success) {
          setData(res.analytics);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch admin analytics:', err);
          setLoading(false);
        }
      }
    }
    loadAnalytics();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-semibold">
        Aggregating system analytics from MongoDB collections...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-6 bg-red-50 text-red-700 text-xs font-bold">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-base font-bold text-slate-800">Platform Analytics & Growth Metrics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real MongoDB aggregation across all student interactions, growth rates, and activity metrics.
        </p>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-100">Total Registered Users</p>
            <Users size={18} className="text-indigo-200" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{data.totalUsers ?? 0}</p>
          <div className="mt-3 pt-2 border-t border-indigo-400/30 flex items-center justify-between text-[11px] text-indigo-100">
            <span>Last 7 Days: +{data.newUsersLast7Days ?? 0}</span>
            <span>Last 30 Days: +{data.newUsersLast30Days ?? 0}</span>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-violet-100">Active Students (7D)</p>
            <Activity size={18} className="text-violet-200" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{data.activeUsers7Days ?? 0}</p>
          <p className="text-[11px] text-violet-100 mt-3 pt-2 border-t border-violet-400/30">
            Distinct users active in quizzes or learning
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-100">Quiz Attempts & Avg</p>
            <Zap size={18} className="text-amber-200" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{data.totalQuizAttempts ?? 0}</p>
          <p className="text-[11px] text-amber-100 mt-3 pt-2 border-t border-amber-400/30">
            Average Score: {data.avgQuizScore ?? 0}%
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-100">Completed Roadmaps</p>
            <Award size={18} className="text-emerald-200" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{data.completedRoadmaps ?? 0}</p>
          <p className="text-[11px] text-emerald-100 mt-3 pt-2 border-t border-emerald-400/30">
            Certificates Issued: {data.totalCertificates ?? 0}
          </p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">User Registration Growth</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">Total Registered Accounts</span>
              <span className="font-bold text-indigo-600 text-sm">{data.totalUsers ?? 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">New Registrations (Past 7 Days)</span>
              <span className="font-bold text-emerald-600 text-sm">+{data.newUsersLast7Days ?? 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">New Registrations (Past 30 Days)</span>
              <span className="font-bold text-blue-600 text-sm">+{data.newUsersLast30Days ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">Learning Performance Analytics</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">Total Quiz Attempts Evaluated</span>
              <span className="font-bold text-amber-600 text-sm">{data.totalQuizAttempts ?? 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">Overall Average Quiz Score</span>
              <span className="font-bold text-violet-600 text-sm">{data.avgQuizScore ?? 0}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-slate-700">Roadmaps Reaching 100% Completion</span>
              <span className="font-bold text-emerald-600 text-sm">{data.completedRoadmaps ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
