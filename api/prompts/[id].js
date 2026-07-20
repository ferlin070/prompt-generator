import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request, { params }) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows } = await sql`
      SELECT * FROM prompts WHERE id = ${params.id} AND user_id = ${auth.userId}
    `;
    if (rows.length === 0) return json({ error: 'Not found' }, 404);
    return json({ prompt: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request, { params }) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const data = await request.json();
    const allowed = ['title', 'business_type', 'business_type_label', 'form_data', 'generated_prompt', 'tags', 'is_favourite'];
    const setClauses = [];
    const values = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        setClauses.push(`${key} = $${values.length + 1}`);
        values.push(key === 'form_data' ? JSON.stringify(data[key]) : data[key]);
      }
    }

    if (setClauses.length === 0) return json({ error: 'No fields to update' }, 400);
    setClauses.push(`version = version + 1, updated_at = now()`);
    values.push(params.id, auth.userId);

    const { rows } = await sql`
      UPDATE prompts SET ${sql.unsafe(setClauses.join(', '))}
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING *
    `;
    if (rows.length === 0) return json({ error: 'Not found' }, 404);
    return json({ prompt: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rowCount } = await sql`
      DELETE FROM prompts WHERE id = ${params.id} AND user_id = ${auth.userId}
    `;
    if (rowCount === 0) return json({ error: 'Not found' }, 404);
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
