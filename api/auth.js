import { sql } from '../lib/db.js';
import { signToken, getAuthUser, json } from '../lib/auth.js';
import bcrypt from 'bcryptjs';

const COMMISSION_RATE = 0.30;

export async function POST(request) {
  try {
    const { email, password, name, businessType, phone, refCode, action } = await request.json();

    if (action === 'register' || (name && email && password)) {
      if (!name || !email || !password) return json({ error: 'Nama, email dan password diperlukan' }, 400);
      if (password.length < 6) return json({ error: 'Password mesti sekurang-kurangnya 6 aksara' }, 400);

      const { rows: existing } = await sql`SELECT id FROM profiles WHERE email = ${email}`;
      if (existing.length > 0) return json({ error: 'Email sudah didaftarkan' }, 409);

      const hash = await bcrypt.hash(password, 12);
      const { rows } = await sql`INSERT INTO profiles (name, email, password_hash, business_type, phone)
        VALUES (${name}, ${email}, ${hash}, ${businessType || null}, ${phone || null})
        RETURNING id, name, email, plan, is_admin, created_at`;
      const user = rows[0];

      if (refCode) {
        const { rows: aff } = await sql`SELECT id, affiliate_balance, affiliate_total_earned FROM profiles WHERE affiliate_code = ${refCode} AND id != ${user.id}`;
        if (aff.length > 0) {
          const commission = 5.00;
          await sql`INSERT INTO affiliate_earnings (affiliate_id, referred_user_id, amount, commission_rate, status) VALUES (${aff[0].id}, ${user.id}, ${commission}, ${COMMISSION_RATE}, 'approved')`;
          await sql`UPDATE profiles SET affiliate_balance = affiliate_balance + ${commission}, affiliate_total_earned = affiliate_total_earned + ${commission} WHERE id = ${aff[0].id}`;
          await sql`UPDATE profiles SET referred_by = ${aff[0].id} WHERE id = ${user.id}`;
        }
      }

      const token = signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin });
      return json({ user, token }, 201);
    }

    // Login
    if (!email || !password) return json({ error: 'Email dan password diperlukan' }, 400);
    const { rows } = await sql`SELECT * FROM profiles WHERE email = ${email}`;
    if (rows.length === 0) return json({ error: 'Email atau password salah' }, 401);

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return json({ error: 'Email atau password salah' }, 401);

    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin });
    return json({
      user: {
        id: user.id, name: user.name, email: user.email, plan: user.plan,
        is_admin: user.is_admin, phone: user.phone, business_type: user.business_type,
        affiliate_code: user.affiliate_code, affiliate_balance: user.affiliate_balance,
        affiliate_total_earned: user.affiliate_total_earned,
        ai_credits_left: user.ai_credits_left, created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { rows } = await sql`SELECT id, name, email, plan, is_admin, phone, business_type,
      affiliate_code, affiliate_balance, affiliate_total_earned, ai_credits_left, created_at
      FROM profiles WHERE id = ${auth.userId}`;
    if (rows.length === 0) return json({ error: 'User not found' }, 404);
    return json({ user: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function PUT(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const updates = await request.json();
    const allowed = ['name', 'phone', 'business_type', 'plan', 'plan_billing_cycle', 'plan_started_at', 'plan_expires_at', 'ai_credits_left', 'is_trial', 'trial_ends_at'];
    const setClauses = []; const values = [];
    for (const key of allowed) {
      if (updates[key] !== undefined) { setClauses.push(`${key} = $${values.length + 1}`); values.push(updates[key]); }
    }
    if (setClauses.length === 0) return json({ error: 'No valid fields' }, 400);
    setClauses.push(`updated_at = now()`); values.push(auth.userId);
    const query = `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, plan, is_admin, phone, business_type, ai_credits_left`;
    const { rows } = await sql.unsafe(query, values);
    return json({ user: rows[0] });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
