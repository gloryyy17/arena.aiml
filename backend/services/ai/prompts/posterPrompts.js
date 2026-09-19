/**
 * Prompt Template for AI Poster Generator
 */
const POSTER_PROMPT_V1 = {
  name: 'POSTER_PROMPT',
  version: '1.0.0',
  purpose: 'Build an optimized visual generation prompt for event posters based on event details, design style, color preferences, and themes',
  variables: [
    'eventName',
    'category',
    'date',
    'venue',
    'organizer',
    'theme',
    'designStyle', // 'minimalist', 'cyberpunk', 'retro', 'modern_abstract', 'vibrant_3d', 'corporate'
    'colorPreference',
    'aspectRatio',
    'customInstructions',
  ],
  systemInstructions: `You are a world-class creative art director specialized in designing stunning, high-impact college tech festival and academic event posters.
Your job is to generate a comprehensive, visually descriptive prompt suitable for state-of-the-art text-to-image diffusion models.`,
  userInstructionsTemplate: (vars) => {
    const styleDescriptors = {
      minimalist: 'clean minimalist layout, elegant typography accents, bold focal element, ample negative space, sophisticated palette',
      cyberpunk: 'futuristic neon lighting, glowing circuitry, holographic HUD elements, dark synthwave atmosphere, dynamic depth',
      retro: 'vintage risograph print texture, retro 80s/90s aesthetic, bold geometric shapes, nostalgic warm tint',
      modern_abstract: 'dynamic 3D fluid gradients, glassmorphism prisms, vibrant iridescent lighting, sleek modern aesthetic',
      vibrant_3d: 'playful 3D clay-render assets, vibrant saturated colors, soft studio lighting, high polish',
      corporate: 'sleek executive conference style, dark navy and gold accents, structured geometric grid, premium quality',
    };

    const chosenStyle = styleDescriptors[vars.designStyle?.toLowerCase()] || styleDescriptors.modern_abstract;

    return `Award-winning event poster for "${vars.eventName}".
Theme: ${vars.theme || vars.category || 'Tech Innovation'}.
Category: ${vars.category || 'Technical event'}.
Atmosphere & Style: ${chosenStyle}.
Color Palette: ${vars.colorPreference || 'Deep indigo, vibrant electric violet, luminous neon lime (#C4F135)'}.
Details to evoke visually: ${vars.customInstructions || 'technology innovation, collaborative community, modern digital showcase'}.
Composition: Professional graphic design, cinematic lighting, ultra-high resolution, 8k render, masterpiece quality, no watermark.`;
  },
  expectedOutputSchema: {
    type: 'object',
    properties: {
      imagePrompt: { type: 'string' },
      styleKeywords: { type: 'array', items: { type: 'string' } },
      recommendedDimensions: { type: 'string' },
    },
    required: ['imagePrompt'],
  },
};

module.exports = { POSTER_PROMPT_V1 };
