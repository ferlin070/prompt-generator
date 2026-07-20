import { json } from '../../lib/auth.js';

export async function POST(request) {
  try {
    const { planId, billing, amount, payerName, payerEmail, paymentChannel } = await request.json();

    const BAYARCASH_API_TOKEN = process.env.BAYARCASH_API_TOKEN;
    const BAYARCASH_PORTAL_KEY = process.env.BAYARCASH_PORTAL_KEY;
    const BAYARCASH_SANDBOX = process.env.BAYARCASH_SANDBOX !== 'false';
    const baseUrl = BAYARCASH_SANDBOX
      ? 'https://api.bayarcash.com/sandbox'
      : 'https://api.bayarcash.com';

    const orderNo = 'INV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const payload = {
      portal_key: BAYARCASH_PORTAL_KEY,
      order_no: orderNo,
      amount: amount.toFixed(2),
      payer_name: payerName || 'Customer',
      payer_email: payerEmail || '',
      payment_channel: paymentChannel || '0',
      redirect_url: `${request.headers.get('origin') || ''}/dashboard.html?payment=success&order=${orderNo}`,
      callback_url: `${request.headers.get('origin') || ''}/api/bayarcash/webhook`,
    };

    const res = await fetch(`${baseUrl}/api/v1/transaction/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAYARCASH_API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.url) {
      return json({ url: result.url });
    }
    return json({ error: result.message || 'Ralat Bayarcash' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
