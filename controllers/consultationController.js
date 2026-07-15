// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const Lead = require('../models/Lead');
const { v4: uuidv4 } = require('uuid');

// Start new consultation
exports.startConsultation = async (req, res) => {
  try {
    const { query, goal } = req.body;
    
    // Generate unique conversation ID
    const conversationId = `vrism_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const consultation = new Consultation({
      conversationId,
      businessData: { query, goal },
      status: 'in-progress',
      stages: {
        stage1: { startedAt: new Date() }
      }
    });
    
    await consultation.save();
    
    // Generate initial AI response based on query
    const initialResponse = generateInitialResponse(query, goal);
    
    res.status(201).json({
      success: true,
      conversationId,
      consultationId: consultation._id,
      message: 'Consultation started successfully',
      aiResponse: initialResponse,
      data: consultation
    });
    
  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start consultation',
      error: error.message
    });
  }
};

// Update consultation stage
exports.updateStage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { stage, answer, userInfo } = req.body;
    
    const consultation = await Consultation.findOne({ conversationId });
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    // Update stage data
    const stageKey = `stage${stage}`;
    consultation.answers.set(stageKey, answer);
    
    if (userInfo) {
      consultation.userInfo = { ...consultation.userInfo, ...userInfo };
    }
    
    // If stage is complete, update status
    if (stage === 7) {
      consultation.status = 'completed';
      consultation.completedAt = new Date();
      
      // Generate lead score
      consultation.leadScore = calculateLeadScore(consultation);
      
      // Save as lead
      await saveLead(consultation);
    }
    
    consultation.updatedAt = new Date();
    await consultation.save();
    
    // Generate next stage response
    const nextResponse = generateStageResponse(stage, answer, consultation);
    
    res.json({
      success: true,
      stage,
      nextStage: stage + 1,
      aiResponse: nextResponse,
      leadScore: consultation.leadScore,
      consultation: consultation
    });
    
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation',
      error: error.message
    });
  }
};

// Get consultation by ID
exports.getConsultation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const consultation = await Consultation.findOne({ conversationId });
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    res.json({
      success: true,
      data: consultation
    });
    
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation',
      error: error.message
    });
  }
};

// Get all consultations with filters
exports.getAllConsultations = async (req, res) => {
  try {
    const { status, limit = 50, page = 1, startDate, endDate } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Consultation.countDocuments(query);
    
    res.json({
      success: true,
      data: consultations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations',
      error: error.message
    });
  }
};

// Generate growth snapshot
exports.generateSnapshot = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const consultation = await Consultation.findOne({ conversationId });
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    const snapshot = generateGrowthSnapshot(consultation);
    consultation.growthSnapshot = snapshot;
    await consultation.save();
    
    res.json({
      success: true,
      snapshot
    });
    
  } catch (error) {
    console.error('Generate snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate snapshot',
      error: error.message
    });
  }
};

// Get lead score
exports.getLeadScore = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const consultation = await Consultation.findOne({ conversationId });
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    const leadScore = calculateLeadScore(consultation);
    consultation.leadScore = leadScore;
    await consultation.save();
    
    res.json({
      success: true,
      leadScore,
      leadStatus: leadScore > 70 ? 'hot' : leadScore > 40 ? 'warm' : 'cold'
    });
    
  } catch (error) {
    console.error('Get lead score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead score',
      error: error.message
    });
  }
};

// Submit for human review
exports.submitForReview = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { notes } = req.body;
    
    const consultation = await Consultation.findOne({ conversationId });
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    consultation.status = 'review';
    consultation.humanReview = {
      reviewed: false,
      reviewNotes: notes || 'Awaiting review',
      reviewedAt: new Date()
    };
    
    await consultation.save();
    
    res.json({
      success: true,
      message: 'Consultation submitted for review',
      data: consultation
    });
    
  } catch (error) {
    console.error('Submit for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit for review',
      error: error.message
    });
  }
};

// Helper Functions

function generateInitialResponse(query, goal) {
  const businessType = detectBusinessType(query);
  const location = extractLocation(query);
  
  return {
    message: `👋 Welcome to VRISM Growth Architect!

I'm your AI Business Consultant. Let me understand your business to create the perfect growth roadmap.

📍 What type of business do you run?`,
    questions: [
      'What type of business do you run?',
      `Where is your business located?${location ? ` (I detected: ${location})` : ''}`,
      'How long have you been in business?',
      'Do you have a website?',
      'Do you have a Google Business Profile?'
    ],
    detectedInfo: {
      businessType,
      location,
      goal: goal || 'not specified'
    },
    stage: 1
  };
}

function generateStageResponse(stage, answer, consultation) {
  const responses = {
    1: {
      message: "✅ Thanks for sharing!\n\nNow let's understand your current situation:",
      questions: [
        'How many leads do you receive monthly?',
        'Do you currently run Meta or Google Ads?',
        'What is your current conversion rate?',
        'Do you have a sales team in place?'
      ]
    },
    2: {
      message: "🔍 Analyzing your business...\n\nTell me about your goals:",
      questions: [
        'More Revenue (Leads, conversion, performance marketing)',
        'More Reach (Content, reels, visibility, community)',
        'More Branding (Identity, story, positioning)',
        'Balanced Growth (Mix of everything)'
      ]
    },
    3: {
      message: "🚀 Great! I've identified your growth opportunity.\n\nLet me create your personalized growth roadmap...",
      questions: ['Show me my growth roadmap']
    },
    4: {
      message: "📊 Here's your personalized Growth Snapshot!"
    },
    5: {
      message: "💰 Let's estimate the investment needed:\n\n💵 What is your monthly marketing budget?",
      questions: [
        'What is your monthly marketing budget?',
        'Do you have a team in place?',
        'When do you want to start?'
      ]
    },
    6: {
      message: "📝 Thank you!\n\nWould you like to schedule a call with our expert?",
      questions: ['Yes, schedule a call', 'Not right now']
    },
    7: {
      message: "✅ Thank you for your time!\n\nYour VRISM Growth Architect is ready to help you scale! 🚀"
    }
  };
  
  return responses[stage] || responses[1];
}

function generateGrowthSnapshot(consultation) {
  const business = consultation.userInfo?.business || 'Your Business';
  const location = consultation.userInfo?.location || 'Your Location';
  
  // Analyze answers for bottleneck
  const stage2Answer = consultation.answers.get('stage2') || '';
  let bottleneck = 'Growth Opportunity';
  
  if (stage2Answer.toLowerCase().includes('lead') || stage2Answer.toLowerCase().includes('enquiry')) {
    bottleneck = 'Low Lead Generation';
  } else if (stage2Answer.toLowerCase().includes('conversion') || stage2Answer.toLowerCase().includes('selling')) {
    bottleneck = 'Conversion Problem';
  } else if (stage2Answer.toLowerCase().includes('website')) {
    bottleneck = 'Digital Presence Gap';
  } else {
    bottleneck = 'Visibility Problem';
  }
  
  const solutions = [
    'Meta Ads Setup',
    'Google Business Profile Optimization',
    'Local SEO Strategy',
    'High-Converting Landing Page',
    'WhatsApp Business Automation',
    'CRM Implementation'
  ];
  
  // Randomly select 4-5 solutions
  const selectedSolutions = solutions
    .sort(() => Math.random() - 0.5)
    .slice(0, 4 + Math.floor(Math.random() * 2));
  
  return {
    business,
    location,
    bottleneck,
    opportunity: 'Google Maps & Local Search Dominance',
    solutions: selectedSolutions,
    budget: '₹25,000 – ₹40,000/month',
    timeline: '60–90 Days',
    confidenceScore: 82 + Math.floor(Math.random() * 13),
    roadmap: {
      month1: ['Landing Page Development', 'Google Business Profile Setup', 'Initial SEO Audit'],
      month2: ['Meta Ads Campaign Launch', 'Content Strategy', 'Lead Generation Setup'],
      month3: ['Optimization', 'WhatsApp Automation', 'Scaling']
    }
  };
}

function calculateLeadScore(consultation) {
  let score = 30;
  
  // Check stages completed
  if (consultation.answers.has('stage1')) score += 15;
  if (consultation.answers.has('stage2')) score += 15;
  if (consultation.userInfo?.goal) score += 10;
  
  // Check budget
  const stage5Answer = consultation.answers.get('stage5');
  if (stage5Answer) {
    const budget = stage5Answer.match(/\d+/)?.[0];
    if (budget && parseInt(budget) > 50000) score += 20;
    else if (budget && parseInt(budget) > 25000) score += 15;
    else if (budget && parseInt(budget) > 10000) score += 10;
  }
  
  return Math.min(score, 100);
}

async function saveLead(consultation) {
  try {
    const lead = new Lead({
      consultationId: consultation._id,
      conversationId: consultation.conversationId,
      leadData: {
        name: consultation.userInfo?.name || 'Unknown',
        email: consultation.userInfo?.email || '',
        phone: consultation.userInfo?.phone || '',
        business: consultation.userInfo?.business || '',
        location: consultation.userInfo?.location || '',
        goal: consultation.userInfo?.goal || '',
        budget: consultation.answers.get('stage5') || '',
        timeline: consultation.answers.get('stage5') || ''
      },
      leadScore: consultation.leadScore,
      status: consultation.leadScore > 70 ? 'qualified' : 'new',
      source: 'VRISM Growth Architect'
    });
    
    await lead.save();
    return lead;
  } catch (error) {
    console.error('Save lead error:', error);
    throw error;
  }
}

function detectBusinessType(query) {
  const keywords = {
    'dental': ['dental', 'dentist', 'tooth'],
    'restaurant': ['restaurant', 'cafe', 'food', 'dining'],
    'agency': ['agency', 'marketing', 'creative'],
    'retail': ['shop', 'retail', 'store'],
    'healthcare': ['clinic', 'hospital', 'doctor', 'medical'],
    'tech': ['tech', 'software', 'startup', 'saas']
  };
  
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => query.toLowerCase().includes(word))) {
      return type;
    }
  }
  return 'general';
}

function extractLocation(query) {
  const locationMatch = query.match(/in\s+([A-Za-z\s,]+)/i);
  return locationMatch ? locationMatch[1].trim() : null;
}

// routes/leads.js
const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');

// Get all leads
router.get('/', LeadController.getAllLeads);

// Get lead by ID
router.get('/:id', LeadController.getLeadById);

// Update lead status
router.put('/:id/status', LeadController.updateLeadStatus);

// Add note to lead
router.post('/:id/notes', LeadController.addNote);

// Assign lead to team member
router.put('/:id/assign', LeadController.assignLead);

// Get lead analytics
router.get('/analytics/summary', LeadController.getLeadAnalytics);

module.exports = router;