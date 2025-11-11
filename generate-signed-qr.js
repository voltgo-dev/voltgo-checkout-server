import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

export const config = {
  api: { bodyParser: true }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, description, storeId, currency } = req.body || {};
    if (!amount || !description || !storeId) {
      return res.status(400).json({ error: 'amount, description, storeId are required' });
    }

    // أنشئ جلسة دفع
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: (currency || 'usd').toLowerCase(),
          product_data: { name: description },
          unit_amount: Math.round(Number(amount) * 100)
        },
        quantity: 1
      }],
      success_url: `${process.env.APP_BASE_URL || 'https://example.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL || 'https://example.com'}/cancel`,
      metadata: { storeId: String(storeId) }
    });

    // ولّد JWT قصير العمر
    const token = jwt.sign(
      { sessionId: session.id, storeId },
      process.env.QR_JWT_SECRET || 'secret',
      { expiresIn: '5m' }
    );

    // نمثّل الpayload كـ base64 حتى يسهل عرضه كـ QR
    const qrPayload = Buffer.from(token).toString('base64');
    return res.status(200).json({ sessionId: session.id, url: session.url, qrPayload });
  } catch (err) {
    console.error('QR generation error:', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
