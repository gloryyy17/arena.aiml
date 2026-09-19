/**
 * Prompt Template for AI Email Generator
 */
const EMAIL_PROMPT_V1 = {
  name: 'EMAIL_PROMPT',
  version: '1.0.0',
  purpose: 'Generate personalized, conversion-optimized HTML and plain-text email campaigns for events',
  variables: [
    'emailType', // 'invitation', 'announcement', 'reminder', 'confirmation', 'promotional', 'thank_you', 'feedback_request', 'cancellation'
    'eventTitle',
    'eventDate',
    'eventVenue',
    'eventCategory',
    'eventDescription',
    'recipientType', // 'all_students', 'registered_participants', 'faculty', 'organizers', 'general'
    'emailPurpose',
    'tone',
    'length',
    'callToAction',
  ],
  systemInstructions: `You are an expert event communication and email marketing specialist for Arena AIML.
Your task is to draft a high-converting, beautifully formatted responsive HTML email and matching plain-text email.
You MUST output valid, structured JSON without markdown wrappers.
The HTML must use clean inline CSS styles compatible with email clients.`,
  userInstructionsTemplate: (vars) => `Generate an email for the following campaign specifications:

- Email Type: ${vars.emailType || 'Event Announcement'}
- Event Title: ${vars.eventTitle}
- Date & Time: ${vars.eventDate || 'Coming Soon'}
- Venue: ${vars.eventVenue || 'Main Auditorium'}
- Category: ${vars.eventCategory || 'Technical'}
- Event Context: ${vars.eventDescription || 'Flagship college event'}
- Recipient Group: ${vars.recipientType || 'Students'}
- Specific Purpose/Note: ${vars.emailPurpose || 'Encourage participation and registrations'}
- Desired Tone: ${vars.tone || 'Exciting and clear'}
- Call to Action: ${vars.callToAction || 'Register Now'}

Return structured JSON with:
1. subject: Attention-grabbing email subject line
2. preview_text: Short preview snippet shown in inboxes (approx 50 chars)
3. html_body: Full responsive HTML email template using inline CSS (colors: #5B47FB accent, #FAF9F5 background, #1A1A1C text, rounded buttons)
4. plain_text: Plain-text fallback version of the email`,
  expectedOutputSchema: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      preview_text: { type: 'string' },
      html_body: { type: 'string' },
      plain_text: { type: 'string' },
    },
    required: ['subject', 'preview_text', 'html_body', 'plain_text'],
  },
  validateOutput: (data) => {
    return (
      typeof data.subject === 'string' &&
      typeof data.preview_text === 'string' &&
      typeof data.html_body === 'string' &&
      typeof data.plain_text === 'string' &&
      data.html_body.length > 50
    );
  },
};

module.exports = { EMAIL_PROMPT_V1 };
