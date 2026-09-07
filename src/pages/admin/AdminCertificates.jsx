import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCertificates() {
      try {
        setLoading(true);
        const res = await adminAPI.getCertificates({ page, limit: 15 });
        if (isMounted && res?.success) {
          setCertificates(res.certificates);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch admin certificates:', err);
          setLoading(false);
        }
      }
    }
    loadCertificates();
    return () => { isMounted = false; };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-base font-bold text-slate-800">Issued Verification Certificates</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified certificates issued upon 100% roadmap mastery ({total} Total Certificates).
        </p>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading certificate records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Certificate ID</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Course / Subject</th>
                  <th className="pb-3">Verification Code</th>
                  <th className="pb-3 text-right pr-2">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {certificates.length > 0 ? (
                  certificates.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-indigo-700">
                        {c.certificateId}
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/users/${c.user?._id || c.user?.id}`} className="font-bold text-slate-800 hover:text-indigo-600">
                          {c.studentName || c.user?.name || 'Student'}
                        </Link>
                        <p className="text-[10px] text-slate-400">{c.user?.email}</p>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {c.courseName}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                          <CheckCircle2 size={10} />
                          <span>{c.verificationCode}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-400 font-medium">
                        {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No certificates issued yet in MongoDB.</td>
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
