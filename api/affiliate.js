import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'stats';

    if (type === 'withdrawals') {
      const { rows } = await sql`SELECT * FROM withdrawals WHERE user_id = ${auth.userId} ORDER BY requested_at DESC`;
      return json({ withdrawals: rows });
    }

    const { rows: [profile] } = await sql`SELECT * FROM profiles WHERE id = ${auth.userId}`;
    if (!profile) return json({ error: 'User not found' }, 404);

    const { rows: earnings } = await sql`SELECT * FROM affiliate_earnings WHERE affiliate_id = ${auth.userId} ORDER BY created_at DESC LIMIT 20`;
    const { rows: referrals } = await sql`SELECT id, plan FROM profiles WHERE referred_by = ${auth.userId}`;
    const activeReferrals = referrals.filter(u => u.plan && u.plan !== 'free');
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const { rows: clicksThisMonth } = await sql`SELECT COUNT(*) as count FROM affiliate_clicks WHERE affiliate_id = ${auth.userId} AND clicked_at >= ${monthStart.toISOString()}`;
    const { rows: totalClicks } = await sql`SELECT COUNT(*) as count FROM affiliate_clicks WHERE affiliate_id = ${auth.userId}`;
    const pending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + parseFloat(e.amount), 0);

    return json({
      code: profile.affiliate_code, enabled: profile.affiliate_enabled,
      balance: parseFloat(profile.affiliate_balance || 0),
      totalEarned: parseFloat(profile.affiliate_total_earned || 0),
      pendingEarnings: pending, totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      clicksThisMonth: parseInt(clicksThisMonth[0]?.count || 0),
      totalClicks: parseInt(totalClicks[0]?.count || 0), earnings,
      referralLink: `${request.headers.get('origin') || ''}/?ref=${profile.affiliate_code || ''}`,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();

    if (body.type === 'click') {
      await sql`INSERT INTO affiliate_clicks (affiliate_id, code) VALUES (${body.affiliate_id}, ${body.code})`;
      return json({ success: true }, 201);
    }

    if (body.type === 'generate-code') {
      const { rows } = await sql`SELECT name FROM profiles WHERE id = ${auth.userId}`;
      const prefix = (rows[0]?.name || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = prefix + suffix;
      await sql`UPDATE profiles SET affiliate_code = ${code}, affiliate_enabled = true, updated_at = now() WHERE id = ${auth.userId}`;
      return json({ code });
    }

    if (body.type === 'withdrawal') {
      const { rows: [profile] } = await sql`SELECT affiliate_balance FROM profiles WHERE id = ${auth.userId}`;
      const balance = parseFloat(profile?.affiliate_balance || 0);
      if (balance < 50) return json({ error: `Minimum RM50. Baki: RM${balance.toFixed(2)}` }, 400);
      if (body.amount > balance) return json({ error: 'Jumlah melebihi baki.' }, 400);
      await sql`INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name) VALUES (${auth.userId}, ${body.amount}, ${body.bankName}, ${body.accountNumber}, ${body.accountName})`;
      await sql`UPDATE profiles SET affiliate_balance = affiliate_balance - ${body.amount} WHERE id = ${auth.userId}`;
      return json({ success: true }, 201);
    }

    return json({ error: 'Invalid type' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
