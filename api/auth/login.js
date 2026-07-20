import { sql } from '../../lib/db.js';
import { signToken, json } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email dan password diperlukan' }, 400);
    }

    const { rows } = await sql`SELECT * FROM profiles WHERE email = ${email}`;
    if (rows.length === 0) {
      return json({ error: 'Email atau password salah' }, 401);
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return json({ error: 'Email atau password salah' }, 401);
    }

    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin });

    return json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        is_admin: user.is_admin,
        phone: user.phone,
        business_type: user.business_type,
        affiliate_code: user.affiliate_code,
        affiliate_balance: user.affiliate_balance,
        affiliate_total_earned: user.affiliate_total_earned,
        ai_credits_left: user.ai_credits_left,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
