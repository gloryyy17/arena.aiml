const recommendationService = require('../services/ai/RecommendationService');
const AIGeneration = require('../models/AIGeneration');

// @desc    Get personalized, explainable event recommendations
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const excludeRegistered = req.query.excludeRegistered !== 'false';

    const recommendations = await recommendationService.getRecommendationsForUser(req.user._id, {
      limit,
      excludeRegistered,
    });

    // Optionally log recommendation generation
    if (recommendations.length > 0) {
      try {
        await AIGeneration.create({
          user: req.user._id,
          generationType: 'recommendation',
          promptName: 'RECOMMENDATION_ENGINE',
          promptVersion: '1.0.0',
          provider: 'content-based-weighted',
          model: 'multi-signal-v1',
          inputParameters: {
            userInterests: req.user.interests,
            department: req.user.department,
            limit,
          },
          result: recommendations.map((r) => ({
            eventId: r.event._id,
            score: r.score,
            reason: r.reason,
          })),
          status: 'success',
        });
      } catch {
        // In-memory mode
      }
    }

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
