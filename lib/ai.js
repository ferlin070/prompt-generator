const ROOTSYS_API_KEY = process.env.ROOTSYS_API_KEY;
const ROOTSYS_BASE_URL = process.env.ROOTSYS_BASE_URL || 'https://rootsys.cloud/v1';
const ROOTSYS_MODEL = process.env.ROOTSYS_MODEL || 'kimi-k2.7';

export async function generateWebsiteHTML(prompt, options = {}) {
  const systemMessage = `You are an elite web developer creating premium landing pages for Malaysian businesses. Return ONLY complete HTML (<!DOCTYPE html> to </html>). All CSS in <style>, all JS in <script>. Use Poppins+Playfair fonts, Font Awesome 6 CDN, Unsplash images, gradients, glassmorphism (backdrop-filter), @keyframes animations, :hover effects, responsive @media, hamburger menu, floating WhatsApp button (wa.me), scroll reveal (IntersectionObserver).

Include ALL sections: navbar(glassmorphic), hero(fullscreen bg image+gradient overlay, stats), about(overlapping images), signature items(cards+prices), menu(tabbed filter+cards), gallery(masonry), features(icon cards), testimonials(dark+glass), booking form(JS validation+WhatsApp submit), contact(cards+map iframe), CTA, footer(4-column), floating buttons.

ALL text in Bahasa Malaysia. Include JSON-LD + OG tags. Keep CSS concise. The HTML MUST end with </html>.`;

  const userMessage = `${prompt}

Create a complete premium landing page in Bahasa Malaysia with ALL sections above. Use real Unsplash images. Make it visually stunning.`;

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
      temperature: options.temperature || 0.85,
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

  if (!html.includes('</html>')) {
    if (!html.includes('</body>')) {
      let pos = html.length;
      let depth = 0;
      for (let i = html.length - 1; i >= 0; i--) {
        if (html[i] === '>') depth++;
        if (html[i] === '<') { depth--; if (depth < 0) { pos = i; break; } }
      }
      html = html.slice(0, pos) + '\n</div>\n</section>\n';
    }
    html += '\n</body>\n</html>';
  }

  if (!html.includes('<body')) {
    let insertPos = html.indexOf('</style>');
    if (insertPos === -1) insertPos = html.indexOf('</head>');
    if (insertPos === -1) insertPos = html.indexOf('<head>') !== -1 ? html.indexOf('<head>') + 6 : 0;
    if (insertPos > 0) {
      html = html.slice(0, insertPos + 8) + '\n</head>\n<body>\n' + html.slice(insertPos + 8);
    } else {
      html = html.replace('<head>', '<head>') + '</head><body>';
    }
  }

  if (!html.includes('</style>') && html.includes('<style')) {
    const scriptPos = html.indexOf('<script');
    if (scriptPos > 0) {
      html = html.slice(0, scriptPos) + '</style>\n</head>\n<body>\n' + html.slice(scriptPos);
    }
  }

  return {
    html,
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model || ROOTSYS_MODEL,
  };
}
