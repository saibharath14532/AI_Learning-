import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Sparkles, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import NotesViewer from '../../components/notes/NotesViewer';
import { toast } from 'react-hot-toast';

const NOTE_TYPES = ['Quick Revision', 'Detailed Notes', 'Exam Preparation', 'Interview Preparation'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LENGTHS = ['Short', 'Medium', 'Detailed'];

const TOPIC_EXAMPLES = [
  'Database Management Systems',
  'Data Structures',
  'Operating Systems',
];

export default function Notes() {
  const location = useLocation();
  const {
    savedNotes,
    activeNote,
    isGenerating,
    isLoadingNotes,
    generateNotes,
    saveNote,
    deleteNote,
    selectNote,
    clearActiveNote
  } = useNotes();

  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Detailed Notes');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [length, setLength] = useState('Medium');
  const [learningGoal, setLearningGoal] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Update
  useEffect(() => {
    document.title = "AI Notes Generator - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Generate clear, structured study notes and reference outlines from any topic in seconds.');
    }
  }, []);

  // Prepopulate topic if redirected from Roadmap
  useEffect(() => {
    if (location.state?.topic) {
      setTopic(location.state.topic);
      toast.success(`Prepopulated topic: ${location.state.topic}`);
    }
  }, [location.state]);

  // Loading animation step cycler
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep(step => (step + 1) % 4);
    }, 450);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate notes.');
      return;
    }

    try {
      await generateNotes(topic, type, difficulty, length, learningGoal);
      toast.success('Study notes generated!');
    } catch {
      toast.error('Failed to generate study notes.');
    }
  };

  const getRelativeTimeString = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const loadingMessages = [
    "Understanding the topic...",
    "Organizing important concepts...",
    "Creating explanations...",
    "Preparing your study notes..."
  ];

  // 0. INITIAL LOADING SCREEN FROM MONGODB
  if (isLoadingNotes) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        <PageHeader
          title="AI Notes Generator"
          subtitle="Create clear, structured study notes from any topic in seconds."
        />
        <PageLoader />
      </div>
    );
  }

  // 1. SIMULATED AI NOTES COMPILING STATE
  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center gap-6 shadow-lg border-indigo-150">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="text-indigo-600 animate-pulse" size={26} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-800">AI is preparing your notes...</h3>
            <p className="text-sm text-slate-500 min-h-[40px] px-4 leading-relaxed font-medium">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 2. ACTIVE NOTES DETAILS VIEW
  if (activeNote) {
    return (
      <NotesViewer
        note={activeNote}
        onSave={saveNote}
        onBack={clearActiveNote}
        onGenerateAgain={clearActiveNote}
      />
    );
  }

  // 3. GENERATOR LANDING FORM & HISTORY LIST
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      <PageHeader
        title="AI Notes Generator"
        subtitle="Create clear, structured study notes from any topic in seconds."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Setup Config Panel */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" />
              Configure Notes
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topic Area</label>
                <Input
                  id="notes-topic"
                  placeholder="e.g. Database Management Systems..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs py-2"
                  required
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TOPIC_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setTopic(ex)}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Note Structure Style</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Level & Length */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="form-input text-xs py-1.5 cursor-pointer"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="form-input text-xs py-1.5 cursor-pointer"
                  >
                    {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Optional Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Learning Goal (Optional)</label>
                <Input
                  id="notes-goal"
                  placeholder="e.g. Pass midterms, interview prep..."
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full text-xs py-2"
                />
              </div>

              {/* Generate Button */}
              <Button
                id="btn-generate-notes"
                type="submit"
                variant="gradient"
                fullWidth
                size="sm"
                leftIcon={<Plus size={14} />}
                className="mt-2"
              >
                Generate Notes
              </Button>
            </form>
          </Card>
        </div>

        {/* Saved Library (Recent Notes) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clock size={15} className="text-slate-400" />
              <span>Recent Notes</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              {savedNotes.length} item{savedNotes.length !== 1 ? 's' : ''} saved
            </span>
          </div>

          {savedNotes.length === 0 ? (
            <Card className="py-12 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="text-slate-300" size={32} />
              <div>
                <h4 className="text-xs font-bold text-slate-700">No Saved Notes</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Configure topics in the setup panel to write notes. Saved outlines are cached here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedNotes.map(noteItem => {
                const noteKey = noteItem.id || noteItem._id;
                const sectionCount = noteItem.sections ? noteItem.sections.length : 0;

                return (
                  <Card
                    key={noteKey}
                    className="hover:border-slate-350 hover:shadow-sm transition-all flex flex-col justify-between p-5 min-h-[140px]"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1">
                          <Badge size="xs" color="indigo">
                            {noteItem.type || 'Detailed Notes'}
                          </Badge>
                          <Badge size="xs">{noteItem.difficulty || 'Intermediate'}</Badge>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete these saved notes?')) {
                              deleteNote(noteKey);
                              toast.success('Notes deleted.');
                            }
                          }}
                          className="text-slate-350 hover:text-red-500 transition-colors p-1 rounded-md cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-800 line-clamp-1 leading-snug">
                        {noteItem.title || noteItem.topic}
                      </h4>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <Calendar size={11} />
                        <span>Generated {getRelativeTimeString(noteItem.savedAt || noteItem.createdAt)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4 mt-3">
                      <span className="text-[10px] font-semibold text-slate-450">
                        {sectionCount} section{sectionCount !== 1 ? 's' : ''} compiled
                      </span>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => selectNote(noteItem)}
                        className="text-indigo-650 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                      >
                        View Notes
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

