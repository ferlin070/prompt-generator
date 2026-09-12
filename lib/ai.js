const ROOTSYS_API_KEY = process.env.ROOTSYS_API_KEY;
const ROOTSYS_BASE_URL = process.env.ROOTSYS_BASE_URL || 'https://rootsys.cloud/v1';
const ROOTSYS_MODEL = process.env.ROOTSYS_MODEL || 'glm-5.2';

export async function generateWebsiteHTML(prompt, options = {}) {
  const systemMessage = 'You are a professional web developer specializing in creating landing pages for Malaysian businesses. Generate a COMPLETE, responsive, standalone HTML landing page with inline CSS. Return ONLY valid HTML code starting with <!DOCTYPE html>. No markdown, no code fences, no explanations. The HTML must be self-contained (all CSS inline in <style> tags, no external dependencies except Google Fonts and Font Awesome CDN).';

  const userMessage = `${prompt}\n\nREQUIREMENTS:\n- Complete HTML document with <!DOCTYPE html>\n- Responsive mobile-first design\n- Inline <style> tags (no external CSS files)\n- Use Google Fonts (Outfit family)\n- Use Font Awesome 6 CDN for icons\n- Include WhatsApp click-to-chat button\n- Professional, modern design\n- All text in ${options.language === 'en' ? 'English' : 'Bahasa Malaysia'}\n- Maximum 50KB HTML size`;

  const response = await fetch(`${ROOTSYS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ROOTSYS_API_KEY,
    },
    body: JSON.stringify({
      model: ROOTSYS_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      max_tokens: options.maxTokens || 8000,
      temperature: options.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Rootsys API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI returned empty response');
  }

  let html = content.trim();
  if (html.startsWith('```html')) {
    html = html.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  } else if (html.startsWith('```')) {
    html = html.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  if (!html.includes('<!DOCTYPE')) {
    throw new Error('AI response does not contain valid HTML');
  }

  if (html.length > 100000) {
    throw new Error('Generated HTML exceeds 100KB limit');
  }

  return {
    html,
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model || ROOTSYS_MODEL,
  };
}
