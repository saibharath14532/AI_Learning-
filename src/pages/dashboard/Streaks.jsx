import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Calendar, Target, ChevronRight, Lock, Heart, ShieldAlert
} from 'lucide-react';
import { streakAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import { PageLoader } from '../../components/common/Loader';

export default function Streaks() {
  const navigate = useNavigate();
  const [isStreakInterrupted, setIsStreakInterrupted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalStudyDays: 0,
    totalStudyHours: 0,
    studiedToday: false,
    weeklyActivity: [
      { day: 'Mon', studied: false },
      { day: 'Tue', studied: false },
      { day: 'Wed', studied: false },
      { day: 'Thu', studied: false },
      { day: 'Fri', studied: false },
      { day: 'Sat', studied: false },
      { day: 'Sun', studied: false },
    ],
    monthlyCalendar: [],
    milestones: [
      { id: 1, target: 7, label: 'First Week', completed: false, icon: '🔥' },
      { id: 2, target: 14, label: 'Two Week Warrior', completed: false, icon: '⚔️' },
      { id: 3, target: 30, label: 'Monthly Master', completed: false, icon: '👑' },
      { id: 4, target: 50, label: 'Learning Champion', completed: false, icon: '🏆' },
      { id: 5, target: 100, label: 'Century Scholar', completed: false, icon: '🎓' },
    ],
    todayGoal: {
      sessionsTarget: 2,
      sessionsCompleted: 0,
      minutesRemaining: 25,
      roadmapTopic: 'Explore Learning Topics',
      roadmapProgress: 0,
    },
    weeklySummary: {
      studyDays: 0,
      studyHours: '0h 0m',
      topicsCompleted: 0,
      quizzesCompleted: 0,
      flashcardsReviewed: 0,
      notesCreated: 0,
    },
    history: [
      { type: 'Current Streak', value: '0 days', active: false },
      { type: 'Longest Streak', value: '0 days', active: false },
      { type: 'Total Study Days', value: '0 days', active: false },
    ],
    recentActivity: [],
  });

  // SEO Update
  useEffect(() => {
    document.title = "Study Streak - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Build study consistency, stay motivated, log daily streaks, and unlock learning milestones.');
    }
  }, []);

  // Fetch real Study Streak metrics from MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchStreak = async () => {
      setLoading(true);
      try {
        const res = await streakAPI.getStreak();
        if (isMounted && res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch study streak data from MongoDB:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStreak();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
        <PageHeader
          title="Study Streak"
          subtitle="Build consistency, stay motivated, and make learning a daily habit."
        />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      {/* Header and Simulation Toggle Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <PageHeader
          title="Study Streak"
          subtitle="Build consistency, stay motivated, and make learning a daily habit."
        />

        {/* Frontend-only simulation controller */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 rounded-xl p-1.5 self-start sm:self-center">
          <span className="text-[10px] font-black text-slate-500 uppercase px-2">Streak Status</span>
          <div className="flex gap-1">
            <button
              onClick={() => setIsStreakInterrupted(false)}
              className={`text-[10px] font-black py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                !isStreakInterrupted
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setIsStreakInterrupted(true)}
              className={`text-[10px] font-black py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                isStreakInterrupted
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Interrupted
            </button>
          </div>
        </div>
      </div>

      {/* 1. STREAK INTERRUPTED WARNING BLOCK */}
      {isStreakInterrupted && (
        <Card className="border-rose-100 bg-rose-50/20 shadow-sm p-5 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-950">Your streak was interrupted.</h4>
              <p className="text-xs text-rose-700 font-medium mt-0.5">
                Previous Streak: <strong className="font-extrabold">{data.currentStreak} Days</strong> • Current: <strong className="font-extrabold">0 Days</strong>. Log in and study tomorrow to start a fresh sequence!
              </p>
            </div>
          </div>
          <Badge color="red">Reset State</Badge>
        </Card>
      )}

      {/* 2. PRIMARY STREAK METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Current Streak Box */}
        <Card className={`md:col-span-2 shadow-sm border-slate-100 flex items-center gap-5 p-6 transition-all ${
          isStreakInterrupted ? 'bg-slate-50/40 opacity-75' : 'bg-gradient-to-r from-orange-50/80 to-amber-50/40 border-orange-100'
        }`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${
            isStreakInterrupted 
              ? 'bg-slate-200 text-slate-400' 
              : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/10 animate-pulse'
          }`}>
            <Flame size={32} className={isStreakInterrupted ? '' : 'fill-white'} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Current Streak</span>
            <p className="text-3xl font-black text-slate-900 leading-none mt-1">
              {isStreakInterrupted ? '0 Days' : `${data.currentStreak} Days`}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-relaxed">
              {isStreakInterrupted 
                ? 'Your daily habit is paused. Study today to activate a streak.' 
                : 'Excellent consistency! One session today preserves your hot status.'}
            </p>
          </div>
        </Card>

        {/* Mini Stats Card 1 */}
        <Card className="shadow-sm border-slate-100 p-5 flex flex-col justify-between bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Longest Streak</span>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block leading-none">{data.longestStreak} Days</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-1">Record consistency mark</span>
          </div>
        </Card>

        {/* Mini Stats Card 2 */}
        <Card className="shadow-sm border-slate-100 p-5 flex flex-col justify-between bg-slate-50/20">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Study Days</span>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block leading-none">{data.totalStudyDays} Days</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-1">Cumulative days studied</span>
          </div>
        </Card>
      </div>

      {/* 3. WEEKLY TRACKER & MONTHLY CONTRIBUTION CALENDAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Checklist Block */}
        <Card className="md:col-span-1 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Weekly Activity</h3>
            <p className="text-[10px] text-slate-400">Weekly checklist logs</p>
          </div>

          <div className="space-y-2">
            {data.weeklyActivity.map((dayItem, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold ${
                  dayItem.studied
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <span className="font-extrabold">{dayItem.day}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black">
                    {dayItem.studied ? 'Completed' : 'Missed'}
                  </span>
                  {dayItem.studied ? (
                    <span aria-label="studied indicator" className="text-emerald-600 font-extrabold font-mono text-sm">✓</span>
                  ) : (
                    <span aria-label="missed indicator" className="text-slate-400 font-extrabold font-mono text-sm">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Calendar View */}
        <Card className="md:col-span-2 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Learning Calendar</h3>
              <p className="text-[10px] text-slate-400">August 2026 logs</p>
            </div>
            {/* Calendar Legend */}
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Studied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded border border-orange-500 bg-white" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* GitHub-style Contribution Grid */}
          <div className="grid grid-cols-7 gap-2 p-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
              <span key={idx} className="text-[9px] font-black text-slate-400 uppercase">{w}</span>
            ))}

            {/* Empty boxes for calendar offset padding (e.g. August starts on Sat = 6 offsets) */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={`offset-${idx}`} className="aspect-square rounded bg-slate-50/20" />
            ))}

            {data.monthlyCalendar.map((dayItem) => {
              const isStudied = dayItem.status === 'studied';
              const isMissed = dayItem.status === 'missed';
              const isToday = dayItem.status === 'today';
              const isFuture = dayItem.status === 'future';

              return (
                <div
                  key={dayItem.day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-black transition-all relative ${
                    isStudied
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isMissed
                      ? 'bg-rose-500 text-white shadow-sm'
                      : isToday
                      ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-sm'
                      : isFuture
                      ? 'bg-slate-50 border border-dashed border-slate-200 text-slate-300'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                  title={`Day ${dayItem.day}: ${dayItem.status}`}
                >
                  <span>{dayItem.day}</span>
                  {isToday && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 4. TODAY'S GOALS & ACTIVE ROADMAP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Learning Goal */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between bg-gradient-soft border-indigo-150">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-indigo-100/30 pb-2">
              <Target size={16} className="text-indigo-650" />
              <span>Today's Learning Goal</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Daily Session Progress</span>
                <span className="text-indigo-750">{data.todayGoal.sessionsCompleted} / {data.todayGoal.sessionsTarget} Sessions</span>
              </div>
              <ProgressBar
                value={data.todayGoal.sessionsCompleted}
                max={data.todayGoal.sessionsTarget}
                size="sm"
              />
              <p className="text-[11px] font-semibold text-slate-500">
                Remaining time today: <strong className="font-extrabold text-slate-700">{data.todayGoal.minutesRemaining} minutes</strong> to match your consistency checklist.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate('/ai-tutor')}
              className="text-indigo-600 border-indigo-150 hover:bg-indigo-50/50"
            >
              Continue Learning
            </Button>
          </div>
        </Card>

        {/* Roadmap Active Card shortcut */}
        <Card className="p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Today's Roadmap Activity
            </h3>
            
            <div className="space-y-4 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Topic</span>
                <h4 className="text-sm font-black text-slate-850 mt-0.5">{data.todayGoal.roadmapTopic}</h4>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Topic Completion</span>
                  <span>{data.todayGoal.roadmapProgress}%</span>
                </div>
                <ProgressBar value={data.todayGoal.roadmapProgress} max={100} size="xs" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-4">
            <button
              onClick={() => navigate('/roadmap')}
              className="text-xs font-bold text-slate-450 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              View Roadmap
            </button>
            <Button
              size="xs"
              variant="gradient"
              onClick={() => navigate('/ai-tutor', { state: { topic: 'Binary Trees' } })}
              rightIcon={<ChevronRight size={12} />}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. STREAK MILESTONES */}
      <Card className="p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Streak Milestones</h3>
            <p className="text-[10px] text-slate-400">Unlock achievement titles as you build consistency</p>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {data.milestones.filter(m => m.completed).length} / {data.milestones.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {data.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`rounded-xl border p-4 text-center flex flex-col justify-between gap-3 transition-all ${
                milestone.completed
                  ? 'bg-orange-50/50 border-orange-100/60 text-orange-900 shadow-sm shadow-orange-500/5'
                  : 'bg-slate-50/40 border-slate-100 text-slate-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-lg ${
                  milestone.completed ? 'bg-orange-100 shadow-sm' : 'bg-slate-100 text-slate-450'
                }`}>
                  {milestone.completed ? milestone.icon : <Lock size={14} />}
                </div>
                <div>
                  <h4 className="text-xs font-black truncate">{milestone.label}</h4>
                  <span className="text-[10px] font-semibold opacity-85 block mt-0.5">🔥 {milestone.target} Days Goal</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100/50 text-[10px] font-black uppercase">
                {milestone.completed ? (
                  <span className="text-emerald-600">Unlocked</span>
                ) : (
                  <span className="text-slate-400">Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. WEEKLY SUMMARY & HISTORY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <Card className="p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
            Weekly Learning Summary (This Week)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 pt-1">
            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Study Days</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.studyDays} / 7
              </strong>
            </div>

            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Study Hours</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.studyHours}
              </strong>
            </div>

            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Topics Mastered</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.topicsCompleted}
              </strong>
            </div>

            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quizzes Done</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.quizzesCompleted}
              </strong>
            </div>

            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cards Studied</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.flashcardsReviewed}
              </strong>
            </div>

            <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Notes Saved</span>
              <strong className="text-slate-800 text-base font-black block mt-1">
                {data.weeklySummary.notesCreated}
              </strong>
            </div>
          </div>
        </Card>

        {/* Streak History Timeline */}
        <Card className="p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
            Streak History
          </h3>
          <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4 py-1 text-xs">
            {data.history.map((historyItem, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  historyItem.active ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-slate-350'
                }`} />
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-bold ${historyItem.active ? 'text-slate-800' : 'text-slate-500'}`}>
                    {historyItem.type}
                  </span>
                  <Badge color={historyItem.active ? 'orange' : 'slate'} size="xs">
                    {historyItem.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 7. MOTIVATION CARD & QUICK NAVS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Motivation Alive Banner */}
        <Card className="md:col-span-2 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/20 border-indigo-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Heart size={22} className="fill-indigo-500 text-indigo-500" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h4 className="text-sm font-black text-slate-800">Keep Your Streak Alive!</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-0.5">
                You've studied for {data.currentStreak} consecutive days. One more session today keeps your streak going.
              </p>
            </div>
            <Button
              size="xs"
              onClick={() => navigate('/ai-tutor')}
              className="w-max"
            >
              Start Learning
            </Button>
          </div>
        </Card>

        {/* Redirects to Progress Analytics */}
        <Card className="md:col-span-1 p-5 shadow-sm flex flex-col justify-between bg-slate-50/20 border-slate-100">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800">Progress Integration</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
              Want to see how this daily consistency translates to overall competency percentages and best scores?
            </p>
          </div>
          <div className="pt-3">
            <Button
              size="xs"
              variant="outline"
              fullWidth
              onClick={() => navigate('/progress')}
              className="text-slate-600 hover:text-indigo-650"
            >
              View Analytics
            </Button>
          </div>
        </Card>
      </div>

      {/* 8. STUDY ACTIVITY LIST */}
      <Card className="p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
          <Calendar size={15} className="text-slate-400" />
          <span>Recent Learning Activity</span>
        </h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 text-xs border-b border-slate-50 last:border-b-0 pb-2 last:pb-0"
            >
              <div>
                <span className="font-bold text-slate-700 block">{activity.type}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Topic: {activity.detail}</span>
              </div>
              <Badge size="xs" color={activity.time === 'Today' ? 'orange' : 'slate'}>
                {activity.time}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

