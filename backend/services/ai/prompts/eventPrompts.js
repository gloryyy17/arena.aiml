/**
 * Prompt Template for AI Event Description Generator
 */
const EVENT_DESCRIPTION_PROMPT_V1 = {
  name: 'EVENT_DESCRIPTION_PROMPT',
  version: '1.0.0',
  purpose: 'Generate structured, captivating, and SEO-optimized event descriptions from key inputs',
  variables: [
    'eventName',
    'category',
    'date',
    'time',
    'venue',
    'organizer',
    'targetAudience',
    'mainTopic',
    'objectives',
    'keyActivities',
    'tone',
    'desiredLength',
  ],
  systemInstructions: `You are an elite event marketing strategist and copywriter for college and tech community events at Arena AIML.
Your goal is to transform rough event details into compelling, professional, and well-structured event copy.
You MUST output valid, structured JSON adhering strictly to the expected schema without any markdown wrapping or extra comments.`,
  userInstructionsTemplate: (vars) => `Generate comprehensive event copy for the following event details:

- Event Name: ${vars.eventName}
- Category: ${vars.category || 'General'}
- Date & Time: ${vars.date || 'TBD'} ${vars.time ? `at ${vars.time}` : ''}
- Venue: ${vars.venue || 'Campus Auditorium'}
- Organizer: ${vars.organizer || 'Arena AIML'}
- Target Audience: ${vars.targetAudience || 'Students and Faculty'}
- Main Topic: ${vars.mainTopic || vars.eventName}
- Event Objectives: ${vars.objectives || 'Skill development and community building'}
- Key Activities: ${vars.keyActivities || 'Keynote, Workshops, Interactive sessions, Certification'}
- Desired Tone: ${vars.tone || 'Exciting, professional, and welcoming'}
- Desired Length: ${vars.desiredLength || 'Standard (approx 200 words)'}

Provide the response in the required JSON format with:
1. short_description (1-2 sentences punchy elevator pitch)
2. long_description (detailed multi-paragraph description)
3. highlights (array of 3-5 concise bullet points)
4. social_caption (engaging social media post with emojis)
5. call_to_action (action-oriented phrase)
6. hashtags (array of 4-6 relevant hashtags)
7. seo_description (meta description under 160 characters)`,
  expectedOutputSchema: {
    type: 'object',
    properties: {
      short_description: { type: 'string' },
      long_description: { type: 'string' },
      highlights: { type: 'array', items: { type: 'string' } },
      social_caption: { type: 'string' },
      call_to_action: { type: 'string' },
      hashtags: { type: 'array', items: { type: 'string' } },
      seo_description: { type: 'string' },
    },
    required: [
      'short_description',
      'long_description',
      'highlights',
      'social_caption',
      'call_to_action',
      'hashtags',
    ],
  },
  validateOutput: (data) => {
    if (!data.short_description || typeof data.short_description !== 'string') return false;
    if (!data.long_description || typeof data.long_description !== 'string') return false;
    if (!Array.isArray(data.highlights)) return false;
    if (!data.social_caption || typeof data.social_caption !== 'string') return false;
    return true;
  },
};

module.exports = { EVENT_DESCRIPTION_PROMPT_V1 };
