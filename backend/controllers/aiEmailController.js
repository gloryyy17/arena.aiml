const aiService = require('../services/ai/AIService');
const emailService = require('../services/email/EmailService');
const AIGeneration = require('../models/AIGeneration');
const EmailCampaign = require('../models/EmailCampaign');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// @desc    Generate AI email copy
// @route   POST /api/ai/email/generate
// @access  Private (Faculty, Admin)
const generateEmail = async (req, res, next) => {
  try {
    const {
      emailType,
      eventTitle,
      eventDate,
      eventVenue,
      eventCategory,
      eventDescription,
      recipientType,
      emailPurpose,
      tone,
      callToAction,
      eventId,
    } = req.body;

    if (!eventTitle) {
      return res.status(400).json({ success: false, message: 'Event title is required for email generation.' });
    }

    const generation = await aiService.executeStructuredPrompt(
      'EMAIL_PROMPT',
      {
        emailType: emailType || 'invitation',
        eventTitle,
        eventDate,
        eventVenue,
        eventCategory,
        eventDescription,
        recipientType,
        emailPurpose,
        tone,
        callToAction,
      },
      { temperature: 0.35 }
    );

    // Persist generation record
    // Persist generation record
    let genId = `email-${Date.now()}`;
    try {
      const record = await AIGeneration.create({
        user: req.user._id,
        event: eventId || null,
        generationType: 'email',
        promptName: generation.metadata.promptName,
        promptVersion: generation.metadata.promptVersion,
        provider: generation.metadata.provider,
        model: generation.metadata.model,
        inputParameters: { emailType, eventTitle, recipientType, tone },
        result: generation.data,
        costTokens: generation.metadata.usage || {},
        status: 'success',
      });
      if (record?._id) genId = record._id;
    } catch {
      // In-memory mode
    }

    res.status(200).json({
      success: true,
      data: generation.data,
      metadata: {
        generationId: genId,
        provider: generation.metadata.provider,
        model: generation.metadata.model,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send email campaign to specified recipients
// @route   POST /api/ai/email/send
// @access  Private (Faculty, Admin)
const sendEmailCampaign = async (req, res, next) => {
  try {
    const {
      campaignName,
      subject,
      htmlBody,
      plainText,
      recipientType,
      customRecipients,
      eventId,
      confirmSend,
    } = req.body;

    // Safety rule: Never send without explicit user confirmation
    if (!confirmSend) {
      return res.status(400).json({
        success: false,
        message: 'Explicit user confirmation (confirmSend: true) is required before sending email campaigns.',
      });
    }

    if (!subject || !htmlBody) {
      return res.status(400).json({
        success: false,
        message: 'Subject and HTML body are required.',
      });
    }

    let recipientList = [];

    if (recipientType === 'registered_participants' && eventId) {
      try {
        const registrations = await Registration.find({
          event: eventId,
          registrationStatus: 'confirmed',
        }).populate('student', 'name email');

        recipientList = registrations
          .map((r) => ({ email: r.student?.email, name: r.student?.name }))
          .filter((r) => r.email);
      } catch {
        recipientList = [];
      }
    } else if (recipientType === 'all_students') {
      try {
        const students = await User.find({ role: 'student', isActive: true }).select('name email');
        recipientList = students.map((s) => ({ email: s.email, name: s.name }));
      } catch {
        recipientList = [{ email: req.user.email, name: req.user.name }];
      }
    } else if (recipientType === 'faculty') {
      try {
        const faculty = await User.find({ role: 'faculty', isActive: true }).select('name email');
        recipientList = faculty.map((f) => ({ email: f.email, name: f.name }));
      } catch {
        recipientList = [{ email: req.user.email, name: req.user.name }];
      }
    } else if (Array.isArray(customRecipients) && customRecipients.length > 0) {
      recipientList = customRecipients.map((item) =>
        typeof item === 'string' ? { email: item.trim(), name: '' } : item
      );
    }

    // Default fallback recipient if list is empty (e.g. current user for testing)
    if (recipientList.length === 0) {
      recipientList = [{ email: req.user.email, name: req.user.name }];
    }

    // Create campaign record
    let campaign = {
      _id: `campaign-${Date.now()}`,
      name: campaignName || `Campaign: ${subject.slice(0, 40)}`,
      totalRecipients: recipientList.length,
      sentCount: 0,
      status: 'sending',
    };

    try {
      const dbCampaign = await EmailCampaign.create({
        name: campaignName || `Campaign: ${subject.slice(0, 40)}`,
        sender: req.user._id,
        event: eventId || null,
        subject,
        htmlBody,
        plainText: plainText || '',
        recipients: recipientList.map((r) => ({ email: r.email, name: r.name, status: 'pending' })),
        totalRecipients: recipientList.length,
        status: 'sending',
      });
      if (dbCampaign) campaign = dbCampaign;
    } catch {
      // In-memory mode
    }

    // Execute email dispatch via EmailService
    const dispatchResult = await emailService.sendEmail({
      to: recipientList,
      subject,
      html: htmlBody,
      text: plainText,
      from: `Arena AIML <${process.env.EMAIL_FROM || 'events@arena.aiml'}>`,
    });

    // Update campaign status
    campaign.status = 'completed';
    campaign.sentCount = dispatchResult.acceptedCount || recipientList.length;
    campaign.failedCount = dispatchResult.rejectedCount || 0;
    campaign.providerMessageId = dispatchResult.messageId || '';
    if (campaign.recipients && Array.isArray(campaign.recipients)) {
      campaign.recipients.forEach((r) => {
        r.status = 'sent';
        r.sentAt = new Date();
      });
    }

    if (campaign.save) {
      try {
        await campaign.save();
      } catch {
        // In-memory mode
      }
    }

    res.status(200).json({
      success: true,
      message: `Email campaign "${campaign.name}" dispatched successfully to ${recipientList.length} recipient(s).`,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        totalRecipients: campaign.totalRecipients,
        sentCount: campaign.sentCount,
        status: campaign.status,
        previewUrl: dispatchResult.previewUrl || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent email campaigns
// @route   GET /api/ai/email/campaigns
// @access  Private (Faculty, Admin)
const getCampaigns = async (req, res, next) => {
  try {
    let campaigns = [];
    try {
      campaigns = await EmailCampaign.find({ sender: req.user._id })
        .populate('event', 'title startDate')
        .sort({ createdAt: -1 })
        .limit(30);
    } catch {
      campaigns = [];
    }

    res.status(200).json({ success: true, count: campaigns.length, campaigns });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateEmail,
  sendEmailCampaign,
  getCampaigns,
};
