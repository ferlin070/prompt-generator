import { sql } from '../lib/db.js';
import { json } from '../lib/auth.js';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (type === 'validate-promo') {
      const code = url.searchParams.get('code');
      if (!code) return json({ error: 'Code required' }, 400);
      const { rows } = await sql`SELECT * FROM promo_codes WHERE code = ${code.toUpperCase()} AND active = true`;
      if (rows.length === 0) return json({ valid: false, message: 'Kod promo tidak sah.' });
      const promo = rows[0];
      if (promo.max_uses && promo.used_count >= promo.max_uses) return json({ valid: false, message: 'Kod promo telah habis.' });
      return json({ valid: true, code: promo, message: `Diskaun ${promo.type === 'percentage' ? promo.value + '%' : 'RM' + promo.value} digunakan!` });
    }

    return json({ error: 'Invalid type' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type === 'setup-db') {
      const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf8');
      const statements = schema.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        await sql.unsafe(stmt);
      }
      return json({ success: true, message: 'Database initialized' });
    }

    if (body.type === 'subscription') {
      const { rows } = await sql`INSERT INTO subscriptions (user_id, plan, billing_cycle, amount, discount, promo_code, status)
        VALUES (${body.userId}, ${body.plan}, ${body.billing_cycle}, ${body.amount}, ${body.discount || 0}, ${body.promo_code || null}, 'pending') RETURNING *`;
      return json({ subscription: rows[0] }, 201);
    }

    return json({ error: 'Invalid type' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
