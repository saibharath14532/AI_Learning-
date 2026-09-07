import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

const STATIC_RECOMMENDATIONS = [
  {
    id: 1,
    subject: 'DBMS',
    title: 'Boyce-Codd Normal Form (BCNF)',
    type: 'explainer',
    tag: 'Next Up',
    tagColor: 'bg-indigo-50 text-indigo-600',
    path: '/ai-tutor',
    actionText: 'Explain Concept',
    icon: BookOpen,
  },
  {
    id: 2,
    subject: 'React JS',
    title: 'Concurrent Rendering & Transitions',
    type: 'quiz',
    tag: 'Review Needed',
    tagColor: 'bg-amber-50 text-amber-600',
    path: '/quiz',
    actionText: 'Take Practice Quiz',
    icon: Zap,
  },
];

export default function RecommendedTopics() {
  const { activeRoadmap } = useRoadmap();
  const [recommendations, setRecommendations] = useState(STATIC_RECOMMENDATIONS);

  useEffect(() => {
    let list = [];

    // 1. Add active roadmap topic if available
    if (activeRoadmap) {
      const activeTopic = activeRoadmap.topics.find(t => t.status === 'In Progress') || 
                          activeRoadmap.topics.find(t => t.status === 'Upcoming');
      if (activeTopic) {
        list.push({
          id: `roadmap_rec_${activeTopic.id}`,
          subject: activeRoadmap.subject || 'Roadmap',
          title: `${activeTopic.title} (${activeTopic.dayRange})`,
          type: 'explainer',
          tag: activeTopic.status === 'In Progress' ? 'Continue' : 'Next Up',
          tagColor: activeTopic.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600',
          path: '/ai-tutor',
          actionText: activeTopic.status === 'In Progress' ? 'Continue Learning' : 'Start Learning',
          icon: BookOpen,
          state: { topic: activeTopic.title }
        });
      }
    }

    // 2. Add weak topic from last completed quiz
    const stored = localStorage.getItem('ailp_completed_quizzes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          const lastQuiz = parsed[0];
          if (lastQuiz.weakTopics && lastQuiz.weakTopics.length > 0) {
            const weakTopic = lastQuiz.weakTopics[0];
            list.push({
              id: `weak_rec_${lastQuiz.id}`,
              subject: lastQuiz.topic || 'Quiz Review',
              title: `${weakTopic} Traversal & Concepts`,
              type: 'explainer',
              tag: 'Review Needed',
              tagColor: 'bg-rose-50 text-rose-600 border border-rose-100',
              path: '/ai-tutor',
              actionText: `Study ${weakTopic}`,
              icon: BookOpen,
              state: { topic: weakTopic }
            });
          }
        }
      } catch (err) {
        console.error('Failed to parse completed quizzes for recommendations', err);
      }
    }

    // 3. Fallback to static recommendations if we have slots left
    STATIC_RECOMMENDATIONS.forEach(rec => {
      if (list.length < 3) {
        list.push(rec);
      }
    });

    setRecommendations(list.slice(0, 3));
  }, [activeRoadmap]);

  return (
    <div className="card flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="flex items-center gap-1.5 mb-5">
          <Sparkles size={16} className="text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-sm">AI Study Recommendations</h3>
        </div>

        <div className="space-y-3.5">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{rec.subject}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rec.tagColor}`}>
                      {rec.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                    {rec.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/50 pt-2.5">
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Icon size={11} className="text-slate-400" />
                    {rec.type === 'explainer' ? 'Reading material' : 'Interactive Test'}
                  </span>
                  <Link to={rec.path} state={rec.state}>
                    <button className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 active:scale-95 transition-all cursor-pointer">
                      {rec.actionText} <ArrowRight size={10} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
