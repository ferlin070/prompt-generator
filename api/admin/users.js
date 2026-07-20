import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows: [admin] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!admin?.is_admin) return json({ error: 'Forbidden' }, 403);

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    let result;
    if (query) {
      result = await sql`
        SELECT * FROM profiles WHERE name ILIKE ${'%' + query + '%'} OR email ILIKE ${'%' + query + '%'}
        ORDER BY created_at DESC LIMIT 50
      `;
    } else {
      result = await sql`SELECT * FROM profiles ORDER BY created_at DESC LIMIT 50`;
    }
    return json({ users: result.rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows: [admin] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!admin?.is_admin) return json({ error: 'Forbidden' }, 403);

    const { userId, plan, is_admin } = await request.json();
    if (plan !== undefined) {
      await sql`UPDATE profiles SET plan = ${plan}, updated_at = now() WHERE id = ${userId}`;
    }
    if (is_admin !== undefined) {
      await sql`UPDATE profiles SET is_admin = ${is_admin}, updated_at = now() WHERE id = ${userId}`;
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
