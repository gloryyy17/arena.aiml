const aiService = require('../services/ai/AIService');

// @desc    List all registered prompt templates and schemas
// @route   GET /api/ai/prompts
// @access  Private (Faculty, Admin)
const listPrompts = (req, res, next) => {
  try {
    const prompts = aiService.getPromptRegistry().listAll();
    res.status(200).json({ success: true, count: prompts.length, prompts });
  } catch (error) {
    next(error);
  }
};

// @desc    Test prompt interpolation and output
// @route   POST /api/ai/prompts/test
// @access  Private (Faculty, Admin)
const testPrompt = async (req, res, next) => {
  try {
    const { promptName, variables } = req.body;

    if (!promptName) {
      return res.status(400).json({ success: false, message: 'promptName is required.' });
    }

    const interpolated = aiService.getPromptRegistry().interpolate(promptName, variables || {});

    const result = await aiService.executeStructuredPrompt(promptName, variables || {}, {
      useCache: false,
    });

    res.status(200).json({
      success: true,
      interpolatedPrompt: interpolated.prompt,
      systemInstruction: interpolated.systemInstruction,
      schema: interpolated.schema,
      result: result.data,
      metadata: result.metadata,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPrompts,
  testPrompt,
};
