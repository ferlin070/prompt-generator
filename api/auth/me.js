import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows } = await sql`
      SELECT id, name, email, plan, is_admin, phone, business_type,
             affiliate_code, affiliate_balance, affiliate_total_earned,
             ai_credits_left, created_at
      FROM profiles WHERE id = ${auth.userId}
    `;
    if (rows.length === 0) return json({ error: 'User not found' }, 404);
    return json({ user: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const updates = await request.json();
    const allowed = ['name', 'phone', 'business_type'];
    const setClauses = [];
    const values = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = $${values.length + 1}`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) return json({ error: 'No valid fields to update' }, 400);

    setClauses.push(`updated_at = now()`);
    values.push(auth.userId);

    const { rows } = await sql`
      UPDATE profiles SET ${sql.unsafe(setClauses.join(', '))}
      WHERE id = ${auth.userId}
      RETURNING id, name, email, plan, is_admin, phone, business_type, ai_credits_left
    `;
    return json({ user: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
