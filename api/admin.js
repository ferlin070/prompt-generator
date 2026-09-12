import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';

async function requireAdmin(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  const { rows } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
  if (!rows[0]?.is_admin) return json({ error: 'Forbidden' }, 403);
  return auth;
}

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.status) return auth;
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'stats';

    switch (type) {
      case 'users': {
        const query = url.searchParams.get('q') || '';
        const result = query
          ? await sql`SELECT id, name, email, plan, is_admin, created_at, updated_at FROM profiles WHERE name ILIKE ${'%' + query + '%'} OR email ILIKE ${'%' + query + '%'} ORDER BY created_at DESC LIMIT 50`
          : await sql`SELECT id, name, email, plan, is_admin, created_at, updated_at FROM profiles ORDER BY created_at DESC LIMIT 50`;
        return json({ users: result.rows });
      }
      case 'subs': {
        const { rows } = await sql`SELECT * FROM subscriptions ORDER BY created_at DESC`;
        return json({ subscriptions: rows });
      }
      case 'promos': {
        const { rows } = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
        return json({ promos: rows });
      }
      case 'withdrawals': {
        const { rows } = await sql`SELECT * FROM withdrawals ORDER BY requested_at DESC`;
        return json({ withdrawals: rows });
      }
      default: {
        const { rows: [userCount] } = await sql`SELECT COUNT(*) as count FROM profiles`;
        const { rows: [promptCount] } = await sql`SELECT COUNT(*) as count FROM prompts`;
        const { rows: activeSubs } = await sql`SELECT amount FROM subscriptions WHERE status = 'active'`;
        const mrr = activeSubs.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
        return json({ userCount: parseInt(userCount.count), promptCount: parseInt(promptCount.count), activeSubs: activeSubs.length, mrr });
      }
    }
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.status) return auth;
  try {
    const body = await request.json();
    if (body.type === 'promo') {
      await sql`INSERT INTO promo_codes (code, type, value) VALUES (${body.code.toUpperCase()}, ${body.promoType}, ${body.value})`;
      return json({ success: true }, 201);
    }
    return json({ error: 'Invalid type' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = await requireAdmin(request);
  if (auth.status) return auth;
  try {
    const body = await request.json();
    switch (body.type) {
      case 'user-plan':
        await sql`UPDATE profiles SET plan = ${body.plan}, updated_at = now() WHERE id = ${body.userId}`;
        break;
      case 'user-admin':
        await sql`UPDATE profiles SET is_admin = ${body.is_admin}, updated_at = now() WHERE id = ${body.userId}`;
        break;
      case 'promo-toggle':
        await sql`UPDATE promo_codes SET active = ${body.active} WHERE id = ${body.id}`;
        break;
      case 'approve-withdrawal':
        await sql`UPDATE withdrawals SET status = 'approved', approved_at = now() WHERE id = ${body.id}`;
        break;
      default:
        return json({ error: 'Invalid type' }, 400);
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
