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

router.post('/:eventId', protect, authorize('student'), registerForEvent);
router.post('/verify-payment', protect, authorize('student'), verifyPayment);
router.get('/my-registrations', protect, authorize('student'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('faculty'), getEventRegistrations);
router.patch('/:id/cancel', protect, authorize('student'), cancelRegistration);

module.exports = router;