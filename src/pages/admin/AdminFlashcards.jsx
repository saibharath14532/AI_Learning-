import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminFlashcards() {
  const [sets, setSets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFlashcards() {
      try {
        setLoading(true);
        const res = await adminAPI.getFlashcards({ page, limit: 15 });
        if (isMounted && res?.success) {
          setSets(res.flashcardSets);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch admin flashcards:', err);
          setLoading(false);
        }
      }
    }
    loadFlashcards();
    return () => { isMounted = false; };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-base font-bold text-slate-800">Flashcard Sets</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Overview of interactive study flashcards ({total} Total Decks).
        </p>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading flashcard records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Topic</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Cards</th>
                  <th className="pb-3">Mastered</th>
                  <th className="pb-3 text-right pr-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sets.length > 0 ? (
                  sets.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-800">
                        {f.topic || f.subject}
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/users/${f.user?._id || f.user?.id}`} className="font-semibold text-indigo-600 hover:underline">
                          {f.user?.name || 'Student'}
                        </Link>
                        <p className="text-[10px] text-slate-400">{f.user?.email}</p>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {f.totalCards || 0} Cards
                      </td>
                      <td className="py-3 font-bold text-emerald-600">
                        {f.masteredCards || 0} ({f.progress || 0}%)
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-400 font-medium">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No flashcard sets found in MongoDB.</td>
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
