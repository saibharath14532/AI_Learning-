import mongoose from 'mongoose';

const KeyTermSchema = new mongoose.Schema({
  term: { type: String, trim: true },
  definition: { type: String, trim: true },
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  heading: { type: String, required: true, trim: true },
  explanation: { type: String, trim: true },
  importantPoints: [{ type: String, trim: true }],
  examples: [{ type: String, trim: true }],
  keyTerms: [KeyTermSchema],
}, { _id: false });

const NoteSchema = new mongoose.Schema({
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
    required: [true, 'Note title is required'],
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
  },
  type: {
    type: String,
    default: 'Detailed Notes',
  },
  difficulty: {
    type: String,
    default: 'Intermediate',
  },
  length: {
    type: String,
    default: 'Medium',
  },
  learningGoal: {
    type: String,
    trim: true,
  },
  overview: {
    type: String,
    trim: true,
  },
  sections: [SectionSchema],
  keyTakeaways: [{ type: String, trim: true }],
  importantTerms: [{ type: String, trim: true }],
  quickRevision: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
  },
  tags: [{ type: String, trim: true }],
  sourceType: {
    type: String,
    default: 'manual',
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    trim: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Create text index for search support across title, topic, subject, overview, and content
NoteSchema.index({ user: 1, createdAt: -1 });
NoteSchema.index({ user: 1, subject: 1 });

NoteSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();

  if (!obj.title) obj.title = obj.topic || obj.subject;
  if (!obj.subject) obj.subject = obj.topic || obj.title;

  obj.savedAt = obj.updatedAt || obj.createdAt;
  obj.sections = obj.sections || [];
  obj.keyTakeaways = obj.keyTakeaways || [];
  obj.importantTerms = obj.importantTerms || [];
  obj.tags = obj.tags || [];

  return obj;
};

const Note = mongoose.model('Note', NoteSchema);
export default Note;
