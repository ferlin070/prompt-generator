import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows: [admin] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!admin?.is_admin) return json({ error: 'Forbidden' }, 403);

    const { rows } = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
    return json({ promos: rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows: [admin] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!admin?.is_admin) return json({ error: 'Forbidden' }, 403);

    const { code, type, value } = await request.json();
    await sql`INSERT INTO promo_codes (code, type, value) VALUES (${code.toUpperCase()}, ${type}, ${value})`;
    return json({ success: true }, 201);
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

    const { id, active } = await request.json();
    await sql`UPDATE promo_codes SET active = ${active} WHERE id = ${id}`;
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
