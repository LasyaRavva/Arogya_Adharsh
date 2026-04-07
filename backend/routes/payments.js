const crypto = require('crypto');
const express = require('express');

const Razorpay = require('razorpay');

const router = express.Router();

const authenticate = require('../middleware/auth');

const getRazorpayClient = () => {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    const configurationError = new Error(
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.'
    );
    configurationError.statusCode = 500;
    throw configurationError;
  }

  return {
    keyId,
    keySecret,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
};

const sanitizeNotes = (notes = {}) =>
  Object.fromEntries(
    Object.entries(notes)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .slice(0, 15)
      .map(([key, value]) => [String(key).slice(0, 40), String(value).slice(0, 255)])
  );

const normalizeAmount = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const amountError = new Error('A valid payment amount is required');
    amountError.statusCode = 400;
    throw amountError;
  }

  return Math.round(parsedAmount * 100);
};

router.post('/razorpay/order', async (req, res) => {
  try {
    const amount = normalizeAmount(req.body?.amount);
    const currency = String(req.body?.currency || 'INR').toUpperCase();

    if (currency !== 'INR') {
      return res.status(400).json({ error: 'Razorpay UPI is available only for INR orders' });
    }

    const receipt = String(req.body?.receipt || `arogya_${Date.now()}`).slice(0, 40);
    const notes = sanitizeNotes({
      ...req.body?.notes,
      customer_id: req.user?.cus_id,
      payment_method: 'UPI',
    });

    const { keyId, client } = getRazorpayClient();
    const razorpayOrder = await client.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });

    return res.json({
      key: keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: process.env.RAZORPAY_BRAND_NAME || 'Arogya Adharsh',
      description: 'UPI payment',
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || 'Failed to create Razorpay order' });
  }
});

router.post('/razorpay/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      error: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
    });
  }

  try {
    const { keySecret, client } = getRazorpayClient();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature' });
    }

    const payment = await client.payments.fetch(razorpay_payment_id);
    const normalizedStatus = String(payment?.status || '').toLowerCase();

    if (!payment || payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Razorpay payment does not match the order' });
    }

    if (!['authorized', 'captured'].includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Razorpay payment is not completed yet' });
    }

    return res.json({
      message: 'Razorpay payment verified successfully',
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message || 'Failed to verify Razorpay payment' });
  }
});

module.exports = router;
