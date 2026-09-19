const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/paymentService');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

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

    // Reactivate a previously cancelled registration instead of blocking re-registration
    const existing = await Registration.findOne({ student: studentId, event: eventId });
    if (existing) {
      if (existing.registrationStatus === 'cancelled') {
        existing.registrationStatus = 'confirmed';
        existing.paymentStatus = event.fee > 0 ? 'pending' : 'not_required';
        await existing.save();
        return res.status(200).json({
          success: true,
          message: 'Registration reactivated',
          registration: existing,
          requiresPayment: event.fee > 0,
        });
      }
      return res.status(400).json({ success: false, message: 'You are already registered for this event' });
    }

    const currentCount = await Registration.countDocuments({ event: eventId, registrationStatus: 'confirmed' });
    if (currentCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity' });
    }

    // Free event — no payment step needed
    if (event.fee === 0) {
      const registration = await Registration.create({
        student: studentId,
        event: eventId,
        registrationStatus: 'confirmed',
        paymentStatus: 'not_required',
      });
      return res.status(201).json({ success: true, registration, requiresPayment: false });
    }

    // Paid event — create registration + Razorpay order
    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      registrationStatus: 'confirmed',
      paymentStatus: 'pending',
    });

    const order = await createRazorpayOrder(event.fee, registration._id.toString());

    const payment = await Payment.create({
      student: studentId,
      event: eventId,
      registration: registration._id,
      amount: event.fee,
      razorpayOrderId: order.id,
      status: 'created',
    });

    registration.payment = payment._id;
    await registration.save();

    res.status(201).json({
      success: true,
      registration,
      requiresPayment: true,
      order: { id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment and confirm registration
// @route   POST /api/registrations/verify-payment
// @access  Private (Student)
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed', failureReason: 'Signature verification failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' },
      { new: true }
    );

    await Registration.findByIdAndUpdate(payment.registration, { paymentStatus: 'paid' });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
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

// @desc    Get all registrations for an event (organizer view)
// @route   GET /api/registrations/event/:eventId
// @access  Private (event creator)
const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email department studentId')
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
  verifyPayment,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
};