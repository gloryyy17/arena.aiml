/**
 * Base AI Provider Abstract Interface
 * All concrete AI model providers (Gemini, OpenAI, Mock, etc.) must implement this interface.
 */
class BaseProvider {
  constructor(config = {}) {
    this.config = config;
    this.providerName = 'base';
  }

  /**
   * Generate raw text response from prompt
   * @param {Object} params
   * @param {string} params.prompt - Formatted prompt string
   * @param {string} [params.systemInstruction] - Optional system instruction
   * @param {number} [params.temperature] - Sampling temperature (0.0 - 1.0)
   * @param {number} [params.maxTokens] - Max tokens to generate
   * @returns {Promise<{ text: string, usage?: { promptTokens: number, completionTokens: number, totalTokens: number } }>}
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 2048 }) {
    throw new Error(`generateText() not implemented by ${this.constructor.name}`);
  }

  /**
   * Generate structured JSON adhering to an expected schema
   * @param {Object} params
   * @param {string} params.prompt - Formatted prompt string
   * @param {string} [params.systemInstruction] - Optional system instruction
   * @param {Object} params.schema - JSON Schema / expected schema description
   * @param {number} [params.temperature] - Sampling temperature
   * @returns {Promise<{ data: any, rawText: string, usage?: Object }>}
   */
  async generateStructuredJSON({ prompt, systemInstruction, schema, temperature = 0.3 }) {
    throw new Error(`generateStructuredJSON() not implemented by ${this.constructor.name}`);
  }

  /**
   * Generate an image from a detailed visual prompt
   * @param {Object} params
   * @param {string} params.prompt - Image generation prompt
   * @param {string} [params.size] - Aspect ratio or resolution
   * @param {string} [params.style] - Aesthetic style
   * @returns {Promise<{ imageUrl: string, metadata?: Object }>}
   */
  async generateImage({ prompt, size = '1024x1024', style = 'modern' }) {
    throw new Error(`generateImage() not implemented by ${this.constructor.name}`);
  }
}

module.exports = BaseProvider;
