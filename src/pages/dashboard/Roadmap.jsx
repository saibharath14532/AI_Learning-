import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Brain, Sparkles, Trash2, Layers, Zap, FileText } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { PageLoader } from '../../components/common/Loader';
import RoadmapTopicCard from '../../components/roadmap/RoadmapTopicCard';
import CurrentLearningCard from '../../components/roadmap/CurrentLearningCard';
import { toast } from 'react-hot-toast';

const GOAL_EXAMPLES = [
  'Master Data Structures',
  'Prepare for Java Interview',
  'Learn Machine Learning',
  'Prepare for Semester Exams',
];

const TOPIC_EXAMPLES = [
  'Data Structures and Algorithms',
  'Java Core Basics',
  'Machine Learning Foundations',
  'Database Management Systems',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TARGET_LEVELS = ['Intermediate', 'Advanced', 'Expert'];
const STUDY_TIMES = ['30 minutes/day', '1 hour/day', '2 hours/day', '3+ hours/day'];
const DURATIONS = ['1 Week', '2 Weeks', '1 Month', '3 Months'];

export default function Roadmap() {
  const navigate = useNavigate();
  const {
    activeRoadmap,
    isLoadingRoadmap,
    isGenerating,
    generateRoadmap,
    updateTopicStatus,
    resetRoadmap,
  } = useRoadmap();

  const [goal, setGoal] = useState('');
  const [subject, setSubject] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [targetLevel, setTargetLevel] = useState('Advanced');
  const [studyTime, setStudyTime] = useState('1 hour/day');
  const [duration, setDuration] = useState('1 Month');
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Update
  useEffect(() => {
    document.title = "AI Learning Roadmap - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Build a personalized learning path designed around your coding goals, current knowledge, and study commitment.');
    }
  }, []);

  // Cycle loading messages for AI generation simulation
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep(step => (step + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error('Please enter a learning goal (e.g. Master Data Structures).');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject topic.');
      return;
    }

    try {
      await generateRoadmap(goal, subject, currentLevel, targetLevel, studyTime, duration);
      toast.success('Learning roadmap generated successfully!');
    } catch {
      toast.error('Failed to generate learning roadmap.');
    }
  };

  const handleStartLearning = (topic) => {
    // Set status to In Progress
    updateTopicStatus(topic.id, 'In Progress');
    toast.success(`Started stage: ${topic.title}`);
    // Navigate to AI Tutor preloaded with the topic
    navigate('/ai-tutor', { state: { topic: topic.title } });
  };

  const handleMarkComplete = (topicId) => {
    updateTopicStatus(topicId, 'Completed');
    toast.success('Stage marked complete!');
  };

  const handleReset = () => {
    resetRoadmap();
    setGoal('');
    setSubject('');
    toast.success('Goal reset. You can generate a new roadmap.');
  };

  const loadingMessages = [
    "Analyzing your learning goal and subject details...",
    "Evaluating your baseline learning level...",
    "Structuring progressive stages & objectives...",
    "Compiling interactive canvas nodes & study resources..."
  ];

  // 0. INITIAL LOADING SCREEN FROM MONGODB
  if (isLoadingRoadmap) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        <PageHeader
          title="AI Learning Roadmap"
          subtitle="Build a personalized learning path designed around your goals, level, and study time."
        />
        <PageLoader />
      </div>
    );
  }

  // 1. GENERATING LOADING SCREEN
  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center gap-6 shadow-lg border-indigo-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Map className="text-indigo-600 animate-pulse" size={26} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-800">AI is building your personalized roadmap...</h3>
            <p className="text-sm text-slate-500 min-h-[40px] px-4 leading-relaxed font-medium">
              {loadingMessages[loadingStep]}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            />
          </div>
        </Card>
      </div>
    );
  }

  // 2. CONFIGURATION LANDING PAGE
  if (!activeRoadmap) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        <PageHeader
          title="AI Learning Roadmap"
          subtitle="Build a personalized learning path designed around your goals, level, and study time."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Main Form card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Learning Goal */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-indigo-500" />
                    What is your primary learning goal?
                  </label>
                  <Input
                    id="roadmap-goal"
                    placeholder="e.g. Master Data Structures, Prepare for Java Interview..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {GOAL_EXAMPLES.map(ex => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setGoal(ex)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Topic */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Brain size={16} className="text-indigo-500" />
                    Subject / Topic Area
                  </label>
                  <Input
                    id="roadmap-subject"
                    placeholder="e.g. Data Structures and Algorithms, Java Programming..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {TOPIC_EXAMPLES.map(ex => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setSubject(ex)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Level Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Current Knowledge Level</label>
                    <select
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(e.target.value)}
                      className="form-input text-sm cursor-pointer"
                    >
                      {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Target Skill Level</label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      className="form-input text-sm cursor-pointer"
                    >
                      {TARGET_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                </div>

                {/* Duration & Daily Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Available Study Time</label>
                    <select
                      value={studyTime}
                      onChange={(e) => setStudyTime(e.target.value)}
                      className="form-input text-sm cursor-pointer"
                    >
                      {STUDY_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">Preferred Learning Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="form-input text-sm cursor-pointer"
                    >
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  id="btn-generate-roadmap"
                  type="submit"
                  variant="gradient"
                  fullWidth
                  size="lg"
                  leftIcon={<Map size={16} />}
                >
                  Generate My Roadmap
                </Button>
              </form>
            </Card>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-5">
            <Card className="bg-slate-50/50 border-slate-100">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-500" />
                AI Syllabus Planning
              </h3>
              <div className="text-[11px] text-slate-500 leading-relaxed space-y-2.5 font-medium">
                <p>
                  Our AI engine maps topics incrementally, spacing complex concepts according to your learning speed.
                </p>
                <p>
                  Phases unlock dynamically as prior sections are marked complete.
                </p>
                <p>
                  Start-learning triggers redirect directly to verified modules in the AI Tutor.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 3. ROADMAP RESULTS DASHBOARD
  const topics = activeRoadmap.topics;
  const inProgressTopic = topics.find(t => t.status === 'In Progress') || topics.find(t => t.status === 'Upcoming') || topics[topics.length - 1];
  const completedCount = topics.filter(t => t.status === 'Completed').length;
  const totalCount = topics.length;
  
  // Calculate remaining estimated hours
  const remainingMin = topics.filter(t => t.status !== 'Completed').reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const remainingHours = Math.ceil(remainingMin / 60);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Badge color="indigo" size="xs" className="mb-1 w-max">AI Personalization Path</Badge>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Your Personalized Learning Roadmap
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<Trash2 size={13} />} className="text-red-500 border-red-200 hover:border-red-300 hover:bg-red-50">
          Reset Path
        </Button>
      </div>

      {/* Meta Specs Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-slate-50/50 shadow-sm border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Learning Goal</span>
          <span className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-1">{activeRoadmap.goal}</span>
        </Card>
        <Card padding="sm" className="bg-slate-50/50 shadow-sm border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Level Range</span>
          <span className="text-xs font-extrabold text-slate-800 mt-1">
            {activeRoadmap.currentLevel} → {activeRoadmap.targetLevel}
          </span>
        </Card>
        <Card padding="sm" className="bg-slate-50/50 shadow-sm border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Learning Duration</span>
          <span className="text-xs font-extrabold text-slate-800 mt-1">{activeRoadmap.duration}</span>
        </Card>
        <Card padding="sm" className="bg-slate-50/50 shadow-sm border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Commitment</span>
          <span className="text-xs font-extrabold text-slate-800 mt-1">{activeRoadmap.dailyStudyTime}</span>
        </Card>
      </div>

      {/* Spotlight and Stats Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spotlight active card */}
        <div className="md:col-span-2">
          <CurrentLearningCard
            topic={inProgressTopic}
            onContinue={handleStartLearning}
          />
        </div>

        {/* Stats breakdown widget */}
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col justify-between p-6 shadow-sm">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">
              Overall Roadmap Progress
            </h4>
            <div className="flex-1 flex flex-col gap-4">
              {/* Radial or linear bar */}
              <ProgressBar
                value={activeRoadmap.progress}
                max={100}
                showValue={true}
                size="md"
              />
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Completed</span>
                  <strong className="text-slate-700 text-sm">{completedCount} / {totalCount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Remaining</span>
                  <strong className="text-slate-700 text-sm">{totalCount - completedCount} stages</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Est. Study Hours</span>
                  <strong className="text-slate-700 text-sm">{remainingHours} hrs</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Current Streak</span>
                  <strong className="text-slate-700 text-sm">7 Days 🔥</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Timeline Header */}
      <div className="pt-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm">Learning Stages Timeline</h3>
        <span className="text-[10px] text-slate-400 font-semibold">{totalCount} modules total</span>
      </div>

      {/* Dotted Learning Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {topics.map((topic) => {
          const isCompleted = topic.status === 'Completed';
          const isInProgress = topic.status === 'In Progress';
          
          return (
            <div key={topic.id} className="relative group animate-fade-in-right">
              {/* Dotted indicator node on the vertical line */}
              <div className={`absolute -left-6 sm:-left-8 top-5 w-4.5 h-4.5 rounded-full border-4 bg-white -translate-x-1/2 flex items-center justify-center transition-all ${
                isCompleted 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : isInProgress 
                  ? 'border-indigo-600 bg-indigo-50 animate-pulse' 
                  : 'border-slate-300'
              }`}>
                {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </div>

              {/* Topic Card Component */}
              <RoadmapTopicCard
                topic={topic}
                onStartLearning={handleStartLearning}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          );
        })}
      </div>

      {/* Recommended Resources List */}
      <div className="pt-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
          Recommended Study Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/ai-tutor')}
            className="card card-interactive text-left p-4 flex items-start gap-3 hover:border-indigo-100 bg-white shadow-sm border border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Brain size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">AI Tutor</h4>
              <p className="text-[10px] text-slate-400 mt-1">Read explanations and review models.</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/quiz')}
            className="card card-interactive text-left p-4 flex items-start gap-3 hover:border-indigo-100 bg-white shadow-sm border border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Practice Quiz</h4>
              <p className="text-[10px] text-slate-400 mt-1">Test your recall of topics.</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/flashcards')}
            className="card card-interactive text-left p-4 flex items-start gap-3 hover:border-indigo-100 bg-white shadow-sm border border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Flashcards</h4>
              <p className="text-[10px] text-slate-400 mt-1">Study definitions. (Upcoming)</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/notes')}
            className="card card-interactive text-left p-4 flex items-start gap-3 hover:border-indigo-100 bg-white shadow-sm border border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">AI Notes</h4>
              <p className="text-[10px] text-slate-400 mt-1">Review generated PDFs. (Upcoming)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

