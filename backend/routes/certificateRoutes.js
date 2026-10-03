const express = require('express');
const router = express.Router();
const {
  markAttendance,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  getEventCertificates,
  generateAICitation,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public verification endpoints
router.get('/verify/:id', verifyCertificate);
router.get('/verify/code/:verificationId', verifyCertificate);

// Protected endpoints for Students
router.get('/my-certificates', protect, authorize('student'), getMyCertificates);

// Protected endpoints for Faculty and Admin
router.post('/generate', protect, authorize('faculty', 'admin'), generateCertificate);
router.post('/ai-citation', protect, authorize('faculty', 'admin'), generateAICitation);
router.get('/event/:id', protect, authorize('faculty', 'admin'), getEventCertificates);
router.post('/:registrationId', protect, authorize('faculty', 'admin'), generateCertificate);
router.patch('/attendance/:id', protect, authorize('faculty', 'admin'), markAttendance);

module.exports = router;
