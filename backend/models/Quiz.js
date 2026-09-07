import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: { type: String },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  correctIndex: { type: Number },
  explanation: { type: String },
  points: { type: Number, default: 1 },
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ownership is required'],
    index: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    default: 'Intermediate',
  },
  type: {
    type: String,
    enum: ['Multiple Choice', 'True / False', 'Fill in the Blanks'],
    default: 'Multiple Choice',
  },
  description: {
    type: String,
    trim: true,
  },
  questions: [QuestionSchema],
  totalQuestions: {
    type: Number,
    default: 0,
  },
  timeLimit: {
    type: Number, // in seconds
    default: 900,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Calculate totalQuestions and default timeLimit before saving if not explicitly passed
QuizSchema.pre('save', function (next) {
  if (this.questions && Array.isArray(this.questions)) {
    this.totalQuestions = this.questions.length;
    if (!this.timeLimit || this.timeLimit === 900) {
      this.timeLimit = this.questions.length * 90; // 1.5 min per question rule
    }
  }
  next();
});

// Sanitized representation for quiz-taking: EXCLUDES correct answers & answer keys
QuizSchema.methods.toTakeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  
  if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      question: q.question,
      options: q.options || [],
      points: q.points || 1,
    }));
  }

  return obj;
};

// Complete object representation for owner review or full inspection
QuizSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz;
