const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitFeedback, getEventFeedbacks } = require('../controllers/aiFeedbackController');

router.post('/', protect, submitFeedback);
router.get('/event/:eventId', protect, authorize('faculty', 'admin'), getEventFeedbacks);

module.exports = router;
