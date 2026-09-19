const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    generationType: {
      type: String,
      enum: ['poster', 'event_description', 'email', 'feedback_analysis', 'chat', 'recommendation'],
      required: true,
    },
    promptName: {
      type: String,
      required: true,
    },
    promptVersion: {
      type: String,
      default: '1.0.0',
    },
    provider: {
      type: String,
      default: 'gemini',
    },
    model: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    inputParameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'retried'],
      default: 'success',
    },
    costTokens: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

aiGenerationSchema.index({ user: 1, generationType: 1, createdAt: -1 });
aiGenerationSchema.index({ event: 1 });

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
