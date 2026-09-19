const mongoose = require('mongoose');

const aiFeedbackAnalysisSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    analyzedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalResponses: {
      type: Number,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    overallSentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      required: true,
    },
    sentimentScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    positivePercentage: {
      type: Number,
      default: 0,
    },
    neutralPercentage: {
      type: Number,
      default: 0,
    },
    negativePercentage: {
      type: Number,
      default: 0,
    },
    positiveThemes: {
      type: [String],
      default: [],
    },
    negativeThemes: {
      type: [String],
      default: [],
    },
    neutralThemes: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    complaints: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    priorityIssues: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
    },
    promptVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  { timestamps: true }
);

aiFeedbackAnalysisSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('AIFeedbackAnalysis', aiFeedbackAnalysisSchema);
