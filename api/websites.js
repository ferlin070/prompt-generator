import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const { rows } = await sql`SELECT id, title, slug, html_content, css_content, status, version, custom_domain, published_at, created_at, updated_at
        FROM websites WHERE id = ${id} AND user_id = ${auth.userId}`;
      if (rows.length === 0) return json({ error: 'Not found' }, 404);
      return json({ website: rows[0] });
    }

    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;
    const { rows } = await sql`SELECT id, title, slug, status, version, published_at, created_at, updated_at
      FROM websites WHERE user_id = ${auth.userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const { rows: countRows } = await sql`SELECT COUNT(*) FROM websites WHERE user_id = ${auth.userId}`;
    return json({ websites: rows, total: parseInt(countRows[0].count), page, limit });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { action, websiteId, ...data } = await request.json();

    if (action === 'publish') {
      const { rows: existing } = await sql`SELECT id, title, slug FROM websites WHERE id = ${websiteId} AND user_id = ${auth.userId}`;
      if (existing.length === 0) return json({ error: 'Not found' }, 404);
      const w = existing[0];
      let slug = w.slug;
      if (!slug) {
        const base = slugify(w.title);
        const suffix = Math.random().toString(36).substring(2, 6);
        slug = `${base}-${suffix}`;
      }
      const { rows } = await sql`UPDATE websites SET status = 'published', slug = ${slug}, published_at = now(), updated_at = now()
        WHERE id = ${websiteId} AND user_id = ${auth.userId} RETURNING id, title, slug, status, published_at`;
      return json({ website: rows[0] });
    }

    if (action === 'unpublish') {
      const { rows } = await sql`UPDATE websites SET status = 'draft', updated_at = now()
        WHERE id = ${websiteId} AND user_id = ${auth.userId} RETURNING id, title, slug, status`;
      return json({ website: rows[0] });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { id, title, html_content, css_content } = await request.json();
    if (!id) return json({ error: 'id required' }, 400);
    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push(`title = $${values.length + 1}`); values.push(title); }
    if (html_content !== undefined) { updates.push(`html_content = $${values.length + 1}`); values.push(html_content); }
    if (css_content !== undefined) { updates.push(`css_content = $${values.length + 1}`); values.push(css_content); }
    if (updates.length === 0) return json({ error: 'No valid fields' }, 400);
    updates.push(`version = version + 1`);
    updates.push(`updated_at = now()`);
    values.push(id);
    const query = `UPDATE websites SET ${updates.join(', ')} WHERE id = $${values.length} AND user_id = $${auth.userId} RETURNING id, title, slug, status, version, updated_at`;
    const { rows } = await sql.unsafe(query, values);
    if (rows.length === 0) return json({ error: 'Not found' }, 404);
    return json({ website: rows[0] });
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
    const { rowCount } = await sql`DELETE FROM websites WHERE id = ${id} AND user_id = ${auth.userId}`;
    if (rowCount === 0) return json({ error: 'Not found' }, 404);
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
