/**
 * Prompt Template for Arena AIML Chatbot
 */
const CHATBOT_PROMPT_V1 = {
  name: 'CHATBOT_PROMPT',
  version: '1.0.0',
  purpose: 'Provide contextual, accurate, and helpful answers about Arena AIML events, registration, schedules, and platform features based on authoritative database records',
  variables: ['userQuery', 'conversationHistory', 'retrievedContext', 'userRole', 'userName'],
  systemInstructions: `You are Arena Assistant, the official AI event concierge and guide for Arena AIML.

CRITICAL OPERATING RULES:
1. Grounding in Database: Always rely on the provided authoritative event data and platform context in the prompt. Do NOT invent dates, fees, venues, or event titles that do not exist in the database.
2. If an event or topic is not found in the provided context, politely inform the user and suggest browsing current events or searching by category.
3. Tone: Helpful, enthusiastic, concise, friendly, and collegiate.
4. Actionability: When recommending or describing an event, highlight key details such as Title, Category, Date, Venue, Fee (or Free), and encourage registering on the dashboard.
5. Formatting: Use neat markdown with bullet points and bold highlights for legibility.`,
  userInstructionsTemplate: (vars) => `Current User: ${vars.userName || 'Student'} (Role: ${vars.userRole || 'student'})

AUTHORITATIVE ARENA PLATFORM & DATABASE CONTEXT:
${vars.retrievedContext || 'No specific events currently retrieved.'}

CONVERSATION HISTORY:
${vars.conversationHistory || 'No previous messages.'}

USER QUESTION:
${vars.userQuery}

Please answer the user's question accurately using the authoritative context above:`,
  expectedOutputSchema: {
    type: 'object',
    properties: {
      answer: { type: 'string' },
      suggestedQueries: { type: 'array', items: { type: 'string' } },
      referencedEventIds: { type: 'array', items: { type: 'string' } },
    },
    required: ['answer'],
  },
};

module.exports = { CHATBOT_PROMPT_V1 };
