const mongoose = require('mongoose');

const recipientLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  sentAt: {
    type: Date,
    default: null,
  },
  error: {
    type: String,
    default: '',
  },
});

const emailCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    htmlBody: {
      type: String,
      required: [true, 'HTML body is required'],
    },
    plainText: {
      type: String,
      default: '',
    },
    recipients: [recipientLogSchema],
    totalRecipients: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'sending', 'completed', 'failed'],
      default: 'pending',
    },
    providerMessageId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

emailCampaignSchema.index({ sender: 1, createdAt: -1 });
emailCampaignSchema.index({ event: 1 });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
