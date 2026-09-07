import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  id: { type: String },
  question: { type: String },
  front: { type: String },
  answer: { type: String },
  back: { type: String },
  explanation: { type: String },
  difficulty: { type: String, default: 'Intermediate' },
  order: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['known', 'review', 'unknown'],
    default: 'unknown',
  },
  known: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const FlashcardSetSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    default: 'Intermediate',
  },
  description: {
    type: String,
    trim: true,
  },
  cards: [CardSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalCards: {
    type: Number,
    default: 0,
  },
  masteredCards: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Calculate totalCards, masteredCards, and progress before saving
FlashcardSetSchema.pre('save', function (next) {
  if (Array.isArray(this.cards)) {
    this.totalCards = this.cards.length;
    this.masteredCards = this.cards.filter(c => c.status === 'known' || c.known === true).length;
    this.progress = this.totalCards > 0 ? Math.round((this.masteredCards / this.totalCards) * 100) : 0;
    this.status = this.progress === 100 ? 'completed' : 'active';
  }
  next();
});

// Safe object representation compatible with existing frontend components
FlashcardSetSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();

  if (!obj.title) obj.title = obj.topic || obj.subject;
  if (!obj.subject) obj.subject = obj.topic || obj.title;

  if (Array.isArray(obj.cards)) {
    obj.cards = obj.cards.map((c, idx) => {
      const cardFront = (c.front || c.question || '').trim();
      const cardBack = (c.back || c.answer || '').trim();
      const cardStatus = c.status || (c.known ? 'known' : 'unknown');

      return {
        id: c.id || `card_${idx + 1}`,
        question: cardFront,
        front: cardFront,
        answer: cardBack,
        back: cardBack,
        explanation: c.explanation || '',
        difficulty: c.difficulty || 'Intermediate',
        order: c.order || (idx + 1),
        status: cardStatus,
        known: cardStatus === 'known',
        topic: obj.topic,
      };
    });
  }

  return obj;
};

const FlashcardSet = mongoose.model('FlashcardSet', FlashcardSetSchema);
export default FlashcardSet;
