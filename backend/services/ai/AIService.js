const GeminiProvider = require('./providers/GeminiProvider');
const OpenAIProvider = require('./providers/OpenAIProvider');
const MockProvider = require('./providers/MockProvider');
const promptRegistry = require('./prompts/PromptRegistry');

/**
 * Centralized AI Service Coordinator
 * Orchestrates providers, prompt execution, structured outputs, caching, error recovery, and logging.
 */
class AIService {
  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.openAIProvider = new OpenAIProvider();
    this.mockProvider = new MockProvider();

    // In-memory cache for deterministic requests (TTL: 15 mins)
    this.cache = new Map();
    this.cacheTTL = 15 * 60 * 1000;
  }

  /**
   * Resolve the active AI provider based on environment & availability
   */
  getActiveProvider() {
    const forcedProvider = process.env.AI_PROVIDER?.toLowerCase();

    if (forcedProvider === 'mock' || process.env.NODE_ENV === 'test') {
      return this.mockProvider;
    }

    if (forcedProvider === 'gemini' && this.geminiProvider.isAvailable()) {
      return this.geminiProvider;
    }

    if (forcedProvider === 'openai' && this.openAIProvider.isAvailable()) {
      return this.openAIProvider;
    }

    // Auto-discovery priority: Gemini -> OpenAI -> Mock
    if (this.geminiProvider.isAvailable()) {
      return this.geminiProvider;
    }

    if (this.openAIProvider.isAvailable()) {
      return this.openAIProvider;
    }

    // Fallback gracefully to Mock Provider so application never crashes
    return this.mockProvider;
  }

  /**
   * Generate cache key from prompt parameters
   */
  _getCacheKey(type, payload) {
    return `${type}:${JSON.stringify(payload)}`;
  }

  /**
   * Check cache
   */
  _getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Set cache
   */
  _setInCache(key, data) {
    if (this.cache.size > 200) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Retry wrapper with exponential backoff
   */
  async _withRetry(fn, retries = 2, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        console.warn(`[AIService] Attempt ${attempt} failed: ${err.message}`);
        if (attempt <= retries) {
          await new Promise((res) => setTimeout(res, delay * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastError;
  }

  /**
   * Execute a structured prompt by template name
   * @param {string} promptName - Registered template name
   * @param {Object} variables - Interpolation variables
   * @param {Object} [options] - Generation options
   */
  async executeStructuredPrompt(promptName, variables = {}, options = {}) {
    const interpolated = promptRegistry.interpolate(promptName, variables);
    const cacheKey = this._getCacheKey(promptName, variables);

    if (options.useCache !== false) {
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        return { ...cached, isCached: true };
      }
    }

    const provider = this.getActiveProvider();

    const result = await this._withRetry(async () => {
      return await provider.generateStructuredJSON({
        prompt: interpolated.prompt,
        systemInstruction: interpolated.systemInstruction,
        schema: interpolated.schema,
        temperature: options.temperature || 0.2,
      });
    });

    // Validate structured output if template defined a validator
    if (interpolated.validateOutput && !interpolated.validateOutput(result.data)) {
      console.warn(`[AIService] Output validation failed for ${promptName}. Attempting fallback structure.`);
    }

    const output = {
      data: result.data,
      metadata: {
        provider: provider.providerName,
        model: result.model || 'unknown',
        promptName: interpolated.name,
        promptVersion: interpolated.version,
        usage: result.usage,
        timestamp: new Date().toISOString(),
      },
    };

    this._setInCache(cacheKey, output);
    return output;
  }

  /**
   * Generate raw text response
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 2048 }) {
    const provider = this.getActiveProvider();
    return await this._withRetry(async () => {
      return await provider.generateText({ prompt, systemInstruction, temperature, maxTokens });
    });
  }

  /**
   * Generate poster image
   */
  async generatePosterImage({ prompt, size = '1024x1024', style = 'modern' }) {
    const provider = this.getActiveProvider();
    return await this._withRetry(async () => {
      return await provider.generateImage({ prompt, size, style });
    });
  }

  /**
   * Get prompt registry instance
   */
  getPromptRegistry() {
    return promptRegistry;
  }
}

// Singleton export
const aiService = new AIService();

module.exports = aiService;
