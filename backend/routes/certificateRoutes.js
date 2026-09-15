const express = require('express');
const router = express.Router();
const {
  markAttendance,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-certificates', protect, authorize('student'), getMyCertificates);
router.get('/verify/:verificationId', verifyCertificate);
router.post('/:registrationId', protect, authorize('faculty'), generateCertificate);
router.patch('/attendance/:id', protect, authorize('faculty'), markAttendance);

module.exports = router;