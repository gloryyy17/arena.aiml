const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { generateCertificatePDF } = require('../services/certificateService');

// @desc    Mark attendance
// @route   PATCH /api/registrations/:id/attendance
// @access  Private (Faculty)
const markAttendance = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    if (registration.event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.attended = true;
    registration.attendanceMarkedAt = new Date();
    await registration.save();

    res.status(200).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate certificate for a registration
// @route   POST /api/certificates/:registrationId
// @access  Private (Faculty)
const generateCertificate = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('event')
      .populate('student', 'name');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    if (registration.event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!registration.attended) {
      return res.status(400).json({ success: false, message: 'Student must be marked as attended first' });
    }
    if (registration.certificateIssued) {
      return res.status(400).json({ success: false, message: 'Certificate already issued for this registration' });
    }

    const certificate = await Certificate.create({
      student: registration.student._id,
      event: registration.event._id,
      registration: registration._id,
      issuedBy: req.user._id,
    });

    const pdfUrl = await generateCertificatePDF({
      studentName: registration.student.name,
      eventTitle: registration.event.title,
      eventDate: new Date(registration.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      verificationId: certificate.verificationId,
    });

    certificate.pdfUrl = pdfUrl;
    await certificate.save();

    registration.certificateIssued = true;
    registration.certificate = certificate._id;
    await registration.save();

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private (Student)
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('event', 'title startDate')
      .sort({ issuedAt: -1 });

    res.status(200).json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Public certificate verification
// @route   GET /api/certificates/verify/:verificationId
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ verificationId: req.params.verificationId })
      .populate('student', 'name')
      .populate('event', 'title startDate venue');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found — invalid verification ID' });
    }

    res.status(200).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

module.exports = { markAttendance, generateCertificate, getMyCertificates, verifyCertificate };