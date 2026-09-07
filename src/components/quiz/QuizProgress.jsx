import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function QuizProgress({
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  onTimeUp,
}) {
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeLow = timeLeft < 30;

  // Trigger time up callback
  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* Progress Text */}
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Progress
          </span>
          <span className="text-sm font-bold text-slate-800">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Digital Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm transition-all ${
            isTimeLow
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Timer size={16} className={isTimeLow ? 'text-rose-500' : 'text-slate-500'} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={currentQuestionIndex + 1}
        max={totalQuestions}
        showValue={false}
        size="sm"
        color={isTimeLow ? 'error' : 'primary'}
      />
    </div>
  );
}
