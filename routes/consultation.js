// routes/consultation.js
const express = require('express');
const router = express.Router();
const ConsultationController = require('../controllers/consultationController');
const { validateConsultation } = require('../middleware/validation');

// Start new consultation
router.post('/start', validateConsultation, ConsultationController.startConsultation);

// Update consultation stage
router.put('/:conversationId/stage', ConsultationController.updateStage);

// Get consultation by ID
router.get('/:conversationId', ConsultationController.getConsultation);

// Get all consultations (with filters)
router.get('/', ConsultationController.getAllConsultations);

// Complete consultation
router.post('/:conversationId/complete', ConsultationController.completeConsultation);

// Generate growth snapshot
router.post('/:conversationId/snapshot', ConsultationController.generateSnapshot);

// Get lead score
router.get('/:conversationId/leadscore', ConsultationController.getLeadScore);

// Submit for human review
router.post('/:conversationId/review', ConsultationController.submitForReview);

// Add human review notes
router.put('/:conversationId/review/notes', ConsultationController.addReviewNotes);

module.exports = router;