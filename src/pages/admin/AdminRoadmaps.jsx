import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRoadmaps() {
      try {
        setLoading(true);
        const res = await adminAPI.getRoadmaps({ page, limit: 15 });
        if (isMounted && res?.success) {
          setRoadmaps(res.roadmaps);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch admin roadmaps:', err);
          setLoading(false);
        }
      }
    }
    loadRoadmaps();
    return () => { isMounted = false; };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-base font-bold text-slate-800">System Learning Roadmaps</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Overview of all AI-generated learning roadmaps created by students ({total} Total).
        </p>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading roadmap records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Subject / Goal</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roadmaps.length > 0 ? (
                  roadmaps.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-800">
                        {r.subject || r.goal}
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/users/${r.user?._id || r.user?.id}`} className="font-semibold text-indigo-600 hover:underline">
                          {r.user?.name || 'Student'}
                        </Link>
                        <p className="text-[10px] text-slate-400">{r.user?.email}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${r.progress || 0}%` }} />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700">{r.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {r.progress === 100 ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-400 font-medium">
                        {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No roadmaps found in MongoDB.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
            <span className="text-slate-400 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg border text-slate-600 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg border text-slate-600 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
