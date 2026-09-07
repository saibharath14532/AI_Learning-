import React from 'react';
import Card from '../common/Card';

export default function DeckProgress({ cards }) {
  if (!cards || cards.length === 0) return null;

  const total = cards.length;
  const known = cards.filter(c => c.status === 'known').length;
  const review = cards.filter(c => c.status === 'review').length;
  const unknown = cards.filter(c => c.status === 'unknown').length;

  const knownPercent = Math.round((known / total) * 100);
  const reviewPercent = Math.round((review / total) * 100);
  const unknownPercent = 100 - knownPercent - reviewPercent; // Ensure total is 100

  return (
    <Card className="p-4 shadow-sm border border-slate-100 bg-slate-50/20">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">Leitner Progress</span>
          <span className="font-extrabold text-slate-500">
            {known} / {total} Mastered
          </span>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${knownPercent}%` }}
            title={`Mastered: ${knownPercent}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-out"
            style={{ width: `${reviewPercent}%` }}
            title={`Reviewing: ${reviewPercent}%`}
          />
          <div
            className="h-full bg-slate-400 transition-all duration-300 ease-out"
            style={{ width: `${unknownPercent}%` }}
            title={`Unfamiliar: ${unknownPercent}%`}
          />
        </div>

        {/* Details List */}
        <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs pt-1.5 border-t border-slate-100/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block font-semibold leading-none">MASTERED</span>
              <strong className="text-slate-750 font-extrabold block mt-0.5">{knownPercent}% <span className="text-[10px] text-slate-400 font-normal">({known})</span></strong>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block font-semibold leading-none">REVIEWING</span>
              <strong className="text-slate-755 font-extrabold block mt-0.5">{reviewPercent}% <span className="text-[10px] text-slate-400 font-normal">({review})</span></strong>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-450 bg-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block font-semibold leading-none">UNFAMILIAR</span>
              <strong className="text-slate-760 font-extrabold block mt-0.5">{unknownPercent}% <span className="text-[10px] text-slate-400 font-normal">({unknown})</span></strong>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
