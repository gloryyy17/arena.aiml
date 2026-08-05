const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    aiGeneratedDescription: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Max participants is required'],
      min: 1,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    budget: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for common queries: upcoming approved events, sorted by date
eventSchema.index({ status: 1, startDate: 1 });

// Virtual field: is registration still open?
eventSchema.virtual('isRegistrationOpen').get(function () {
  return this.status === 'approved' && new Date() < this.registrationDeadline;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);