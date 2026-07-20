import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { plan, billing_cycle, promo_code } = await request.json();

    let discount = 0;
    if (promo_code) {
      const { rows } = await sql`
        SELECT * FROM promo_codes WHERE code = ${promo_code} AND active = true
      `;
      if (rows.length > 0) {
        const promo = rows[0];
        discount = promo.type === 'percentage'
          ? calculateBasePrice(plan, billing_cycle) * (promo.value / 100)
          : promo.value;
        await sql`UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ${promo.id}`;
      }
    }

    const amount = calculateBasePrice(plan, billing_cycle) - discount;

    const { rows } = await sql`
      INSERT INTO subscriptions (user_id, plan, billing_cycle, amount, discount, promo_code, status)
      VALUES (${auth.userId}, ${plan}, ${billing_cycle}, ${amount}, ${discount}, ${promo_code || null}, 'pending')
      RETURNING *
    `;

    return json({ subscription: rows[0], amount }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

function calculateBasePrice(plan, cycle) {
  const prices = { starter: 29, pro: 49, agency: 99 };
  const base = prices[plan] || 49;
  return cycle === 'yearly' ? base * 12 * 0.8 : base;
}
