import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows: [profile] } = await sql`
      SELECT * FROM profiles WHERE id = ${auth.userId}
    `;
    if (!profile) return json({ error: 'User not found' }, 404);

    const { rows: earnings } = await sql`
      SELECT * FROM affiliate_earnings WHERE affiliate_id = ${auth.userId}
      ORDER BY created_at DESC LIMIT 20
    `;

    const { rows: referrals } = await sql`
      SELECT id, plan FROM profiles WHERE referred_by = ${auth.userId}
    `;
    const activeReferrals = referrals.filter(u => u.plan && u.plan !== 'free');

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { rows: clicksThisMonth } = await sql`
      SELECT COUNT(*) as count FROM affiliate_clicks
      WHERE affiliate_id = ${auth.userId} AND clicked_at >= ${monthStart.toISOString()}
    `;

    const { rows: totalClicks } = await sql`
      SELECT COUNT(*) as count FROM affiliate_clicks WHERE affiliate_id = ${auth.userId}
    `;

    const pending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + parseFloat(e.amount), 0);

    return json({
      code: profile.affiliate_code,
      enabled: profile.affiliate_enabled,
      balance: parseFloat(profile.affiliate_balance || 0),
      totalEarned: parseFloat(profile.affiliate_total_earned || 0),
      pendingEarnings: pending,
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      clicksThisMonth: parseInt(clicksThisMonth[0]?.count || 0),
      totalClicks: parseInt(totalClicks[0]?.count || 0),
      earnings,
      referralLink: `${request.headers.get('origin') || ''}/?ref=${profile.affiliate_code || ''}`,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
