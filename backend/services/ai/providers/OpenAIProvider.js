const BaseProvider = require('./BaseProvider');

/**
 * OpenAI Compatible Provider
 */
class OpenAIProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.textModel = config.textModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.apiBaseUrl = config.apiBaseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 2048 }) {
    if (!this.isAvailable()) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.textModel,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: this.textModel,
      provider: this.providerName,
    };
  }

  async generateStructuredJSON({ prompt, systemInstruction, schema, temperature = 0.2 }) {
    if (!this.isAvailable()) {
      throw new Error('OPENAI_API_KEY is not configured.');
    }

    const messages = [];
    const sysPrompt = (systemInstruction ? systemInstruction + '\n\n' : '') +
      'You MUST return valid raw JSON adhering to the specified schema without backticks or extra commentary.';
    messages.push({ role: 'system', content: sysPrompt });
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: this.textModel,
      messages,
      temperature,
      response_format: { type: 'json_object' },
    };

    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let rawText = data.choices?.[0]?.message?.content || '{}';
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error(`Failed to parse OpenAI JSON output: ${parseErr.message}`);
    }

    return {
      data: parsedData,
      rawText,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: this.textModel,
      provider: this.providerName,
    };
  }

  async generateImage({ prompt, size = '1024x1024', style = 'modern' }) {
    if (!this.isAvailable()) {
      throw new Error('OPENAI_API_KEY is not configured for image generation.');
    }

    const response = await fetch(`${this.apiBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt}, ${style} aesthetic, high quality event poster`,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Image Generation Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || '';

    return {
      imageUrl,
      provider: this.providerName,
      metadata: { prompt, size, style, generatedAt: new Date().toISOString() },
    };
  }
}

module.exports = OpenAIProvider;
