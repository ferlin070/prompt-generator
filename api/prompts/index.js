import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    const { rows } = await sql`
      SELECT * FROM prompts WHERE user_id = ${auth.userId}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `;
    const { rows: countRows } = await sql`
      SELECT COUNT(*) FROM prompts WHERE user_id = ${auth.userId}
    `;
    return json({ prompts: rows, total: parseInt(countRows[0].count), page, limit });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const data = await request.json();
    const { rows } = await sql`
      INSERT INTO prompts (user_id, title, business_type, business_type_label, form_data, generated_prompt, tags)
      VALUES (${auth.userId}, ${data.title}, ${data.business_type}, ${data.business_type_label || null},
              ${JSON.stringify(data.form_data || {})}, ${data.generated_prompt || null}, ${data.tags || []})
      RETURNING *
    `;
    return json({ prompt: rows[0] }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
