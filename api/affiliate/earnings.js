import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows } = await sql`
      SELECT * FROM affiliate_earnings WHERE affiliate_id = ${auth.userId}
      ORDER BY created_at DESC
    `;
    return json({ earnings: rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
