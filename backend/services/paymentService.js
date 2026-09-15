const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (amountInRupees, receiptId) => {
  const options = {
    amount: Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt: receiptId,
  };
  return await razorpay.orders.create(options);
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature };