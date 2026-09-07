import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Certificate of Completion',
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85,
    },
    score: {
      type: Number,
      default: 85,
    },
    grade: {
      type: String,
      enum: ['Excellence', 'Merit', 'Pass'],
      default: 'Excellence',
    },
    status: {
      type: String,
      enum: ['Completed', 'Issued', 'Revoked'],
      default: 'Completed',
    },
    topicsCompleted: {
      type: Number,
      default: 0,
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    requirements: {
      roadmap: { type: Number, default: 100 },
      topics: { type: String, default: '100%' },
      quiz: { type: Number, default: 80 },
      finalAssessment: { type: Number, default: 85 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate certificates for the same user & roadmap
certificateSchema.index({ user: 1, roadmap: 1 }, { unique: true });

// Convert document to safe plain object for frontend consumption
certificateSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;

  // Format date strings if needed
  if (obj.completionDate) {
    const d = new Date(obj.completionDate);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    obj.completionDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
    obj.issueDate = d.toISOString().split('T')[0];
  }

  return obj;
};

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
