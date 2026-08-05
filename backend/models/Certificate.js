const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
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
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
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