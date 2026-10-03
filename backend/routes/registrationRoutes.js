const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  verifyPayment,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student registration routes
router.post('/:eventId', protect, authorize('student'), registerForEvent);
router.post('/verify-payment', protect, authorize('student'), verifyPayment);
router.get('/my-registrations', protect, authorize('student'), getMyRegistrations);
router.patch('/:id/cancel', protect, authorize('student'), cancelRegistration);

// Faculty & Admin routes
router.get('/event/:eventId', protect, authorize('faculty', 'admin'), getEventRegistrations);

module.exports = router;
