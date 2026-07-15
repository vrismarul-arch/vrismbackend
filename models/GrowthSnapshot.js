import mongoose from "mongoose";

const growthSnapshotSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      enum: ["revenue", "reach", "branding", "balanced", "automation"],
      required: true,
    },
    businessType: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    website: { type: String, enum: ["Yes", "No"], required: true },
    channels: { type: [String], default: [] },
    budget: {
      type: String,
      enum: ["b1", "b2", "b3", "b4"],
      required: true,
    },
    urgency: {
      type: String,
      enum: ["now", "30d", "3m", "research"],
      required: true,
    },

    snapshot: {
      businessType: String,
      stage: String,
      growthScore: Number,
      healthScore: Number,
      bottleneck: String,
      opportunityScore: Number,
      recommended: [String],
      estimatedBudget: String,
      timeline: String,
      priority: String,
      leadScore: Number,
      confidenceScore: Number,
      roadmap: {
        month1: String,
        month2: String,
        month3: String,
        month6: String,
        expected: String,
      },
    },

    lead: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      company: { type: String, trim: true },
      unlockedAt: Date,
    },

    unlocked: { type: Boolean, default: false },

    sessionId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

const GrowthSnapshot = mongoose.model("GrowthSnapshot", growthSnapshotSchema);

export default GrowthSnapshot;