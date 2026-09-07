import React from 'react';
import { BookOpen, ArrowRight, Brain } from 'lucide-react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';

export default function CurrentLearningCard({
  topic,
  onContinue,
}) {
  if (!topic) return null;

  // Mock progress details for the active topic card
  const mockProgress = 60;
  const remainingMinutes = Math.round(topic.estimatedMinutes * (1 - mockProgress / 100));

  return (
    <Card variant="highlighted" className="shadow-md border-indigo-200 bg-gradient-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 bottom-0 opacity-5 flex items-center pr-6 pointer-events-none">
        <Brain size={160} />
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <BookOpen size={16} className="text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase">
            Active Study Spotlight
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 leading-snug">
              {topic.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              Currently working on this stage. Review concepts and implement exercises in the AI Tutor.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => onContinue(topic)}
              className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 py-2.5 px-4 rounded-xl shadow transition-all cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Spot progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-3 border-t border-slate-100/60">
          <ProgressBar
            value={mockProgress}
            max={100}
            label="Module Mastery"
            size="sm"
            showValue={true}
          />
          <div className="flex justify-end text-xs font-semibold text-slate-500">
            Estimated remaining: <strong className="text-slate-700 ml-1">{remainingMinutes} mins</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}
