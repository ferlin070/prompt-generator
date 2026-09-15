const ROOTSYS_API_KEY = process.env.ROOTSYS_API_KEY;
const ROOTSYS_BASE_URL = process.env.ROOTSYS_BASE_URL || 'https://rootsys.cloud/v1';
const ROOTSYS_MODEL = process.env.ROOTSYS_MODEL || 'minimax-m3';
const { renderWebsite } = await import('./template.js');

export async function generateWebsiteHTML(prompt, options = {}) {
  const systemMessage = `You generate JSON content for a Malaysian business landing page. Return ONLY valid JSON, no markdown. Schema:
{"heroBadge":"short badge text","heroTitle":"main headline","heroHighlight":"accent word","heroDescription":"1-2 sentences","heroCard":{"tag":"badge","name":"item name","description":"1 sentence","price":"RM X","priceNote":"for 4 pax"},"aboutTitle":"section heading","aboutText1":"paragraph","aboutText2":"paragraph","aboutFeatures":[{"icon":"fas fa-utensils","text":"label"}],"heroImage":"unsplash URL","heroCardImage":"unsplash URL","aboutImage1":"unsplash URL","aboutImage2":"unsplash URL","signature":[{"tag":"Wajib Cuba","name":"dish name","description":"1-2 sentences","features":["point1","point2","point3","point4"],"price":"RM 25","priceNote":"mengikut jenis","image":"unsplash URL"},{"tag":"Pakej Keluarga","name":"set name","description":"...","features":["..."],"price":"RM 100","priceNote":"untuk 4 pax","image":"unsplash URL"}],"menu":[{"name":"dish","description":"1 sentence","price":"RM X","image":"unsplash URL","category":"utama|minuman|pencuci","badge":"Popular|Hot|Signature|null"}],"gallery":[{"image":"unsplash URL","title":"label","subtitle":"short"},{"image":"...","title":"...","subtitle":"..."}],"features":[{"icon":"fas fa-fire","title":"title","description":"1 sentence"}],"testimonials":[{"name":"Person","title":"role","text":"quote"}],"stats":["10+","5K+","4.9★"],"ctaTitle":"heading","ctaText":"paragraph"}
Use 6 menu items for utama, 4 for minuman, 4 for pencuci (14 total). Use 6 gallery items, 6 features, 6 testimonials. Use real Unsplash photo URLs (https://images.unsplash.com/photo-XXXX?w=800&q=80) relevant to the business type. Write ALL user-facing text in ${options.language === 'en' ? 'English' : 'Bahasa Malaysia'}.`;

  const userMessage = `${prompt}

Generate the JSON content now in ${options.language === 'en' ? 'English' : 'Bahasa Malaysia'}. Return ONLY the JSON object.`;

  const response = await fetch(`${ROOTSYS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': ROOTSYS_API_KEY },
    body: JSON.stringify({
      model: ROOTSYS_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 6000,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Rootsys API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error('AI returned empty response');
  content = content.trim();
  if (content.startsWith('```json')) content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  else if (content.startsWith('```')) content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');

  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('AI response does not contain JSON');
  content = content.slice(jsonStart, jsonEnd + 1);

  let contentObj;
  try { contentObj = JSON.parse(content); }
  catch { throw new Error('AI returned invalid JSON'); }

  const html = renderWebsite({
    ...contentObj,
    business: {
      name: options.businessName || contentObj.heroTitle || 'Perniagaan',
      tagline: contentObj.heroBadge || '',
      description: options.description || contentObj.heroDescription || '',
      location: options.location || 'Malaysia',
      phone: options.phone,
      whatsapp: options.whatsapp,
      email: options.email,
      address: options.location,
    },
    businessType: options.businessType || 'default',
    theme: options.theme || 'modern',
    language: options.language || 'ms',
  });

  return {
    html,
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model || ROOTSYS_MODEL,
  };
}
