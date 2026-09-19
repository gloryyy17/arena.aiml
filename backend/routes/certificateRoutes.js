const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  verifyCertificate,
  getEventCertificates,
  generateAICitation,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify/:id', verifyCertificate);

// Protected endpoints for Faculty and Admin
router.post('/generate', protect, authorize('faculty', 'admin'), generateCertificate);
router.post('/ai-citation', protect, authorize('faculty', 'admin'), generateAICitation);
router.get('/event/:id', protect, authorize('faculty', 'admin'), getEventCertificates);

module.exports = router;
