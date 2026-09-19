const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const { protect } = require('../middleware/authMiddleware');
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} = require('../controllers/registrationController');

router.post('/:eventId', protect, registerForEvent);
router.get('/my-registrations', protect, getMyRegistrations);
router.patch('/:id/cancel', protect, cancelRegistration);

module.exports = router;
>>>>>>> b5eade6dd82a7ac4eb45ee39014e8e6f0cf09347
