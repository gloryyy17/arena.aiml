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

    // Check prompt contents to craft highly realistic domain outputs
    if (lower.includes('email') || lower.includes('subject') || lower.includes('html_body')) {
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
    } else if (lower.includes('feedback') || lower.includes('sentiment') || lower.includes('rating')) {
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
    } else if (lower.includes('recommend') || lower.includes('explanation')) {
      mockResult = {
        score: 0.94,
        explanation: 'Matches your registered interest in Artificial Intelligence, Workshops, and previous attendance in Technical events.',
        reason: 'Matches your registered interest in Artificial Intelligence, Workshops, and previous attendance in Technical events.',
        highlight_tags: ['AI', 'Workshop', 'Technical'],
        key_signals: ['Category match: Technical', 'Tag overlap: AI, Machine Learning', 'High popularity rating'],
      };
    } else if (lower.includes('event') || lower.includes('description') || lower.includes('copy')) {
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
    } else {
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
    const encoded = encodeURIComponent(prompt.slice(0, 100));
    const [width, height] = size.includes('x') ? size.split('x') : [1024, 1024];

    return {
      imageUrl: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=${width}&h=${height}&fit=crop&auto=format`,
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
