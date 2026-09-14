const express = require('express');
const router = express.Router();
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
