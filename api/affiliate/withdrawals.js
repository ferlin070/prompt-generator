import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

const MIN_WITHDRAW = 50;

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows } = await sql`
      SELECT * FROM withdrawals WHERE user_id = ${auth.userId} ORDER BY requested_at DESC
    `;
    return json({ withdrawals: rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { amount, bankName, accountNumber, accountName } = await request.json();

    const { rows: [profile] } = await sql`
      SELECT affiliate_balance FROM profiles WHERE id = ${auth.userId}
    `;
    const balance = parseFloat(profile?.affiliate_balance || 0);

    if (balance < MIN_WITHDRAW) {
      return json({ error: `Minimum RM${MIN_WITHDRAW}. Baki: RM${balance.toFixed(2)}` }, 400);
    }
    if (amount > balance) {
      return json({ error: 'Jumlah melebihi baki.' }, 400);
    }

    await sql`
      INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name)
      VALUES (${auth.userId}, ${amount}, ${bankName}, ${accountNumber}, ${accountName})
    `;

    await sql`
      UPDATE profiles SET affiliate_balance = affiliate_balance - ${amount} WHERE id = ${auth.userId}
    `;

    return json({ success: true }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
