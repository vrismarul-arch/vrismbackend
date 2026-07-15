import GrowthSnapshot from "../models/GrowthSnapshot.js";
const BUDGETS = [
  { id: "b1", label: "Below ₹10K" },
  { id: "b2", label: "₹10K–25K" },
  { id: "b3", label: "₹25K–50K" },
  { id: "b4", label: "₹50K+" },
];

function generateGrowthSnapshot(answers) {
  const hasWebsite = answers.website === "Yes";
  const channelCount = answers.channels?.length || 0;
  const budgetIndex = BUDGETS.findIndex((b) => b.id === answers.budget);
  const urgencyBoost = answers.urgency === "now" ? 15 : answers.urgency === "30d" ? 8 : 0;

  const digitalScore = (hasWebsite ? 20 : 0) + channelCount * 8;
  const growthScore = Math.min(96, 42 + digitalScore + urgencyBoost + budgetIndex * 6);
  const healthScore = Math.min(94, 38 + digitalScore + budgetIndex * 5);
  const opportunityScore = Math.min(98, 100 - digitalScore + urgencyBoost);
  const confidenceScore = Math.min(99, 70 + budgetIndex * 5 + (hasWebsite ? 6 : 0));
  const leadScore = Math.min(100, 55 + urgencyBoost + budgetIndex * 8);

  const bottleneck = !hasWebsite
    ? "No digital presence to capture demand"
    : channelCount === 0
    ? "No active marketing channels driving traffic"
    : channelCount < 2
    ? "Over-reliance on a single acquisition channel"
    : "Inconsistent lead follow-up and conversion tracking";

  const stage = !hasWebsite
    ? "Pre-Digital"
    : channelCount <= 1
    ? "Early Growth"
    : channelCount <= 3
    ? "Scaling"
    : "Established";

  const recommended = [];
  if (!hasWebsite) recommended.push("High-Converting Website");
  if (!answers.channels?.includes("SEO")) recommended.push("Local SEO");
  if (!answers.channels?.includes("Google Ads")) recommended.push("Google Ads");
  if (!answers.channels?.includes("Meta Ads")) recommended.push("Meta Ads Funnel");
  recommended.push("CRM + Lead Automation");

  const priority =
    answers.urgency === "now" ? "Critical" : answers.urgency === "30d" ? "High" : "Standard";

  return {
    businessType: answers.businessType || "Business",
    stage,
    growthScore,
    healthScore,
    bottleneck,
    opportunityScore,
    recommended: recommended.slice(0, 4),
    estimatedBudget: BUDGETS[Math.max(budgetIndex, 1)]?.label || "₹25K–50K",
    timeline:
      answers.urgency === "now" ? "2-4 Weeks" : answers.urgency === "30d" ? "30 Days" : "60-90 Days",
    priority,
    leadScore,
    confidenceScore,
    roadmap: {
      month1: "Fix foundation — website, tracking, and brand assets aligned to your goal.",
      month2: `Launch targeted acquisition via ${recommended[0] || "priority channel"}.`,
      month3: "Optimize funnel using real conversion data and cut wasted spend.",
      month6: "Scale winning channels and automate lead nurturing end-to-end.",
      expected: `Projected ${Math.min(3, Math.ceil(growthScore / 30))}x qualified lead flow within 6 months.`,
    },
  };
}

// POST /api/growth-snapshot
export const createSnapshot = async (req, res) => {
  try {
    const { goal, businessType, location, website, channels, budget, urgency, sessionId } =
      req.body;

    if (!goal || !businessType || !location || !website || !budget || !urgency) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const snapshotData = generateGrowthSnapshot({
      goal,
      businessType,
      location,
      website,
      channels: channels || [],
      budget,
      urgency,
    });

    const doc = await GrowthSnapshot.create({
      goal,
      businessType,
      location,
      website,
      channels: channels || [],
      budget,
      urgency,
      snapshot: snapshotData,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      success: true,
      id: doc._id,
      snapshot: doc.snapshot,
    });
  } catch (err) {
    console.error("createSnapshot error:", err);
    return res.status(500).json({ success: false, message: "Server error while generating snapshot" });
  }
};

// PATCH /api/growth-snapshot/:id/unlock
export const unlockSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, company } = req.body;

    if (!name || !phone || !email || !company) {
      return res.status(400).json({ success: false, message: "All lead fields are required" });
    }

    const doc = await GrowthSnapshot.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Snapshot not found" });
    }

    doc.lead = { name, phone, email, company, unlockedAt: new Date() };
    doc.unlocked = true;
    await doc.save();

    return res.status(200).json({
      success: true,
      snapshot: doc.snapshot,
      message: "Snapshot unlocked",
    });
  } catch (err) {
    console.error("unlockSnapshot error:", err);
    return res.status(500).json({ success: false, message: "Server error while unlocking snapshot" });
  }
};

// GET /api/growth-snapshot/:id
export const getSnapshot = async (req, res) => {
  try {
    const doc = await GrowthSnapshot.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    console.error("getSnapshot error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/growth-snapshot
export const getAllSnapshots = async (req, res) => {
  try {
    const docs = await GrowthSnapshot.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    console.error("getAllSnapshots error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};