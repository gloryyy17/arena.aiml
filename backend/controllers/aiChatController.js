const aiService = require('../services/ai/AIService');
const AIConversation = require('../models/AIConversation');
const Event = require('../models/Event');
const { isDbConnected } = require('../config/db');
const mockStore = require('../config/mockStore');

// @desc    Interact with Arena AI Chatbot
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const userId = req.user._id;

    // 1. Fetch or create conversation
    let conversation;
    let upcomingEvents = [];

    if (!isDbConnected()) {
      conversation = mockStore.getConversation(conversationId, userId);
      if (!conversation) {
        conversation = mockStore.createConversation(userId, message.slice(0, 35) + '...');
      }
      upcomingEvents = mockStore.getEvents();
    } else {
      if (conversationId) {
        conversation = await AIConversation.findOne({ _id: conversationId, user: userId });
      }
      if (!conversation) {
        conversation = await AIConversation.create({
          user: userId,
          title: message.slice(0, 35) + '...',
          messages: [],
        });
      }

      upcomingEvents = await Event.find({
        status: 'approved',
        isPublished: true,
        startDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .select('title description category department venue startDate endDate fee maxParticipants tags')
        .sort({ startDate: 1 })
        .limit(10);
    }

    const contextEventsText = upcomingEvents
      .map(
        (e) =>
          `• Event [ID: ${e._id}]: "${e.title}" | Category: ${e.category} | Dept: ${e.department || 'All'} | Venue: ${e.venue} | Date: ${new Date(e.startDate).toDateString()} | Fee: ${e.fee === 0 ? 'Free' : `₹${e.fee}`} | Tags: ${(e.tags || []).join(', ')} | Description: ${e.description.slice(0, 150)}...`
      )
      .join('\n');

    const platformContext = `
ACTIVE UPCOMING APPROVED ARENA EVENTS:
${contextEventsText || 'No upcoming events currently scheduled.'}

PLATFORM INFORMATION & REGISTRATION RULES:
- Students can browse and register for events directly on their student dashboard.
- For paid events, payment is securely completed via Razorpay.
- Faculty members create and submit events for Admin review.
- Digital verifiable certificates are automatically issued upon attendance.
- Theme switching (Dark/Light mode) is available at the top right toggle.`;

    // Format previous 6 conversation messages for context
    const recentHistory = conversation.messages
      .slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    // 3. Interpolate prompt with PromptRegistry
    const interpolated = aiService.getPromptRegistry().interpolate('CHATBOT_PROMPT', {
      userQuery: message,
      retrievedContext: platformContext,
      conversationHistory: recentHistory,
      userName: req.user.name,
      userRole: req.user.role,
    });

    // 4. Generate structured response
    const provider = aiService.getActiveProvider();
    const result = await provider.generateStructuredJSON({
      prompt: interpolated.prompt,
      systemInstruction: interpolated.systemInstruction,
      schema: interpolated.schema,
      temperature: 0.3,
    });

    const parsedData = result.data || {};
    let answerText = parsedData.answer;
    if (!answerText || typeof answerText !== 'string' || answerText.trim().startsWith('{')) {
      if (parsedData.summary) {
        answerText = parsedData.summary;
      } else {
        answerText = 'Hello! I am your Arena AI Concierge. How can I assist you with events, schedules, or registrations today?';
      }
    }
    const suggestedQueries = Array.isArray(parsedData.suggestedQueries) && parsedData.suggestedQueries.length > 0
      ? parsedData.suggestedQueries
      : [
          'What events are happening this week?',
          'How do I register for an event?',
          'Show Technical workshops',
        ];

    // Identify which events were referenced
    const referencedEventIds = (parsedData.referencedEventIds || [])
      .filter((id) => upcomingEvents.some((e) => e._id.toString() === id.toString()));

    // 5. Append messages to conversation
    if (!isDbConnected()) {
      mockStore.addMessageToConversation(conversation._id, { role: 'user', content: message });
      mockStore.addMessageToConversation(conversation._id, {
        role: 'assistant',
        content: answerText,
        suggestedQueries,
        referencedEventIds,
      });
    } else {
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      conversation.messages.push({
        role: 'assistant',
        content: answerText,
        suggestedQueries,
        referencedEventIds,
        timestamp: new Date(),
      });

      await conversation.save();
    }

    const referencedEvents = upcomingEvents.filter((e) => referencedEventIds.includes(e._id.toString()));

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      answer: answerText,
      suggestedQueries,
      referencedEvents,
      data: {
        answer: answerText,
        suggestedQueries,
        referencedEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active conversation history
// @route   GET /api/ai/chat/history/:conversationId?
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    let conversation;

    if (!isDbConnected()) {
      conversation = mockStore.getConversation(conversationId, req.user._id);
    } else {
      if (conversationId) {
        conversation = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
      } else {
        conversation = await AIConversation.findOne({ user: req.user._id, isActive: true }).sort({ updatedAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      conversation: conversation || { messages: [] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for user
// @route   GET /api/ai/chat/conversations
// @access  Private
const getUserConversations = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const conversations = mockStore.getUserConversations(req.user._id);
      return res.status(200).json({ success: true, count: conversations.length, conversations });
    }

    const conversations = await AIConversation.find({ user: req.user._id })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(15);

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI,
  getChatHistory,
  getUserConversations,
};
