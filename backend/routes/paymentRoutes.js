const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentConfig,
  getMyPayments,
} = require('../controllers/paymentController');

// All payment routes require authenticated access
router.use(protect);

// Order creation & payment verification
router.post('/create-order', authorize('student'), createPaymentOrder);
router.post('/verify', authorize('student'), verifyPayment);

// Payment configuration & student payment history
router.get('/config', getPaymentConfig);
router.get('/my-payments', authorize('student'), getMyPayments);

module.exports = router;
