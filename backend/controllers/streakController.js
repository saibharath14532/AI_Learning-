import QuizAttempt from '../models/QuizAttempt.js';
import FlashcardSet from '../models/FlashcardSet.js';
import Roadmap from '../models/Roadmap.js';
import Note from '../models/Note.js';

// Helper to format Date to YYYY-MM-DD string in local time
const formatDateStr = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to calculate difference in days between two YYYY-MM-DD strings
const getDaysDiff = (d1Str, d2Str) => {
  const t1 = new Date(d1Str).getTime();
  const t2 = new Date(d2Str).getTime();
  return Math.round((t2 - t1) / (1000 * 3600 * 24));
};

// @desc    Get real study streak statistics and activity logs
// @route   GET /api/streak
// @access  Private
export const getStudyStreak = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user documents across all 4 learning activity collections
    const [attempts, flashcardSets, roadmaps, notes] = await Promise.all([
      QuizAttempt.find({ user: userId }).sort({ completedAt: -1 }).populate('quiz', 'title subject topic'),
      FlashcardSet.find({ user: userId }).sort({ updatedAt: -1 }),
      Roadmap.find({ user: userId }).sort({ updatedAt: -1 }),
      Note.find({ user: userId }).sort({ createdAt: -1 }),
    ]);

    // Collect all unique activity dates (YYYY-MM-DD)
    const uniqueDatesSet = new Set();
    const recentActivity = [];

    attempts.forEach(a => {
      const d = a.completedAt || a.createdAt;
      if (d) {
        const dStr = formatDateStr(d);
        uniqueDatesSet.add(dStr);
        recentActivity.push({
          type: 'Quiz Completed',
          detail: `${a.quiz?.title || 'Quiz'} (${a.percentage || 0}%)`,
          timestamp: d,
        });
      }
    });

    flashcardSets.forEach(s => {
      const d = s.updatedAt || s.createdAt;
      if (d) {
        const dStr = formatDateStr(d);
        uniqueDatesSet.add(dStr);
        recentActivity.push({
          type: 'Flashcards Reviewed',
          detail: s.title || s.topic || 'Flashcard Set',
          timestamp: d,
        });
      }
    });

    roadmaps.forEach(r => {
      const d = r.updatedAt || r.createdAt;
      if (d) {
        const dStr = formatDateStr(d);
        uniqueDatesSet.add(dStr);
        recentActivity.push({
          type: 'Roadmap Updated',
          detail: `${r.goal || r.subject} (${r.progress}%)`,
          timestamp: d,
        });
      }
    });

    notes.forEach(n => {
      const d = n.createdAt || n.updatedAt;
      if (d) {
        const dStr = formatDateStr(d);
        uniqueDatesSet.add(dStr);
        recentActivity.push({
          type: 'Notes Saved',
          detail: n.title || n.topic || 'Notes',
          timestamp: d,
        });
      }
    });

    // Sort recent activity descending by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivityList = recentActivity.slice(0, 5).map(act => {
      const actDateStr = formatDateStr(act.timestamp);
      const todayStr = formatDateStr(new Date());
      const yesterdayStr = formatDateStr(new Date(Date.now() - 86400000));
      
      let timeLabel = actDateStr;
      if (actDateStr === todayStr) timeLabel = 'Today';
      else if (actDateStr === yesterdayStr) timeLabel = 'Yesterday';

      return {
        type: act.type,
        detail: act.detail,
        time: timeLabel,
      };
    });

    // Dates setup
    const now = new Date();
    const todayStr = formatDateStr(now);
    const yesterdayStr = formatDateStr(new Date(now.getTime() - 86400000));

    const studiedToday = uniqueDatesSet.has(todayStr);
    const totalStudyDays = uniqueDatesSet.size;

    // 1. Calculate Current Streak
    let currentStreak = 0;
    let streakStartStr = null;

    if (uniqueDatesSet.has(todayStr)) {
      streakStartStr = todayStr;
    } else if (uniqueDatesSet.has(yesterdayStr)) {
      streakStartStr = yesterdayStr;
    }

    if (streakStartStr) {
      let checkDate = new Date(streakStartStr);
      while (true) {
        const checkStr = formatDateStr(checkDate);
        if (uniqueDatesSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 2. Calculate Longest Streak
    const sortedDates = Array.from(uniqueDatesSet).sort();
    let longestStreak = 0;

    if (sortedDates.length > 0) {
      let tempStreak = 1;
      let maxTemp = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const diff = getDaysDiff(sortedDates[i - 1], sortedDates[i]);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
        if (tempStreak > maxTemp) {
          maxTemp = tempStreak;
        }
      }
      longestStreak = Math.max(currentStreak, maxTemp);
    }

    // 3. Weekly Activity (Monday through Sunday for current week)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (now.getDay() + 6) % 7; // Monday = 0
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - currentDayIdx);

    const weeklyActivity = dayNames.map((dayName, idx) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + idx);
      const dStr = formatDateStr(d);
      return {
        day: dayName,
        studied: uniqueDatesSet.has(dStr),
      };
    });

    // 4. Monthly Calendar
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthlyCalendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dStr = formatDateStr(d);
      
      let status = 'missed';
      if (dStr === todayStr) {
        status = studiedToday ? 'today' : 'today';
      } else if (d > now) {
        status = 'future';
      } else if (uniqueDatesSet.has(dStr)) {
        status = 'studied';
      }

      monthlyCalendar.push({ day, status });
    }

    // 5. Milestones
    const milestones = [
      { id: 1, target: 7, label: 'First Week', completed: longestStreak >= 7 || currentStreak >= 7, icon: '🔥' },
      { id: 2, target: 14, label: 'Two Week Warrior', completed: longestStreak >= 14 || currentStreak >= 14, icon: '⚔️' },
      { id: 3, target: 30, label: 'Monthly Master', completed: longestStreak >= 30 || currentStreak >= 30, icon: '👑' },
      { id: 4, target: 50, label: 'Learning Champion', completed: longestStreak >= 50 || currentStreak >= 50, icon: '🏆' },
      { id: 5, target: 100, label: 'Century Scholar', completed: longestStreak >= 100 || currentStreak >= 100, icon: '🎓' },
    ];

    // 6. Active Roadmap info for Today's Goal card
    const activeRoadmap = roadmaps.find(r => r.progress < 100) || roadmaps[0] || null;
    let nextTopicTitle = 'Explore Learning Topics';
    let roadmapProgress = 0;

    if (activeRoadmap) {
      roadmapProgress = activeRoadmap.progress || 0;
      if (Array.isArray(activeRoadmap.topics)) {
        const nextTopic = activeRoadmap.topics.find(t => t.status !== 'Completed') || activeRoadmap.topics[0];
        if (nextTopic) {
          nextTopicTitle = nextTopic.title;
        }
      }
    }

    const todayGoal = {
      sessionsTarget: 2,
      sessionsCompleted: studiedToday ? 1 : 0,
      minutesRemaining: studiedToday ? 0 : 25,
      roadmapTopic: nextTopicTitle,
      roadmapProgress,
    };

    // 7. Weekly Summary
    const thisWeekStudyDays = weeklyActivity.filter(w => w.studied).length;
    const weeklySummary = {
      studyDays: thisWeekStudyDays,
      studyHours: `${thisWeekStudyDays * 1}h ${thisWeekStudyDays > 0 ? '30m' : '0m'}`,
      topicsCompleted: attempts.length,
      quizzesCompleted: attempts.length,
      flashcardsReviewed: flashcardSets.reduce((acc, s) => acc + (s.totalCards || 0), 0),
      notesCreated: notes.length,
    };

    // 8. Streak History Timeline
    const history = [
      { type: 'Current Streak', value: `${currentStreak} days`, active: currentStreak > 0 },
      { type: 'Longest Streak', value: `${longestStreak} days`, active: false },
      { type: 'Total Study Days', value: `${totalStudyDays} days`, active: false },
    ];

    return res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalStudyDays,
        totalStudyHours: Math.round(totalStudyDays * 1.5 * 10) / 10,
        studiedToday,
        weeklyActivity,
        monthlyCalendar,
        milestones,
        todayGoal,
        weeklySummary,
        history,
        recentActivity: recentActivityList,
      }
    });
  } catch (error) {
    console.error(`Get Study Streak Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving study streak data',
    });
  }
};

// @desc    Get monthly learning calendar status
// @route   GET /api/streak/calendar
// @access  Private
export const getStudyCalendar = async (req, res) => {
  try {
    const userId = req.user._id;

    const [attempts, flashcardSets, roadmaps, notes] = await Promise.all([
      QuizAttempt.find({ user: userId }),
      FlashcardSet.find({ user: userId }),
      Roadmap.find({ user: userId }),
      Note.find({ user: userId }),
    ]);

    const datesSet = new Set();
    [...attempts, ...flashcardSets, ...roadmaps, ...notes].forEach(doc => {
      const d = doc.completedAt || doc.updatedAt || doc.createdAt;
      if (d) datesSet.add(formatDateStr(d));
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const todayStr = formatDateStr(now);

    const calendar = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dStr = formatDateStr(d);

      let status = 'missed';
      if (dStr === todayStr) status = 'today';
      else if (d > now) status = 'future';
      else if (datesSet.has(dStr)) status = 'studied';

      calendar.push({ day, date: dStr, status });
    }

    return res.status(200).json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    console.error(`Get Study Calendar Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving study calendar',
    });
  }
};

// @desc    Get weekly activity status (Monday - Sunday)
// @route   GET /api/streak/weekly
// @access  Private
export const getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const [attempts, flashcardSets, roadmaps, notes] = await Promise.all([
      QuizAttempt.find({ user: userId }),
      FlashcardSet.find({ user: userId }),
      Roadmap.find({ user: userId }),
      Note.find({ user: userId }),
    ]);

    const datesSet = new Set();
    [...attempts, ...flashcardSets, ...roadmaps, ...notes].forEach(doc => {
      const d = doc.completedAt || doc.updatedAt || doc.createdAt;
      if (d) datesSet.add(formatDateStr(d));
    });

    const now = new Date();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (now.getDay() + 6) % 7;
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - currentDayIdx);

    const weekly = dayNames.map((dayName, idx) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + idx);
      const dStr = formatDateStr(d);
      return {
        day: dayName,
        date: dStr,
        studied: datesSet.has(dStr),
      };
    });

    return res.status(200).json({
      success: true,
      data: weekly,
    });
  } catch (error) {
    console.error(`Get Weekly Activity Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving weekly activity',
    });
  }
};
