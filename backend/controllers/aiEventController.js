const aiService = require('../services/ai/AIService');
const AIGeneration = require('../models/AIGeneration');

// @desc    Generate structured event descriptions, highlights, and social copy
// @route   POST /api/ai/event/description
// @access  Private (Faculty, Admin)
const generateEventDescription = async (req, res, next) => {
  try {
    const {
      eventName,
      category,
      date,
      time,
      venue,
      organizer,
      targetAudience,
      mainTopic,
      objectives,
      keyActivities,
      tone,
      desiredLength,
      eventId,
    } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required to generate descriptions.',
      });
    }

    const generation = await aiService.executeStructuredPrompt(
      'EVENT_DESCRIPTION_PROMPT',
      {
        eventName,
        category,
        date,
        time,
        venue,
        organizer,
        targetAudience,
        mainTopic,
        objectives,
        keyActivities,
        tone,
        desiredLength,
      },
      { temperature: 0.3 }
    );

    // Persist generation record
    let recordId = `gen-${Date.now()}`;
    try {
      const record = await AIGeneration.create({
        user: req.user._id,
        event: eventId || null,
        generationType: 'event_description',
        promptName: generation.metadata.promptName,
        promptVersion: generation.metadata.promptVersion,
        provider: generation.metadata.provider,
        model: generation.metadata.model,
        inputParameters: { eventName, category, tone, desiredLength },
        result: generation.data,
        costTokens: generation.metadata.usage || {},
        status: 'success',
      });
      if (record?._id) recordId = record._id;
    } catch {
      // In-memory mode
    }

    res.status(200).json({
      success: true,
      data: generation.data,
      metadata: {
        generationId: recordId,
        provider: generation.metadata.provider,
        model: generation.metadata.model,
        isCached: Boolean(generation.isCached),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateEventDescription,
};
