/**
 * Prompt Template for AI Feedback Analysis
 */
const FEEDBACK_ANALYSIS_PROMPT_V1 = {
  name: 'FEEDBACK_ANALYSIS_PROMPT',
  version: '1.0.0',
  purpose: 'Analyze event participant feedback and produce comprehensive sentiment scores, categorized themes, suggestions, and actionable improvements',
  variables: ['eventTitle', 'feedbackEntries', 'totalResponses', 'averageRating'],
  systemInstructions: `You are a specialized qualitative and quantitative event analytics AI for Arena AIML.
Your role is to deeply analyze student and participant feedback responses, extract emotional sentiment, identify recurring positive and negative themes, summarize recommendations, and flag priority issues.
You MUST output valid, structured JSON adhering strictly to the expected schema without any markdown formatting.`,
  userInstructionsTemplate: (vars) => `Analyze the following participant feedback submissions for the event "${vars.eventTitle}":

Event Metadata:
- Event Title: ${vars.eventTitle}
- Total Submissions: ${vars.totalResponses || 'Multiple'}
- Average Numerical Rating: ${vars.averageRating ? `${vars.averageRating} / 5` : 'N/A'}

Participant Feedback Entries:
${Array.isArray(vars.feedbackEntries) ? vars.feedbackEntries.map((f, i) => `${i + 1}. [Rating: ${f.rating || 'N/A'}/5] "${f.comment || f}"`).join('\n') : vars.feedbackEntries}

Produce a structured analytical report with:
1. overall_sentiment: "positive" | "negative" | "neutral" | "mixed"
2. sentiment_score: float between 0.0 (extremely negative) and 1.0 (extremely positive)
3. positive_percentage: estimated % of positive sentiment (0-100)
4. neutral_percentage: estimated % of neutral sentiment (0-100)
5. negative_percentage: estimated % of negative sentiment (0-100)
6. positive_themes: array of top positive highlights/themes
7. negative_themes: array of top complaints/negative themes
8. neutral_themes: array of observations or neutral feedback
9. topics: array of key topics identified (e.g., "Registration", "Speaker", "Venue", "Audio")
10. complaints: specific complaints extracted
11. suggestions: constructive suggestions proposed by attendees
12. priority_issues: top 2-4 critical action items organizers must resolve for future events
13. summary: concise, executive narrative summarizing the overall event reception`,
  expectedOutputSchema: {
    type: 'object',
    properties: {
      overall_sentiment: { type: 'string' },
      sentiment_score: { type: 'number' },
      positive_percentage: { type: 'number' },
      neutral_percentage: { type: 'number' },
      negative_percentage: { type: 'number' },
      positive_themes: { type: 'array', items: { type: 'string' } },
      negative_themes: { type: 'array', items: { type: 'string' } },
      neutral_themes: { type: 'array', items: { type: 'string' } },
      topics: { type: 'array', items: { type: 'string' } },
      complaints: { type: 'array', items: { type: 'string' } },
      suggestions: { type: 'array', items: { type: 'string' } },
      priority_issues: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
    required: [
      'overall_sentiment',
      'sentiment_score',
      'positive_themes',
      'negative_themes',
      'suggestions',
      'priority_issues',
      'summary',
    ],
  },
  validateOutput: (data) => {
    return (
      typeof data.overall_sentiment === 'string' &&
      typeof data.sentiment_score === 'number' &&
      Array.isArray(data.positive_themes) &&
      Array.isArray(data.negative_themes) &&
      Array.isArray(data.suggestions) &&
      Array.isArray(data.priority_issues) &&
      typeof data.summary === 'string'
    );
  },
};

module.exports = { FEEDBACK_ANALYSIS_PROMPT_V1 };
