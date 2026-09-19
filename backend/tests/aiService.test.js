const aiService = require('../services/ai/AIService');
const promptRegistry = require('../services/ai/prompts/PromptRegistry');
const MockProvider = require('../services/ai/providers/MockProvider');

describe('AI Service Foundation & Prompt Registry Tests', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.AI_PROVIDER = 'mock';
  });

  test('PromptRegistry registers and lists all standard prompts', () => {
    const list = promptRegistry.listAll();
    expect(list.length).toBeGreaterThanOrEqual(6);

    const names = list.map((p) => p.name);
    expect(names).toContain('EVENT_DESCRIPTION_PROMPT');
    expect(names).toContain('EMAIL_PROMPT');
    expect(names).toContain('POSTER_PROMPT');
    expect(names).toContain('CHATBOT_PROMPT');
    expect(names).toContain('FEEDBACK_ANALYSIS_PROMPT');
    expect(names).toContain('RECOMMENDATION_PROMPT');
  });

  test('PromptRegistry correctly interpolates event prompt template', () => {
    const interpolated = promptRegistry.interpolate('EVENT_DESCRIPTION_PROMPT', {
      eventName: 'AI Hackathon 2026',
      category: 'Technical',
      venue: 'Main Seminar Hall',
    });

    expect(interpolated.prompt).toContain('AI Hackathon 2026');
    expect(interpolated.prompt).toContain('Technical');
    expect(interpolated.prompt).toContain('Main Seminar Hall');
    expect(interpolated.systemInstruction).toBeDefined();
    expect(interpolated.schema).toBeDefined();
  });

  test('MockProvider generates realistic structured event JSON', async () => {
    const provider = new MockProvider();
    const result = await provider.generateStructuredJSON({
      prompt: 'EVENT DESCRIPTION for Hackathon',
    });

    expect(result.data).toBeDefined();
    expect(result.data.short_description).toBeDefined();
    expect(result.data.long_description).toBeDefined();
    expect(Array.isArray(result.data.highlights)).toBe(true);
    expect(Array.isArray(result.data.hashtags)).toBe(true);
  });

  test('AIService executes structured prompt successfully with caching', async () => {
    const res1 = await aiService.executeStructuredPrompt('EVENT_DESCRIPTION_PROMPT', {
      eventName: 'Deep Learning Summit',
      category: 'Workshop',
    });

    expect(res1.data).toBeDefined();
    expect(res1.data.short_description).toBeDefined();
    expect(res1.metadata.provider).toBe('mock');

    // Second call with same parameters should return cached result
    const res2 = await aiService.executeStructuredPrompt('EVENT_DESCRIPTION_PROMPT', {
      eventName: 'Deep Learning Summit',
      category: 'Workshop',
    });

    expect(res2.isCached).toBe(true);
  });

  test('AIService generates poster image URL', async () => {
    const res = await aiService.generatePosterImage({
      prompt: 'Futuristic AI Workshop Poster',
      size: '1024x1024',
      style: 'cyberpunk',
    });

    expect(res.imageUrl).toBeDefined();
    expect(res.imageUrl).toContain('http');
  });
});
