import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows } = await sql`SELECT name FROM profiles WHERE id = ${auth.userId}`;
    if (rows.length === 0) return json({ error: 'User not found' }, 404);

    const prefix = (rows[0].name || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = prefix + suffix;

    await sql`
      UPDATE profiles SET affiliate_code = ${code}, affiliate_enabled = true, updated_at = now()
      WHERE id = ${auth.userId}
    `;
    return json({ code });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
