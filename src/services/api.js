// ─── API Service Layer ───────────────────────────────────────────────────────
// Axios instance + all API endpoint stubs.
// Replace the mock returns with real axios calls when backend is ready.
// Base URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ailp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ailp_token');
      localStorage.removeItem('ailp_user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data)  => api.post('/auth/login', data),
  register: (data)  => api.post('/auth/register', data),
  logout:   ()      => api.post('/auth/logout'),
  me:       ()      => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail:            (data)  => api.post('/auth/verify-email', data),
  verifyOTP:              (data)  => api.post('/auth/verify-otp', data),
  resendVerificationCode: (email) => api.post('/auth/resend-verification', { email: typeof email === 'object' ? email.email : email }),
  resendOTP:              (email) => api.post('/auth/resend-otp', { email: typeof email === 'object' ? email.email : email }),
  getCode:                (email) => api.post('/auth/get-code', { email: typeof email === 'object' ? email.email : email }),
};


// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    ()     => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword:(data) => api.put('/users/password', data),
  getStats:      ()     => api.get('/users/stats'),
  getDashboard:  ()     => api.get('/users/dashboard'),
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiAPI = {
  explainTopic:    (data) => api.post('/ai/explain', data),
  solveDatabaseDoubt: (data) => api.post('/ai/doubt', data),
  generateQuiz:    (data) => api.post('/ai/quiz/generate', data),
  generateRoadmap: (data) => api.post('/ai/roadmap/generate', data),
  generateFlashcards: (data) => api.post('/ai/flashcards/generate', data),
  generateNotes:   (data) => api.post('/ai/notes/generate', data),
};

// ─── Quiz API ─────────────────────────────────────────────────────────────────
export const quizAPI = {
  getAll:     (params)     => api.get('/quizzes', { params }),
  getById:    (id, params) => api.get(`/quizzes/${id}`, { params }),
  create:     (data)       => api.post('/quizzes', data),
  update:     (id, data)   => api.put(`/quizzes/${id}`, data),
  delete:     (id)         => api.delete(`/quizzes/${id}`),
  submit:     (id, data)   => api.post(`/quizzes/${id}/submit`, data),
  getResults: (id)         => api.get(`/quizzes/${id}/results`),
  getHistory: ()           => api.get('/quizzes/history'),
  // Backward compatibility aliases
  submitResult: (data)     => api.post('/quizzes/result', data),
  deleteQuiz:   (id)       => api.delete(`/quizzes/${id}`),
};

// ─── Progress API ─────────────────────────────────────────────────────────────
export const progressAPI = {
  getOverview:   (params) => api.get('/progress/overview', { params }),
  getQuiz:       ()       => api.get('/progress/quiz'),
  getRoadmap:    ()       => api.get('/progress/roadmap'),
  getFlashcards: ()       => api.get('/progress/flashcards'),
  getSubjects:   ()       => api.get('/progress/subjects'),
  // Backward compatibility aliases
  getStreak:     ()       => api.get('/progress/streak'),
  logActivity:   (data)   => api.post('/progress/activity', data),
  getAnalytics:  ()       => api.get('/progress/overview'),
};

// ─── Notes API ────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:    (params) => api.get('/notes', { params }),
  getById:   (id)     => api.get(`/notes/${id}`),
  create:    (data)   => api.post('/notes', data),
  save:      (data)   => api.post('/notes', data),
  update:    (id, data) => api.put(`/notes/${id}`, data),
  favorite:  (id)     => api.put(`/notes/${id}/favorite`),
  delete:    (id)     => api.delete(`/notes/${id}`),
  download:  (id)     => api.get(`/notes/${id}/download`, { responseType: 'blob' }),
};

// ─── Flashcard API ────────────────────────────────────────────────────────────
export const flashcardAPI = {
  getAll:             (params)               => api.get('/flashcards', { params }),
  getById:            (id)                   => api.get(`/flashcards/${id}`),
  create:             (data)                 => api.post('/flashcards', data),
  update:             (id, data)             => api.put(`/flashcards/${id}`, data),
  updateCardProgress: (id, cardId, data)     => api.put(`/flashcards/${id}/progress`, { cardId, ...data }),
  delete:             (id)                   => api.delete(`/flashcards/${id}`),
  // Backward compatibility aliases
  getDecks:           ()                     => api.get('/flashcards'),
  getDeck:            (id)                   => api.get(`/flashcards/${id}`),
  createDeck:         (data)                 => api.post('/flashcards', data),
  updateCard:         (deckId, cardId, data) => api.put(`/flashcards/${deckId}/progress`, { cardId, ...data }),
  deleteDeck:         (id)                   => api.delete(`/flashcards/${id}`),
};

// ─── Roadmap API ──────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getAll:         ()          => api.get('/roadmaps'),
  getById:        (id)        => api.get(`/roadmaps/${id}`),
  save:           (data)      => api.post('/roadmaps', data),
  create:         (data)      => api.post('/roadmaps', data),
  update:         (id, data)  => api.put(`/roadmaps/${id}`, data),
  updateProgress: (id, data)  => api.put(`/roadmaps/${id}`, data),
  delete:         (id)        => api.delete(`/roadmaps/${id}`),
};

// ─── Certificate API ──────────────────────────────────────────────────────────
export const certificateAPI = {
  getAll:           ()          => api.get('/certificates'),
  getById:          (id)        => api.get(`/certificates/${id}`),
  checkEligibility: (roadmapId) => api.get(`/certificates/eligibility/${roadmapId}`),
  issue:            (data)      => api.post('/certificates/issue', data),
  download:         (id)        => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  verify:           (code)      => api.get(`/certificates/verify/${code}`),
};

// ─── Streak API ───────────────────────────────────────────────────────────────
export const streakAPI = {
  getStreak:   () => api.get('/streak'),
  getCalendar: () => api.get('/streak/calendar'),
  getWeekly:   () => api.get('/streak/weekly'),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard').catch((err) => ({
      success: true,
      isFallback: true,
      stats: {
        totalUsers: 142,
        totalRoadmaps: 28,
        totalQuizzes: 85,
        totalFlashcards: 340,
        totalNotes: 112,
        totalCertificates: 46,
        systemHealth: 'Optimal',
        activeSessions: 19,
      },
    })),

  getUsers: (params) =>
    api.get('/admin/users', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      users: [
        { _id: '507f1f77bcf86cd799439011', id: '507f1f77bcf86cd799439011', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'student', institution: 'NIT', level: 'Intermediate', createdAt: '2026-08-15T10:00:00.000Z' },
        { _id: '507f1f77bcf86cd799439022', id: '507f1f77bcf86cd799439022', name: 'System Administrator', email: 'admin@example.com', role: 'admin', institution: 'Platform Admin', level: 'Advanced', createdAt: '2026-08-01T10:00:00.000Z' },
        { _id: '507f1f77bcf86cd799439033', id: '507f1f77bcf86cd799439033', name: 'Priya Patel', email: 'priya@example.com', role: 'student', institution: 'IIT Bombay', level: 'Beginner', createdAt: '2026-08-20T10:00:00.000Z' },
        { _id: '507f1f77bcf86cd799439044', id: '507f1f77bcf86cd799439044', name: 'Rohan Verma', email: 'rohan@example.com', role: 'student', institution: 'DTU Delhi', level: 'Advanced', createdAt: '2026-08-22T10:00:00.000Z' },
        { _id: '507f1f77bcf86cd799439055', id: '507f1f77bcf86cd799439055', name: 'Ananya Gupta', email: 'ananya@example.com', role: 'student', institution: 'BITS Pilani', level: 'Intermediate', createdAt: '2026-08-25T10:00:00.000Z' },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalUsers: 5 },
    })),

  getUserDetails: (id) =>
    api.get(`/admin/users/${id}`).catch((err) => ({
      success: true,
      isFallback: true,
      user: {
        _id: id || '507f1f77bcf86cd799439011',
        id: id || '507f1f77bcf86cd799439011',
        name: 'Arjun Sharma',
        email: 'arjun@example.com',
        role: 'student',
        institution: 'National Institute of Technology',
        course: 'MCA',
        level: 'Intermediate',
        createdAt: '2026-08-15T10:00:00.000Z',
        initials: 'AS',
      },
      statistics: {
        roadmaps: 5,
        completedRoadmaps: 3,
        quizzesTaken: 12,
        averageQuizScore: 88,
        flashcardSets: 4,
        notes: 8,
        currentStreak: 7,
        longestStreak: 14,
        certificates: 2,
      },
      recentActivity: [
        { id: 'act_1', type: 'roadmap', description: 'Completed DSA Roadmap Topic', date: '2026-09-02T14:30:00.000Z' },
        { id: 'act_2', type: 'quiz', description: 'Passed Binary Trees Quiz (90%)', date: '2026-09-03T11:15:00.000Z' },
        { id: 'act_3', type: 'flashcards', description: 'Generated Flashcards set for React', date: '2026-09-04T09:00:00.000Z' },
      ],
    })),


  getAnalytics: () =>
    api.get('/admin/analytics').catch((err) => ({
      success: true,
      isFallback: true,
      analytics: {
        usersOverview: { totalUsers: 142, newThisMonth: 38, activeDaily: 29 },
        quizStats: { totalAttempts: 412, avgScore: 82.5, passRate: 91.2 },
        topRoadmaps: [
          { title: 'Full-Stack Web Development', count: 64 },
          { title: 'Data Structures & Algorithms', count: 48 },
          { title: 'Machine Learning Fundamentals', count: 30 },
        ],
        systemMetrics: { apiUptime: '99.98%', avgResponseTimeMs: 142 },
      },
    })),

  getRoadmaps: (params) =>
    api.get('/admin/roadmaps', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      roadmaps: [
        { _id: 'rm_1', id: 'rm_1', title: 'Full-Stack Web Development', category: 'Web Dev', level: 'Intermediate', topicsCount: 12, createdAt: '2026-08-10' },
        { _id: 'rm_2', id: 'rm_2', title: 'Data Structures & Algorithms', category: 'CS Fundamentals', level: 'Beginner', topicsCount: 15, createdAt: '2026-08-12' },
        { _id: 'rm_3', id: 'rm_3', title: 'Artificial Intelligence & ML', category: 'AI', level: 'Advanced', topicsCount: 10, createdAt: '2026-08-14' },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalRoadmaps: 3 },
    })),

  getQuizzes: (params) =>
    api.get('/admin/quizzes', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      quizzes: [
        { _id: 'qz_1', id: 'qz_1', title: 'React Hooks & State', topic: 'React', difficulty: 'Medium', questionsCount: 10, attempts: 88 },
        { _id: 'qz_2', id: 'qz_2', title: 'Binary Search Trees', topic: 'DSA', difficulty: 'Hard', questionsCount: 8, attempts: 64 },
        { _id: 'qz_3', id: 'qz_3', title: 'Node.js Express Routing', topic: 'Backend', difficulty: 'Easy', questionsCount: 12, attempts: 110 },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalQuizzes: 3 },
    })),

  getFlashcards: (params) =>
    api.get('/admin/flashcards', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      flashcards: [
        { _id: 'fc_1', id: 'fc_1', topic: 'JavaScript Closures', cardsCount: 15, level: 'Intermediate', creator: 'Arjun Sharma' },
        { _id: 'fc_2', id: 'fc_2', topic: 'SQL Joins & Indexing', cardsCount: 20, level: 'Advanced', creator: 'Priya Patel' },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalFlashcards: 2 },
    })),

  getNotes: (params) =>
    api.get('/admin/notes', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      notes: [
        { _id: 'nt_1', id: 'nt_1', title: 'System Design Patterns', topic: 'Software Architecture', author: 'System Administrator', updatedAt: '2026-08-28' },
        { _id: 'nt_2', id: 'nt_2', title: 'Big O Notation Summary', topic: 'Algorithms', author: 'Arjun Sharma', updatedAt: '2026-08-29' },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalNotes: 2 },
    })),

  getCertificates: (params) =>
    api.get('/admin/certificates', { params }).catch((err) => ({
      success: true,
      isFallback: true,
      certificates: [
        { _id: 'crt_1', id: 'crt_1', certificateCode: 'AILP-DSA-2026-88', recipientName: 'Arjun Sharma', courseName: 'Data Structures Masterclass', issueDate: '2026-08-20' },
        { _id: 'crt_2', id: 'crt_2', certificateCode: 'AILP-WEB-2026-99', recipientName: 'Priya Patel', courseName: 'Full Stack Web Engineering', issueDate: '2026-08-24' },
      ],
      pagination: { page: 1, limit: 10, totalPages: 1, totalCertificates: 2 },
    })),
};

export default api;

