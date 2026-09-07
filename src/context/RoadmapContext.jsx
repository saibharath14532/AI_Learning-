import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { roadmapAPI, aiAPI } from '../services/api';
import { generateMockRoadmap } from '../data/mockData';
import { useAuth } from './AuthContext';

const RoadmapContext = createContext(null);

const safeJsonParse = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export function RoadmapProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [activeRoadmap, setActiveRoadmap] = useState(() => safeJsonParse('ailp_active_roadmap', null));

  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync activeRoadmap to localStorage for fast initial render
  useEffect(() => {
    if (activeRoadmap) {
      localStorage.setItem('ailp_active_roadmap', JSON.stringify(activeRoadmap));
    } else {
      localStorage.removeItem('ailp_active_roadmap');
    }
  }, [activeRoadmap]);

  // Fetch authenticated user's roadmaps from MongoDB
  const fetchRoadmaps = useCallback(async () => {
    if (!isAuthenticated && !localStorage.getItem('ailp_token')) {
      setIsLoadingRoadmap(false);
      return;
    }

    setIsLoadingRoadmap(true);
    try {
      const res = await roadmapAPI.getAll();
      if (res.success && Array.isArray(res.roadmaps)) {
        setUserRoadmaps(res.roadmaps);
        if (res.roadmaps.length > 0) {
          // Select the most recent active roadmap
          const current = res.roadmaps[0];
          setActiveRoadmap(current);
        } else {
          setActiveRoadmap(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load user roadmaps from MongoDB:', err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  }, [isAuthenticated]);

  // Load user roadmaps on mount or when auth state changes
  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps, user?.id, user?._id]);

  // Generate & Save Roadmap to MongoDB via Gemini AI
  const generateRoadmap = useCallback(async (goal, subject, currentLevel, targetLevel, dailyStudyTime, duration) => {
    setIsGenerating(true);
    try {
      let savedRoadmap = null;

      // 1. Attempt Gemini AI Roadmap Generation & MongoDB Save
      try {
        const res = await aiAPI.generateRoadmap({ goal, subject, currentLevel, targetLevel, dailyStudyTime, duration });
        if (res.success && res.roadmap) {
          savedRoadmap = res.roadmap;
          setActiveRoadmap(res.roadmap);
          setUserRoadmaps(prev => [res.roadmap, ...prev]);
          return res.roadmap;
        }
      } catch (aiErr) {
        console.warn('AI Roadmap Generation failed, falling back to template API:', aiErr);
      }

      // 2. Fallback to standard save endpoint if AI endpoint fails
      const template = generateMockRoadmap(goal, subject, currentLevel, targetLevel, dailyStudyTime, duration);
      const payload = {
        title: template.title || goal || subject,
        goal: goal || template.goal,
        subject: subject || template.subject,
        currentLevel: currentLevel || template.currentLevel,
        targetLevel: targetLevel || template.targetLevel,
        duration: duration || template.duration,
        dailyStudyTime: dailyStudyTime || template.dailyStudyTime,
        progress: 0,
        status: 'in-progress',
        topics: template.topics || [],
      };

      const res = await roadmapAPI.save(payload);
      if (res.success && res.roadmap) {
        savedRoadmap = res.roadmap;
        setActiveRoadmap(res.roadmap);
        setUserRoadmaps(prev => [res.roadmap, ...prev]);
        return res.roadmap;
      } else {
        setActiveRoadmap(template);
        return template;
      }
    } catch (err) {
      console.error('Failed to save generated roadmap to database:', err);
      const fallback = generateMockRoadmap(goal, subject, currentLevel, targetLevel, dailyStudyTime, duration);
      setActiveRoadmap(fallback);
      return fallback;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Update Topic Status & recalculate overall progress percentage in MongoDB
  const updateTopicStatus = useCallback(async (topicId, newStatus) => {
    if (!activeRoadmap) return;

    const updatedTopics = (activeRoadmap.topics || []).map(topic => {
      if (topic.id === topicId) {
        return { ...topic, status: newStatus, completed: newStatus === 'Completed' };
      }
      return topic;
    });

    // Calculate completed percentage
    const completedCount = updatedTopics.filter(t => t.status === 'Completed').length;
    const totalCount = updatedTopics.length || 1;
    const newProgress = Math.round((completedCount / totalCount) * 100);

    // Auto-unlock next topic if status was completed
    if (newStatus === 'Completed') {
      const completedIndex = updatedTopics.findIndex(t => t.id === topicId);
      if (completedIndex !== -1 && completedIndex + 1 < updatedTopics.length) {
        const nextTopic = updatedTopics[completedIndex + 1];
        if (nextTopic.status === 'Upcoming' || nextTopic.status === 'Locked') {
          nextTopic.status = 'In Progress';
        }
      }
    }

    const updatedRoadmapState = {
      ...activeRoadmap,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'in-progress',
      topics: updatedTopics,
    };

    // Optimistic UI update
    setActiveRoadmap(updatedRoadmapState);

    // Persist changes to MongoDB if roadmap has database ID
    const roadmapId = activeRoadmap.id || activeRoadmap._id;
    if (roadmapId && !roadmapId.startsWith('roadmap_1')) {
      try {
        await roadmapAPI.update(roadmapId, {
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in-progress',
          topics: updatedTopics,
        });
      } catch (err) {
        console.error('Failed to sync topic progress to MongoDB:', err);
      }
    }
  }, [activeRoadmap]);

  // Delete / Reset Roadmap
  const resetRoadmap = useCallback(async () => {
    if (activeRoadmap) {
      const roadmapId = activeRoadmap.id || activeRoadmap._id;
      if (roadmapId && !roadmapId.startsWith('roadmap_1')) {
        try {
          await roadmapAPI.delete(roadmapId);
        } catch (err) {
          console.warn('Failed to delete roadmap from MongoDB:', err);
        }
      }
    }

    setActiveRoadmap(null);
    setUserRoadmaps(prev => prev.filter(r => (r.id || r._id) !== (activeRoadmap?.id || activeRoadmap?._id)));
    localStorage.removeItem('ailp_active_roadmap');
  }, [activeRoadmap]);

  const value = {
    activeRoadmap,
    userRoadmaps,
    isLoadingRoadmap,
    isGenerating,
    fetchRoadmaps,
    generateRoadmap,
    updateTopicStatus,
    resetRoadmap,
  };

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error('useRoadmap must be used within a RoadmapProvider');
  return ctx;
}

export default RoadmapContext;
