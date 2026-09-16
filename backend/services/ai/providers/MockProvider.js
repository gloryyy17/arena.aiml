const BaseProvider = require('./BaseProvider');

/**
 * Deterministic Mock AI Provider
 * Used for fast, zero-cost automated testing, CI/CD, and local offline development.
 */
class MockProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'mock';
  }

  isAvailable() {
    return true;
  }

  async generateText({ prompt, systemInstruction, temperature = 0.7 }) {
    return {
      text: `[Mock AI Response] Response for: ${prompt.slice(0, 80)}...`,
      usage: { promptTokens: 42, completionTokens: 64, totalTokens: 106 },
      model: 'mock-model-v1',
      provider: this.providerName,
    };
  }

  async generateStructuredJSON({ prompt, systemInstruction, schema, temperature = 0.2 }) {
    let mockResult = {};

    const lower = (prompt + ' ' + (systemInstruction || '')).toLowerCase();
    const props = schema?.properties || {};

    // 1. CHATBOT: Identified by schema.properties.answer or chatbot prompt
    if (props.answer || lower.includes('chatbot_prompt') || lower.includes('official ai event concierge') || lower.includes('user question:')) {
      let userQuery = lower;
      const uqIdx = lower.lastIndexOf('user question:');
      if (uqIdx !== -1) {
        userQuery = lower.slice(uqIdx + 'user question:'.length).split('please answer')[0].trim();
      }

      let answer = 'Hello! I am your Arena AI Assistant. How can I help you today? You can ask me about upcoming hackathons, campus workshops, registration deadlines, or digital certificates.';
      let suggestedQueries = [
        'What events are happening this week?',
        'How do I register for an event?',
        'Show Technical workshops',
      ];
      let referencedEventIds = [];

      if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b/i.test(userQuery) || userQuery === 'hello' || userQuery === 'hi') {
        answer = 'Hello! I am your Arena AI Assistant. How can I help you today? You can ask me about upcoming hackathons, campus workshops, registration deadlines, or digital certificates.';
        suggestedQueries = [
          'What events are happening this week?',
          'How do I register for an event?',
          'Show Technical workshops',
        ];
      } else if (userQuery.includes('hackathon') || userQuery.includes('genesis') || userQuery.includes('technical') || userQuery.includes('ai event')) {
        answer = 'The flagship **AI Hackathon 2026** is scheduled for Sep 15–16 in the Main Auditorium & Innovation Lab! It is a 24-hour sprint focusing on generative AI, intelligent agents, and neural interfaces. Registration is free and open to all students directly on your dashboard.';
        suggestedQueries = ['How do I register for AI Hackathon?', 'What is the hackathon schedule?', 'Are certificates provided?'];
        referencedEventIds = ['sample-ai-hackathon'];
      } else if (userQuery.includes('rangmanch') || userQuery.includes('cultural') || userQuery.includes('dance') || userQuery.includes('music') || userQuery.includes('drama')) {
        answer = 'The **Cultural Fest: Rangmanch** will take place on Sep 20–21 at the Open Air Theatre (OAT)! It features inter-departmental dance, music, drama competitions, and street plays. Entry is completely free.';
        suggestedQueries = ['What competitions are in Rangmanch?', 'Can I register for Rangmanch?', 'Show other events'];
        referencedEventIds = ['sample-rangmanch'];
      } else if (userQuery.includes('design') || userQuery.includes('ui') || userQuery.includes('ux') || userQuery.includes('figma') || userQuery.includes('workshop')) {
        answer = 'The **UI/UX Design Masterclass** is on Sep 25 from 2:00 PM to 6:00 PM in Design Studio Lab 3. It covers hands-on Figma component architecture, micro-interactions, and modern glassmorphic web styling. Entry fee is ₹50.';
        suggestedQueries = ['How do I pay the ₹50 fee?', 'What tools are required?', 'Show all workshops'];
        referencedEventIds = ['sample-ui-ux-design'];
      } else if (userQuery.includes('cricket') || userQuery.includes('sports') || userQuery.includes('cup') || userQuery.includes('tournament')) {
        answer = 'The **Inter-College Cricket Cup** kicks off on Oct 2 at the Sports Ground! It is an annual 20-over knockout tournament between AIML colleges. Free team registration on your dashboard.';
        suggestedQueries = ['What is the match schedule?', 'Who is the sports coordinator?', 'Show all events'];
        referencedEventIds = ['sample-cricket-cup'];
      } else if (userQuery.includes('register') || userQuery.includes('how to register') || userQuery.includes('registration') || userQuery.includes('join')) {
        answer = 'Registering for an event on Arena is simple:\n1. Browse through the events on the Arena board or your dashboard.\n2. Click on the event card to view full venue, itinerary, and coordinator details.\n3. Click **"Register Now"** to confirm your spot.\n\nYou can track and manage all your active registrations under **"My Registrations"** on your dashboard.';
        suggestedQueries = ['What events can I register for?', 'Can I cancel a registration?', 'Are digital certificates provided?'];
        referencedEventIds = ['sample-ai-hackathon', 'sample-rangmanch'];
      } else if (userQuery.includes('certificate') || userQuery.includes('digital certificate')) {
        answer = 'Yes! All participants who attend registered Arena events receive a verified digital certificate. You will be able to view and download your certificates directly from your student dashboard once attendance is confirmed.';
        suggestedQueries = ['How do I view my registrations?', 'Show upcoming events', 'What events are free?'];
      } else if (userQuery.includes('week') || userQuery.includes('upcoming') || userQuery.includes('available') || userQuery.includes('show') || userQuery.includes('events') || userQuery.includes('free')) {
        answer = 'Here are the active approved events upcoming on the Arena board:\n\n• **AI Hackathon 2026** (Technical) — Sep 15–16 | Main Auditorium (Free)\n• **Cultural Fest: Rangmanch** (Cultural) — Sep 20–21 | Open Air Theatre (Free)\n• **UI/UX Design Masterclass** (Workshop) — Sep 25 | Design Studio Lab 3 (₹50)\n• **Inter-College Cricket Cup** (Sports) — Oct 2–5 | Sports Ground (Free)\n\nClick any event card to register!';
        suggestedQueries = ['How do I register for AI Hackathon?', 'Show Technical workshops', 'Are there any fees?'];
        referencedEventIds = ['sample-ai-hackathon', 'sample-rangmanch', 'sample-ui-ux-design', 'sample-cricket-cup'];
      }

      mockResult = {
        answer,
        suggestedQueries,
        referencedEventIds,
        message: 'Mock chatbot response generated successfully.',
        timestamp: new Date().toISOString(),
      };
    }
    // 2. EMAIL STUDIO: Identified by schema.properties.subject or email prompt
    else if (props.subject || props.html_body || lower.includes('email_campaign_prompt') || lower.includes('email studio')) {
      mockResult = {
        subject: 'Exciting Update: Join Us at Arena AIML Upcoming Event!',
        preview_text: 'Discover key highlights, schedules, and registration details for the upcoming event.',
        html_body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E7E4DC; border-radius: 12px; background: #FAF9F5;">
  <h1 style="color: #5B47FB; font-size: 24px; margin-bottom: 12px;">You're Invited to AIML Arena!</h1>
  <p style="color: #1A1A1C; font-size: 15px; line-height: 1.6;">We are thrilled to welcome you to our upcoming flagship event. Experience live workshops, keynotes, and interactive showcases.</p>
  <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border-radius: 8px; border: 1px solid #E7E4DC;">
    <strong>Highlights:</strong>
    <ul style="margin: 8px 0; padding-left: 20px;">
      <li>Industry keynote sessions</li>
      <li>Hands-on coding challenges</li>
      <li>Digital certificates for all attendees</li>
    </ul>
  </div>
  <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #5B47FB; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: 600;">Confirm Registration</a>
</div>`,
        plain_text: `You're Invited to AIML Arena!\n\nWe are thrilled to welcome you to our upcoming flagship event. Experience live workshops, keynotes, and interactive showcases.\n\nHighlights:\n- Industry keynote sessions\n- Hands-on coding challenges\n- Digital certificates for all attendees\n\nConfirm your registration at http://localhost:5173/dashboard`,
      };
    }
    // 3. FEEDBACK ANALYSIS: Identified by schema.properties.overall_sentiment
    else if (props.overall_sentiment || props.sentimentScore || props.sentiment_score || lower.includes('feedback_analysis_prompt')) {
      mockResult = {
        overall_sentiment: 'positive',
        sentiment_score: 0.84,
        positive_percentage: 75,
        neutral_percentage: 15,
        negative_percentage: 10,
        positive_themes: ['Engaging speakers', 'Comprehensive hands-on labs', 'Great networking'],
        negative_themes: ['Registration desk queue', 'Audio echo in room 3'],
        neutral_themes: ['Standard schedule pacing', 'Adequate seating'],
        topics: ['AI Workshop', 'Logistics', 'Venue Facilities'],
        complaints: ['Registration took longer than expected during morning rush'],
        suggestions: ['Provide digital fast-track check-in via QR code', 'Record sessions for later viewing'],
        priority_issues: ['Optimize entrance check-in workflow', 'Upgrade room 3 microphone acoustics'],
        summary: 'Attendees expressed high satisfaction with event content and speakers, with minor recommendations to streamline check-in lines and room acoustics.',
      };
    }
    // 4. RECOMMENDATIONS: Identified by schema.properties.explanation or score
    else if (props.explanation || props.score || lower.includes('recommendation_engine')) {
      mockResult = {
        score: 0.94,
        explanation: 'Matches your registered interest in Artificial Intelligence, Workshops, and previous attendance in Technical events.',
        reason: 'Matches your registered interest in Artificial Intelligence, Workshops, and previous attendance in Technical events.',
        highlight_tags: ['AI', 'Workshop', 'Technical'],
        key_signals: ['Category match: Technical', 'Tag overlap: AI, Machine Learning', 'High popularity rating'],
      };
    }
    // 5. EVENT COPY GENERATOR: Identified by schema.properties.short_description
    else if (props.short_description || props.shortDescription || props.highlights || lower.includes('event_description') || lower.includes('event description')) {
      mockResult = {
        short_description: 'An immersive hands-on session on advanced AI architectures, neural networks, and event innovations.',
        long_description: 'Join us for an electrifying deep-dive exploring modern AI engineering, intelligent event systems, and hands-on coding workshops led by industry leaders.',
        highlights: [
          'Live interactive coding labs and practical walkthroughs',
          'Keynote addresses from AI industry specialists',
          'Networking sessions with cross-department peers',
          'Exclusive project showcases and digital certification',
        ],
        social_caption: '🚀 Ready to supercharge your AI skills? Join us at AIML Arena for an unforgettable experience! Register today #AIMLArena #AIInnovation',
        call_to_action: 'Reserve your spot today — seats are limited!',
        hashtags: ['#AIMLArena', '#ArtificialIntelligence', '#TechEvent', '#Hackathon2026'],
        seo_description: 'Explore cutting-edge artificial intelligence, event tech, and industry best practices at AIML Arena.',
      };
    }
    // 6. DEFAULT FALLBACK
    else {
      mockResult = {
        answer: 'I can help you explore upcoming events, register, view schedules, and connect with organisers on Arena AIML.',
        suggestedQueries: ['What events are happening this week?', 'How do I register?', 'Show Technical events'],
        message: 'Mock structured output generated successfully.',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      data: mockResult,
      rawText: JSON.stringify(mockResult),
      usage: { promptTokens: 30, completionTokens: 90, totalTokens: 120 },
      model: 'mock-model-v1',
      provider: this.providerName,
    };
  }

  async generateImage({ prompt, size = '1024x1024', style = 'modern' }) {
    const [width, height] = size.includes('x') ? size.split('x') : [1024, 1024];

    // High quality themed Unsplash event poster images based on style
    const styleImages = {
      cyberpunk: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1024&h=1024&fit=crop&auto=format',
      modern_abstract: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&h=1024&fit=crop&auto=format',
      minimalist: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1024&h=1024&fit=crop&auto=format',
      retro: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1024&h=1024&fit=crop&auto=format',
      vibrant_3d: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1024&h=1024&fit=crop&auto=format',
      corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1024&h=1024&fit=crop&auto=format',
    };

    const imageUrl = styleImages[style] || styleImages.modern_abstract;

    return {
      imageUrl,
      provider: this.providerName,
      metadata: {
        prompt,
        size,
        style,
        generatedAt: new Date().toISOString(),
        mock: true,
      },
    };
  }
}

module.exports = MockProvider;
