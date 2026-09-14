const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Feedback comment is required'],
      trim: true,
      maxlength: 1500,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// One feedback per student per event
feedbackSchema.index({ student: 1, event: 1 }, { unique: true });
feedbackSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
