// models/Consultation.js
const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  businessData: {
    query: String,
    goal: String,
    selectedGoal: String
  },
  stages: {
    stage1: { type: mongoose.Schema.Types.Mixed }, // Business Understanding
    stage2: { type: mongoose.Schema.Types.Mixed }, // Bottleneck Analysis
    stage3: { type: mongoose.Schema.Types.Mixed }, // Growth Opportunity
    stage4: { type: mongoose.Schema.Types.Mixed }, // Solution Recommendation
    stage5: { type: mongoose.Schema.Types.Mixed }, // Budget Estimation
    stage6: { type: mongoose.Schema.Types.Mixed }, // Lead Capture
    stage7: { type: mongoose.Schema.Types.Mixed }  // Human Review
  },
  answers: {
    type: Map,
    of: String
  },
  userInfo: {
    business: String,
    location: String,
    goal: String,
    leadScore: Number,
    email: String,
    phone: String,
    name: String
  },
  growthSnapshot: {
    business: String,
    location: String,
    bottleneck: String,
    opportunity: String,
    solutions: [String],
    budget: String,
    timeline: String,
    confidenceScore: Number,
    roadmap: {
      month1: [String],
      month2: [String],
      month3: [String]
    }
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'review'],
    default: 'in-progress'
  },
  completedAt: Date,
  humanReview: {
    reviewed: { type: Boolean, default: false },
    reviewedBy: String,
    reviewNotes: String,
    reviewedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
ConsultationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
ConsultationSchema.index({ createdAt: -1 });
ConsultationSchema.index({ status: 1 });
ConsultationSchema.index({ 'userInfo.business': 'text' });

module.exports = mongoose.model('Consultation', ConsultationSchema);