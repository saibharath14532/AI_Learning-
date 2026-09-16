import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WelcomeCard from './WelcomeCard';
import DailyGoal from './DailyGoal';
import StreakCard from './StreakCard';
import RecentActivity from './RecentActivity';
import RecommendedTopics from './RecommendedTopics';
import WeeklyAnalytics from './WeeklyAnalytics';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <WelcomeCard />

      {/* Grid Layout for Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Daily Goals & Streak Tracking */}
        <div className="space-y-6">
          <DailyGoal />
          <StreakCard />
        </div>

        {/* Column 2: Weekly Analytics Charts & AI Recs */}
        <div className="space-y-6">
          <WeeklyAnalytics />
          <RecommendedTopics />
        </div>

        {/* Column 3: Recent Progress Log */}
        <div className="space-y-6">
          <RecentActivity />
        </div>

      </div>
    </div>
  );
}
