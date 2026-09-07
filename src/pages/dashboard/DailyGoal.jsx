import { useState } from 'react';
import { Target, CheckCircle2, Plus } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function DailyGoal() {
  const [minutes, setMinutes] = useState(25);
  const target = 45;
  const percentage = Math.min(Math.round((minutes / target) * 100), 100);

  const handleAddTime = () => {
    if (minutes >= target) {
      toast.success("Goal already completed today! Keep it up.");
      return;
    }
    setMinutes((prev) => Math.min(prev + 5, target));
    toast.success("Logged 5 mins of active study!");
  };

  // SVG dimensions for circular progress
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card flex flex-col justify-between h-full min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Target size={17} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Daily Goal</h3>
        </div>
        {percentage >= 100 && (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> Done
          </span>
        )}
      </div>

      <div className="flex items-center gap-5 my-2">
        {/* SVG Circular Progress */}
        <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth="6"
            />
            {/* Active ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-indigo-600 fill-none transition-all duration-500 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-slate-800">{percentage}%</span>
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-[11px] font-semibold leading-none">ACTIVE TIME</p>
          <p className="text-2xl font-black text-slate-800 mt-1.5">
            {minutes} <span className="text-xs text-slate-400 font-normal">/ {target} mins</span>
          </p>
          <p className="text-slate-400 text-[10px] mt-1 truncate">
            {target - minutes > 0 ? `${target - minutes} mins to hit your target` : 'Daily target achieved!'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          leftIcon={<Plus size={14} />}
          onClick={handleAddTime}
          className="text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
        >
          Add 5 Mins Study
        </Button>
      </div>
    </div>
  );
}
