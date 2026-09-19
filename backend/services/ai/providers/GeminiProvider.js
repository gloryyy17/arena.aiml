const BaseProvider = require('./BaseProvider');

/**
 * Google Gemini Model Provider
 * Uses Gemini REST API for high-speed, structured JSON generation and chat
 */
class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'gemini';
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.textModel = config.textModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generate raw text response
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const url = `${this.apiEndpoint}/${this.textModel}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text).join('') || '';

    return {
      text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      model: this.textModel,
      provider: this.providerName,
    };
  }

  /**
   * Generate structured JSON
   */
  async generateStructuredJSON({ prompt, systemInstruction, schema, temperature = 0.2 }) {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const url = `${this.apiEndpoint}/${this.textModel}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompt}\n\nIMPORTANT: Respond with valid, raw JSON only without markdown formatting or backticks.` }],
        },
      ],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (schema) {
      body.generationConfig.responseSchema = schema;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    let rawText = candidate?.content?.parts?.map((p) => p.text).join('') || '{}';

    // Sanitize any accidental markdown code fences
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error(`Failed to parse Gemini structured JSON: ${parseErr.message}. Output was: ${rawText.slice(0, 200)}`);
    }

    return {
      data: parsedData,
      rawText,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      model: this.textModel,
      provider: this.providerName,
    };
  }

  /**
   * Generate image (using Pollinations / Imagen AI API via fetch)
   */
  async generateImage({ prompt, size = '1024x1024', style = 'modern' }) {
    // Generate an enhanced visual prompt
    const enhancedPrompt = encodeURIComponent(`${prompt}, ${style} style, high resolution, 8k, professional event poster design`);
    const [width, height] = size.includes('x') ? size.split('x') : [1024, 1024];
    const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;

    return {
      imageUrl,
      provider: 'gemini-pollinations',
      metadata: {
        prompt,
        size,
        style,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = GeminiProvider;
