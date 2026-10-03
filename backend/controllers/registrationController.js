const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');
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
    if (!event.fee || event.fee === 0) {
      const registration = await Registration.create({
        student: studentId,
        event: eventId,
        registrationStatus: 'confirmed',
        paymentStatus: 'not_required',
      });
      return res.status(201).json({ success: true, registration, requiresPayment: false });
    }

    // Paid event — create registration + payment order
    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      registrationStatus: 'confirmed',
      paymentStatus: 'pending',
    });

    const receiptId = `rcpt_${String(studentId).slice(-6)}_${Date.now()}`.slice(0, 40);
    const order = await paymentService.createOrder({
      amount: event.fee,
      receipt: receiptId,
      notes: {
        studentId: String(studentId),
        eventId: String(eventId),
        registrationId: String(registration._id),
      },
    });

    const payment = await Payment.create({
      student: studentId,
      event: eventId,
      registration: registration._id,
      amount: event.fee,
      currency: order.currency || 'INR',
      razorpayOrderId: order.orderId || order.id,
      status: 'created',
    });

    registration.payment = payment._id;
    await registration.save();

    res.status(201).json({
      success: true,
      registration,
      requiresPayment: true,
      order: {
        id: order.orderId || order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
        keyId: paymentService.getPublicKey(),
      },
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
    const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
    const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const signature = req.body.razorpay_signature || req.body.razorpaySignature;
    const eventId = req.body.eventId;
    const studentId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'razorpayOrderId is required' });
    }

    const verification = paymentService.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!verification.verified) {
      if (isDbConnected()) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: 'failed', failureReason: 'Signature verification failed' }
        );
      }
      return res.status(400).json({
        success: false,
        message: verification.message || 'Payment verification failed',
      });
    }

    if (!isDbConnected()) {
      const result = mockStore.verifyPayment(studentId, eventId, {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId || `pay_mock_${Date.now()}`,
        razorpaySignature: signature || `sig_mock_${Date.now()}`,
      });
      if (result.error) {
        return res.status(result.status || 400).json({ success: false, message: result.error });
      }
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment: result.payment,
        registration: result.registration,
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { razorpayPaymentId: paymentId, razorpaySignature: signature, status: 'paid' },
      { new: true }
    );

    if (payment) {
      await Registration.findByIdAndUpdate(payment.registration, { paymentStatus: 'paid', registrationStatus: 'confirmed' });
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully', payment });
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

// @desc    Get all registrations for an event (organizer view)
// @route   GET /api/registrations/event/:eventId
// @access  Private (event creator / admin)
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!isDbConnected()) {
      const event = mockStore.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      const allRegs = mockStore.getMyRegistrations ? Array.from(mockStore.registrations.values()) : [];
      const eventRegs = allRegs.filter((r) => {
        const rEventId = r.event?._id || r.event;
        return String(rEventId) === String(eventId);
      });
      return res.status(200).json({ success: true, count: eventRegs.length, registrations: eventRegs });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: eventId })
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
  verifyPayment,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
};