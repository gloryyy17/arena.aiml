const crypto = require('crypto');
const Razorpay = require('razorpay');

/**
 * Payment Service for Razorpay Gateway
 * Supports live Razorpay credentials and graceful mock simulation fallback.
 */
class PaymentService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.razorpayInstance = null;

    if (this.keyId && this.keySecret) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
        console.log('[PaymentService] Razorpay live client initialized successfully.');
      } catch (err) {
        console.error('[PaymentService] Failed to initialize Razorpay SDK:', err.message);
      }
    } else {
      console.log('[PaymentService] Razorpay keys not provided. Operating in Mock/Simulation mode.');
    }
  }

  /**
   * Check if live Razorpay keys are configured
   */
  isConfigured() {
    return Boolean(this.keyId && this.keySecret && this.razorpayInstance);
  }

  /**
   * Get public Key ID for frontend checkout
   */
  getPublicKey() {
    return this.isConfigured() ? this.keyId : 'rzp_test_mock_arena';
  }

  /**
   * Create an order for payment
   * @param {Object} params
   * @param {number} params.amount Amount in INR (will be converted to paise)
   * @param {string} params.currency Currency code, defaults to INR
   * @param {string} params.receipt Unique receipt/reference string
   * @param {Object} params.notes Additional metadata
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    const amountInPaise = Math.round(Number(amount) * 100);

    if (amountInPaise <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (this.isConfigured()) {
      try {
        const order = await this.razorpayInstance.orders.create({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes,
        });

        return {
          isMock: false,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          rawOrder: order,
        };
      } catch (err) {
        console.error('[PaymentService] Razorpay order creation failed:', err);
        throw new Error(err.error?.description || err.message || 'Razorpay order creation failed.');
      }
    }

    // Mock Simulation Order
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      isMock: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_mock_${Date.now()}`,
      status: 'created',
      notes,
    };
  }

  /**
   * Verify Razorpay cryptographic signature
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.paymentId
   * @param {string} params.signature
   */
  verifySignature({ orderId, paymentId, signature }) {
    // If running in mock mode or mock IDs were used
    if (!this.isConfigured() || String(orderId).startsWith('order_mock_')) {
      return {
        verified: true,
        isMock: true,
        message: 'Mock payment verified successfully.',
      };
    }

    if (!orderId || !paymentId || !signature) {
      return {
        verified: false,
        isMock: false,
        message: 'Missing orderId, paymentId, or signature for verification.',
      };
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isMatch = generatedSignature === signature;
      return {
        verified: isMatch,
        isMock: false,
        message: isMatch ? 'Payment signature verified.' : 'Invalid payment signature.',
      };
    } catch (err) {
      return {
        verified: false,
        isMock: false,
        message: `Signature verification error: ${err.message}`,
      };
    }
  }
}

// Export singleton instance
module.exports = new PaymentService();
