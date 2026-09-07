import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Sparkles, Clock, TrendingUp, CheckCircle2,
  Calendar, ChevronRight, AlertTriangle, ArrowUpRight, Target
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { useRoadmap } from '../../context/RoadmapContext';
import { progressAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { PageLoader } from '../../components/common/Loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FILTERS = ['This Week', 'This Month', 'All Time'];

export default function Progress() {
  const navigate = useNavigate();
  const { activeRoadmap } = useRoadmap();
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overallProgress: 0,
    topicsCompleted: 0,
    quizzesCompleted: 0,
    avgQuizScore: 0,
    studyHours: 0,
    flashcardsReviewed: 0,
    notesCreated: 0,
    studyHoursChart: [0, 0, 0, 0, 0, 0, 0],
    quizScoresTrend: [],
    topicPerformance: [],
    strongAreas: [],
    weakAreas: [],
    weeklySummary: {
      studyTime: '0h 0m',
      topicsCompleted: 0,
      quizzes: 0,
      flashcards: 0,
      notesCreated: 0,
      tutorSessions: 0,
    },
    studyTimeImprovement: '0%',
    topicsCompletedImprovement: '0 completed',
    quizScoreImprovement: '0% average',
    insights: [],
  });

  // SEO Update
  useEffect(() => {
    document.title = "Learning Progress - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Track your learning activity, study consistency, quiz scores over time, and custom topic mastery charts.');
    }
  }, []);

  // Fetch real analytics from MongoDB via progressAPI
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await progressAPI.getOverview({ period: activeFilter });
        if (isMounted && res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch progress analytics from MongoDB:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { isMounted = false; };
  }, [activeFilter]);

  // 1. Chart 1: Study Activity Hours (Bar)
  const studyLabels = activeFilter === 'This Week'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : activeFilter === 'This Month'
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const studyChartData = {
    labels: studyLabels,
    datasets: [
      {
        label: 'Study Time (mins)',
        data: data.studyHoursChart,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const studyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleFont: { size: 11, family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 9, family: 'Inter' }, color: '#94a3b8' },
        border: { dash: [4, 4] },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter' }, color: '#64748b' },
      },
    },
  };

  // 2. Chart 2: Quiz Scores Over Time (Line)
  const quizLabels = data.quizScoresTrend.map((_, idx) => `Quiz ${idx + 1}`);
  const quizChartData = {
    labels: quizLabels,
    datasets: [
      {
        label: 'Quiz Score (%)',
        data: data.quizScoresTrend,
        fill: true,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        tension: 0.35,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const quizChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        titleFont: { size: 11, family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 9, family: 'Inter' }, color: '#94a3b8' },
        border: { dash: [4, 4] },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter' }, color: '#64748b' },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
        <PageHeader
          title="Learning Progress"
          subtitle="Track your learning activity, performance, consistency, and growth."
        />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      {/* Page Header and Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <PageHeader
          title="Learning Progress"
          subtitle="Track your learning activity, performance, consistency, and growth."
        />

        {/* Filter Pills */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl w-max self-start sm:self-center">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* OVERALL PERFORMANCE CARD ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Overall Progress</span>
          <div className="mt-2 space-y-1">
            <span className="text-xl font-black text-slate-800">{data.overallProgress}%</span>
            <ProgressBar value={data.overallProgress} max={100} size="xs" />
          </div>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Topics Completed</span>
          <span className="text-xl font-black text-slate-800 mt-2">{data.topicsCompleted}</span>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Quizzes Completed</span>
          <span className="text-xl font-black text-slate-800 mt-2">{data.quizzesCompleted}</span>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Quiz Score</span>
          <span className="text-xl font-black text-slate-800 mt-2">{data.avgQuizScore}%</span>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Study Hours</span>
          <span className="text-xl font-black text-slate-800 mt-2">{data.studyHours}h</span>
        </Card>

        <Card padding="sm" className="shadow-sm border-slate-100 flex flex-col justify-between p-4 bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Cards Reviewed</span>
          <span className="text-xl font-black text-slate-800 mt-2">{data.flashcardsReviewed}</span>
        </Card>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Activity Chart */}
        <Card className="shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clock size={16} className="text-indigo-600" />
              <span>Learning Activity</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Study hours</span>
          </div>
          <div className="h-48 relative">
            <Bar data={studyChartData} options={studyChartOptions} />
          </div>
        </Card>

        {/* Quiz Scores Trend Chart */}
        <Card className="shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp size={16} className="text-indigo-600" />
              <span>Quiz Performance Trend</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Scores (%)</span>
          </div>
          <div className="h-48 relative">
            <Line data={quizChartData} options={quizChartOptions} />
          </div>
        </Card>
      </div>

      {/* WEEKLY SUMMARY & GOAL PROGRESS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Summary Card */}
        <Card className="md:col-span-1 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Learning Activity Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400 block">Study Time</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.studyTime}</strong>
                <span className="text-[10px] text-emerald-600 font-bold block">{data.studyTimeImprovement} vs last period</span>
              </div>
              <div>
                <span className="text-slate-400 block">Topics Done</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.topicsCompleted}</strong>
                <span className="text-[10px] text-emerald-600 font-bold block">{data.topicsCompletedImprovement} completed</span>
              </div>
              <div>
                <span className="text-slate-400 block">Quizzes taken</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.quizzes}</strong>
                <span className="text-[10px] text-emerald-600 font-bold block">{data.quizScoreImprovement} average</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cards Studied</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.flashcards}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Notes Created</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.notesCreated}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Tutor Queries</span>
                <strong className="text-slate-700 text-sm">{data.weeklySummary.tutorSessions}</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Roadmap Goal Progress visually linked */}
        <Card className="md:col-span-2 p-5 shadow-sm space-y-4 flex flex-col justify-between bg-gradient-soft border-indigo-150">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-indigo-100/30 pb-2">
              <Target size={16} className="text-indigo-650" />
              <span>Learning Goal Progress</span>
            </h3>

            {activeRoadmap ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active Syllabus Goal</span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5">{activeRoadmap.goal}</h4>
                  </div>
                  <Badge color="indigo">Roadmap Connected</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <ProgressBar
                    value={activeRoadmap.progress}
                    max={100}
                    label="Roadmap Progress"
                    size="sm"
                    showValue={true}
                  />
                  <div className="flex sm:justify-end text-xs font-semibold text-slate-500 gap-4">
                    <div>
                      <span className="text-slate-450 block">Completed</span>
                      <strong className="text-slate-750 text-sm">
                        {activeRoadmap.topics.filter(t => t.status === 'Completed').length} / {activeRoadmap.topics.length} Topics
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-450 block">Time Left</span>
                      <strong className="text-slate-750 text-sm">
                        {Math.ceil(activeRoadmap.topics.filter(t => t.status !== 'Completed').reduce((s, t) => s + t.estimatedMinutes, 0) / 60)} hours
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active Syllabus Goal</span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5">Master Data Structures</h4>
                  </div>
                  <Badge color="indigo">Demo Goal</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <ProgressBar
                    value={64}
                    max={100}
                    label="Roadmap Progress"
                    size="sm"
                    showValue={true}
                  />
                  <div className="flex sm:justify-end text-xs font-semibold text-slate-500 gap-4">
                    <div>
                      <span className="text-slate-450 block">Completed</span>
                      <strong className="text-slate-750 text-sm">16 / 25 Topics</strong>
                    </div>
                    <div>
                      <span className="text-slate-450 block">Time Left</span>
                      <strong className="text-slate-750 text-sm">12 hours</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/roadmap')}
              rightIcon={<ChevronRight size={12} />}
              className="text-indigo-650 border-indigo-200 hover:border-indigo-350 hover:bg-indigo-50/50"
            >
              View Roadmap
            </Button>
          </div>
        </Card>
      </div>

      {/* TOPIC PERFORMANCE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Mastery Lists */}
        <Card className="p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
            Topic Performance
          </h3>
          <div className="space-y-3">
            {data.topicPerformance.map((topic, idx) => {
              const isStrong = topic.rating === 'Strong';
              const isAverage = topic.rating === 'Average';
              
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{topic.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-450 font-extrabold">{topic.score}% Mastery</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isStrong 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : isAverage 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {topic.rating}
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={topic.score}
                    max={100}
                    size="xs"
                    color={isStrong ? 'emerald' : isAverage ? 'amber' : 'rose'}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Strong Areas Badges */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Your Strong Areas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {data.strongAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 flex items-start gap-2.5"
                >
                  <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-emerald-900 text-xs block font-extrabold truncate">
                      {area.name}
                    </strong>
                    <span className="text-[10px] text-emerald-650 block mt-0.5 font-bold">
                      {area.score}% mastery level
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* WEAK AREAS (Topics to Improve) */}
      <Card className="p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-amber-500" />
          <span>Topics to Improve</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.weakAreas.map((area, idx) => (
            <Card
              key={idx}
              className="border-rose-100 bg-rose-50/20 hover:border-rose-200 transition-all p-4 flex flex-col justify-between min-h-[140px]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-850 truncate">{area.name}</h4>
                  <Badge color="red" size="xs">{area.score}% score</Badge>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Recommended Action</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{area.action}</p>
              </div>

              <div className="pt-3 border-t border-rose-100/40 flex justify-end mt-2">
                <button
                  onClick={() => navigate('/ai-tutor', { state: { topic: area.name } })}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                >
                  <span>Study Topic</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* STUDY activity logs */}
      <Card className="p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
          <Calendar size={15} className="text-slate-400" />
          <span>Recent Learning Activity</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 text-xs border-b border-slate-50 pb-2">
            <div>
              <span className="font-bold text-slate-700 block">Completed DBMS Practice Quiz</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Score: 88% • Spaced recall verified</span>
            </div>
            <Badge size="xs" color="indigo">Today</Badge>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs border-b border-slate-50 pb-2">
            <div>
              <span className="font-bold text-slate-700 block">Reviewed 15 Spaced Flashcards</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Topic: DBMS • 4 marked mastered</span>
            </div>
            <Badge size="xs" color="indigo">Today</Badge>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs border-b border-slate-50 pb-2">
            <div>
              <span className="font-bold text-slate-700 block">Completed Syllabus Roadmap Stage</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Topic: Normalization & Normal Forms</span>
            </div>
            <Badge size="xs" color="slate">Yesterday</Badge>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs border-b border-slate-50 pb-2">
            <div>
              <span className="font-bold text-slate-700 block">Generated AI Revision Notes</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Topic: Operating Systems Paging</span>
            </div>
            <Badge size="xs" color="slate">Yesterday</Badge>
          </div>

          <div className="flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">Consulted AI Tutor Explainer</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Topic: Binary Tree Traversals</span>
            </div>
            <Badge size="xs" color="slate">2 days ago</Badge>
          </div>
        </div>
      </Card>

      {/* INSIGHTS CARD & NEXT STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Learning Insights */}
        <Card className="p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
            <Sparkles size={15} className="text-indigo-650" />
            <span>AI Learning Insights</span>
          </h3>
          <div className="space-y-3">
            {data.insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 flex items-start gap-2.5"
              >
                <div className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase mt-0.5">
                  Sample AI Insight
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Next Steps */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Recommended Next Steps
            </h3>
            
            <div className="space-y-3 pt-3">
              {/* Step 1 */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">1</span>
                  <span className="text-xs font-bold text-slate-700">Review Binary Trees</span>
                </div>
                <button
                  onClick={() => navigate('/ai-tutor', { state: { topic: 'Binary Trees' } })}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Study
                </button>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">2</span>
                  <span className="text-xs font-bold text-slate-700">Complete pending Roadmap topic</span>
                </div>
                <button
                  onClick={() => navigate('/roadmap')}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Roadmap
                </button>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">3</span>
                  <span className="text-xs font-bold text-slate-700">Take a DBMS practice quiz</span>
                </div>
                <button
                  onClick={() => navigate('/quiz')}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Quiz
                </button>
              </div>

              {/* Step 4 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">4</span>
                  <span className="text-xs font-bold text-slate-700">Review difficult flashcards</span>
                </div>
                <button
                  onClick={() => navigate('/flashcards')}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Flashcards
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

