import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, BookOpen, CheckCircle2, ChevronRight, Lock,
  Download, Share2, Eye, ShieldCheck, Copy
} from 'lucide-react';
import { certificateAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

export default function Certificates() {
  const navigate = useNavigate();
  const [selectedCert, setSelectedCert] = useState(null);
  const [shareCert, setShareCert] = useState(null);
  const [requirementsCert, setRequirementsCert] = useState(null);

  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);
  const [earnedCerts, setEarnedCerts] = useState([]);
  const [inProgressCerts, setInProgressCerts] = useState([]);
  const [lockedCerts, setLockedCerts] = useState([]);
  const [stats, setStats] = useState({
    earnedCount: 0,
    completedCoursesCount: 0,
    topicsMastered: 0,
    averageScore: 0,
  });

  // SEO Update
  useEffect(() => {
    document.title = "Certificates - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Celebrate your learning achievements and showcase verified course credentials you've earned.");
    }
  }, []);

  // Fetch real certificates from MongoDB
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateAPI.getAll();
      if (res.success && res.data) {
        setEarnedCerts(res.data.earnedCertificates || []);
        setInProgressCerts(res.data.inProgressCertificates || []);
        setLockedCerts(res.data.lockedCertificates || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch certificates from MongoDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Claim/Issue Certificate for 100% completed roadmap
  const handleClaimCertificate = async (roadmapId) => {
    setIssuingId(roadmapId);
    try {
      const res = await certificateAPI.issue({ roadmapId });
      if (res.success && res.data) {
        toast.success(res.message || 'Certificate claimed successfully!');
        await fetchCertificates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim certificate');
    } finally {
      setIssuingId(null);
    }
  };

  const completedCerts = earnedCerts;

  const handleDownload = (cert) => {
    toast.success(`Download started: ${cert.courseName} Certificate asset is preparing. (Demonstration build: PDF generation is compiled on the backend environment).`);
  };

  const handleShare = (cert) => {
    setShareCert(cert);
  };

  const copyShareLink = (cert) => {
    const fakeLink = `https://ailp.edu/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(fakeLink);
    toast.success('Certificate link copied to clipboard!');
  };

  const triggerNativeShare = (cert) => {
    const fakeLink = `https://ailp.edu/verify/${cert.certificateId}`;
    if (navigator.share) {
      navigator.share({
        title: `${cert.courseName} Completion Certificate`,
        text: `I completed ${cert.courseName} with an average score of ${cert.percentage}%!`,
        url: fakeLink,
      })
      .then(() => toast.success('Shared successfully!'))
      .catch(() => {});
    } else {
      copyShareLink(cert);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
        <PageHeader
          title="Certificates"
          subtitle="Celebrate your learning achievements and showcase the skills you've mastered."
        />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      <PageHeader
        title="Certificates"
        subtitle="Celebrate your learning achievements and showcase the skills you've mastered."
      />

      {/* 1. STATISTICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm" className="shadow-sm border-slate-100 flex items-center gap-3.5 p-4 bg-slate-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Certificates Earned</span>
            <strong className="text-xl font-black text-slate-800 block mt-1.5">{stats.earnedCount}</strong>
          </div>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex items-center gap-3.5 p-4 bg-slate-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Courses Completed</span>
            <strong className="text-xl font-black text-slate-800 block mt-1.5">{stats.completedCoursesCount}</strong>
          </div>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex items-center gap-3.5 p-4 bg-slate-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Topics Mastered</span>
            <strong className="text-xl font-black text-slate-800 block mt-1.5">{stats.topicsMastered}</strong>
          </div>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex items-center gap-3.5 p-4 bg-slate-50/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Average Score</span>
            <strong className="text-xl font-black text-slate-800 block mt-1.5">{stats.averageScore}%</strong>
          </div>
        </Card>
      </div>

      {/* 2. EARNED CERTIFICATES SECTION */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
          Earned Credentials
        </h3>

        {earnedCerts.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50/40 border-dashed border-slate-200">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Certificates Earned Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Complete any learning roadmap to 100% to automatically unlock your official certificate of completion!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {earnedCerts.map((cert) => (
              <Card
                key={cert.id}
                className="hover:border-slate-350 hover:shadow-sm transition-all flex flex-col justify-between p-5 min-h-[220px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge color="indigo">Verified Credential</Badge>
                    <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Certificate of Completion</span>
                    <h4 className="text-base font-black text-slate-850 line-clamp-1 mt-0.5">{cert.courseName}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-50">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Awarded to</span>
                      <span className="text-slate-700 truncate block">{cert.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Completed</span>
                      <span className="text-slate-700 block">{cert.completionDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Final Score</span>
                      <span className="text-slate-700 block">{cert.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Credential ID</span>
                      <span className="text-slate-450 truncate block font-mono">{cert.certificateId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center gap-2 mt-4">
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<Eye size={12} />}
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<Download size={12} />}
                    onClick={() => handleDownload(cert)}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <button
                    onClick={() => handleShare(cert)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                    title="Share Certificate"
                  >
                    <Share2 size={12} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. IN-PROGRESS & LOCKED SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In-Progress Credentials */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Credentials In Progress
            </h3>

            {inProgressCerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No active credentials currently in progress.</p>
            ) : (
              inProgressCerts.map((cert) => (
                <div key={cert.id} className="space-y-3.5 pt-1 border-b border-slate-50 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{cert.courseName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Estimated Completion: {cert.estimatedCompletion}
                      </span>
                    </div>
                    {cert.progress >= 100 ? (
                      <Badge color="emerald">Eligible for Certificate!</Badge>
                    ) : (
                      <Badge color="yellow">In Progress</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Course Progress</span>
                      <span>{cert.progress}%</span>
                    </div>
                    <ProgressBar value={cert.progress} max={100} size="xs" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-500 pt-1 items-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Topics Done</span>
                      <span className="text-slate-700">{cert.topicsCompleted} / {cert.totalTopics}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Avg Quiz Score</span>
                      <span className="text-slate-700">{cert.percentage}%</span>
                    </div>
                    <div className="text-right">
                      {cert.progress >= 100 ? (
                        <Button
                          size="xs"
                          variant="gradient"
                          onClick={() => handleClaimCertificate(cert.roadmapId)}
                          disabled={issuingId === cert.roadmapId}
                        >
                          {issuingId === cert.roadmapId ? 'Issuing...' : 'Claim Certificate'}
                        </Button>
                      ) : (
                        <button
                          onClick={() => setRequirementsCert(cert)}
                          className="text-[10px] text-indigo-650 hover:underline cursor-pointer"
                        >
                          View Requirements
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/roadmap')}
              rightIcon={<ChevronRight size={12} />}
              className="text-indigo-650 border-indigo-200"
            >
              Continue Learning
            </Button>
          </div>
        </Card>

        {/* Locked Credentials */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Locked Credentials
            </h3>

            {lockedCerts.map((cert) => (
              <div key={cert.id} className="space-y-3.5 pt-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-400">{cert.courseName}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      Requirement: {cert.requirement}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Lock size={10} /> Locked
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-500 font-semibold leading-relaxed">
                  To unlock the assessment for this credential, you must complete the pre-requisite learning roadmap.
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setRequirementsCert(cert)}
                    className="text-[10px] text-slate-450 hover:text-indigo-600 font-bold cursor-pointer"
                  >
                    View Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/roadmap')}
              className="text-slate-500 border-slate-200"
              disabled
            >
              Requirements Locked
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. MODAL: CERTIFICATE PREVIEW / DETAILS */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title="Certificate Preview"
          size="lg"
        >
          <div className="space-y-6">
            {/* Academic Certificate Graphic Layout */}
            <div className="relative border-4 border-double border-slate-800 bg-amber-50/10 p-6 sm:p-12 text-center space-y-6 rounded-xl select-none">
              {/* Premium Insignia background stamp */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award size={180} className="text-slate-800" />
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">AI Learning Platform</span>
                <h4 className="text-2xl font-black text-slate-800 tracking-wide">Certificate of Completion</h4>
              </div>

              {/* Body message */}
              <div className="space-y-2">
                <p className="text-xs text-slate-450 font-serif italic">This certifies that</p>
                <h5 className="text-lg font-black text-slate-900 font-serif underline decoration-double decoration-slate-400 underline-offset-4">
                  {selectedCert.studentName}
                </h5>
                <p className="text-xs text-slate-450 font-serif italic">has successfully completed the learning path</p>
                <h5 className="text-base font-extrabold text-indigo-950 font-sans tracking-tight">
                  {selectedCert.courseName}
                </h5>
              </div>

              {/* Performance Score */}
              <div className="space-y-1 bg-slate-50/65 py-2.5 px-4 rounded-xl border border-slate-100 max-w-xs mx-auto">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Achievement Score</span>
                <strong className="text-base font-black text-emerald-700">{selectedCert.percentage}% Final Grade</strong>
              </div>

              {/* Signatures and Date */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 max-w-md mx-auto text-xs font-semibold text-slate-500">
                <div className="space-y-1">
                  <span className="text-slate-800 font-serif block italic">AI Learning Platform Board</span>
                  <div className="border-t border-slate-300 w-24 mx-auto pt-1 mt-2 text-[9px] uppercase font-bold text-slate-400">
                    Accreditation
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-800 font-mono block">{selectedCert.completionDate}</span>
                  <div className="border-t border-slate-300 w-24 mx-auto pt-1 mt-2 text-[9px] uppercase font-bold text-slate-400">
                    Date Issued
                  </div>
                </div>
              </div>

              {/* ID Badge */}
              <div className="pt-2">
                <span className="text-[8px] text-slate-450 font-mono block">
                  Verify Credentials • Certificate ID: {selectedCert.certificateId}
                </span>
                <span className="text-[8px] text-slate-350 block mt-0.5">
                  (Project demonstration build credential only. Not institutionally certified.)
                </span>
              </div>
            </div>

            {/* Certificate Details Specifications Table */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs font-semibold">
              <h5 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1.5">Credential Specifications</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Final Mastery Score</span>
                  <span className="text-slate-850">{selectedCert.percentage}% average grade</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Topics Mastered</span>
                  <span className="text-slate-850">{selectedCert.topicsCompleted} syllabus sections</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Study Hours Logged</span>
                  <span className="text-slate-850">{selectedCert.studyHours} hours completed</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Credential ID</span>
                  <span className="text-slate-850 font-mono">{selectedCert.certificateId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Verification Status</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <ShieldCheck size={13} /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(selectedCert)}
                leftIcon={<Share2 size={13} />}
              >
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(selectedCert)}
                leftIcon={<Download size={13} />}
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCert(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. MODAL: SHARE OPTIONS */}
      {shareCert && (
        <Modal
          isOpen={!!shareCert}
          onClose={() => setShareCert(null)}
          title="Share Credential"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Copy this credentials verification URL to display it on LinkedIn, resumes, or portfolios.
            </p>

            <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-[10px] sm:text-xs text-slate-600">
              <span className="flex-1 truncate">https://ailp.edu/verify/{shareCert.certificateId}</span>
              <button
                onClick={() => copyShareLink(shareCert)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Copy Link"
              >
                <Copy size={13} />
              </button>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerNativeShare(shareCert)}
                leftIcon={<Share2 size={12} />}
              >
                System Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareCert(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. MODAL: REQUIREMENTS CHECKLIST */}
      {requirementsCert && (
        <Modal
          isOpen={!!requirementsCert}
          onClose={() => setRequirementsCert(null)}
          title="Credential Requirements"
          size="sm"
        >
          <div className="space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <h4 className="text-sm font-black text-slate-800">{requirementsCert.courseName}</h4>
              <p className="text-[10px] text-slate-400">Completion checklist to earn credential</p>
            </div>

            <div className="space-y-3 font-semibold text-xs text-slate-650">
              {/* Roadmap Requirement */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <span>Complete learning roadmap</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">{requirementsCert.requirements.roadmap}%</span>
                  {requirementsCert.requirements.roadmap === 100 ? (
                    <span className="text-emerald-600 text-sm">✓</span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </div>
              </div>

              {/* Topics Requirement */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <span>Complete required learning topics</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">{requirementsCert.requirements.topics}</span>
                  {requirementsCert.requirements.roadmap === 100 ? (
                    <span className="text-emerald-600 text-sm">✓</span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </div>
              </div>

              {/* Quiz Requirement */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <span>Achieve minimum quiz score</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">
                    {requirementsCert.requirements.quiz > 0 ? `${requirementsCert.requirements.quiz}%` : 'Pending'}
                  </span>
                  {requirementsCert.requirements.quiz >= 80 ? (
                    <span className="text-emerald-600 text-sm">✓</span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </div>
              </div>

              {/* Final Assessment Requirement */}
              <div className="flex items-center justify-between gap-3">
                <span>Complete final assessment</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">
                    {requirementsCert.requirements.finalAssessment ? `${requirementsCert.requirements.finalAssessment}%` : 'Locked'}
                  </span>
                  {requirementsCert.requirements.finalAssessment ? (
                    <span className="text-emerald-600 text-sm">✓</span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRequirementsCert(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

