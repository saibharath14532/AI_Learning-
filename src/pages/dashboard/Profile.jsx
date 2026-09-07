import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Edit2, Check,
  Brain, Zap, Layers, FileText, Map, BarChart2, Award, Flame, Bell,
  Key, Trash2, LogOut, Sparkles, Upload, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, loadUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Page loading & async action states
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form Fields (Personal Info)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');

  // Form Fields (Preferences)
  const [level, setLevel] = useState('Intermediate');
  const [learningGoal, setLearningGoal] = useState('Interview Preparation');
  const [preferredStudyTime, setPreferredStudyTime] = useState('Evening');
  const [dailyGoal, setDailyGoal] = useState('1 hour');
  const [learningStyle, setLearningStyle] = useState('Mixed');

  // Form Fields (Notifications)
  const [dailyReminder, setDailyReminder] = useState(true);
  const [quizReminder, setQuizReminder] = useState(true);
  const [streakReminder, setStreakReminder] = useState(true);
  const [newRecommendations, setNewRecommendations] = useState(true);
  const [certificateAchievement, setCertificateAchievement] = useState(true);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Avatar Upload Ref
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // SEO Update
  useEffect(() => {
    document.title = "My Profile - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Configure your global platform preferences, notify indicators, learning targets, and update contact credentials.');
    }
  }, []);

  // Fetch fresh profile from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        await loadUserProfile();
      } catch (err) {
        console.error('Error fetching profile from MongoDB:', err);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchLatestProfile();
    return () => {
      isMounted = false;
    };
  }, [loadUserProfile]);

  // Sync state values when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setInstitution(user.institution || '');
      setCourse(user.course || '');
      setYear(user.year || '');
      setLevel(user.level || 'Intermediate');
      setLearningGoal(user.learningGoal || 'Interview Preparation');
      setPreferredStudyTime(user.preferredStudyTime || 'Evening');
      setDailyGoal(user.dailyGoal || '1 hour');
      setLearningStyle(user.learningStyle || 'Mixed');
      setAvatarPreview(user.avatar || null);

      if (user.notificationsSettings) {
        setDailyReminder(user.notificationsSettings.dailyReminder ?? true);
        setQuizReminder(user.notificationsSettings.quizReminder ?? true);
        setStreakReminder(user.notificationsSettings.streakReminder ?? true);
        setNewRecommendations(user.notificationsSettings.newRecommendations ?? true);
        setCertificateAchievement(user.notificationsSettings.certificateAchievement ?? true);
      }
    }
  }, [user]);

  // Handle personal info saving
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        course: course.trim(),
        year: year.trim(),
      });
      if (res.success) {
        setIsEditing(false);
        toast.success('Profile updated successfully.');
      } else {
        toast.error(res.error || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Handle preferences saving
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    try {
      const res = await updateProfile({
        level,
        learningGoal,
        preferredStudyTime,
        dailyGoal,
        learningStyle
      });
      if (res.success) {
        toast.success('Learning preferences updated.');
      } else {
        toast.error(res.error || 'Failed to update preferences.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update preferences.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Handle notification changes
  const handleToggleNotification = async (setting, value, setter) => {
    setter(value);
    const currentSettings = user?.notificationsSettings || {};
    const updatedSettings = {
      ...currentSettings,
      [setting]: value
    };
    try {
      const res = await updateProfile({
        notificationsSettings: updatedSettings
      });
      if (res.success) {
        toast.success('Notification settings saved.');
      } else {
        setter(!value);
        toast.error(res.error || 'Failed to save notification settings.');
      }
    } catch (err) {
      setter(!value);
      toast.error(err.message || 'Failed to save notification settings.');
    }
  };

  // Handle file picker and preview via FileReader
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result;
        setAvatarPreview(result);
        const res = await updateProfile({ avatar: result });
        if (res.success) {
          toast.success('Avatar updated successfully!');
        } else {
          toast.error(res.error || 'Failed to update avatar.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle password saving
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await userAPI.changePassword({ oldPassword, newPassword });
      if (res.success) {
        toast.success(res.message || 'Password changed successfully.');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to change password.');
      }
    } catch (err) {
      toast.error(err.message || err.error || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion simulation
  const handleConfirmDelete = () => {
    toast.error('Delete action logged. Account wipe completed (Simulation).');
    setShowDeleteModal(false);
    logout();
    navigate('/login');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setInstitution(user.institution || '');
      setCourse(user.course || '');
      setYear(user.year || '');
    }
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
        <PageHeader
          title="My Profile"
          subtitle="Manage your profile, learning preferences, and account information."
        />
        <PageLoader />
      </div>
    );
  }

  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      <PageHeader
        title="My Profile"
        subtitle="Manage your profile, learning preferences, and account information."
      />

      {/* 1. PROFILE HEADER CARD */}
      <Card className="shadow-sm p-6 sm:p-8 bg-gradient-soft border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar Picture with FileReader Upload */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-md overflow-hidden flex-shrink-0 select-none">
              {avatarPreview ? (
                <img src={avatarPreview} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.initials || 'AS'}</span>
              )}
            </div>
            
            {/* Upload Hover Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/60 text-white text-[9px] font-black uppercase rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none"
              title="Change Photo"
            >
              <Upload size={12} />
              <span>Change</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <span>{name || user?.name || 'Student'}</span>
              <Badge color="indigo" size="xs">{level || 'Intermediate'}</Badge>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">{user?.email || 'student@example.com'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar size={11} />
              <span>Member since: {memberSinceFormatted}</span>
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Edit2 size={13} />}
          onClick={() => setIsEditing(true)}
          className={isEditing ? 'hidden' : ''}
        >
          Edit Profile
        </Button>
      </Card>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: FORM SECTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* PERSONAL INFORMATION FORM */}
          <Card className="shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-850 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <User size={15} className="text-indigo-500" />
              <span>Personal Information</span>
            </h3>

            {isEditing ? (
              <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <Input
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <Input
                      id="edit-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs"
                      placeholder="e.g. +1 (555) 019-2834"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">College / Institution</label>
                    <Input
                      id="edit-institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full text-xs"
                      placeholder="e.g. MIT College of Engineering"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Course</label>
                    <Input
                      id="edit-course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full text-xs"
                      placeholder="e.g. Computer Science (B.Tech / MCA)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Year of Study</label>
                    <Input
                      id="edit-year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full text-xs"
                      placeholder="e.g. Year 2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={isSavingPersonal}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    variant="gradient"
                    disabled={isSavingPersonal}
                    leftIcon={<Check size={13} />}
                  >
                    {isSavingPersonal ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Full Name</span>
                  <span className="text-slate-800 block mt-1">{name || 'Not provided'}</span>
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Phone Number</span>
                  <span className="text-slate-800 block mt-1">{phone || 'Not provided'}</span>
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3 sm:col-span-2">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">College / Institution</span>
                  <span className="text-slate-800 block mt-1">{institution || 'Not provided'}</span>
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Course Path</span>
                  <span className="text-slate-800 block mt-1">{course || 'Not provided'}</span>
                </div>

                <div className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Year of Study</span>
                  <span className="text-slate-800 block mt-1">{year || 'Not provided'}</span>
                </div>
              </div>
            )}
          </Card>

          {/* LEARNING PREFERENCES */}
          <Card className="shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-850 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <Sparkles size={15} className="text-indigo-500" />
              <span>Learning Preferences</span>
            </h3>

            <form onSubmit={handleSavePreferences} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Learning Goal</label>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  <option value="Exam Preparation">Exam Preparation</option>
                  <option value="Interview Preparation">Interview Preparation</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="General Learning">General Learning</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Study Time</label>
                <select
                  value={preferredStudyTime}
                  onChange={(e) => setPreferredStudyTime(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Daily Study Goal</label>
                <select
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3+ hours">3+ hours</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="form-input text-xs py-1.5 cursor-pointer"
                >
                  <option value="Visual">Visual</option>
                  <option value="Practice-based">Practice-based</option>
                  <option value="Reading">Reading</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-50 flex justify-end">
                <Button
                  size="sm"
                  type="submit"
                  variant="gradient"
                  disabled={isSavingPreferences}
                  leftIcon={<Check size={13} />}
                >
                  {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          </Card>

          {/* NOTIFICATION SETTINGS */}
          <Card className="shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-850 text-sm border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <Bell size={15} className="text-indigo-500" />
              <span>Notifications Settings</span>
            </h3>

            <div className="space-y-3 font-semibold text-xs text-slate-650">
              {/* Daily Reminder */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850">Daily Study Reminder</span>
                  <span className="text-[10px] text-slate-400 block">Nudge alert to log learning daily</span>
                </div>
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(e) => handleToggleNotification('dailyReminder', e.target.checked, setDailyReminder)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Quiz Reminder */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850">Quiz Reminder</span>
                  <span className="text-[10px] text-slate-400 block">Alert when practice quiz objectives expire</span>
                </div>
                <input
                  type="checkbox"
                  checked={quizReminder}
                  onChange={(e) => handleToggleNotification('quizReminder', e.target.checked, setQuizReminder)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Streak Reminder */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850">Streak Reminder</span>
                  <span className="text-[10px] text-slate-400 block">Warning logs before daily streak clocks reset</span>
                </div>
                <input
                  type="checkbox"
                  checked={streakReminder}
                  onChange={(e) => handleToggleNotification('streakReminder', e.target.checked, setStreakReminder)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* New Recommendations */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850">New Learning Recommendations</span>
                  <span className="text-[10px] text-slate-400 block">Suggestions based on weak study competencies</span>
                </div>
                <input
                  type="checkbox"
                  checked={newRecommendations}
                  onChange={(e) => handleToggleNotification('newRecommendations', e.target.checked, setNewRecommendations)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Certificate Achievements */}
              <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850">Certificate Achievements</span>
                  <span className="text-[10px] text-slate-400 block">Status update when credentials lock conditions clear</span>
                </div>
                <input
                  type="checkbox"
                  checked={certificateAchievement}
                  onChange={(e) => handleToggleNotification('certificateAchievement', e.target.checked, setCertificateAchievement)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: STATS & ACCOUNT PREFERENCES */}
        <div className="space-y-6">
          {/* PROFILE STATISTICS */}
          <Card className="p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Profile Statistics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Current Streak</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.currentStreak ?? 0} Days
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Longest Streak</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.longestStreak ?? 0} Days
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Topics Mastered</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.topicsCompleted ?? 0} Completed
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Quizzes Taken</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.quizzesCompleted ?? 0} Finished
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Avg Quiz Score</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.averageScore ?? 0}% Accuracy
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block uppercase">Study Hours</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.studyHours ?? 0}h Logged
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[9px] text-slate-400 block uppercase">Earned Credentials</span>
                <strong className="text-slate-800 text-sm mt-0.5 block">
                  {user?.statistics?.certificates ?? 0} Certificates Earned
                </strong>
              </div>
            </div>
          </Card>

          {/* SYSTEM SHORTCUTS */}
          <Card className="p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Learning Shortcuts
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/ai-tutor')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Brain size={13} className="text-indigo-500" />
                <span>AI Tutor</span>
              </button>
              
              <button
                onClick={() => navigate('/quiz')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Zap size={13} className="text-yellow-600" />
                <span>Quiz Hub</span>
              </button>

              <button
                onClick={() => navigate('/flashcards')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Layers size={13} className="text-indigo-650" />
                <span>Flashcards</span>
              </button>

              <button
                onClick={() => navigate('/notes')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <FileText size={13} className="text-slate-500" />
                <span>Notes Generator</span>
              </button>

              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Map size={13} className="text-indigo-400" />
                <span>Roadmap</span>
              </button>

              <button
                onClick={() => navigate('/progress')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <BarChart2 size={13} className="text-emerald-600" />
                <span>Progress</span>
              </button>

              <button
                onClick={() => navigate('/certificates')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Award size={13} className="text-orange-500" />
                <span>Certificates</span>
              </button>

              <button
                onClick={() => navigate('/streak')}
                className="flex items-center gap-1.5 p-2 rounded-xl text-left bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <Flame size={13} className="text-orange-600" />
                <span>Streak Log</span>
              </button>
            </div>
          </Card>

          {/* ACCOUNT SETTINGS SECTION */}
          <Card className="p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Account Settings
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors cursor-pointer"
              >
                <Key size={13} className="text-slate-400" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-red-700 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100/50 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Account</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-slate-750 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-150 transition-colors cursor-pointer"
              >
                <LogOut size={13} className="text-slate-500" />
                <span>Logout</span>
              </button>
            </div>
          </Card>
        </div>

      </div>

      {/* 3. MODAL: CHANGE PASSWORD */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          size="sm"
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPass1 ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input text-xs py-2 pr-9 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass1(!showPass1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                >
                  {showPass1 ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showPass2 ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input text-xs py-2 pr-9 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass2(!showPass2)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                >
                  {showPass2 ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input text-xs py-2 w-full"
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                disabled={isChangingPassword}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. DIALOG: DELETE ACCOUNT CONFIRMATION */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Student Account"
        description="Are you absolutely sure you want to delete your student account? This will wipe your locally cached study records and cannot be undone."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

