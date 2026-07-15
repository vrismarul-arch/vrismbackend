// controllers/leadController.js
const Lead = require('../models/Lead');
const Consultation = require('../models/Consultation');

exports.getAllLeads = async (req, res) => {
  try {
    const { status, limit = 50, page = 1, sortBy = 'leadScore', sortOrder = -1 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const leads = await Lead.find(query)
      .populate('consultationId', 'conversationId status createdAt')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Lead.countDocuments(query);
    
    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leads',
      error: error.message
    });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findById(id).populate('consultationId');
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead',
      error: error.message
    });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead status',
      error: error.message
    });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, createdBy } = req.body;
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    lead.notes.push({ note, createdBy: createdBy || 'System' });
    lead.updatedAt = new Date();
    await lead.save();
    
    res.json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { assignedTo, updatedAt: new Date() },
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.json({
      success: true,
      data: lead
    });
    
  } catch (error) {
    console.error('Assign lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign lead',
      error: error.message
    });
  }
};

exports.getLeadAnalytics = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const byStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgScore = await Lead.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$leadScore' }
        }
      }
    ]);
    
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        averageLeadScore: avgScore[0]?.average || 0,
        recentLeads
      }
    });
    
  } catch (error) {
    console.error('Get lead analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead analytics',
      error: error.message
    });
  }
};