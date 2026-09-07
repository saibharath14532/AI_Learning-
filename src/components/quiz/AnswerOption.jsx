import React from 'react';

export default function AnswerOption({
  letter,
  text,
  isSelected,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 cursor-pointer group ${
        isSelected
          ? 'bg-indigo-50 border-indigo-600 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
      } ${disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
    >
      <span
        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
          isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
        }`}
      >
        {letter}
      </span>
      <span
        className={`text-sm font-medium transition-colors ${
          isSelected ? 'text-indigo-900' : 'text-slate-700'
        }`}
      >
        {text}
      </span>
    </button>
  );
}
