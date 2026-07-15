// models/Lead.js
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  conversationId: String,
  leadData: {
    name: String,
    email: String,
    phone: String,
    business: String,
    location: String,
    goal: String,
    budget: String,
    timeline: String
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  source: {
    type: String,
    default: 'VRISM Growth Architect'
  },
  notes: [{
    note: String,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: Date,
  assignedTo: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

LeadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

LeadSchema.index({ status: 1 });
LeadSchema.index({ 'leadData.business': 'text' });
LeadSchema.index({ leadScore: -1 });

module.exports = mongoose.model('Lead', LeadSchema);