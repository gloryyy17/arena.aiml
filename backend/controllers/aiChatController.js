const aiService = require('../services/ai/AIService');
const AIConversation = require('../models/AIConversation');
const Event = require('../models/Event');

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

    // 2. Fetch authoritative Arena event data from Database (RAG Grounding)
    const upcomingEvents = await Event.find({
      status: 'approved',
      isPublished: true,
      startDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .select('title description category department venue startDate endDate fee maxParticipants tags')
      .sort({ startDate: 1 })
      .limit(10);

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
    const answerText = parsedData.answer || result.rawText || 'I am happy to assist you with Arena AIML events!';
    const suggestedQueries = parsedData.suggestedQueries || [
      'What events are happening this week?',
      'How do I register for an event?',
      'Show me Technical workshops',
    ];

    // Identify which events were referenced
    const referencedEventIds = (parsedData.referencedEventIds || [])
      .filter((id) => upcomingEvents.some((e) => e._id.toString() === id.toString()));

    // 5. Append messages to conversation
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

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      answer: answerText,
      suggestedQueries,
      referencedEvents: upcomingEvents.filter((e) => referencedEventIds.includes(e._id.toString())),
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

    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
    } else {
      conversation = await AIConversation.findOne({ user: req.user._id, isActive: true }).sort({ updatedAt: -1 });
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
