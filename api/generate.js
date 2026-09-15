import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';
import { generateWebsiteHTML } from '../lib/ai.js';
import { BUSINESS_TEMPLATES, generatePrompt } from '../lib/prompt-builder.js';

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { formData, businessType, promptId, title, theme, colorStyle } = await request.json();

    if (!formData || !businessType) {
      return json({ error: 'formData dan businessType diperlukan' }, 400);
    }

    const validThemes = ['modern', 'elegan', 'minimalis', 'gelap'];
    const chosenTheme = validThemes.includes(theme) ? theme : 'modern';
    const validColors = ['', 'hangat', 'sejuk', 'mewah', 'elegan', 'segar', 'berani', 'lembut', 'tropika', 'manis', 'gelap2'];
    const chosenColor = validColors.includes(colorStyle) ? colorStyle : '';

    if (auth.userId) {
      const { rows: recent } = await sql`SELECT id FROM websites WHERE user_id = ${auth.userId} AND created_at > now() - interval '1 hour'`;
      if (recent.length >= 3) {
        return json({ error: 'Had janaan: 3 website sejam. Sila cuba kemudian.' }, 429);
      }
      const { rows: profile } = await sql`SELECT plan, plan_expires_at FROM profiles WHERE id = ${auth.userId}`;
      let plan = profile[0]?.plan || 'free';
      if (plan !== 'free' && plan !== 'starter' && plan !== 'pro' && plan !== 'agency') plan = 'free';
      const expires = profile[0]?.plan_expires_at;
      if (expires && new Date(expires) < new Date()) plan = 'free';
      const siteQuota = { free: 1, starter: 3, pro: 10, agency: 999 }[plan] || 1;
      const { rows: owned } = await sql`SELECT id FROM websites WHERE user_id = ${auth.userId}`;
      if (owned.length >= siteQuota) {
        return json({ error: `Had website dicapai (${owned.length}/${siteQuota}) untuk pelan ${plan}. Naik taraf untuk jana lebih banyak website.` }, 403);
      }
    }

    const tpl = BUSINESS_TEMPLATES[businessType] || { label: businessType };
    const prompt = generatePrompt(formData, businessType);
    const result = await generateWebsiteHTML(prompt, {
      language: formData.language || 'ms',
      theme: chosenTheme,
      colorStyle: chosenColor,
    });

    const { rows } = await sql`INSERT INTO websites (user_id, prompt_id, title, html_content, version)
      VALUES (${auth.userId}, ${promptId || null}, ${title || formData.businessName || tpl.label || 'Website Baru'}, ${result.html}, 1)
      RETURNING id, title, slug, status, created_at`;

    await sql`INSERT INTO website_versions (website_id, html_content, version) VALUES (${rows[0].id}, ${result.html}, 1)`;

    return json({
      website: rows[0],
      html: result.html,
      tokensUsed: result.tokensUsed,
      model: result.model,
    }, 201);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
