import { sql } from '../../lib/db.js';
import { signToken, json } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';

const COMMISSION_RATE = 0.30;

export async function POST(request) {
  try {
    const { name, email, password, businessType, phone, refCode } = await request.json();

    if (!name || !email || !password) {
      return json({ error: 'Nama, email dan password diperlukan' }, 400);
    }
    if (password.length < 6) {
      return json({ error: 'Password mesti sekurang-kurangnya 6 aksara' }, 400);
    }

    const existing = await sql`SELECT id FROM profiles WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return json({ error: 'Email sudah didaftarkan' }, 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await sql`
      INSERT INTO profiles (name, email, password_hash, business_type, phone)
      VALUES (${name}, ${email}, ${password_hash}, ${businessType || null}, ${phone || null})
      RETURNING id, name, email, plan, is_admin, created_at
    `;
    const user = rows[0];

    // Process affiliate referral
    if (refCode) {
      const { rows: aff } = await sql`
        SELECT id, affiliate_balance, affiliate_total_earned FROM profiles
        WHERE affiliate_code = ${refCode} AND id != ${user.id}
      `;
      if (aff.length > 0) {
        const commission = 5.00; // Fixed commission on signup
        await sql`INSERT INTO affiliate_earnings (affiliate_id, referred_user_id, amount, commission_rate, status)
                  VALUES (${aff[0].id}, ${user.id}, ${commission}, ${COMMISSION_RATE}, 'approved')`;
        await sql`UPDATE profiles SET affiliate_balance = affiliate_balance + ${commission},
                  affiliate_total_earned = affiliate_total_earned + ${commission}
                  WHERE id = ${aff[0].id}`;
        await sql`UPDATE profiles SET referred_by = ${aff[0].id} WHERE id = ${user.id}`;
      }
    }

    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin });

    return json({ user, token }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
