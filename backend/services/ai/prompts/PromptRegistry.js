const { EVENT_DESCRIPTION_PROMPT_V1 } = require('./eventPrompts');
const { EMAIL_PROMPT_V1 } = require('./emailPrompts');
const { POSTER_PROMPT_V1 } = require('./posterPrompts');
const { CHATBOT_PROMPT_V1 } = require('./chatbotPrompts');
const { FEEDBACK_ANALYSIS_PROMPT_V1 } = require('./feedbackPrompts');
const { RECOMMENDATION_PROMPT_V1 } = require('./recommendationPrompts');

/**
 * Central Prompt Registry
 * Manages versioned prompt templates, interpolation, validation, and schema definitions.
 */
class PromptRegistry {
  constructor() {
    this.prompts = new Map();

    // Register standard prompt templates
    this.register(EVENT_DESCRIPTION_PROMPT_V1);
    this.register(EMAIL_PROMPT_V1);
    this.register(POSTER_PROMPT_V1);
    this.register(CHATBOT_PROMPT_V1);
    this.register(FEEDBACK_ANALYSIS_PROMPT_V1);
    this.register(RECOMMENDATION_PROMPT_V1);
  }

  /**
   * Register or update a prompt template
   * @param {Object} promptTemplate
   */
  register(promptTemplate) {
    if (!promptTemplate.name || !promptTemplate.version) {
      throw new Error('Prompt template must have a name and version');
    }
    const key = `${promptTemplate.name}_V${promptTemplate.version}`;
    this.prompts.set(key, promptTemplate);
    // Also store latest version under the base name
    this.prompts.set(promptTemplate.name, promptTemplate);
  }

  /**
   * Retrieve a registered prompt template
   * @param {string} name - Name (e.g. 'EVENT_DESCRIPTION_PROMPT' or 'EVENT_DESCRIPTION_PROMPT_V1.0.0')
   * @returns {Object}
   */
  get(name) {
    const template = this.prompts.get(name);
    if (!template) {
      throw new Error(`Prompt template '${name}' not found in PromptRegistry.`);
    }
    return template;
  }

  /**
   * List all registered prompts with their metadata
   */
  listAll() {
    const seen = new Set();
    const list = [];
    for (const [key, template] of this.prompts.entries()) {
      if (seen.has(template.name)) continue;
      seen.add(template.name);
      list.push({
        name: template.name,
        version: template.version,
        purpose: template.purpose,
        variables: template.variables,
        hasSchema: Boolean(template.expectedOutputSchema),
      });
    }
    return list;
  }

  /**
   * Interpolate a prompt template with provided runtime variables
   * @param {string} promptName
   * @param {Object} variables
   * @returns {{ prompt: string, systemInstruction: string, schema: Object, version: string }}
   */
  interpolate(promptName, variables = {}) {
    const template = this.get(promptName);

    // Sanitize variables to prevent raw prompt injections from breaking template syntax
    const sanitizedVars = {};
    for (const [k, v] of Object.entries(variables)) {
      if (typeof v === 'string') {
        sanitizedVars[k] = v.trim();
      } else {
        sanitizedVars[k] = v;
      }
    }

    const prompt = template.userInstructionsTemplate(sanitizedVars);
    const systemInstruction = template.systemInstructions;
    const schema = template.expectedOutputSchema;

    return {
      prompt,
      systemInstruction,
      schema,
      name: template.name,
      version: template.version,
      validateOutput: template.validateOutput || null,
    };
  }
}

// Singleton instance
const promptRegistry = new PromptRegistry();

module.exports = promptRegistry;
