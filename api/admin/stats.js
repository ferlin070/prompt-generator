import { sql } from '../../lib/db.js';
import { getAuthUser, json } from '../../lib/auth.js';

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  try {
    const { rows: [userRow] } = await sql`SELECT is_admin FROM profiles WHERE id = ${auth.userId}`;
    if (!userRow?.is_admin) return json({ error: 'Forbidden' }, 403);

    const { rows: [userCount] } = await sql`SELECT COUNT(*) as count FROM profiles`;
    const { rows: [promptCount] } = await sql`SELECT COUNT(*) as count FROM prompts`;
    const { rows: activeSubs } = await sql`SELECT amount FROM subscriptions WHERE status = 'active'`;

    const mrr = activeSubs.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    return json({
      userCount: parseInt(userCount.count),
      promptCount: parseInt(promptCount.count),
      activeSubs: activeSubs.length,
      mrr,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
