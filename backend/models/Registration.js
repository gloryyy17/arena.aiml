const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'waitlisted'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'failed', 'refunded'],
      default: 'not_required',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendanceMarkedAt: {
      type: Date,
      default: null,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
      default: null,
    },
    feedbackSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate registrations — one student can register once per event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

// Fast lookups: "all registrations for event X" and "all registrations for student Y"
registrationSchema.index({ event: 1, registrationStatus: 1 });
registrationSchema.index({ student: 1 });

module.exports = mongoose.model('Registration', registrationSchema);