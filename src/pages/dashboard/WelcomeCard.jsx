import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoadmap } from '../../context/RoadmapContext';
import { Sparkles, Award, Calendar } from 'lucide-react';

export default function WelcomeCard() {
  const { user } = useAuth();
  const { activeRoadmap } = useRoadmap();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/30 shadow-lg p-6 sm:p-8 flex flex-col justify-between min-h-[180px]">
      <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-32 h-32 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />

      {/* Date & Greeting */}
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-medium mb-2.5">
          <Calendar size={13} />
          <span>{today}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white">
          Welcome back, {user?.name || 'Learner'}! <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-indigo-100 text-xs sm:text-sm max-w-lg leading-relaxed">
          Your AI tutor has organized learning tasks based on your goal to master <strong className="text-white">{activeRoadmap ? activeRoadmap.subject : (user?.learningGoal || 'Computer Science')}</strong>.
        </p>
      </div>

      {/* Bottom Row Tier & Stats */}
      <div className="relative z-10 flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/10">
        <Link to="/certificates" className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
            <Award size={16} />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block font-semibold leading-none">CREDENTIALS</span>
            <span className="text-white text-xs font-bold mt-0.5 block">{user?.statistics?.certificates ?? 0} Earned (View)</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/20 flex items-center justify-center text-violet-300">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] text-violet-300 block font-semibold leading-none font-sans">ACCURACY</span>
            <span className="text-white text-xs font-bold mt-0.5 block">{user?.statistics?.averageScore ? `${user.statistics.averageScore}%` : '95.0%'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
