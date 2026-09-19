const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    participantName: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    certificateType: {
      type: String,
      default: 'Participation', // 'Participation', 'Excellence', 'Appreciation', 'Winner'
    },
    citation: {
      type: String,
      default: '',
    },
    organizerName: {
      type: String,
      default: 'Department Faculty Coordinator',
    },
    hodName: {
      type: String,
      default: 'Dr. Animesh Tayal',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
    verificationId: {
      type: String,
      unique: true,
      required: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate a unique verification ID before saving, if not already set
certificateSchema.pre('validate', function (next) {
  if (!this.verificationId) {
    this.verificationId = `CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);