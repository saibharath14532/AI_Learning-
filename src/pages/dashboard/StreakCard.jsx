import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Check, ChevronRight } from 'lucide-react';
import { streakAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DEFAULT_WEEK_DAYS = [
  { label: 'Mon', completed: false },
  { label: 'Tue', completed: false },
  { label: 'Wed', completed: false },
  { label: 'Thu', completed: false },
  { label: 'Fri', completed: false },
  { label: 'Sat', completed: false },
  { label: 'Sun', completed: false },
];

export default function StreakCard() {
  const [days, setDays] = useState(DEFAULT_WEEK_DAYS);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStreakData = async () => {
      try {
        const res = await streakAPI.getStreak();
        if (isMounted && res.success && res.data) {
          setStreakCount(res.data.currentStreak || 0);
          if (Array.isArray(res.data.weeklyActivity)) {
            const formatted = res.data.weeklyActivity.map(item => ({
              label: item.day,
              completed: !!item.studied,
            }));
            setDays(formatted);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live streak data for StreakCard:', err);
      }
    };
    fetchStreakData();
    return () => { isMounted = false; };
  }, []);

  const toggleToday = () => {
    // Current day index
    const todayIndex = (new Date().getDay() + 6) % 7;
    const updated = [...days];
    if (!updated[todayIndex]?.completed) {
      if (updated[todayIndex]) updated[todayIndex].completed = true;
      setDays(updated);
      setStreakCount(prev => prev + 1);
      toast.success('Daily study logged! Streak extended 🔥');
    } else {
      if (updated[todayIndex]) updated[todayIndex].completed = false;
      setDays(updated);
      setStreakCount(prev => Math.max(0, prev - 1));
      toast('Daily log updated.', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="card flex flex-col justify-between h-full min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Flame size={17} className="animate-pulse" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Study Streak</h3>
        </div>
        <Link
          to="/streak"
          className="text-[10px] font-bold text-orange-650 hover:text-orange-750 flex items-center gap-0.5"
        >
          <span>View Streak</span>
          <ChevronRight size={10} />
        </Link>
      </div>

      {/* Streak Count Banner */}
      <div className="flex items-center gap-3.5 my-1">
        <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm shadow-orange-500/10">
          <Flame size={24} className="fill-orange-600" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-800">{streakCount} Days</p>
          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Keep your daily learning streak alive</p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-slate-100">
        {days.map((day, idx) => (
          <div
            key={day.label}
            onClick={idx === 5 ? toggleToday : undefined}
            className={`flex flex-col items-center p-1.5 rounded-lg transition-all ${
              idx === 5 ? 'cursor-pointer active:scale-95' : ''
            } ${
              day.completed
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'
                : idx === 5
                ? 'bg-slate-50 border border-dashed border-slate-200 text-slate-400 hover:border-orange-200 hover:bg-orange-50/30'
                : 'bg-slate-50 border border-slate-100 text-slate-400'
            }`}
          >
            <span className="text-[9px] font-bold block leading-none">{day.label}</span>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-1.5 ${
              day.completed ? 'bg-white/20' : 'bg-slate-200/50'
            }`}>
              {day.completed ? (
                <Check size={9} strokeWidth={4} className="text-white" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
