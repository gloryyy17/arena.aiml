const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/paymentService');

const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event || event.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Event not available for registration' });
    }

    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    const existing = await Registration.findOne({ student: req.user._id, event: event._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const confirmedCount = await Registration.countDocuments({
      event: event._id,
      registrationStatus: 'confirmed',
    });
    if (confirmedCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    if (event.fee === 0) {
      const registration = await Registration.create({
        student: req.user._id,
        event: event._id,
        paymentStatus: 'not_required',
      });
      return res.status(201).json({ success: true, registration, requiresPayment: false });
    }

    const registration = await Registration.create({
      student: req.user._id,
      event: event._id,
      paymentStatus: 'pending',
    });

    const order = await createRazorpayOrder(event.fee, registration._id.toString());

    const payment = await Payment.create({
      student: req.user._id,
      event: event._id,
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

const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event', 'title startDate venue fee posterUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    next(error);
  }
};

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

const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    if (registration.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();

    res.status(200).json({ success: true, message: 'Registration cancelled' });
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