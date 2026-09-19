const Event = require('../../models/Event');
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const aiService = require('./AIService');

/**
 * Content-Based & Multi-Signal Recommendation Engine
 * Calculates weighted affinity scores between user profiles, registration history,
 * category alignment, tag overlap, popularity, and recency, generating explainable recommendations.
 */
class RecommendationService {
  constructor(weights = {}) {
    // Configurable signal weights (must sum to 1.0)
    this.weights = {
      interestMatch: weights.interestMatch ?? 0.35,
      categoryMatch: weights.categoryMatch ?? 0.25,
      historySimilarity: weights.historySimilarity ?? 0.15,
      popularity: weights.popularity ?? 0.15,
      recency: weights.recency ?? 0.10,
    };
  }

  /**
   * Calculate Jaccard similarity between two sets of string tokens
   */
  _jaccardSimilarity(arr1 = [], arr2 = []) {
    if (!arr1.length || !arr2.length) return 0;
    const s1 = new Set(arr1.map((item) => item.toLowerCase().trim()));
    const s2 = new Set(arr2.map((item) => item.toLowerCase().trim()));
    const intersection = new Set([...s1].filter((x) => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate string overlap score
   */
  _keywordMatchScore(keywords = [], text = '') {
    if (!keywords.length || !text) return 0;
    const lowerText = text.toLowerCase();
    let matches = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase().trim())) {
        matches++;
      }
    }
    return Math.min(1.0, matches / Math.max(1, keywords.length));
  }

  /**
   * Get personalized recommendations for a user
   * @param {string} userId - ID of the user requesting recommendations
   * @param {Object} [options]
   * @param {number} [options.limit=6] - Max recommendations to return
   * @param {boolean} [options.excludeRegistered=true] - Exclude events user already registered for
   * @returns {Promise<Array<{ event: Object, score: number, matchPercentage: number, reason: string, keySignals: Array<string> }>>}
   */
  async getRecommendationsForUser(userId, options = {}) {
    const limit = options.limit || 6;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // 1. Fetch user's registered events to build historical preferences
    const userRegistrations = await Registration.find({
      student: userId,
      registrationStatus: { $ne: 'cancelled' },
    }).populate('event');

    const registeredEventIds = new Set(userRegistrations.map((r) => r.event?._id?.toString()).filter(Boolean));

    const pastCategories = userRegistrations.map((r) => r.event?.category).filter(Boolean);
    const pastTags = userRegistrations.flatMap((r) => r.event?.tags || []);

    // 2. Fetch all upcoming approved & published events
    const query = {
      status: 'approved',
      isPublished: true,
      startDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // from today onwards
    };

    if (options.excludeRegistered !== false && registeredEventIds.size > 0) {
      query._id = { $nin: Array.from(registeredEventIds) };
    }

    const availableEvents = await Event.find(query).populate('createdBy', 'name department');

    if (!availableEvents.length) {
      return [];
    }

    // Compute max participant popularity reference for normalization
    const maxCapacity = Math.max(...availableEvents.map((e) => e.maxParticipants || 100), 100);

    const scoredEvents = [];

    for (const event of availableEvents) {
      const signals = [];

      // Signal 1: Interest Match (User interests vs Event Title, Description, Tags, Category)
      const userInterests = user.interests || [];
      const eventText = `${event.title} ${event.description} ${event.category} ${(event.tags || []).join(' ')}`;
      const interestScore = this._keywordMatchScore(userInterests, eventText);
      if (interestScore > 0) {
        signals.push(`Matches your interests (${userInterests.slice(0, 2).join(', ')})`);
      }

      // Signal 2: Category Match (User Department / Past Categories vs Event Category)
      let categoryScore = 0;
      if (user.department && event.department && user.department.toLowerCase() === event.department.toLowerCase()) {
        categoryScore += 0.5;
        signals.push(`Hosted by your department (${user.department})`);
      }
      if (pastCategories.includes(event.category)) {
        categoryScore += 0.5;
        signals.push(`Matches your preferred category: ${event.category}`);
      } else if (interestScore > 0.4) {
        categoryScore += 0.3;
      }
      categoryScore = Math.min(1.0, categoryScore);

      // Signal 3: Historical Similarity (Jaccard similarity on past attended tags)
      const tagSimilarity = this._jaccardSimilarity(pastTags, event.tags || []);
      if (tagSimilarity > 0.2) {
        signals.push(`Similar to events you previously joined`);
      }

      // Signal 4: Popularity (normalized by capacity & fee factor)
      const popularityScore = Math.min(1.0, (event.maxParticipants || 50) / maxCapacity);
      if (event.fee === 0) {
        signals.push('Free registration');
      }

      // Signal 5: Recency / Date urgency (events occurring in the next 7-14 days receive a recency boost)
      const daysUntilEvent = (new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24);
      let recencyScore = 0.5;
      if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
        recencyScore = 1.0;
        signals.push('Happening this week');
      } else if (daysUntilEvent > 7 && daysUntilEvent <= 21) {
        recencyScore = 0.8;
      }

      // Combined Weighted Score (0.0 to 1.0)
      const compositeScore =
        this.weights.interestMatch * interestScore +
        this.weights.categoryMatch * categoryScore +
        this.weights.historySimilarity * tagSimilarity +
        this.weights.popularity * popularityScore +
        this.weights.recency * recencyScore;

      // Deduplicate signals and build natural explanation
      const uniqueSignals = Array.from(new Set(signals));
      let explanation = uniqueSignals.length > 0
        ? uniqueSignals.slice(0, 3).join(' • ')
        : `Recommended based on ${event.category} popularity and upcoming schedule`;

      scoredEvents.push({
        event,
        score: Number(compositeScore.toFixed(3)),
        matchPercentage: Math.round(compositeScore * 100),
        reason: explanation,
        keySignals: uniqueSignals,
      });
    }

    // Sort descending by score and return top N
    scoredEvents.sort((a, b) => b.score - a.score);
    return scoredEvents.slice(0, limit);
  }
}

// Singleton export
const recommendationService = new RecommendationService();

module.exports = recommendationService;
