import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  dayRange: { type: String },
  difficulty: { type: String, default: 'Intermediate' },
  estimatedMinutes: { type: Number, default: 60 },
  objectives: [{ type: String }],
  status: { type: String, default: 'Upcoming' },
  completed: { type: Boolean, default: false },
}, { _id: false });

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 1 },
  status: { type: String, default: 'not-started' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  topics: [TopicSchema],
}, { _id: false });

const RoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ownership is required'],
    index: true,
  },
  title: {
    type: String,
    trim: true,
  },
  goal: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  currentLevel: {
    type: String,
    default: 'Beginner',
  },
  targetLevel: {
    type: String,
    default: 'Advanced',
  },
  duration: {
    type: String,
    default: '1 Month',
  },
  dailyStudyTime: {
    type: String,
    default: '1 hour/day',
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'in-progress',
  },
  topics: [TopicSchema],
  modules: [ModuleSchema],
}, {
  timestamps: true,
});

// Virtual method to output clean safe object with string id
RoadmapSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  if (!obj.title) {
    obj.title = obj.goal || obj.subject;
  }
  return obj;
};

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
export default Roadmap;
