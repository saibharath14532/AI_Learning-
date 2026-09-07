import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { RoadmapProvider } from './context/RoadmapContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { NotesProvider } from './context/NotesContext';
import { Toaster } from 'react-hot-toast';

// ─── Layouts ────────────────────────────────────────────────────────────────
import DashboardLayout from './components/layout/DashboardLayout';

// ─── Public Pages ───────────────────────────────────────────────────────────
import Home from './pages/public/Home';
import About from './pages/public/About';
import Features from './pages/public/Features';

// ─── Auth Pages ─────────────────────────────────────────────────────────────
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailVerification from './pages/auth/EmailVerification';

// ─── Dashboard Pages ────────────────────────────────────────────────────────
import Dashboard from './pages/dashboard/Dashboard';
import TopicExplainer from './pages/dashboard/TopicExplainer';
import DoubtSolver from './pages/dashboard/DoubtSolver';
import QuizGenerator from './pages/dashboard/QuizGenerator';
import QuizAttempt from './pages/dashboard/QuizAttempt';
import QuizResultPage from './pages/dashboard/QuizResultPage';
import Roadmap from './pages/dashboard/Roadmap';
import Flashcards from './pages/dashboard/Flashcards';
import Notes from './pages/dashboard/Notes';
import Progress from './pages/dashboard/Progress';
import Streaks from './pages/dashboard/Streaks';
import Certificates from './pages/dashboard/Certificates';
import Profile from './pages/dashboard/Profile';

// ─── Admin Pages & Guard ───────────────────────────────────────────────────
import AdminRoute from './components/routing/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetails from './pages/admin/AdminUserDetails';
import AdminRoadmaps from './pages/admin/AdminRoadmaps';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminFlashcards from './pages/admin/AdminFlashcards';
import AdminNotes from './pages/admin/AdminNotes';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// ─── Protected Route Wrapper ─────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <QuizProvider>
                <RoadmapProvider>
                  <FlashcardProvider>
                    <NotesProvider>
                      <DashboardLayout />
                    </NotesProvider>
                  </FlashcardProvider>
                </RoadmapProvider>
              </QuizProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-tutor" element={<TopicExplainer />} />
          <Route path="/doubt-solver" element={<DoubtSolver />} />
          <Route path="/quiz" element={<QuizGenerator />} />
          <Route path="/quiz/attempt" element={<QuizAttempt />} />
          <Route path="/quiz/result" element={<QuizResultPage />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/streak" element={<Streaks />} />
          <Route path="/streaks" element={<Streaks />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/settings" element={<Profile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetails />} />
            <Route path="roadmaps" element={<AdminRoadmaps />} />
            <Route path="quizzes" element={<AdminQuizzes />} />
            <Route path="flashcards" element={<AdminFlashcards />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
