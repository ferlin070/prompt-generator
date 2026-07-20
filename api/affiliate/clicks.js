import { sql } from '../../lib/db.js';
import { json } from '../../lib/auth.js';

export async function POST(request) {
  try {
    const { affiliate_id, code } = await request.json();
    await sql`
      INSERT INTO affiliate_clicks (affiliate_id, code)
      VALUES (${affiliate_id}, ${code})
    `;
    return json({ success: true }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
