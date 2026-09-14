/**
 * Prompt Template for AI Recommendation Explanation
 */
const RECOMMENDATION_PROMPT_V1 = {
  name: 'RECOMMENDATION_PROMPT',
  version: '1.0.0',
  purpose: 'Generate clear, human-understandable, and transparent explanations for personalized event recommendations',
  variables: ['userName', 'userInterests', 'userPastEvents', 'eventTitle', 'eventCategory', 'eventTags', 'matchedSignals'],
  systemInstructions: `You are the recommendation intelligence explainer for Arena AIML.
Your task is to write a short, punchy 1-2 sentence explanation of WHY a specific event is recommended to a student based on their profile and matching signals.`,
  userInstructionsTemplate: (vars) => `Student Profile:
- Name: ${vars.userName}
- Interests: ${Array.isArray(vars.userInterests) ? vars.userInterests.join(', ') : (vars.userInterests || 'General')}
- Past Attended/Registered Categories: ${vars.userPastEvents || 'None recorded'}

Recommended Event:
- Title: ${vars.eventTitle}
- Category: ${vars.eventCategory}
- Tags: ${Array.isArray(vars.eventTags) ? vars.eventTags.join(', ') : (vars.eventTags || 'None')}
- Matched Algorithmic Signals: ${vars.matchedSignals || 'Category & Interest match'}

Provide a structured JSON output with:
1. explanation: concise 1-2 sentence transparent explanation for the user
2. highlight_tags: array of 2-3 matched key tags or reasons`,
  expectedOutputSchema: {
    type: 'object',
    properties: {
      explanation: { type: 'string' },
      highlight_tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['explanation'],
  },
};

module.exports = { RECOMMENDATION_PROMPT_V1 };
