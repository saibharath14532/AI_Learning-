import React, { useState, useEffect } from 'react';
import { Zap, Map, FileText, Sparkles } from 'lucide-react';
import { quizAPI, notesAPI, roadmapAPI } from '../../services/api';

const STATIC_ACTIVITIES = [
  {
    id: 1,
    type: 'quiz',
    icon: Zap,
    iconBg: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    title: 'Completed Quiz: DBMS Normalization',
    desc: 'Scored 8/10 on 2NF & 3NF definitions.',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'doubt',
    icon: Sparkles,
    iconBg: 'bg-violet-50 text-violet-600 border-violet-100',
    title: 'Resolved Doubt: SQL Joins vs Subqueries',
    desc: 'Analyzed query execution plans & index behavior.',
    time: '4 hours ago',
  },
  {
    id: 3,
    type: 'roadmap',
    icon: Map,
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'Milestone Achieved: React Architecture',
    desc: 'Completed Phase 2: State Management & Hooks.',
    time: 'Yesterday',
  },
  {
    id: 4,
    type: 'notes',
    icon: FileText,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    title: 'Generated Notes: ACID Properties',
    desc: 'Created structural summaries & database isolation levels.',
    time: '2 days ago',
  },
];

export default function RecentActivity() {
  const [activities, setActivities] = useState(STATIC_ACTIVITIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadActivities() {
      try {
        const [quizRes, noteRes, roadmapRes] = await Promise.allSettled([
          quizAPI.getHistory(),
          notesAPI.getAll(),
          roadmapAPI.getAll(),
        ]);

        const fetchedList = [];

        if (quizRes.status === 'fulfilled' && quizRes.value) {
          const attempts = Array.isArray(quizRes.value) ? quizRes.value : (quizRes.value?.data?.attempts || quizRes.value?.data || []);
          if (Array.isArray(attempts)) {
            attempts.slice(0, 3).forEach(att => {
              fetchedList.push({
                id: `quiz_${att._id || att.id || Math.random()}`,
                type: 'quiz',
                icon: Zap,
                iconBg: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                title: `Completed Quiz: ${att.quiz?.title || att.quizTitle || att.topic || 'Quiz'}`,
                desc: `Scored ${att.score !== undefined ? att.score : (att.percentage || 0)}/10 on AI questions.`,
                timestamp: new Date(att.completedAt || att.createdAt || Date.now()).getTime(),
                time: att.completedAt ? new Date(att.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              });
            });
          }
        }

        if (noteRes.status === 'fulfilled' && noteRes.value) {
          const notes = Array.isArray(noteRes.value) ? noteRes.value : (noteRes.value?.data?.notes || noteRes.value?.notes || noteRes.value?.data || []);
          if (Array.isArray(notes)) {
            notes.slice(0, 3).forEach(n => {
              fetchedList.push({
                id: `note_${n._id || n.id || Math.random()}`,
                type: 'notes',
                icon: FileText,
                iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
                title: `Generated Notes: ${n.topic || n.title || 'Study Notes'}`,
                desc: n.summary ? n.summary.slice(0, 70) + '...' : 'Generated detailed study notes & key concepts.',
                timestamp: new Date(n.createdAt || Date.now()).getTime(),
                time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recently',
              });
            });
          }
        }

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
          const roadmaps = Array.isArray(roadmapRes.value) ? roadmapRes.value : (roadmapRes.value?.data?.roadmaps || roadmapRes.value?.roadmaps || roadmapRes.value?.data || []);
          if (Array.isArray(roadmaps)) {
            roadmaps.slice(0, 3).forEach(r => {
              fetchedList.push({
                id: `roadmap_${r._id || r.id || Math.random()}`,
                type: 'roadmap',
                icon: Map,
                iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                title: `Roadmap: ${r.subject || r.title || r.goal || 'Learning Roadmap'}`,
                desc: `Progress: ${r.progress || 0}% completed across modules.`,
                timestamp: new Date(r.updatedAt || r.createdAt || Date.now()).getTime(),
                time: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recently',
              });
            });
          }
        }

        fetchedList.sort((a, b) => b.timestamp - a.timestamp);

        if (isMounted) {
          if (fetchedList.length > 0) {
            setActivities(fetchedList.slice(0, 4));
          } else {
            setActivities(STATIC_ACTIVITIES);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setActivities(STATIC_ACTIVITIES);
          setLoading(false);
        }
      }
    }
    loadActivities();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="card flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
          <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline">View All</span>
        </div>

        <div className="space-y-4">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex gap-3 group">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${act.iconBg}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal truncate">{act.desc}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">{act.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
