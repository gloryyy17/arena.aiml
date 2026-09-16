const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const paymentService = require('../services/paymentService');
const { isDbConnected } = require('../config/db');
const mockStore = require('../config/mockStore');

/**
 * @desc    Initialize payment order for paid event
 * @route   POST /api/payments/create-order
 * @access  Private (Student)
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    // In-Memory Fallback if MongoDB is offline
    if (!isDbConnected()) {
      const event = mockStore.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }

      if (Number(event.fee || 0) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This event is free. Please use direct registration.',
        });
      }

      // Check existing
      const existing = mockStore.getMyRegistrations(studentId).find(
        (r) => (r.event?._id === eventId || r.event === eventId) && r.registrationStatus === 'confirmed'
      );
      if (existing && existing.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'You are already registered and paid for this event.' });
      }

      const receiptId = `rcpt_${studentId}_${Date.now()}`.slice(0, 40);
      const orderResult = await paymentService.createOrder({
        amount: event.fee,
        receipt: receiptId,
        notes: {
          studentId: String(studentId),
          eventId: String(eventId),
          eventTitle: event.title,
        },
      });

      // Save order in mock store
      const mockPayment = mockStore.createPaymentOrder(studentId, eventId, orderResult, event.fee);

      return res.status(200).json({
        success: true,
        order: orderResult,
        keyId: paymentService.getPublicKey(),
        isMock: orderResult.isMock,
        event: {
          id: event._id,
          title: event.title,
          fee: event.fee,
        },
      });
    }

    // MongoDB Mode
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.status !== 'approved' || !event.isPublished) {
      return res.status(400).json({ success: false, message: 'Event is not open for registration.' });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed.' });
    }

    if (Number(event.fee || 0) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This event is free. Please use direct registration.',
      });
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      event: eventId,
      registrationStatus: 'confirmed',
    });
    if (currentCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
    }

    // Check existing registration
    let registration = await Registration.findOne({ student: studentId, event: eventId });
    if (registration && registration.registrationStatus === 'confirmed' && registration.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'You are already registered and paid for this event.' });
    }

    // Create pending registration if none exists
    if (!registration) {
      registration = await Registration.create({
        student: studentId,
        event: eventId,
        registrationStatus: 'confirmed',
        paymentStatus: 'pending',
      });
    }

    const receiptId = `rcpt_${String(studentId).slice(-6)}_${Date.now()}`.slice(0, 40);
    const orderResult = await paymentService.createOrder({
      amount: event.fee,
      receipt: receiptId,
      notes: {
        studentId: String(studentId),
        eventId: String(eventId),
        registrationId: String(registration._id),
      },
    });

    // Record initial Payment document
    const payment = await Payment.create({
      student: studentId,
      event: eventId,
      registration: registration._id,
      amount: event.fee,
      currency: orderResult.currency || 'INR',
      razorpayOrderId: orderResult.orderId,
      status: 'created',
    });

    // Link payment ID to registration
    registration.payment = payment._id;
    await registration.save();

    res.status(200).json({
      success: true,
      order: orderResult,
      keyId: paymentService.getPublicKey(),
      isMock: orderResult.isMock,
      event: {
        id: event._id,
        title: event.title,
        fee: event.fee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment signature and confirm registration
 * @route   POST /api/payments/verify
 * @access  Private (Student)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId } = req.body;
    const studentId = req.user._id;

    if (!razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'razorpayOrderId is required.' });
    }

    // Verify cryptographic signature via PaymentService
    const verification = paymentService.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Payment signature verification failed.',
      });
    }

    // In-Memory Fallback if MongoDB is offline
    if (!isDbConnected()) {
      const result = mockStore.verifyPayment(studentId, eventId, {
        razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
        razorpaySignature: razorpaySignature || `sig_mock_${Date.now()}`,
      });

      if (result.error) {
        return res.status(result.status || 400).json({ success: false, message: result.error });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully and registration confirmed!',
        payment: result.payment,
        registration: result.registration,
      });
    }

    // MongoDB Mode
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || `sig_mock_${Date.now()}`;
    payment.status = 'paid';
    await payment.save();

    // Update registration status
    const registration = await Registration.findById(payment.registration);
    if (registration) {
      registration.paymentStatus = 'paid';
      registration.registrationStatus = 'confirmed';
      registration.payment = payment._id;
      await registration.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and registration confirmed!',
      payment,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment gateway public configuration
 * @route   GET /api/payments/config
 * @access  Private
 */
const getPaymentConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    keyId: paymentService.getPublicKey(),
    isMock: !paymentService.isConfigured(),
  });
};

/**
 * @desc    Get current student's payments
 * @route   GET /api/payments/my-payments
 * @access  Private (Student)
 */
const getMyPayments = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    if (!isDbConnected()) {
      const payments = mockStore.getMyPayments(studentId);
      return res.status(200).json({ success: true, count: payments.length, payments });
    }

    const payments = await Payment.find({ student: studentId })
      .populate('event', 'title category fee startDate venue')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentConfig,
  getMyPayments,
};
