import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { quizAPI, aiAPI } from '../services/api';
import { generateMockQuiz } from '../data/mockData';
import { useAuth } from './AuthContext';

const QuizContext = createContext(null);

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

export function QuizProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [activeQuiz, setActiveQuiz] = useState(() => safeJsonParse('ailp_active_quiz', null));
  const [userAnswers, setUserAnswers] = useState(() => safeJsonParse('ailp_user_answers', {}));

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('ailp_quiz_time_left');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  const [userQuizzes, setUserQuizzes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);

  const [quizResult, setQuizResult] = useState(() => safeJsonParse('ailp_last_quiz_result', null));

  const timerRef = useRef(null);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (activeQuiz) {
      localStorage.setItem('ailp_active_quiz', JSON.stringify(activeQuiz));
    } else {
      localStorage.removeItem('ailp_active_quiz');
    }
  }, [activeQuiz]);

  useEffect(() => {
    localStorage.setItem('ailp_user_answers', JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    if (timeLeft > 0) {
      localStorage.setItem('ailp_quiz_time_left', timeLeft.toString());
    } else {
      localStorage.removeItem('ailp_quiz_time_left');
    }
  }, [timeLeft]);

  useEffect(() => {
    if (quizResult) {
      localStorage.setItem('ailp_last_quiz_result', JSON.stringify(quizResult));
    } else {
      localStorage.removeItem('ailp_last_quiz_result');
    }
  }, [quizResult]);

  // Fetch user's quizzes from MongoDB
  const fetchUserQuizzes = useCallback(async () => {
    if (!isAuthenticated && !localStorage.getItem('ailp_token')) return;
    setIsLoadingQuizzes(true);
    try {
      const res = await quizAPI.getAll();
      if (res.success && Array.isArray(res.quizzes)) {
        setUserQuizzes(res.quizzes);
      }
    } catch (err) {
      console.warn('Failed to load user quizzes from MongoDB:', err);
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [isAuthenticated]);

  // Fetch user's quiz attempt history from MongoDB
  const fetchQuizHistory = useCallback(async () => {
    if (!isAuthenticated && !localStorage.getItem('ailp_token')) return;
    try {
      const res = await quizAPI.getHistory();
      if (res.success && Array.isArray(res.history)) {
        setQuizHistory(res.history);
      }
    } catch (err) {
      console.warn('Failed to load quiz history from MongoDB:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserQuizzes();
    fetchQuizHistory();
  }, [fetchUserQuizzes, fetchQuizHistory, user?.id, user?._id]);

  // Start timer when active quiz changes
  useEffect(() => {
    if (activeQuiz && timeLeft > 0 && !quizResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz, timeLeft, quizResult]);

  // Generate & Save Quiz to MongoDB via Gemini AI
  const startQuiz = useCallback(async (topic, difficulty, type, count, goal, roadmapId = null) => {
    setIsGenerating(true);
    setQuizResult(null);
    setUserAnswers({});

    try {
      let savedQuiz = null;

      // 1. Attempt Gemini AI Quiz Generation & MongoDB Save
      try {
        const res = await aiAPI.generateQuiz({ topic, difficulty, type, count, goal, roadmapId });
        if (res.success && res.quiz) {
          savedQuiz = res.quiz;
          setUserQuizzes(prev => [res.quiz, ...prev]);
        }
      } catch (aiErr) {
        console.warn('AI Quiz Generation failed, falling back to template API:', aiErr);
      }

      // 2. Fallback to standard Quiz create endpoint if AI endpoint fails
      if (!savedQuiz) {
        const template = generateMockQuiz(topic, difficulty, type, count, goal);
        const payload = {
          title: template.title || `${topic} Quiz`,
          subject: topic,
          topic: topic,
          difficulty: difficulty || 'Intermediate',
          type: type || 'Multiple Choice',
          description: goal ? `Goal: ${goal}` : `Practice quiz on ${topic}`,
          questions: template.questions || [],
          timeLimit: (template.questions?.length || 10) * 90,
          roadmap: roadmapId,
        };
        try {
          const res = await quizAPI.create(payload);
          if (res.success && res.quiz) {
            savedQuiz = res.quiz;
            setUserQuizzes(prev => [res.quiz, ...prev]);
          }
        } catch (apiErr) {
          console.warn('MongoDB API create failed, falling back to local template:', apiErr);
          savedQuiz = template;
        }
      }

      setActiveQuiz(savedQuiz);

      // 1.5 minutes per question rule
      const totalQuestions = savedQuiz.questions ? savedQuiz.questions.length : count || 10;
      const initialSeconds = totalQuestions * 90;
      setTimeLeft(initialSeconds);

      localStorage.removeItem('ailp_last_quiz_result');
      return savedQuiz;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Save answer selection
  const saveAnswer = useCallback((questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  // Submit and evaluate quiz via Server API
  const submitQuiz = useCallback(async () => {
    if (!activeQuiz) return null;
    setIsSubmitting(true);

    try {
      const quizId = activeQuiz.id || activeQuiz._id;
      const totalQuestions = activeQuiz.questions.length;
      const totalInitialTime = totalQuestions * 90;
      const timeSpentSec = Math.max(0, totalInitialTime - timeLeft);

      const formattedAnswers = activeQuiz.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: userAnswers[q.id] !== undefined ? String(userAnswers[q.id]) : '',
      }));

      let evaluatedResult = null;

      // Attempt server evaluation if quiz has a valid MongoDB ID
      if (quizId && !quizId.startsWith('dynamic_')) {
        try {
          const res = await quizAPI.submit(quizId, {
            answers: formattedAnswers,
            timeTaken: timeSpentSec,
          });

          if (res.success && res.result) {
            evaluatedResult = res.result;
          }
        } catch (err) {
          console.warn('Server submission failed, running client evaluation fallback:', err);
        }
      }

      // Fallback local evaluation if offline or temp quiz
      if (!evaluatedResult) {
        let correctCount = 0;
        const reviewDetails = activeQuiz.questions.map((q) => {
          const userAnswer = userAnswers[q.id];
          let isCorrect = false;

          if (activeQuiz.type === 'Fill in the Blanks') {
            const uAns = userAnswer ? String(userAnswer).trim().toLowerCase() : '';
            const cAns = (q.correctAnswer || '').trim().toLowerCase();
            isCorrect = uAns === cAns;
          } else {
            isCorrect = userAnswer !== undefined && parseInt(userAnswer, 10) === (q.correctIndex !== undefined ? q.correctIndex : parseInt(q.correctAnswer, 10));
          }

          if (isCorrect) correctCount++;

          return {
            id: q.id,
            question: q.question,
            options: q.options || [],
            userAnswer: userAnswer !== undefined ? userAnswer : null,
            correctAnswer: activeQuiz.type === 'Fill in the Blanks' ? q.correctAnswer : (q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer),
            explanation: q.explanation || '',
            isCorrect,
            topic: q.topic || activeQuiz.topic,
          };
        });

        const scorePercent = Math.round((correctCount / totalQuestions) * 100);
        const minTaken = Math.floor(timeSpentSec / 60);
        const secTaken = timeSpentSec % 60;
        const timeTakenStr = `${minTaken.toString().padStart(2, '0')}:${secTaken.toString().padStart(2, '0')}`;

        evaluatedResult = {
          title: activeQuiz.title,
          topic: activeQuiz.topic,
          difficulty: activeQuiz.difficulty,
          type: activeQuiz.type,
          score: correctCount,
          total: totalQuestions,
          percentage: scorePercent,
          correctAnswers: correctCount,
          incorrectAnswers: totalQuestions - correctCount,
          unanswered: 0,
          timeTaken: timeTakenStr,
          strongTopics: scorePercent >= 80 ? [activeQuiz.topic] : [],
          weakTopics: scorePercent < 80 ? [activeQuiz.topic] : [],
          reviewDetails,
        };
      }

      setQuizResult(evaluatedResult);

      // Refresh quiz history from MongoDB
      fetchQuizHistory();

      // Stop the timer
      if (timerRef.current) clearInterval(timerRef.current);

      return evaluatedResult;
    } finally {
      setIsSubmitting(false);
    }
  }, [activeQuiz, userAnswers, timeLeft, fetchQuizHistory]);

  // Reset/Clear Quiz
  const exitQuiz = useCallback(() => {
    setActiveQuiz(null);
    setUserAnswers({});
    setTimeLeft(0);
    setQuizResult(null);
    if (timerRef.current) clearInterval(timerRef.current);

    localStorage.removeItem('ailp_active_quiz');
    localStorage.removeItem('ailp_user_answers');
    localStorage.removeItem('ailp_quiz_time_left');
    localStorage.removeItem('ailp_last_quiz_result');
  }, []);

  const value = {
    activeQuiz,
    userAnswers,
    timeLeft,
    isGenerating,
    isSubmitting,
    isLoadingQuizzes,
    userQuizzes,
    quizHistory,
    quizResult,
    fetchUserQuizzes,
    fetchQuizHistory,
    startQuiz,
    saveAnswer,
    submitQuiz,
    exitQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within a QuizProvider');
  return ctx;
}

export default QuizContext;
