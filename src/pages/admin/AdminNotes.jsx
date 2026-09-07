import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNotes() {
      try {
        setLoading(true);
        const res = await adminAPI.getNotes({ page, limit: 15 });
        if (isMounted && res?.success) {
          setNotes(res.notes);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch admin notes:', err);
          setLoading(false);
        }
      }
    }
    loadNotes();
    return () => { isMounted = false; };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-base font-bold text-slate-800">Generated Study Notes Metadata</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Overview of AI study notes created by students ({total} Total Notes). Content is kept private.
        </p>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading notes records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Title / Topic</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Summary Preview</th>
                  <th className="pb-3">Starred</th>
                  <th className="pb-3 text-right pr-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {notes.length > 0 ? (
                  notes.map((n) => (
                    <tr key={n._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-800">
                        {n.title || n.topic}
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/users/${n.user?._id || n.user?.id}`} className="font-semibold text-indigo-600 hover:underline">
                          {n.user?.name || 'Student'}
                        </Link>
                        <p className="text-[10px] text-slate-400">{n.user?.email}</p>
                      </td>
                      <td className="py-3 max-w-[220px] truncate text-slate-500 font-medium">
                        {n.summary || 'AI Generated Markdown Notes'}
                      </td>
                      <td className="py-3">
                        {n.isFavorite ? (
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        ) : (
                          <Star size={14} className="text-slate-300" />
                        )}
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-400 font-medium">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No study notes found in MongoDB.</td>
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
