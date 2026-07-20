import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const { rows } = await sql`SELECT * FROM prompts WHERE id = ${id} AND user_id = ${auth.userId}`;
      if (rows.length === 0) return json({ error: 'Not found' }, 404);
      return json({ prompt: rows[0] });
    }

    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;
    const { rows } = await sql`SELECT * FROM prompts WHERE user_id = ${auth.userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const { rows: countRows } = await sql`SELECT COUNT(*) FROM prompts WHERE user_id = ${auth.userId}`;
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
    const { rows } = await sql`INSERT INTO prompts (user_id, title, business_type, business_type_label, form_data, generated_prompt, tags)
      VALUES (${auth.userId}, ${data.title}, ${data.business_type}, ${data.business_type_label || null},
      ${JSON.stringify(data.form_data || {})}, ${data.generated_prompt || null}, ${data.tags || []}) RETURNING *`;
    return json({ prompt: rows[0] }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const data = await request.json();
    const { rows } = await sql`UPDATE prompts SET title = COALESCE(${data.title}, title),
      business_type = COALESCE(${data.business_type}, business_type),
      form_data = COALESCE(${data.form_data ? JSON.stringify(data.form_data) : null}::jsonb, form_data),
      generated_prompt = COALESCE(${data.generated_prompt}, generated_prompt),
      tags = COALESCE(${data.tags}, tags), is_favourite = COALESCE(${data.is_favourite}, is_favourite),
      version = version + 1, updated_at = now()
      WHERE id = ${data.id} AND user_id = ${auth.userId} RETURNING *`;
    if (rows.length === 0) return json({ error: 'Not found' }, 404);
    return json({ prompt: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function DELETE(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'id required' }, 400);
    const { rowCount } = await sql`DELETE FROM prompts WHERE id = ${id} AND user_id = ${auth.userId}`;
    if (rowCount === 0) return json({ error: 'Not found' }, 404);
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
