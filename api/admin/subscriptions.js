import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows: [admin] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!admin?.is_admin) return json({ error: 'Forbidden' }, 403);

    const { rows } = await sql`SELECT * FROM subscriptions ORDER BY created_at DESC`;
    return json({ subscriptions: rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
