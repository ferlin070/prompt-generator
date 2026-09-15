const ROOTSYS_API_KEY = process.env.ROOTSYS_API_KEY;
const ROOTSYS_BASE_URL = process.env.ROOTSYS_BASE_URL || 'https://rootsys.cloud/v1';
const ROOTSYS_MODEL = process.env.ROOTSYS_MODEL || 'minimax-m3';
const { renderWebsite } = await import('./template.js');

export async function generateWebsiteHTML(prompt, options = {}) {
  const systemMessage = `You generate rich, detailed JSON content for a Malaysian business landing page. Return ONLY valid JSON, no markdown.

CONTENT QUALITY RULES:
- Write persuasive, specific marketing copy — NOT generic filler
- Use Malaysian context: local places, Malaysian Ringgit, local tastes
- Menu descriptions must be mouth-watering/specific (mention ingredients, texture, taste)
- Testimonials must sound authentic with specific details (what they ordered, occasion)
- Stats should be realistic for a Malaysian SME
- Tagline must be catchy and memorable (max 6 words)

COLOR SUGGESTION: Include "colorStyle" field. Pick ONE from these based on business personality:
- "hangat" (warm terracotta - F&B, food, appetite)
- "sejuk" (ocean blue - professional, corporate, tech, clinic)
- "mewah" (royal gold - premium, luxury, wedding, high-end)
- "elegan" (amethyst purple - fashion, beauty, creative)
- "segar" (forest green - health, organic, nature, eco)
- "berani" (sunset red - energetic, gym, sports, bold brands)
- "lembut" (peach soft - feminine, kids, flowers, gentle services)
- "tropika" (tropical teal - beach, resort, seafood, fresh)
- "manis" (candy pop - dessert, bubble tea, youth brands)
- "gelap2" (charcoal pro - legal, finance, consulting)

JSON SCHEMA:
{"tagline":"catchy max 6 words","colorStyle":"hangat|sejuk|mewah|elegan|segar|berani|lembut|tropika|manis|gelap2","heroBadge":"short badge","heroTitle":"main headline","heroHighlight":"accent word","heroDescription":"2 sentences persuasive","heroCard":{"tag":"badge","name":"item name","description":"2 sentences appetizing","price":"RM X","priceNote":"for 4 pax"},"aboutTitle":"section heading","aboutText1":"detailed paragraph 2-3 sentences","aboutText2":"paragraph 2-3 sentences","aboutFeatures":[{"icon":"fas fa-utensils","text":"specific benefit"}],"heroImage":"unsplash URL","heroCardImage":"unsplash URL","aboutImage1":"unsplash URL","aboutImage2":"unsplash URL","signature":[{"tag":"Wajib Cuba","name":"dish name","description":"2 sentences detailed","features":["specific point with detail","point2","point3","point4"],"price":"RM 25","priceNote":"mengikut jenis","image":"unsplash URL"},{"tag":"Pakej Keluarga","name":"set name","description":"...","features":["..."],"price":"RM 100","priceNote":"untuk 4 pax","image":"unsplash URL"}],"menu":[{"name":"dish","description":"mouth-watering 1-2 sentences with ingredients","price":"RM X","image":"unsplash URL","category":"utama|minuman|pencuci","badge":"Popular|Hot|Signature|New|null"}],"gallery":[{"image":"unsplash URL","title":"label","subtitle":"short"},{"image":"...","title":"...","subtitle":"..."}],"features":[{"icon":"fas fa-fire","title":"benefit title","description":"specific 1-2 sentences how it helps customer"}],"testimonials":[{"name":"Malaysian name","title":"role/location","text":"quote with specific detail"}],"stats":["10+","5K+","4.9★"],"ctaTitle":"compelling heading","ctaText":"paragraph with urgency","faq":[{"q":"common customer question","a":"helpful specific answer"},{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}]}

QUANTITIES: 6 utama + 4 minuman + 4 pencuci menu items. 6 gallery, 6 features, 6 testimonials, 4 FAQ. Real Unsplash URLs (https://images.unsplash.com/photo-XXXX?w=800&q=80) matching the business type. ALL text in ${options.language === 'en' ? 'English' : 'Bahasa Malaysia'}.

${options.colorStyle ? `IMPORTANT: Use colorStyle "${options.colorStyle}" (user selected this).` : 'Suggest the best colorStyle for this business type.'}`;

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
      tagline: contentObj.tagline || contentObj.heroBadge || '',
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
    colorStyle: options.colorStyle || contentObj.colorStyle,
    tagline: contentObj.tagline,
  });

  return {
    html,
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model || ROOTSYS_MODEL,
  };
}
