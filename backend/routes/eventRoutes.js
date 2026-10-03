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

// Faculty & Admin routes
router.get('/my-events', protect, authorize('faculty', 'admin'), getMyEvents);
router.get('/admin/all', protect, authorize('admin'), getAllEventsForAdmin);

router.get('/:id', getEventById);

// Creation and management routes
router.post('/', protect, authorize('faculty', 'admin'), createEvent);
router.put('/:id', protect, authorize('faculty', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteEvent);
router.patch('/:id/submit', protect, authorize('faculty', 'admin'), submitEvent);

// Admin routes
router.patch('/:id/approve', protect, authorize('admin'), approveEvent);
router.patch('/:id/reject', protect, authorize('admin'), rejectEvent);

module.exports = router;