const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  getAllEventsForAdmin,
  updateEvent,
  deleteEvent,
  submitEvent,
  approveEvent,
  rejectEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);

// Specific routes BEFORE /:id to avoid route collision
router.get('/my-events', protect, authorize('faculty'), getMyEvents);
router.get('/admin/all', protect, authorize('admin'), getAllEventsForAdmin);

router.get('/:id', getEventById);

// Faculty routes
router.post('/', protect, authorize('faculty'), createEvent);
router.put('/:id', protect, authorize('faculty'), updateEvent);
router.delete('/:id', protect, authorize('faculty'), deleteEvent);
router.patch('/:id/submit', protect, authorize('faculty'), submitEvent);

// Admin routes
router.patch('/:id/approve', protect, authorize('admin'), approveEvent);
router.patch('/:id/reject', protect, authorize('admin'), rejectEvent);

module.exports = router;