import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: {
    type: String,
    default: '+1 (555) 019-2834',
  },
  institution: {
    type: String,
    default: 'MIT College of Engineering',
  },
  course: {
    type: String,
    default: 'Master of Computer Applications (MCA)',
  },
  year: {
    type: String,
    default: 'Year 2',
  },
  level: {
    type: String,
    default: 'Intermediate',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  learningGoal: {
    type: String,
    default: 'Interview Preparation',
  },
  preferredStudyTime: {
    type: String,
    default: 'Evening',
  },
  dailyGoal: {
    type: String,
    default: '1 hour',
  },
  learningStyle: {
    type: String,
    default: 'Mixed',
  },
  bio: {
    type: String,
    default: 'MCA student passionate about AI and software development.',
  },
  avatar: {
    type: String,
    default: null,
  },
  notificationsSettings: {
    dailyReminder: { type: Boolean, default: true },
    quizReminder: { type: Boolean, default: true },
    streakReminder: { type: Boolean, default: true },
    newRecommendations: { type: Boolean, default: true },
    certificateAchievement: { type: Boolean, default: true },
  },
  statistics: {
    currentStreak: { type: Number, default: 7 },
    longestStreak: { type: Number, default: 14 },
    topicsCompleted: { type: Number, default: 24 },
    quizzesCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    certificates: { type: Number, default: 0 },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
  },
  otpHash: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  otpLastSentAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});


// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare input password with database hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Helper virtual or method to format output safely
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  
  // Map _id to id to support the frontend standard structure
  obj.id = obj._id.toString();
  
  // Make sure firstName and initials are present
  if (obj.name) {
    obj.firstName = obj.name.split(' ')[0];
    obj.initials = obj.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  
  return obj;
};

const User = mongoose.model('User', UserSchema);
export default User;
