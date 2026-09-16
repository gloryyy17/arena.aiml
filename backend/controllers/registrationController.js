const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { isDbConnected } = require('../config/db');
const mockStore = require('../config/mockStore');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    // In-Memory Fallback if MongoDB is not connected
    if (!isDbConnected()) {
      const result = mockStore.registerStudent(studentId, eventId);
      if (result.error) {
        return res.status(result.status || 400).json({ success: false, message: result.error });
      }
      return res.status(201).json({ success: true, registration: result.registration });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'approved' || !event.isPublished) {
      return res.status(400).json({ success: false, message: 'Event is not open for registration' });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Check existing registration
    const existing = await Registration.findOne({ student: studentId, event: eventId });
    if (existing) {
      if (existing.registrationStatus === 'cancelled') {
        existing.registrationStatus = 'confirmed';
        await existing.save();
        return res.status(200).json({ success: true, message: 'Registration reactivated', registration: existing });
      }
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({ event: eventId, registrationStatus: 'confirmed' });
    if (currentCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity' });
    }

    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      registrationStatus: 'confirmed',
      paymentStatus: event.fee > 0 ? 'pending' : 'not_required',
    });

    res.status(201).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const registrations = mockStore.getMyRegistrations(req.user._id);
      return res.status(200).json({ success: true, count: registrations.length, registrations });
    }

    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        select: 'title description category venue startDate endDate fee posterUrl status',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration
// @route   PATCH /api/registrations/:id/cancel
// @access  Private (Student)
const cancelRegistration = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const result = mockStore.cancelRegistration(req.params.id, req.user._id);
      if (result.error) {
        return res.status(result.status || 400).json({ success: false, message: result.error });
      }
      return res.status(200).json({ success: true, message: 'Registration cancelled', registration: result.registration });
    }

    const registration = await Registration.findOne({ _id: req.params.id, student: req.user._id });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();

    res.status(200).json({ success: true, message: 'Registration cancelled', registration });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
};
