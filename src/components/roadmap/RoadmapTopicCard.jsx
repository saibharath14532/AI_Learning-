import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Play, CheckCircle2, Circle, FileText } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function RoadmapTopicCard({
  topic,
  onStartLearning,
  onMarkComplete,
}) {
  const navigate = useNavigate();
  const { title, description, dayRange, difficulty, estimatedMinutes, objectives, status } = topic;

  const isLocked = status === 'Locked';
  const isCompleted = status === 'Completed';
  const isInProgress = status === 'In Progress';
  const isUpcoming = status === 'Upcoming';

  return (
    <Card
      variant={isInProgress ? 'highlighted' : 'default'}
      className={`relative overflow-hidden transition-all border ${
        isInProgress
          ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
          : isLocked
          ? 'opacity-65 border-slate-100 bg-slate-50/20'
          : 'border-slate-200'
      }`}
    >
      <div className="space-y-4">
        {/* Header Title & Badges */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider block mb-1 w-max">
              {dayRange}
            </span>
            <h4 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h4>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge>{difficulty}</Badge>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md">
              {estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          {description}
        </p>

        {/* Objectives */}
        {objectives && objectives.length > 0 && (
          <div className="pt-2 border-t border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Learning Objectives
            </span>
            <div className="space-y-1.5">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                  <Check size={13} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100/50 mt-1">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            {isCompleted && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Completed
              </span>
            )}
            {isInProgress && (
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 animate-pulse">
                <Circle size={14} className="fill-indigo-600/10" /> In Progress
              </span>
            )}
            {isUpcoming && (
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Circle size={14} /> Upcoming
              </span>
            )}
            {isLocked && (
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Lock size={12} /> Locked
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isCompleted && !isLocked && (
              <>
                <button
                  type="button"
                  onClick={() => onStartLearning(topic)}
                  className={`inline-flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    isInProgress
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow hover:bg-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Play size={10} className={isInProgress ? 'fill-current' : ''} />
                  <span>Start Learning</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/notes', { state: { topic: topic.title } })}
                  className="inline-flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <FileText size={11} />
                  <span>Generate Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => onMarkComplete(topic.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all cursor-pointer"
                >
                  <Check size={12} />
                  <span>Mark Complete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
