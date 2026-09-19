const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// AI Controllers
const { generatePoster, getPosterHistory } = require('../controllers/aiPosterController');
const { generateEventDescription } = require('../controllers/aiEventController');
const { generateEmail, sendEmailCampaign, getCampaigns } = require('../controllers/aiEmailController');
const { chatWithAI, getChatHistory, getUserConversations } = require('../controllers/aiChatController');
const { analyzeEventFeedback, getLatestFeedbackAnalysis } = require('../controllers/aiFeedbackController');
const { getRecommendations } = require('../controllers/aiRecommendationController');
const { listPrompts, testPrompt } = require('../controllers/aiPromptController');

// 1. AI Poster Generator
router.post('/poster/generate', protect, authorize('faculty', 'admin'), generatePoster);
router.get('/poster/history', protect, getPosterHistory);

// 2. AI Event Description Generator
router.post('/event/description', protect, authorize('faculty', 'admin'), generateEventDescription);

// 3. AI Email Studio (Generator & Campaign Sender)
router.post('/email/generate', protect, authorize('faculty', 'admin'), generateEmail);
router.post('/email/send', protect, authorize('faculty', 'admin'), sendEmailCampaign);
router.get('/email/campaigns', protect, authorize('faculty', 'admin'), getCampaigns);

// 4. AI Chatbot
router.post('/chat', protect, chatWithAI);
router.get('/chat/history', protect, getChatHistory);
router.get('/chat/history/:conversationId', protect, getChatHistory);
router.get('/chat/conversations', protect, getUserConversations);

// 5. AI Feedback Analysis
router.post('/feedback/analyze', protect, authorize('faculty', 'admin'), analyzeEventFeedback);
router.get('/feedback/analysis/:eventId', protect, getLatestFeedbackAnalysis);

// 6. AI Recommendations
router.get('/recommendations', protect, getRecommendations);

// 7. Prompt Engineering System Registry & Playground
router.get('/prompts', protect, listPrompts);
router.post('/prompts/test', protect, authorize('faculty', 'admin'), testPrompt);

module.exports = router;
