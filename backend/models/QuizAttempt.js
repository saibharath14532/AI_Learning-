import mongoose from 'mongoose';

const AnswerRecordSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
}, { _id: false });

const QuizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ownership is required'],
    index: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required'],
    index: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    index: true,
  },
  answers: [AnswerRecordSchema],
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  incorrectAnswers: {
    type: Number,
    default: 0,
  },
  unanswered: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

QuizAttemptSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);
export default QuizAttempt;
