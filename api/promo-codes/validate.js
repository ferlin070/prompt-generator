import { sql } from '../../lib/db.js';
import { json } from '../../lib/auth.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) return json({ error: 'Code parameter required' }, 400);

    const { rows } = await sql`
      SELECT * FROM promo_codes WHERE code = ${code.toUpperCase()} AND active = true
    `;
    if (rows.length === 0) return json({ valid: false, message: 'Kod promo tidak sah.' });
    const promo = rows[0];
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return json({ valid: false, message: 'Kod promo telah habis.' });
    }
    return json({ valid: true, code: promo, message: `Diskaun ${promo.type === 'percentage' ? promo.value + '%' : 'RM' + promo.value} digunakan!` });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
