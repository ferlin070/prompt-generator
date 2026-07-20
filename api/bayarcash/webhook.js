import { json } from '../../lib/auth.js';

export async function POST(request) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    // Verify signature if provided
    const secretKey = process.env.BAYARCASH_API_SECRET_KEY;
    if (secretKey && data.signature) {
      const crypto = await import('crypto');
      const expected = crypto.createHmac('sha256', secretKey).update(body).digest('hex');
      if (data.signature !== expected) {
        return json({ error: 'Invalid signature' }, 401);
      }
    }

    // Handle the payment notification
    if (data.status === 'success' || data.status === 'completed') {
      // Payment successful - update subscription
      // This would need the order reference to find the user/subscription
      console.log('Payment successful:', data.order_no);
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
