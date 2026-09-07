import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Check, Sparkles, Brain, Zap, Layers, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from 'react-hot-toast';

export default function NotesViewer({
  note,
  onSave,
  onBack,
  onGenerateAgain
}) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleSave = () => {
    const success = onSave(note);
    if (success) {
      setIsSaved(true);
      toast.success('Notes saved locally!');
    } else {
      setIsSaved(true);
      toast.success('Notes already saved in your library.');
    }
  };

  const handlePdfExport = () => {
    setShowPdfModal(true);
  };

  const triggerBrowserPrint = () => {
    setShowPdfModal(false);
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* 1. TOP HEADER & ACTIONS ROW */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Library</span>
        </button>

        <div className="flex flex-wrap gap-2">
          {/* Save Action */}
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl border transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 border-emerald-150 text-emerald-700 opacity-80 cursor-default'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50/50'
            }`}
          >
            <Check size={14} className={isSaved ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{isSaved ? 'Saved' : 'Save Notes'}</span>
          </button>

          {/* Download PDF Action */}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download size={13} />}
            onClick={handlePdfExport}
            className="text-indigo-600 border-indigo-200 hover:border-indigo-300"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* 2. TITLE SECTION */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Badge color="indigo">{note.type}</Badge>
          <Badge>{note.difficulty}</Badge>
          <Badge>{note.length}</Badge>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          {note.title}
        </h2>
        {note.learningGoal && (
          <p className="text-xs font-semibold text-indigo-500">
            Goal Focus: {note.learningGoal}
          </p>
        )}
      </div>

      {/* 3. OVERVIEW CARD */}
      <Card className="shadow-sm border-slate-100 bg-slate-50/20 p-5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
          Overview
        </span>
        <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
          {note.overview}
        </p>
      </Card>

      {/* 4. TABLE OF CONTENTS */}
      <Card className="shadow-sm p-5 border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          Table of Contents
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {note.sections.map((sec, idx) => (
            <a
              key={idx}
              href={`#section-${idx}`}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-semibold group"
            >
              <ChevronRight size={13} className="text-slate-350 group-hover:text-indigo-500 transition-colors" />
              <span>{sec.heading}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* 5. SECTIONS BODY */}
      <div className="space-y-6">
        {note.sections.map((sec, idx) => (
          <div key={idx} id={`section-${idx}`} className="scroll-mt-6">
            <Card className="shadow-sm p-6 sm:p-8 space-y-4 border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-50 pb-2">
                {sec.heading}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {sec.explanation}
              </p>

              {/* Important Points */}
              {sec.importantPoints && sec.importantPoints.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">
                    Important Points
                  </span>
                  <ul className="space-y-1">
                    {sec.importantPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="text-xs text-slate-600 list-disc list-inside leading-relaxed pl-1 font-medium">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {sec.examples && sec.examples.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1.5">
                    Example Insights
                  </span>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 font-mono text-[10px] sm:text-xs text-slate-700 leading-normal space-y-1">
                    {sec.examples.map((ex, eIdx) => (
                      <div key={eIdx}>{ex}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Terms */}
              {sec.keyTerms && sec.keyTerms.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-2">
                    Key Definitions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sec.keyTerms.map((kt, kIdx) => (
                      <div
                        key={kIdx}
                        className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-2.5 max-w-xs text-left"
                      >
                        <strong className="text-indigo-900 text-[11px] block font-extrabold">{kt.term}</strong>
                        <span className="text-slate-500 text-[10px] block mt-0.5 font-medium leading-relaxed">
                          {kt.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* 6. KEY TAKEAWAYS */}
      <Card className="shadow-sm p-6 sm:p-8 bg-gradient-soft border-indigo-100 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Check size={16} className="text-indigo-600" />
          Key Takeaways
        </h3>
        <div className="space-y-2">
          {note.keyTakeaways.map((takeaway, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-650 font-medium">
              <Check size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{takeaway}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 7. IMPORTANT TERMS BADGES */}
      <Card className="shadow-sm p-6 sm:p-8 border-slate-100 space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Important Vocabulary Terms
        </h3>
        <div className="flex flex-wrap gap-2">
          {note.importantTerms.map((term, idx) => (
            <span
              key={idx}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600"
            >
              {term}
            </span>
          ))}
        </div>
      </Card>

      {/* 8. QUICK REVISION BLOCK */}
      <Card className="shadow-sm p-6 sm:p-8 border-indigo-200 bg-indigo-50/20 space-y-3">
        <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={14} className="text-indigo-600" />
          Quick Revision Sheet
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold italic">
          "{note.quickRevision}"
        </p>
      </Card>

      {/* 9. INTEGRATION CALLOUT CARD */}
      <Card className="shadow-sm p-6 border-slate-200 bg-white space-y-5">
        <div className="text-center space-y-1">
          <h4 className="text-sm font-extrabold text-slate-800">Study Enrichment Actions</h4>
          <p className="text-xs text-slate-400">Navigate to other active modules preloaded with this topic.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Flashcards */}
          <div className="border border-slate-100 rounded-xl p-4 text-center flex flex-col justify-between gap-3 bg-slate-50/30">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Flashcards</span>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Want to memorize this topic terminology?</p>
            </div>
            <button
              onClick={() => navigate('/flashcards', { state: { topic: note.topic } })}
              className="w-full text-xs font-bold py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Layers size={12} />
              <span>Create Flashcards</span>
            </button>
          </div>

          {/* Quiz */}
          <div className="border border-slate-100 rounded-xl p-4 text-center flex flex-col justify-between gap-3 bg-slate-50/30">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Practice Quiz</span>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Test your knowledge with custom MCQs.</p>
            </div>
            <button
              onClick={() => navigate('/quiz', { state: { topic: note.topic } })}
              className="w-full text-xs font-bold py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-100 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap size={12} />
              <span>Take Quiz</span>
            </button>
          </div>

          {/* Tutor */}
          <div className="border border-slate-100 rounded-xl p-4 text-center flex flex-col justify-between gap-3 bg-slate-50/30">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI Tutor</span>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Need a deeper architectural explanation?</p>
            </div>
            <button
              onClick={() => navigate('/ai-tutor', { state: { topic: note.topic } })}
              className="w-full text-xs font-bold py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Brain size={12} />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 10. GENERATE AGAIN FOOTER */}
      <div className="flex justify-center pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateAgain}
          leftIcon={<RefreshCw size={12} />}
          className="text-slate-500 border-slate-200 hover:border-slate-350"
        >
          Generate Again
        </Button>
      </div>

      {/* 11. PDF DOWNLOADING INFORMATIONAL MODAL */}
      <ConfirmDialog
        isOpen={showPdfModal}
        title="PDF Document Export"
        description="PDF template compiling is handled securely at later stages. You can print study outlines directly through your browser or verify document caching models in this frontend build."
        confirmText="Browser Print (PDF)"
        cancelText="Close Dialog"
        onConfirm={triggerBrowserPrint}
        onCancel={() => setShowPdfModal(false)}
      />
    </div>
  );
}
