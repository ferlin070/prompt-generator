import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';
import crypto from 'crypto';

const API_TOKEN = process.env.BAYARCASH_API_TOKEN;
const SECRET_KEY = process.env.BAYARCASH_API_SECRET_KEY;
const PORTAL_KEY = process.env.BAYARCASH_PORTAL_KEY;
const SANDBOX = process.env.BAYARCASH_SANDBOX !== 'false';
const BASE_URL = SANDBOX ? 'https://api.console.bayarcash-sandbox.com/v3' : 'https://api.console.bayar.cash/v3';
const MOCK_MODE = !API_TOKEN || API_TOKEN.startsWith('your-');

function checksumFor(data) {
  const keys = ['amount', 'callback_url', 'order_number', 'payer_email', 'payer_name', 'payer_telephone_number', 'payment_channel', 'portal_key', 'return_url'];
  const values = keys.map(k => String(data[k] ?? '')).reduce((a, v) => a + v, '');
  return crypto.createHash('sha256').update(SECRET_KEY + values).digest('hex').toUpperCase();
}

function verifyChecksum(data, received) {
  if (!SECRET_KEY || !received) return false;
  const keys = ['amount', 'callback_url', 'exchange_transaction_id', 'order_number', 'payer_email', 'payer_name', 'payer_telephone_number', 'payment_channel', 'portal_key', 'return_url', 'status', 'transaction_id', 'transaction_request_id'];
  const values = keys.map(k => String(data[k] ?? '')).reduce((a, v) => a + v, '');
  const expected = crypto.createHash('sha256').update(SECRET_KEY + values).digest('hex').toUpperCase();
  return expected === received.toUpperCase();
}

async function activatePlan(userId, planId, billingCycle, amount, orderNo) {
  const days = billingCycle === 'yearly' ? 365 : 30;
  const planLimits = { free: 0, starter: 50, pro: 300, agency: 99999 };
  const { rows } = await sql`
    UPDATE profiles SET
      plan = ${planId},
      plan_billing_cycle = ${billingCycle},
      plan_started_at = now(),
      plan_expires_at = now() + (${days} || ' days')::interval,
      ai_credits_left = ${planLimits[planId] ?? 0},
      is_trial = false,
      trial_ends_at = null,
      updated_at = now()
    WHERE id = ${userId}
    RETURNING id, plan, plan_expires_at`;
  await sql`
    UPDATE subscriptions SET status = 'paid', payment_method = 'bayarcash'
    WHERE id = (SELECT id FROM subscriptions WHERE user_id = ${userId} AND status = 'pending' ORDER BY created_at DESC LIMIT 1)`;
  return rows[0];
}

export async function POST(request) {
  const url = new URL(request.url);
  const isWebhook = url.searchParams.get('webhook') === '1' || url.pathname.includes('webhook');

  if (isWebhook) {
    try {
      const rawBody = await request.text();
      const body = JSON.parse(rawBody);
      if (SECRET_KEY && body.checksum && !verifyChecksum(body, body.checksum)) {
        return json({ error: 'Invalid checksum' }, 401);
      }
      const status = (body.status || '').toLowerCase();
      if (['success', 'completed', 'paid'].includes(status)) {
        const { rows: subs } = await sql`SELECT id, user_id, plan, billing_cycle, amount FROM subscriptions WHERE order_no = ${body.order_number} AND status = 'pending'`;
        if (subs.length > 0) {
          const s = subs[0];
          await activatePlan(s.user_id, s.plan, s.billing_cycle, s.amount, body.order_number);
          console.log('[payment] Activated:', body.order_number, 'plan:', s.plan);
        }
      } else if (['failed', 'cancelled', 'expired'].includes(status)) {
        await sql`UPDATE subscriptions SET status = ${status} WHERE order_no = ${body.order_number}`;
      }
      return json({ success: true });
    } catch (error) {
      console.error('[payment webhook]', error.message);
      return json({ success: true });
    }
  }

  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Sila log masuk dahulu' }, 401);

  try {
    const { planId, billing, amount, payerName, payerEmail, paymentChannel, promoCode } = await request.json();
    if (!planId || !amount || amount <= 0) return json({ error: 'Maklumat pembayaran tidak sah' }, 400);
    if (amount > 10000) return json({ error: 'Jumlah melebihi had' }, 400);

    const origin = request.headers.get('origin') || '';
    const orderNo = 'PB-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    await sql`INSERT INTO subscriptions (user_id, plan, billing_cycle, amount, promo_code, order_no, status)
      VALUES (${auth.userId}, ${planId}, ${billing || 'monthly'}, ${amount}, ${promoCode || null}, ${orderNo}, 'pending')`;

    if (MOCK_MODE) {
      console.log('[payment] MOCK MODE — lepas kredensial sebenar diisi, ini akan panggil Bayarcash');
      const mockUrl = `${origin}/dashboard.html?payment=success&order=${orderNo}&mock=1`;
      return json({ url: mockUrl, orderNo, mock: true });
    }

    const payload = {
      portal_key: PORTAL_KEY,
      order_number: orderNo,
      amount: Number(amount).toFixed(2),
      payer_name: payerName || 'Customer',
      payer_email: payerEmail || '',
      payer_telephone_number: '',
      payment_channel: paymentChannel || '0',
      return_url: `${origin}/dashboard.html?payment=success&order=${orderNo}`,
      callback_url: `${origin}/api/payment?webhook=1`,
    };
    payload.checksum = checksumFor(payload);

    const res = await fetch(`${BASE_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      await sql`UPDATE subscriptions SET status = 'failed' WHERE id = (SELECT id FROM subscriptions WHERE user_id = ${auth.userId} ORDER BY created_at DESC LIMIT 1)`;
      const errMsg = result.message || result.error || `Bayarcash error ${res.status}`;
      return json({ error: errMsg }, 400);
    }

    const payUrl = result.url || (result.data && result.data.url) || (result.redirect_url);
    if (!payUrl) {
      return json({ error: 'Bayarcash tidak memulangkan URL pembayaran', detail: JSON.stringify(result).slice(0, 300) }, 502);
    }

    return json({ url: payUrl, orderNo });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
