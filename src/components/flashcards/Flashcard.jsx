import React, { useState, useEffect } from 'react';
import { RefreshCw, Brain } from 'lucide-react';

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <div
      onClick={handleFlip}
      className="perspective-1000 w-full max-w-xl cursor-pointer select-none aspect-[1.6/1] md:aspect-[1.8/1] min-h-[240px] focus:outline-none group mx-auto"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT FACE (Question) */}
        <div className="absolute inset-0 w-full h-full backface-hidden border border-slate-200 bg-white rounded-2xl flex flex-col justify-between p-6 sm:p-8 hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
              {card.topic || 'General'}
            </span>
            <Brain size={15} className="text-slate-300" />
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <h3 className="text-base sm:text-lg font-black text-slate-800 text-center leading-relaxed max-w-md">
              {card.front}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-widest animate-pulse mt-1">
            <RefreshCw size={11} />
            <span>Click to Reveal Answer</span>
          </div>
        </div>

        {/* BACK FACE (Answer) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-white rounded-2xl flex flex-col justify-between p-6 sm:p-8 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
              {card.topic || 'General'}
            </span>
            <Brain size={15} className="text-indigo-400 animate-pulse" />
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center leading-relaxed max-w-md">
              {card.back}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            <RefreshCw size={11} />
            <span>Click to View Question</span>
          </div>
        </div>
      </div>
    </div>
  );
}
