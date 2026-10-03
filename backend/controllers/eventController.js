const Event = require('../models/Event');
const { isDbConnected } = require('../config/db');
const mockStore = require('../config/mockStore');

// @desc    Create new event (starts as draft)
// @route   POST /api/events
// @access  Private (Faculty)
const createEvent = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const event = mockStore.createEvent({
        ...req.body,
        createdBy: { _id: req.user._id, name: req.user.name, department: req.user.department },
      });
      return res.status(201).json({ success: true, event });
    }

    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved, published events (public)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const events = mockStore.getEvents(req.query);
      return res.status(200).json({ success: true, count: events.length, events });
    }

    const { category, department, search } = req.query;

    const filter = { status: 'approved', isPublished: true };
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('createdBy', 'name department')
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const event = mockStore.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(200).json({ success: true, event });
    }

    const event = await Event.findById(req.params.id).populate('createdBy', 'name department');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in faculty's own events (all statuses)
// @route   GET /api/events/my-events
// @access  Private (Faculty)
const getMyEvents = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const events = mockStore.getMyEvents(req.user._id);
      return res.status(200).json({ success: true, count: events.length, events });
    }

    const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for admin (any status)
// @route   GET /api/events/admin/all
// @access  Private (Admin)
const getAllEventsForAdmin = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const events = mockStore.getAllEvents();
      return res.status(200).json({ success: true, count: events.length, events });
    }

    const { status } = req.query;
    const filter = status ? { status } : {};

    const events = await Event.find(filter)
      .populate('createdBy', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Faculty - own events only)
const updateEvent = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const updated = mockStore.updateEvent(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(200).json({ success: true, event: updated });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    // If event was already approved and faculty edits it, send it back for re-approval
    if (event.status === 'approved') {
      req.body.status = 'pending';
      req.body.approvedBy = null;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Faculty - own events only)
const deleteEvent = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.deleteEvent(req.params.id);
      return res.status(200).json({ success: true, message: 'Event deleted successfully' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit event for admin approval
// @route   PATCH /api/events/:id/submit
// @access  Private (Faculty - own events only)
const submitEvent = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const updated = mockStore.updateEvent(req.params.id, { isPublished: false, status: 'pending', rejectionReason: '' });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(200).json({ success: true, event: updated });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    event.isPublished = false;
    event.status = 'pending';
    event.rejectionReason = '';
    await event.save();

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event
// @route   PATCH /api/events/:id/approve
// @access  Private (Admin)
const approveEvent = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const updated = mockStore.updateEvent(req.params.id, {
        status: 'approved',
        isPublished: true,
        approvedBy: req.user._id,
        rejectionReason: '',
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(200).json({ success: true, event: updated });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isPublished: true, approvedBy: req.user._id, rejectionReason: '' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event
// @route   PATCH /api/events/:id/reject
// @access  Private (Admin)
const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!isDbConnected()) {
      const updated = mockStore.updateEvent(req.params.id, {
        status: 'rejected',
        isPublished: false,
        rejectionReason: reason || 'No reason provided by administration.',
        approvedBy: null,
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return res.status(200).json({ success: true, event: updated });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        isPublished: false,
        rejectionReason: reason || 'No reason provided by administration.',
        approvedBy: null,
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};