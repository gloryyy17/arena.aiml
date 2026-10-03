const aiService = require('../services/ai/AIService');
const AIGeneration = require('../models/AIGeneration');
const Event = require('../models/Event');

// @desc    Generate AI event poster
// @route   POST /api/ai/poster/generate
// @access  Private (Faculty, Admin)
const generatePoster = async (req, res, next) => {
  try {
    const {
      eventName,
      category,
      date,
      time,
      venue,
      organizer,
      description,
      targetAudience,
      theme,
      designStyle,
      colorPreference,
      posterSize,
      customInstructions,
      eventId,
    } = req.body;

    if (!eventName) {
      return res.status(400).json({ success: false, message: 'Event name is required for poster generation.' });
    }

    // Build the enhanced visual prompt using PromptRegistry
    const interpolated = aiService.getPromptRegistry().interpolate('POSTER_PROMPT', {
      eventName,
      category,
      date,
      venue,
      organizer,
      theme,
      designStyle: designStyle || 'modern_abstract',
      colorPreference,
      aspectRatio: posterSize || '1024x1024',
      customInstructions: customInstructions || description,
    });

    const size = posterSize || '1024x1024';
    const style = designStyle || 'modern_abstract';

    // Call Image Generation Provider through AIService
    const generationResult = await aiService.generatePosterImage({
      prompt: interpolated.prompt,
      size,
      style,
    });

    // Save generation metadata to database
    let genId = `poster-${Date.now()}`;
    try {
      const aiGenRecord = await AIGeneration.create({
        user: req.user._id,
        event: eventId || null,
        generationType: 'poster',
        promptName: 'POSTER_PROMPT',
        promptVersion: interpolated.version,
        provider: generationResult.provider || 'gemini',
        model: 'imagen-3 / pollinations',
        inputParameters: {
          eventName,
          category,
          theme,
          designStyle: style,
          colorPreference,
          size,
        },
        result: {
          imageUrl: generationResult.imageUrl,
          metadata: generationResult.metadata,
        },
        status: 'success',
      });
      if (aiGenRecord?._id) genId = aiGenRecord._id;
    } catch {
      // In-memory mode
    }

    // If linked to an event, optionally update event's posterUrl if requested
    if (eventId && req.body.applyToEvent) {
      try {
        await Event.findByIdAndUpdate(eventId, { posterUrl: generationResult.imageUrl });
      } catch {
        // In-memory mode
      }
    }

    res.status(200).json({
      success: true,
      data: {
        generationId: genId,
        imageUrl: generationResult.imageUrl,
        promptUsed: interpolated.prompt,
        style,
        size,
        metadata: generationResult.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get poster generation history for logged-in user
// @route   GET /api/ai/poster/history
// @access  Private
const getPosterHistory = async (req, res, next) => {
  try {
    let history = [];
    try {
      history = await AIGeneration.find({
        user: req.user._id,
        generationType: 'poster',
      })
        .sort({ createdAt: -1 })
        .limit(20);
    } catch {
      history = [];
    }

    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePoster,
  getPosterHistory,
};
