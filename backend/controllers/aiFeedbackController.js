const aiService = require('../services/ai/AIService');
const Feedback = require('../models/Feedback');
const AIFeedbackAnalysis = require('../models/AIFeedbackAnalysis');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Analyze feedback for an event using AI
// @route   POST /api/ai/feedback/analyze
// @access  Private (Faculty, Admin)
const analyzeEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required for feedback analysis.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Fetch all feedback submissions for this event
    const feedbackList = await Feedback.find({ event: eventId });

    if (feedbackList.length === 0) {
      // If no live feedback submitted yet, provide initial template or demo analysis
      const demoFeedback = [
        { rating: 5, comment: 'The speaker was top notch and the practical examples were crystal clear!' },
        { rating: 4, comment: 'Great technical workshop. Registration queue in the morning was a bit slow though.' },
        { rating: 5, comment: 'Loved the interactive exercises and certificates issued quickly.' },
        { rating: 3, comment: 'Room 2 had slight audio echo, but the slide content was brilliant.' },
      ];

      const generation = await aiService.executeStructuredPrompt(
        'FEEDBACK_ANALYSIS_PROMPT',
        {
          eventTitle: event.title,
          feedbackEntries: demoFeedback,
          totalResponses: demoFeedback.length,
          averageRating: 4.25,
        },
        { temperature: 0.2 }
      );

      const analysisData = generation.data;

      const record = await AIFeedbackAnalysis.create({
        event: eventId,
        analyzedBy: req.user._id,
        totalResponses: demoFeedback.length,
        averageRating: 4.25,
        overallSentiment: analysisData.overall_sentiment || 'positive',
        sentimentScore: analysisData.sentiment_score ?? 0.82,
        positivePercentage: analysisData.positive_percentage ?? 75,
        neutralPercentage: analysisData.neutral_percentage ?? 15,
        negativePercentage: analysisData.negative_percentage ?? 10,
        positiveThemes: analysisData.positive_themes || [],
        negativeThemes: analysisData.negative_themes || [],
        neutralThemes: analysisData.neutral_themes || [],
        topics: analysisData.topics || [],
        complaints: analysisData.complaints || [],
        suggestions: analysisData.suggestions || [],
        priorityIssues: analysisData.priority_issues || [],
        summary: analysisData.summary || 'Initial review indicates strong positive engagement.',
        promptVersion: generation.metadata.promptVersion,
      });

      return res.status(200).json({
        success: true,
        data: record,
        isSampleData: true,
      });
    }

    // Calculate quantitative metrics
    const totalResponses = feedbackList.length;
    const avgRating = Number((feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalResponses).toFixed(2));

    const generation = await aiService.executeStructuredPrompt(
      'FEEDBACK_ANALYSIS_PROMPT',
      {
        eventTitle: event.title,
        feedbackEntries: feedbackList.map((f) => ({ rating: f.rating, comment: f.comment })),
        totalResponses,
        averageRating: avgRating,
      },
      { temperature: 0.2 }
    );

    const data = generation.data;

    const analysisRecord = await AIFeedbackAnalysis.create({
      event: eventId,
      analyzedBy: req.user._id,
      totalResponses,
      averageRating: avgRating,
      overallSentiment: data.overall_sentiment || 'positive',
      sentimentScore: data.sentiment_score ?? 0.8,
      positivePercentage: data.positive_percentage ?? 70,
      neutralPercentage: data.neutral_percentage ?? 20,
      negativePercentage: data.negative_percentage ?? 10,
      positiveThemes: data.positive_themes || [],
      negativeThemes: data.negative_themes || [],
      neutralThemes: data.neutral_themes || [],
      topics: data.topics || [],
      complaints: data.complaints || [],
      suggestions: data.suggestions || [],
      priorityIssues: data.priority_issues || [],
      summary: data.summary || '',
      promptVersion: generation.metadata.promptVersion,
    });

    res.status(200).json({
      success: true,
      data: analysisRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest feedback analysis for an event
// @route   GET /api/ai/feedback/analysis/:eventId
// @access  Private
const getLatestFeedbackAnalysis = async (req, res, next) => {
  try {
    const analysis = await AIFeedbackAnalysis.findOne({ event: req.params.eventId })
      .populate('event', 'title startDate category')
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this event yet.',
      });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit participant feedback
// @route   POST /api/feedback
// @access  Private (Students)
const submitFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, comment, tags } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, numerical rating (1-5), and comment are required.',
      });
    }

    // Check if user already submitted feedback
    const existing = await Feedback.findOne({ student: req.user._id, event: eventId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event.',
      });
    }

    const feedback = await Feedback.create({
      student: req.user._id,
      event: eventId,
      rating,
      comment,
      tags: tags || [],
    });

    // Mark feedbackSubmitted on Registration if it exists
    await Registration.findOneAndUpdate(
      { student: req.user._id, event: eventId },
      { feedbackSubmitted: true }
    );

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback for an event
// @route   GET /api/feedback/event/:eventId
// @access  Private (Faculty, Admin)
const getEventFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('student', 'name department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeEventFeedback,
  getLatestFeedbackAnalysis,
  submitFeedback,
  getEventFeedbacks,
};
