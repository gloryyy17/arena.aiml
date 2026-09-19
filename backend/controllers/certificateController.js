const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const { isDbConnected } = require('../config/db');
const aiService = require('../services/ai/AIService');

// In-memory store fallback
const mockCertificates = new Map();

// Seed a couple of demo certificates
const seedDemoCertificates = () => {
  if (mockCertificates.size === 0) {
    const demoCert = {
      _id: 'cert-demo-001',
      verificationId: 'CERT-SBJ-AIML-7842',
      participantName: 'Aarav Sharma',
      eventName: 'AI Genesis Hackathon 2026',
      certificateType: 'Participation',
      citation: 'WE GIVE THIS CERTIFICATE BECAUSE AARAV SHARMA HAS PARTICIPATED IN AI GENESIS HACKATHON 2026 THAT WE ORGANIZE.',
      organizerName: 'Dr. Alan Turing',
      hodName: 'Dr. Animesh Tayal',
      issuedAt: new Date().toISOString(),
      issuedBy: { name: 'Dr. Alan Turing', role: 'faculty' },
    };
    mockCertificates.set(demoCert.verificationId, demoCert);
  }
};
seedDemoCertificates();

// @desc    Generate a new verifiable certificate
// @route   POST /api/certificates/generate
// @access  Private (Faculty, Admin)
const generateCertificate = async (req, res, next) => {
  try {
    const {
      participantName,
      eventName,
      certificateType = 'Participation',
      citation,
      organizerName = 'Organizer',
      hodName = 'Dr. Animesh Tayal',
      eventId,
      studentId,
    } = req.body;

    if (!participantName || !eventName) {
      return res.status(400).json({
        success: false,
        message: 'Participant Name and Event Name are required to issue a certificate.',
      });
    }

    const verificationId = `CERT-SBJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const defaultCitation = citation ||
      `WE GIVE THIS CERTIFICATE BECAUSE ${participantName.toUpperCase()} HAS PARTICIPATED IN ${eventName.toUpperCase()} THAT WE ORGANIZE.`;

    if (!isDbConnected()) {
      const cert = {
        _id: `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        verificationId,
        participantName,
        eventName,
        certificateType,
        citation: defaultCitation,
        organizerName,
        hodName,
        eventId: eventId || null,
        studentId: studentId || null,
        issuedAt: new Date().toISOString(),
        issuedBy: {
          _id: req.user._id,
          name: req.user.name,
          department: req.user.department,
        },
      };

      mockCertificates.set(verificationId, cert);
      return res.status(201).json({ success: true, certificate: cert });
    }

    const cert = await Certificate.create({
      participantName,
      eventName,
      certificateType,
      citation: defaultCitation,
      organizerName,
      hodName,
      event: eventId || null,
      student: studentId || null,
      verificationId,
      issuedBy: req.user._id,
    });

    res.status(201).json({ success: true, certificate: cert });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate by verificationId (Public)
// @route   GET /api/certificates/verify/:id
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryId = id.trim().toUpperCase();

    if (!isDbConnected()) {
      const cert = mockCertificates.get(queryId);
      if (!cert) {
        return res.status(404).json({ success: false, message: 'Invalid certificate ID or certificate not found.' });
      }
      return res.status(200).json({ success: true, valid: true, certificate: cert });
    }

    const cert = await Certificate.findOne({ verificationId: queryId })
      .populate('issuedBy', 'name department')
      .populate('event', 'title category startDate');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Invalid certificate ID or certificate not found.' });
    }

    res.status(200).json({ success: true, valid: true, certificate: cert });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates issued by faculty or for an event
// @route   GET /api/certificates/event/:id
// @access  Private (Faculty, Admin)
const getEventCertificates = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const results = Array.from(mockCertificates.values()).filter(
        (c) => c.eventId === id || c.eventName?.toLowerCase().includes(id.toLowerCase())
      );
      return res.status(200).json({ success: true, count: results.length, certificates: results });
    }

    const certs = await Certificate.find({ event: id })
      .populate('student', 'name email studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: certs.length, certificates: certs });
  } catch (error) {
    next(error);
  }
};

// @desc    AI-assisted citation drafting
// @route   POST /api/certificates/ai-citation
// @access  Private (Faculty, Admin)
const generateAICitation = async (req, res, next) => {
  try {
    const {
      participantName = 'Participant',
      eventName = 'College Technical Symposium',
      category = 'Technical',
      certificateType = 'Participation',
      achievement = 'successful participation',
    } = req.body;

    const citationStyles = {
      Participation: `WE GIVE THIS CERTIFICATE BECAUSE ${participantName.toUpperCase()} HAS PARTICIPATED IN ${eventName.toUpperCase()} THAT WE ORGANIZE.`,
      Excellence: `THIS CERTIFICATE IS AWARDED TO ${participantName.toUpperCase()} IN RECOGNITION OF OUTSTANDING EXCELLENCE AND HIGH PERFORMANCE IN ${eventName.toUpperCase()}.`,
      Winner: `THIS CERTIFICATE IS PROUDLY CONFERRED UPON ${participantName.toUpperCase()} FOR SECURING TOP HONORS AND DISTINCTION IN ${eventName.toUpperCase()}.`,
      Appreciation: `WITH SINCERE APPRECIATION TO ${participantName.toUpperCase()} FOR VALUABLE CONTRIBUTIONS AND COMMENDABLE DEDICATION DURING ${eventName.toUpperCase()}.`,
    };

    const citation = citationStyles[certificateType] || citationStyles.Participation;

    res.status(200).json({
      success: true,
      citation,
      metadata: {
        participantName,
        eventName,
        certificateType,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCertificate,
  verifyCertificate,
  getEventCertificates,
  generateAICitation,
};
