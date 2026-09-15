import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';
import crypto from 'crypto';
import { sendMail, receiptEmail } from '../lib/email.js';

const API_TOKEN = process.env.BAYARCASH_API_TOKEN;
const SECRET_KEY = process.env.BAYARCASH_API_SECRET_KEY;
const PORTAL_KEY = process.env.BAYARCASH_PORTAL_KEY;
const SANDBOX = process.env.BAYARCASH_SANDBOX !== 'false';
const BASE_URL = SANDBOX ? 'https://api.console.bayarcash-sandbox.com/v3' : 'https://api.console.bayar.cash/v3';
const MOCK_MODE = !API_TOKEN || API_TOKEN.startsWith('your-');

function checksumFor(data) {
  const payload = {
    amount: String(data.amount),
    order_number: String(data.order_number ?? ''),
    payer_email: String(data.payer_email ?? ''),
    payer_name: String(data.payer_name ?? ''),
    payment_channel: String(data.payment_channel ?? ''),
  };
  const sorted = Object.keys(payload).sort();
  const payloadString = sorted.map(k => payload[k]).join('|');
  return crypto.createHmac('sha256', SECRET_KEY).update(payloadString).digest('hex');
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

  try {
    const { rows: u } = await sql`SELECT name, email FROM profiles WHERE id = ${userId}`;
    if (u[0]?.email) {
      sendMail(u[0].email, `Resit Pembayaran - ${orderNo || 'PromptBiz Pro'}`, receiptEmail(u[0].name || 'Pelanggan', planId, amount, orderNo || '-')).then(sent => {
        if (sent) console.log('[payment] Receipt email sent:', u[0].email);
      }).catch(() => {});
    }
  } catch {}

  return rows[0];
}

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const orderNo = url.searchParams.get('order');
    if (!orderNo) return json({ error: 'order required' }, 400);

    const res = await fetch(`${BASE_URL}/transactions`, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Accept': 'application/json' },
    });
    const data = await res.json();
    const txn = (data.data || []).find(t => t.order_number === orderNo);
    if (!txn) return json({ found: false, status: 'unknown' });

    const okStatuses = [3, '3', 'success', 'successful', 'completed'];
    if (okStatuses.includes(txn.status)) {
      const { rows: subs } = await sql`SELECT id, user_id, plan, billing_cycle, amount FROM subscriptions WHERE order_no = ${orderNo} AND status = 'pending'`;
      if (subs.length > 0) {
        const s = subs[0];
        await activatePlan(s.user_id, s.plan, s.billing_cycle, s.amount, orderNo);
        console.log('[payment] ACTIVATED (poll):', orderNo, 'plan:', s.plan);
      }
      return json({ found: true, status: 'success', paid: true, plan: txn.order_number });
    }
    return json({ found: true, status: txn.status_description || String(txn.status), paid: false });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const isWebhook = url.searchParams.get('webhook') === '1' || url.pathname.includes('webhook');

  if (isWebhook) {
    try {
      const rawBody = await request.text();
      let body = {};
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = JSON.parse(rawBody);
      } else {
        for (const [k, v] of new URLSearchParams(rawBody)) body[k] = v;
      }

      if (body.checksum && SECRET_KEY) {
        const cbPayload = {
          amount: String(body.amount ?? ''),
          order_number: String(body.order_number ?? ''),
          payer_email: String(body.payer_email ?? ''),
          payer_name: String(body.payer_name ?? ''),
          payment_channel: String(body.payment_channel ?? ''),
        };
        const sorted = Object.keys(cbPayload).sort();
        const payloadString = sorted.map(k => cbPayload[k]).join('|');
        const expected = crypto.createHmac('sha256', SECRET_KEY).update(payloadString).digest('hex');
        if (expected !== body.checksum.toLowerCase()) {
          return json({ error: 'Invalid checksum' }, 401);
        }
      }

      const rawStatus = String(body.status ?? '').toLowerCase();
      const successStatuses = ['1', '3', 'success', 'successful', 'completed', 'paid', 'true'];
      const failStatuses = ['0', '2', '4', 'failed', 'cancelled', 'expired', 'false'];
      const orderNo = body.order_number || body.orderNo;

      if (successStatuses.includes(rawStatus)) {
        const { rows: subs } = await sql`SELECT id, user_id, plan, billing_cycle, amount FROM subscriptions WHERE order_no = ${orderNo} AND status = 'pending'`;
        if (subs.length > 0) {
          const s = subs[0];
          await activatePlan(s.user_id, s.plan, s.billing_cycle, s.amount, orderNo);
          console.log('[payment] ACTIVATED:', orderNo, 'plan:', s.plan, 'amount:', s.amount);
        }
      } else if (failStatuses.includes(rawStatus)) {
        await sql`UPDATE subscriptions SET status = 'failed' WHERE order_no = ${orderNo}`;
        console.log('[payment] FAILED:', orderNo);
      } else {
        console.log('[payment] webhook received, status:', rawStatus, 'order:', orderNo);
      }
      return json({ success: true });
    } catch (error) {
      console.error('[payment webhook error]', error.message);
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
