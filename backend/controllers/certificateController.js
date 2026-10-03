const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { isDbConnected } = require('../config/db');

let generateCertificatePDF = null;
try {
  generateCertificatePDF = require('../services/certificateServices').generateCertificatePDF;
} catch (err) {
  console.warn('[CertificateController] certificateServices not loaded:', err.message);
}

// In-memory store fallback
const mockCertificates = new Map();

// Seed demo certificates
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

// @desc    Mark attendance for a registration
// @route   PATCH /api/certificates/attendance/:id or /api/registrations/:id/attendance
// @access  Private (Faculty, Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        registration: {
          _id: id,
          attended: true,
          attendanceMarkedAt: new Date().toISOString(),
        },
      });
    }

    const registration = await Registration.findById(id).populate('event');
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (
      req.user.role !== 'admin' &&
      registration.event?.createdBy &&
      registration.event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this event' });
    }

    registration.attended = true;
    registration.attendanceMarkedAt = new Date();
    await registration.save();

    res.status(200).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a new verifiable certificate (Direct or from Registration)
// @route   POST /api/certificates/generate or POST /api/certificates/:registrationId
// @access  Private (Faculty, Admin)
const generateCertificate = async (req, res, next) => {
  try {
    const registrationId = req.params.registrationId || req.body.registrationId;

    if (registrationId && isDbConnected()) {
      const registration = await Registration.findById(registrationId)
        .populate('event')
        .populate('student', 'name');

      if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }
      if (
        req.user.role !== 'admin' &&
        registration.event?.createdBy &&
        registration.event.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (!registration.attended) {
        return res.status(400).json({ success: false, message: 'Student must be marked as attended first' });
      }
      if (registration.certificateIssued) {
        return res.status(400).json({ success: false, message: 'Certificate already issued for this registration' });
      }

      const verificationId = `CERT-SBJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const citation = `WE GIVE THIS CERTIFICATE BECAUSE ${(registration.student?.name || 'STUDENT').toUpperCase()} HAS PARTICIPATED IN ${(registration.event?.title || 'EVENT').toUpperCase()} THAT WE ORGANIZE.`;

      let pdfUrl = '';
      if (generateCertificatePDF) {
        try {
          pdfUrl = await generateCertificatePDF({
            studentName: registration.student?.name || 'Student',
            eventTitle: registration.event?.title || 'Event',
            eventDate: registration.event?.startDate
              ? new Date(registration.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : '2026',
            verificationId,
          });
        } catch (pdfErr) {
          console.warn('[CertificateController] PDF generation skipped/failed:', pdfErr.message);
        }
      }

      const certificate = await Certificate.create({
        participantName: registration.student?.name || 'Student',
        eventName: registration.event?.title || 'Event',
        certificateType: 'Participation',
        citation,
        organizerName: req.user.name || 'Faculty Coordinator',
        hodName: 'Dr. Animesh Tayal',
        student: registration.student?._id || null,
        event: registration.event?._id || null,
        registration: registration._id,
        verificationId,
        pdfUrl,
        issuedBy: req.user._id,
      });

      registration.certificateIssued = true;
      registration.certificate = certificate._id;
      await registration.save();

      return res.status(201).json({ success: true, certificate });
    }

    const {
      participantName,
      eventName,
      certificateType = 'Participation',
      citation,
      organizerName = req.user?.name || 'Faculty Coordinator',
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
    const defaultCitation =
      citation ||
      `WE GIVE THIS CERTIFICATE BECAUSE ${participantName.toUpperCase()} HAS PARTICIPATED IN ${eventName.toUpperCase()} THAT WE ORGANIZE.`;

    let pdfUrl = '';
    if (generateCertificatePDF) {
      try {
        pdfUrl = await generateCertificatePDF({
          studentName: participantName,
          eventTitle: eventName,
          eventDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          verificationId,
        });
      } catch (pdfErr) {
        console.warn('[CertificateController] PDF generation skipped/failed:', pdfErr.message);
      }
    }

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
        pdfUrl,
        issuedAt: new Date().toISOString(),
        issuedBy: {
          _id: req.user?._id,
          name: req.user?.name,
          department: req.user?.department,
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
      pdfUrl,
      issuedBy: req.user._id,
    });

    res.status(201).json({ success: true, certificate: cert });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private (Student)
const getMyCertificates = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const results = Array.from(mockCertificates.values()).filter(
        (c) => c.studentId === req.user._id || c.participantName?.toLowerCase() === req.user.name?.toLowerCase()
      );
      return res.status(200).json({ success: true, count: results.length, certificates: results });
    }

    const certificates = await Certificate.find({ student: req.user._id })
      .populate('event', 'title startDate')
      .sort({ issuedAt: -1 });

    res.status(200).json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Public certificate verification
// @route   GET /api/certificates/verify/:id (or :verificationId)
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const rawId = req.params.id || req.params.verificationId;
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Certificate verification ID is required.' });
    }
    const queryId = rawId.trim().toUpperCase();

    if (!isDbConnected()) {
      const cert = mockCertificates.get(queryId);
      if (!cert) {
        return res.status(404).json({ success: false, message: 'Invalid certificate ID or certificate not found.' });
      }
      return res.status(200).json({ success: true, valid: true, certificate: cert });
    }

    let cert = await Certificate.findOne({ verificationId: queryId })
      .populate('issuedBy', 'name department')
      .populate('event', 'title category startDate venue')
      .populate('student', 'name email');

    if (!cert) {
      // Try finding by exact regex / trimmed
      cert = await Certificate.findOne({ verificationId: new RegExp(`^${queryId}$`, 'i') })
        .populate('issuedBy', 'name department')
        .populate('event', 'title category startDate venue')
        .populate('student', 'name email');
    }

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found — invalid verification ID' });
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
  markAttendance,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  getEventCertificates,
  generateAICitation,
};