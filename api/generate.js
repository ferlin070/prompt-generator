import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';
import { generateWebsiteHTML } from '../lib/ai.js';
import { BUSINESS_TEMPLATES, generatePrompt } from '../lib/prompt-builder.js';

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const { formData, businessType, promptId, title } = await request.json();

    if (!formData || !businessType) {
      return json({ error: 'formData dan businessType diperlukan' }, 400);
    }

    if (auth.userId) {
      const { rows: recent } = await sql`SELECT id FROM websites WHERE user_id = ${auth.userId} AND created_at > now() - interval '1 hour'`;
      if (recent.length >= 3) {
        return json({ error: 'Had janaan: 3 website sejam. Sila cuba kemudian.' }, 429);
      }
    }

    const tpl = BUSINESS_TEMPLATES[businessType] || { label: businessType };
    const prompt = generatePrompt(formData, businessType);
    const result = await generateWebsiteHTML(prompt, { language: formData.language || 'ms' });

    const { rows } = await sql`INSERT INTO websites (user_id, prompt_id, title, html_content, version)
      VALUES (${auth.userId}, ${promptId || null}, ${title || formData.businessName || tpl.label || 'Website Baru'}, ${result.html}, 1)
      RETURNING id, title, slug, status, created_at`;

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
