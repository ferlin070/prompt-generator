const PALETTES = {
  restaurant: { primary: '#e07856', primaryLight: '#f0977a', secondary: '#c2493a', accent: '#3d1f1a', bgLight: '#fdf8f5', gold: '#ffd700' },
  cafe: { primary: '#a67c52', primaryLight: '#c09b76', secondary: '#6f4e37', accent: '#2f2119', bgLight: '#faf6f2', gold: '#ffd700' },
  bakery: { primary: '#d4a574', primaryLight: '#e6c19a', secondary: '#a6763e', accent: '#3e2c1e', bgLight: '#fdf9f4', gold: '#ffd700' },
  fashion: { primary: '#9370b8', primaryLight: '#b39ddb', secondary: '#6a4c93', accent: '#2d1b4e', bgLight: '#f8f6fc', gold: '#ffd700' },
  salon: { primary: '#e58fb1', primaryLight: '#f2b3cc', secondary: '#c26b8f', accent: '#3d1f2e', bgLight: '#fdf5f8', gold: '#ffd700' },
  clinic: { primary: '#5dade2', primaryLight: '#85c1e9', secondary: '#3498db', accent: '#1b3c59', bgLight: '#f4f9fd', gold: '#ffd700' },
  tech: { primary: '#48c9b0', primaryLight: '#76d7c4', secondary: '#1abc9c', accent: '#0e2f2c', bgLight: '#f0faf8', gold: '#ffd700' },
  education: { primary: '#f5b041', primaryLight: '#f8c471', secondary: '#e67e22', accent: '#4a2f0e', bgLight: '#fdf9f0', gold: '#ffd700' },
  default: { primary: '#9393cd', primaryLight: '#b3b3e0', secondary: '#6e5298', accent: '#352040', bgLight: '#f8f7fc', gold: '#ffd700' },
};

const ICONS = {
  restaurant: 'fas fa-utensils', cafe: 'fas fa-mug-hot', bakery: 'fas fa-birthday-cake',
  fashion: 'fas fa-shirt', salon: 'fas fa-spa', clinic: 'fas fa-stethoscope',
  tech: 'fas fa-laptop-code', education: 'fas fa-graduation-cap', default: 'fas fa-star',
};

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderWebsite(c) {
  const biz = c.business || {};
  const name = esc(biz.name || 'Perniagaan Anda');
  const tagline = esc(biz.tagline || '');
  const p = PALETTES[c.businessType] || PALETTES.default;
  const icon = ICONS[c.businessType] || ICONS.default;
  const wa = (biz.whatsapp || '60123456789').replace(/\D/g, '');

  const menuCards = (c.menu || []).map((m, i) => {
    const cat = m.category || 'utama';
    return `<article class="menu-card${cat === 'utama' ? ' show' : ''}" data-category="${esc(cat)}">
      <div class="menu-card-img"><img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy">
      ${m.badge ? `<span class="menu-card-badge${m.badge === 'Hot' ? ' hot' : ''}"><i class="fas fa-${m.badge === 'Hot' ? 'fire' : 'star'}"></i> ${esc(m.badge)}</span>` : ''}</div>
      <div class="menu-card-content"><h3>${esc(m.name)}</h3><p>${esc(m.description || '')}</p>
      <div class="menu-card-footer"><div class="menu-price">${esc(m.price)}</div>
      <a href="https://wa.me/${wa}?text=${encodeURIComponent('Saya nak order ' + (m.name || ''))}" class="btn-order" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Order</a></div></div></article>`;
  }).join('\n');

  const sigCards = (c.signature || []).map(s => `
    <div class="signature-card reveal">
      <div class="signature-card-img" style="background-image:url('${esc(s.image)}')">
        <div class="signature-card-tag"><i class="fas fa-fire"></i> ${esc(s.tag || 'Wajib Cuba')}</div>
      </div>
      <div class="signature-card-content">
        <h3>${esc(s.name)}</h3><p>${esc(s.description)}</p>
        <ul>${(s.features || []).map(f => `<li><i class="fas fa-check-circle"></i> ${esc(f)}</li>`).join('')}</ul>
        <div class="signature-card-footer">
          <div class="signature-price">${esc(s.price)}<small>${esc(s.priceNote || '')}</small></div>
          <a href="https://wa.me/${wa}?text=${encodeURIComponent('Saya nak order ' + (s.name || ''))}" class="btn-order" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Order</a>
        </div>
      </div>
    </div>`).join('\n');

  const testimonials = (c.testimonials || []).map(t => `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${'<i class="fas fa-star"></i>'.repeat(5)}</div>
      <p class="testimonial-text">"${esc(t.text)}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${esc((t.name || 'K').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</div>
        <div class="testimonial-info"><h4>${esc(t.name)}</h4><span>${esc(t.title || '')}</span></div>
      </div>
    </div>`).join('\n');

  const features = (c.features || []).map(f => `
    <div class="feature-card reveal">
      <div class="feature-icon"><i class="${esc(f.icon || 'fas fa-star')}"></i></div>
      <h3>${esc(f.title)}</h3><p>${esc(f.description)}</p>
    </div>`).join('\n');

  const gallery = (c.gallery || []).map((g, i) => `
    <div class="gallery-item" style="background-image:url('${esc(g.image)}')">
      <div class="gallery-item-overlay"><h4>${esc(g.title)}</h4><p>${esc(g.subtitle || '')}</p><i class="fas fa-expand"></i></div>
    </div>`).join('\n');

  const tabs = ['utama', 'minuman', 'pencuci'].map((cat, i) => {
    const labels = { utama: 'Makanan Utama', minuman: 'Minuman', pencuci: 'Pencuci Mulut' };
    const tabIcons = { utama: 'fas fa-utensils', minuman: 'fas fa-glass-water', pencuci: 'fas fa-ice-cream' };
    return `<button class="menu-tab${i === 0 ? ' active' : ''}" data-category="${cat}"><i class="${tabIcons[cat]}"></i> ${labels[cat]}</button>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(biz.metaDescription || name + ' - ' + tagline)}">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${esc(biz.metaDescription || tagline)}">
<meta property="og:type" content="website">
<title>${name} | ${esc(tagline)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"${name}","address":{"@type":"PostalAddress","addressLocality":"${esc(biz.location || 'Malaysia')}","addressCountry":"MY"},"telephone":"${esc(biz.phone || '+60123456789')}"}</script>
<style>
:root{--primary:${p.primary};--primary-light:${p.primaryLight};--secondary:${p.secondary};--accent:${p.accent};--accent-dark:${p.accent};--bg-light:${p.bgLight};--bg-white:#fff;--text-dark:#2a2030;--text-muted:#6b6373;--gold:${p.gold};--gradient-main:linear-gradient(135deg,${p.primary} 0%,${p.secondary} 100%);--gradient-accent:linear-gradient(135deg,${p.secondary} 0%,${p.accent} 100%);--gradient-hero:linear-gradient(135deg,rgba(0,0,0,.75) 0%,rgba(0,0,0,.5) 50%,rgba(0,0,0,.35) 100%);--shadow-sm:0 4px 12px rgba(0,0,0,.08);--shadow-md:0 8px 24px rgba(0,0,0,.12);--shadow-lg:0 20px 50px rgba(0,0,0,.18);--shadow-glow:0 10px 40px ${p.primary}66;--transition:.3s cubic-bezier(.4,0,.2,1);--radius-sm:12px;--radius-md:20px;--radius-lg:30px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:80px}
body{font-family:'Poppins',sans-serif;color:var(--text-dark);background:var(--bg-light);line-height:1.6;overflow-x:hidden}
h1,h2,h3,h4{font-family:'Playfair Display',serif;line-height:1.2;color:var(--accent)}
.container{max-width:1280px;margin:0 auto;padding:0 24px}
.navbar{position:fixed;top:0;left:0;width:100%;z-index:1000;padding:18px 0;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06);transition:var(--transition)}
.navbar.scrolled{padding:12px 0;box-shadow:var(--shadow-sm);background:rgba(255,255,255,.95)}
.nav-container{max-width:1280px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center}
.logo{display:flex;align-items:center;gap:12px;text-decoration:none}
.logo-icon{width:48px;height:48px;background:var(--gradient-main);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;box-shadow:var(--shadow-glow);transform:rotate(-5deg)}
.logo-text{display:flex;flex-direction:column;line-height:1.1}
.logo-text strong{font-family:'Playfair Display',serif;font-size:20px;font-weight:800;color:var(--accent)}
.logo-text span{font-size:11px;color:var(--secondary);font-weight:500;letter-spacing:.5px}
.nav-menu{display:flex;gap:8px;list-style:none;align-items:center}
.nav-menu a{color:var(--accent);text-decoration:none;font-weight:500;font-size:15px;padding:10px 18px;border-radius:50px;transition:var(--transition)}
.nav-menu a:hover{color:var(--secondary);background:rgba(0,0,0,.05)}
.nav-menu .nav-cta{background:var(--gradient-main);color:#fff;padding:10px 22px;margin-left:8px;box-shadow:var(--shadow-sm)}
.nav-menu .nav-cta:hover{transform:translateY(-2px);box-shadow:var(--shadow-glow);background:var(--gradient-accent);color:#fff}
.hamburger{display:none;background:none;border:none;cursor:pointer;width:44px;height:44px;position:relative;z-index:1001}
.hamburger span{display:block;width:26px;height:2px;background:var(--accent);margin:6px auto;transition:var(--transition);border-radius:2px}
.hamburger.active span:nth-child(1){transform:translateY(8px) rotate(45deg)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:translateY(-8px) rotate(-45deg)}
.hero{position:relative;min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background-image:url('${esc(c.heroImage)}');background-size:cover;background-position:center;z-index:-1}
.hero::after{content:'';position:absolute;inset:0;background:var(--gradient-hero);z-index:-1}
.hero-content{max-width:1280px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;width:100%}
.hero-text{color:#fff;animation:fadeInUp 1s ease}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.25);padding:8px 18px;border-radius:50px;font-size:13px;font-weight:500;margin-bottom:24px}
.hero-badge i{color:var(--gold)}
.hero h1{font-size:clamp(2.5rem,6vw,4.5rem);color:#fff;font-weight:800;margin-bottom:24px;text-shadow:0 4px 20px rgba(0,0,0,.3)}
.hero h1 span{color:var(--gold);display:inline-block;position:relative}
.hero h1 span::after{content:'';position:absolute;bottom:5px;left:0;width:100%;height:4px;background:var(--gold);border-radius:2px;opacity:.6}
.hero p{font-size:18px;margin-bottom:32px;opacity:.95;line-height:1.7;max-width:540px}
.hero-buttons{display:flex;gap:16px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;transition:var(--transition);border:none;cursor:pointer;font-family:inherit;white-space:nowrap}
.btn-primary{background:#fff;color:var(--accent);box-shadow:0 10px 30px rgba(0,0,0,.2)}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 15px 40px rgba(0,0,0,.3);background:var(--gold)}
.btn-secondary{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);color:#fff;border:2px solid rgba(255,255,255,.3)}
.btn-secondary:hover{background:rgba(255,255,255,.25);border-color:#fff;transform:translateY(-3px)}
.btn-gradient{background:var(--gradient-main);color:#fff;box-shadow:var(--shadow-glow)}
.btn-gradient:hover{background:var(--gradient-accent);transform:translateY(-3px)}
.hero-stats{display:flex;gap:32px;margin-top:48px;flex-wrap:wrap}
.hero-stat strong{font-size:32px;font-weight:800;color:var(--gold);font-family:'Playfair Display',serif;display:block}
.hero-stat span{font-size:13px;opacity:.9}
.hero-card{background:rgba(255,255,255,.1);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.25);border-radius:var(--radius-lg);padding:32px;color:#fff;animation:fadeInRight 1s ease;box-shadow:0 30px 60px rgba(0,0,0,.3)}
.hero-card-img{width:100%;height:280px;border-radius:var(--radius-md);background-image:url('${esc(c.heroCardImage || (c.gallery && c.gallery[0] && c.gallery[0].image) || '')}');background-size:cover;background-position:center;margin-bottom:24px;position:relative;overflow:hidden}
.hero-card-tag{position:absolute;top:16px;right:16px;background:var(--gold);color:var(--accent);padding:6px 14px;border-radius:50px;font-size:12px;font-weight:700;z-index:2}
.hero-card h3{color:#fff;font-size:24px;margin-bottom:8px}
.hero-card p{font-size:14px;opacity:.9;margin-bottom:20px}
.hero-card-row{display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid rgba(255,255,255,.2)}
.hero-card-price{font-size:28px;font-weight:800;color:var(--gold);font-family:'Playfair Display',serif}
.hero-card-price small{font-size:12px;opacity:.8;display:block;color:#fff;font-family:'Poppins',sans-serif;font-weight:400}
.section{padding:100px 0}
.section-header{text-align:center;max-width:700px;margin:0 auto 60px}
.section-tag{display:inline-block;background:var(--gradient-main);color:#fff;padding:6px 18px;border-radius:50px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px}
.section-header h2{font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:16px}
.section-header p{color:var(--text-muted);font-size:16px}
.about{background:var(--bg-white)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.about-images{position:relative;height:540px}
.about-img{position:absolute;border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-lg);background-size:cover;background-position:center}
.about-img-1{top:0;left:0;width:70%;height:70%;background-image:url('${esc(c.aboutImage1)}')}
.about-img-2{bottom:0;right:0;width:60%;height:55%;background-image:url('${esc(c.aboutImage2)}')}
.about-floating{position:absolute;top:40%;right:0;background:#fff;padding:24px;border-radius:var(--radius-md);box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:16px;z-index:2;transform:translateX(20px)}
.about-floating i{width:50px;height:50px;background:var(--gradient-main);color:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px}
.about-floating strong{display:block;font-size:22px;color:var(--accent);font-family:'Playfair Display',serif}
.about-floating span{font-size:12px;color:var(--text-muted)}
.about-content h2{font-size:clamp(1.8rem,3.5vw,2.5rem);margin-bottom:20px}
.about-content h2 span{color:var(--secondary)}
.about-content p{color:var(--text-muted);margin-bottom:20px;font-size:15px}
.about-features{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:32px 0}
.about-feature{display:flex;align-items:center;gap:12px;padding:14px 18px;background:var(--bg-light);border-radius:var(--radius-sm);border-left:4px solid var(--primary)}
.about-feature i{color:var(--secondary);font-size:18px}
.about-feature span{font-weight:600;font-size:14px;color:var(--accent)}
.signature{background:var(--bg-light);position:relative;overflow:hidden}
.signature::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:var(--gradient-main);border-radius:50%;opacity:.15;filter:blur(80px)}
.signature::after{content:'';position:absolute;bottom:-100px;left:-100px;width:400px;height:400px;background:var(--gradient-accent);border-radius:50%;opacity:.1;filter:blur(80px)}
.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;position:relative;z-index:1}
.signature-card{background:#fff;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-md);transition:var(--transition)}
.signature-card:hover{transform:translateY(-10px);box-shadow:var(--shadow-lg)}
.signature-card-img{height:280px;background-size:cover;background-position:center;position:relative;overflow:hidden}
.signature-card-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.4),transparent)}
.signature-card-tag{position:absolute;top:20px;left:20px;background:var(--gold);color:var(--accent);padding:6px 14px;border-radius:50px;font-size:12px;font-weight:700;z-index:2;display:flex;align-items:center;gap:6px}
.signature-card-content{padding:32px}
.signature-card h3{font-size:26px;margin-bottom:12px;color:var(--accent)}
.signature-card p{color:var(--text-muted);font-size:14px;margin-bottom:20px}
.signature-card ul{list-style:none;margin-bottom:24px}
.signature-card ul li{padding:8px 0;color:var(--text-dark);font-size:14px;display:flex;align-items:center;gap:10px}
.signature-card ul li i{color:var(--secondary);font-size:12px}
.signature-card-footer{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid var(--bg-light)}
.signature-price{font-family:'Playfair Display',serif;font-size:28px;font-weight:800;color:var(--secondary)}
.signature-price small{display:block;font-family:'Poppins',sans-serif;font-size:11px;color:var(--text-muted);font-weight:400}
.menu{background:var(--bg-white)}
.menu-tabs{display:flex;justify-content:center;gap:12px;margin-bottom:50px;flex-wrap:wrap}
.menu-tab{padding:12px 28px;background:var(--bg-light);color:var(--accent);border:2px solid transparent;border-radius:50px;cursor:pointer;font-weight:600;font-size:14px;transition:var(--transition);font-family:inherit;display:flex;align-items:center;gap:8px}
.menu-tab:hover{background:rgba(0,0,0,.05)}
.menu-tab.active{background:var(--gradient-main);color:#fff;box-shadow:var(--shadow-glow)}
.menu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}
.menu-card{background:var(--bg-light);border-radius:var(--radius-md);overflow:hidden;transition:var(--transition);display:none}
.menu-card.show{display:block;animation:fadeInUp .6s ease}
.menu-card:hover{transform:translateY(-8px);box-shadow:var(--shadow-md)}
.menu-card-img{height:220px;background-size:cover;background-position:center;position:relative;overflow:hidden}
.menu-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.menu-card:hover .menu-card-img img{transform:scale(1.1)}
.menu-card-badge{position:absolute;top:14px;left:14px;background:var(--accent);color:#fff;padding:5px 12px;border-radius:50px;font-size:11px;font-weight:600}
.menu-card-badge.hot{background:#ff4757}
.menu-card-content{padding:24px}
.menu-card h3{font-size:20px;margin-bottom:8px;color:var(--accent)}
.menu-card p{color:var(--text-muted);font-size:13px;margin-bottom:16px;min-height:40px}
.menu-card-footer{display:flex;justify-content:space-between;align-items:center;gap:12px}
.menu-price{font-family:'Playfair Display',serif;font-size:24px;font-weight:800;color:var(--secondary)}
.btn-order{background:var(--gradient-main);color:#fff;padding:10px 18px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;transition:var(--transition)}
.btn-order:hover{background:var(--gradient-accent);transform:translateY(-2px);box-shadow:var(--shadow-glow)}
.gallery{background:var(--bg-light)}
.gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:16px}
.gallery-item{border-radius:var(--radius-md);overflow:hidden;position:relative;cursor:pointer;background-size:cover;background-position:center;transition:var(--transition)}
.gallery-item:nth-child(1){grid-column:span 2;grid-row:span 2}
.gallery-item:nth-child(6){grid-column:span 2}
.gallery-item::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 0%,rgba(0,0,0,.7) 100%);opacity:0;transition:var(--transition)}
.gallery-item:hover::before{opacity:1}
.gallery-item:hover{transform:scale(1.02);box-shadow:var(--shadow-lg)}
.gallery-item-overlay{position:absolute;bottom:20px;left:20px;right:20px;color:#fff;transform:translateY(20px);opacity:0;transition:var(--transition);z-index:2}
.gallery-item:hover .gallery-item-overlay{transform:translateY(0);opacity:1}
.gallery-item-overlay h4{color:#fff;font-size:20px;margin-bottom:4px}
.gallery-item-overlay p{font-size:13px;opacity:.9}
.gallery-item-overlay i{position:absolute;top:0;right:0;width:40px;height:40px;background:#fff;color:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center}
.features{background:var(--bg-white)}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.feature-card{background:var(--bg-light);border-radius:var(--radius-md);padding:32px;text-align:center;transition:var(--transition);border:1px solid transparent}
.feature-card:hover{background:#fff;transform:translateY(-8px);box-shadow:var(--shadow-md)}
.feature-icon{width:70px;height:70px;background:var(--gradient-main);color:#fff;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;transition:var(--transition)}
.feature-card:hover .feature-icon{transform:scale(1.1) rotate(-5deg)}
.feature-card h3{font-size:18px;margin-bottom:10px;color:var(--accent)}
.feature-card p{color:var(--text-muted);font-size:13px}
.testimonials{background:var(--gradient-accent);color:#fff;position:relative;overflow:hidden}
.testimonials::before{content:'';position:absolute;top:-150px;left:-150px;width:400px;height:400px;background:var(--primary);border-radius:50%;opacity:.15;filter:blur(100px)}
.testimonials::after{content:'';position:absolute;bottom:-150px;right:-150px;width:400px;height:400px;background:var(--primary);border-radius:50%;opacity:.15;filter:blur(100px)}
.testimonials .section-tag{background:rgba(255,255,255,.15);backdrop-filter:blur(10px)}
.testimonials .section-header h2{color:#fff}
.testimonials .section-header p{color:rgba(255,255,255,.8)}
.testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;position:relative;z-index:1}
.testimonial-card{background:rgba(255,255,255,.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);border-radius:var(--radius-md);padding:32px;transition:var(--transition)}
.testimonial-card:hover{transform:translateY(-8px);background:rgba(255,255,255,.12)}
.testimonial-stars{color:var(--gold);margin-bottom:16px;font-size:16px}
.testimonial-text{font-size:15px;line-height:1.7;margin-bottom:24px;opacity:.95;font-style:italic}
.testimonial-author{display:flex;align-items:center;gap:14px}
.testimonial-avatar{width:50px;height:50px;border-radius:50%;background:var(--gradient-main);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#fff}
.testimonial-info h4{color:#fff;font-size:16px;margin-bottom:2px;font-family:'Poppins',sans-serif;font-weight:600}
.testimonial-info span{font-size:12px;opacity:.7}
.booking{background:var(--bg-light)}
.booking-wrapper{display:grid;grid-template-columns:1fr 1fr;gap:40px;background:#fff;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg)}
.booking-info{background:var(--gradient-accent);padding:50px;color:#fff;position:relative;overflow:hidden}
.booking-info h2{color:#fff;font-size:32px;margin-bottom:16px;position:relative}
.booking-info>p{opacity:.9;margin-bottom:32px;font-size:15px;position:relative}
.booking-hours{list-style:none;position:relative}
.booking-hours li{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.15);font-size:14px}
.booking-hours li:last-child{border-bottom:none}
.booking-hours li span:first-child{font-weight:600;display:flex;align-items:center;gap:10px}
.booking-form{padding:50px}
.booking-form h3{font-size:26px;margin-bottom:8px}
.booking-form>p{color:var(--text-muted);font-size:14px;margin-bottom:32px}
.form-group{margin-bottom:18px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-group label{display:block;font-size:13px;font-weight:600;color:var(--accent);margin-bottom:8px}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:14px 18px;border:2px solid var(--bg-light);border-radius:var(--radius-sm);font-family:inherit;font-size:14px;color:var(--text-dark);background:var(--bg-light);transition:var(--transition)}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--primary);background:#fff;box-shadow:0 0 0 4px rgba(0,0,0,.06)}
.form-group input.error{border-color:#ff4757}
.form-error{color:#ff4757;font-size:12px;margin-top:4px;display:none}
.form-group textarea{resize:vertical;min-height:100px}
.btn-submit{width:100%;background:var(--gradient-main);color:#fff;padding:16px;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;transition:var(--transition);font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:var(--shadow-glow)}
.btn-submit:hover{background:var(--gradient-accent);transform:translateY(-2px)}
.form-message{padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;display:none;align-items:center;gap:10px;font-size:14px}
.form-message.show{display:flex}
.form-message.success{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.form-message.error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.contact{background:var(--bg-white)}
.contact-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:40px}
.contact-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.contact-card{background:var(--bg-light);padding:24px;border-radius:var(--radius-md);transition:var(--transition);border-left:4px solid var(--primary)}
.contact-card:hover{background:#fff;box-shadow:var(--shadow-md);transform:translateY(-4px)}
.contact-card i{width:44px;height:44px;background:var(--gradient-main);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px}
.contact-card h4{font-size:14px;color:var(--accent);margin-bottom:6px;font-family:'Poppins',sans-serif;font-weight:600}
.contact-card p,.contact-card a{color:var(--text-muted);font-size:13px;text-decoration:none;display:block;word-break:break-word}
.contact-social{display:flex;gap:12px}
.contact-social a{width:44px;height:44px;background:var(--bg-light);color:var(--accent);border-radius:12px;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:var(--transition)}
.contact-social a:hover{background:var(--gradient-main);color:#fff;transform:translateY(-3px)}
.contact-map{border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-md);height:100%;min-height:480px}
.contact-map iframe{width:100%;height:100%;border:none}
.cta-section{background:var(--gradient-accent);padding:80px 0;text-align:center;color:#fff;position:relative;overflow:hidden}
.cta-section::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:var(--primary);border-radius:50%;opacity:.15;filter:blur(120px)}
.cta-section h2{color:#fff;font-size:clamp(1.8rem,3.5vw,2.5rem);margin-bottom:20px;max-width:800px;margin-left:auto;margin-right:auto;position:relative}
.cta-section p{max-width:700px;margin:0 auto 32px;opacity:.95;font-size:16px;position:relative}
.cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
.footer{background:var(--accent-dark);color:#fff;padding:60px 0 0}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px}
.footer-brand .logo-text strong{color:#fff}
.footer-brand p{opacity:.7;font-size:14px;margin-bottom:20px}
.footer h4{color:#fff;font-size:16px;margin-bottom:20px;font-family:'Poppins',sans-serif;font-weight:600}
.footer ul{list-style:none}
.footer ul li{margin-bottom:10px}
.footer ul a{color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;transition:var(--transition);display:inline-flex;align-items:center;gap:8px}
.footer ul a:hover{color:var(--primary-light);transform:translateX(4px)}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding:24px 0;text-align:center;font-size:13px;opacity:.7}
.whatsapp-float{position:fixed;bottom:30px;right:30px;width:60px;height:60px;background:#25d366;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;text-decoration:none;box-shadow:0 10px 30px rgba(37,211,102,.4);z-index:999;transition:var(--transition);animation:pulse 2s infinite}
.whatsapp-float:hover{transform:scale(1.1);background:#1ebe57}
.back-to-top{position:fixed;bottom:30px;right:105px;width:50px;height:50px;background:var(--gradient-main);color:#fff;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:var(--shadow-glow);z-index:999;cursor:pointer;opacity:0;visibility:hidden;transition:var(--transition)}
.back-to-top.visible{opacity:1;visibility:visible}
.back-to-top:hover{transform:translateY(-4px);background:var(--gradient-accent)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.5)}70%{box-shadow:0 0 0 20px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
.reveal{opacity:0;transform:translateY(40px);transition:opacity .8s ease,transform .8s ease}
.reveal.active{opacity:1;transform:translateY(0)}
@media(max-width:1024px){.hero-content{grid-template-columns:1fr;gap:40px}.about-grid,.signature-grid,.booking-wrapper,.contact-grid{grid-template-columns:1fr;gap:40px}.about-images{height:400px;max-width:500px;margin:0 auto}.footer-grid{grid-template-columns:1fr 1fr}}
@media(max-width:768px){.nav-menu{position:fixed;top:0;right:-100%;width:80%;max-width:320px;height:100vh;background:#fff;flex-direction:column;padding:100px 30px 30px;box-shadow:-10px 0 30px rgba(0,0,0,.15);transition:right .4s ease;align-items:stretch;gap:6px}.nav-menu.active{right:0}.nav-menu a{padding:14px 18px;border-radius:var(--radius-sm)}.nav-menu .nav-cta{margin-left:0;margin-top:12px;text-align:center;justify-content:center}.hamburger{display:block}.gallery-grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:180px}.gallery-item:nth-child(1){grid-column:span 2}.gallery-item:nth-child(6){grid-column:span 1}.booking-info,.booking-form{padding:32px 24px}.form-row{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr;gap:30px}.whatsapp-float{bottom:20px;right:20px;width:54px;height:54px;font-size:26px}.back-to-top{right:84px;bottom:20px;width:44px;height:44px}}
@media(max-width:480px){.section{padding:70px 0}.hero{padding:100px 0 60px}.hero-stats{gap:24px}.hero-stat strong{font-size:26px}.contact-cards{grid-template-columns:1fr}.about-features{grid-template-columns:1fr}.gallery-grid{grid-template-columns:1fr}.gallery-item:nth-child(1){grid-column:span 1}.menu-grid{grid-template-columns:1fr}.hero-buttons{flex-direction:column;width:100%}.btn{width:100%;justify-content:center}}
</style>
</head>
<body>
<nav class="navbar" id="navbar"><div class="nav-container">
<a href="#" class="logo"><div class="logo-icon"><i class="${icon}"></i></div><div class="logo-text"><strong>${name}</strong><span>${esc(tagline)}</span></div></a>
<ul class="nav-menu" id="navMenu">
<li><a href="#home">Utama</a></li><li><a href="#about">Tentang</a></li><li><a href="#menu">Menu</a></li><li><a href="#gallery">Galeri</a></li><li><a href="#booking">Tempahan</a></li><li><a href="#contact">Hubungi</a></li>
<li><a href="https://wa.me/${wa}" class="nav-cta" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a></li>
</ul>
<button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</div></nav>

<header class="hero" id="home"><div class="hero-content">
<div class="hero-text">
<div class="hero-badge"><i class="${icon}"></i> ${esc(c.heroBadge || tagline)}</div>
<h1>${esc(c.heroTitle || name)} <span>${esc(c.heroHighlight || '')}</span></h1>
<p>${esc(c.heroDescription || biz.description || '')}</p>
<div class="hero-buttons">
<a href="#booking" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Tempah Sekarang</a>
<a href="https://wa.me/${wa}" class="btn btn-secondary" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Hubungi Kami</a>
</div>
<div class="hero-stats">
<div class="hero-stat"><strong>${esc((c.stats && c.stats[0]) || '10+')}</strong><span>Tahun Pengalaman</span></div>
<div class="hero-stat"><strong>${esc((c.stats && c.stats[1]) || '5K+')}</strong><span>Pelanggan Gembira</span></div>
<div class="hero-stat"><strong>${esc((c.stats && c.stats[2]) || '4.9★')}</strong><span>Penilaian</span></div>
</div>
</div>
${c.heroCard ? `<div class="hero-card">
<div class="hero-card-img"><div class="hero-card-tag"><i class="fas fa-crown"></i> ${esc(c.heroCard.tag || 'Wajib Cuba')}</div></div>
<h3>${esc(c.heroCard.name)}</h3><p>${esc(c.heroCard.description)}</p>
<div class="hero-card-row"><div class="hero-card-price">${esc(c.heroCard.price)}<small>${esc(c.heroCard.priceNote || 'Mulai Harga')}</small></div>
<a href="https://wa.me/${wa}?text=${encodeURIComponent('Saya nak order ' + (c.heroCard.name || ''))}" class="btn-order" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Order</a></div>
</div>` : ''}
</div></header>

<section class="section about" id="about"><div class="container"><div class="about-grid">
<div class="about-images reveal">
<div class="about-img about-img-1"></div><div class="about-img about-img-2"></div>
<div class="about-floating"><i class="fas fa-award"></i><div><strong>${esc((c.stats && c.stats[0]) || '10+')}</strong><span>Tahun Pengalaman</span></div></div>
</div>
<div class="about-content reveal">
<div class="section-tag">Tentang Kami</div>
<h2>${esc(c.aboutTitle || 'Kisah')} <span>${name}</span></h2>
<p>${esc(c.aboutText1 || biz.description || '')}</p>
<p>${esc(c.aboutText2 || '')}</p>
<div class="about-features">${(c.aboutFeatures || []).map(f => `<div class="about-feature"><i class="${esc(f.icon || 'fas fa-check')}"></i><span>${esc(f.text)}</span></div>`).join('')}</div>
<a href="#menu" class="btn btn-gradient"><i class="fas fa-book-open"></i> Lihat Menu Kami</a>
</div>
</div></div></section>

<section class="section signature" id="signature"><div class="container">
<div class="section-header reveal"><div class="section-tag">Menu Signatur</div><h2>Hidangan Wajib Cuba</h2><p>Dua hidangan ikonik kami yang menjadi tarikan utama</p></div>
<div class="signature-grid">${sigCards}</div>
</div></section>

<section class="section menu" id="menu"><div class="container">
<div class="section-header reveal"><div class="section-tag">Menu Pilihan</div><h2>Pelbagai Hidangan Istimewa</h2><p>Jelajahi menu kami yang pelbagai</p></div>
<div class="menu-tabs reveal">${tabs}</div>
<div class="menu-grid" id="menuGrid">${menuCards}</div>
</div></section>

<section class="section gallery" id="gallery"><div class="container">
<div class="section-header reveal"><div class="section-tag">Galeri</div><h2>Keindahan & Suasana</h2><p>Lihat sendiri keunikan kami</p></div>
<div class="gallery-grid reveal">${gallery}</div>
</div></section>

<section class="section features"><div class="container">
<div class="section-header reveal"><div class="section-tag">Kelebihan Kami</div><h2>Mengapa Pilih ${name}?</h2></div>
<div class="features-grid">${features}</div>
</div></section>

<section class="section testimonials" id="testimonials"><div class="container">
<div class="section-header reveal"><div class="section-tag">Testimoni</div><h2>Apa Kata Pelanggan Kami</h2></div>
<div class="testimonials-grid">${testimonials}</div>
</div></section>

<section class="section booking" id="booking"><div class="container">
<div class="section-header reveal"><div class="section-tag">Tempahan</div><h2>Tempah Meja Anda</h2></div>
<div class="booking-wrapper reveal">
<div class="booking-info">
<h2>Maklumat <span style="color:var(--gold)">Tempahan</span></h2>
<p>Sila isi borang di sebelah atau hubungi kami melalui WhatsApp.</p>
<ul class="booking-hours">
<li><span><i class="fas fa-clock"></i> Isnin - Khamis</span><span>11:00 AM - 10:00 PM</span></li>
<li><span><i class="fas fa-clock"></i> Jumaat - Ahad</span><span>11:00 AM - 11:00 PM</span></li>
<li><span><i class="fas fa-phone"></i> Telefon</span><span>${esc(biz.phone || '012-345 6789')}</span></li>
<li><span><i class="fab fa-whatsapp"></i> WhatsApp</span><span>${esc(biz.phone || '011-2567 0105')}</span></li>
</ul>
</div>
<div class="booking-form">
<h3>Borang Tempahan</h3><p>Sila lengkapkan maklumat di bawah.</p>
<div class="form-message" id="formMessage"><i class="fas fa-check-circle"></i><span id="formMessageText"></span></div>
<form id="bookingForm" novalidate>
<div class="form-row">
<div class="form-group"><label for="name">Nama Penuh *</label><input type="text" id="name" placeholder="Nama anda" required><div class="form-error">Sila masukkan nama anda</div></div>
<div class="form-group"><label for="phone">No. Telefon *</label><input type="tel" id="phone" placeholder="012-3456789" required><div class="form-error">Sila masukkan nombor yang sah</div></div>
</div>
<div class="form-row">
<div class="form-group"><label for="date">Tarikh *</label><input type="date" id="date" required><div class="form-error">Sila pilih tarikh</div></div>
<div class="form-group"><label for="time">Masa *</label><input type="time" id="time" required><div class="form-error">Sila pilih masa</div></div>
</div>
<div class="form-row">
<div class="form-group"><label for="pax">Bilangan Orang *</label><select id="pax" required><option value="">Pilih</option><option>1-2 orang</option><option>3-4 orang</option><option>5-8 orang</option><option>9-12 orang</option><option>12+ orang</option></select><div class="form-error">Sila pilih bilangan</div></div>
<div class="form-group"><label for="seating">Tempat Duduk</label><select id="seating"><option>Biasa</option><option>Outdoor</option><option>VIP</option></select></div>
</div>
<div class="form-group"><label for="notes">Catatan Khas</label><textarea id="notes" placeholder="Permintaan khas..."></textarea></div>
<button type="submit" class="btn-submit"><i class="fas fa-paper-plane"></i> Hantar Tempahan</button>
</form>
</div>
</div>
</div></section>

<section class="section contact" id="contact"><div class="container">
<div class="section-header reveal"><div class="section-tag">Hubungi Kami</div><h2>Lokasi & Maklumat</h2></div>
<div class="contact-grid">
<div class="reveal">
<div class="contact-cards">
<div class="contact-card"><i class="fas fa-map-marker-alt"></i><h4>Alamat</h4><p>${esc(biz.address || biz.location || 'Malaysia')}</p></div>
<div class="contact-card"><i class="fas fa-phone-alt"></i><h4>Telefon</h4><a href="tel:${esc((biz.phone || '').replace(/\\D/g, ''))}">${esc(biz.phone || '012-345 6789')}</a></div>
<div class="contact-card"><i class="fab fa-whatsapp"></i><h4>WhatsApp</h4><a href="https://wa.me/${wa}" target="_blank" rel="noopener">${esc(biz.phone || '011-2567 0105')}</a></div>
<div class="contact-card"><i class="fas fa-envelope"></i><h4>Email</h4><a href="mailto:${esc(biz.email || 'info@example.com')}">${esc(biz.email || 'info@example.com')}</a></div>
</div>
<div class="contact-social">
<a href="https://wa.me/${wa}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
<a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
<a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
<a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
</div>
</div>
<div class="contact-map reveal"><iframe src="https://www.google.com/maps?q=${encodeURIComponent(biz.location || 'Malaysia')}&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Lokasi"></iframe></div>
</div>
</div></section>

<section class="cta-section"><div class="container">
<h2 class="reveal">${esc(c.ctaTitle || 'Teringin Mencuba?')}</h2>
<p class="reveal">${esc(c.ctaText || 'Hubungi kami sekarang untuk pengalaman terbaik!')}</p>
<div class="cta-buttons reveal">
<a href="https://wa.me/${wa}" class="btn btn-primary" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Tempah Sekarang</a>
<a href="tel:${esc((biz.phone || '').replace(/\\D/g, ''))}" class="btn btn-secondary"><i class="fas fa-phone"></i> Hubungi Kami</a>
</div>
</div></section>

<footer class="footer"><div class="container">
<div class="footer-grid">
<div class="footer-brand">
<a href="#" class="logo"><div class="logo-icon"><i class="${icon}"></i></div><div class="logo-text"><strong>${name}</strong><span>${esc(tagline)}</span></div></a>
<p>${esc(biz.description || '')}</p>
<div class="contact-social"><a href="https://wa.me/${wa}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a><a href="#"><i class="fab fa-facebook-f"></i></a><a href="#"><i class="fab fa-instagram"></i></a><a href="#"><i class="fab fa-tiktok"></i></a></div>
</div>
<div><h4>Pautan Pantas</h4><ul>
<li><a href="#home"><i class="fas fa-chevron-right"></i> Utama</a></li>
<li><a href="#about"><i class="fas fa-chevron-right"></i> Tentang</a></li>
<li><a href="#menu"><i class="fas fa-chevron-right"></i> Menu</a></li>
<li><a href="#gallery"><i class="fas fa-chevron-right"></i> Galeri</a></li>
<li><a href="#booking"><i class="fas fa-chevron-right"></i> Tempahan</a></li>
</ul></div>
<div><h4>Hubungi Kami</h4><ul>
<li><a href="tel:${esc((biz.phone || '').replace(/\\D/g, ''))}"><i class="fas fa-phone"></i> ${esc(biz.phone || '')}</a></li>
<li><a href="https://wa.me/${wa}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a></li>
<li><a href="mailto:${esc(biz.email || '')}"><i class="fas fa-envelope"></i> ${esc(biz.email || '')}</a></li>
</ul></div>
<div><h4>Waktu Operasi</h4><ul>
<li><a href="#"><i class="fas fa-clock"></i> Isnin - Khamis</a></li>
<li><a href="#" style="padding-left:24px;font-size:13px">11:00 AM - 10:00 PM</a></li>
<li><a href="#"><i class="fas fa-clock"></i> Jumaat - Ahad</a></li>
<li><a href="#" style="padding-left:24px;font-size:13px">11:00 AM - 11:00 PM</a></li>
</ul></div>
</div>
<div class="footer-bottom"><p>&copy; 2026 <strong>${name}</strong>. Hak Cipta Terpelihara.</p></div>
</div></footer>

<a href="https://wa.me/${wa}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
<button class="back-to-top" id="backToTop" aria-label="Ke atas"><i class="fas fa-arrow-up"></i></button>

<script>
const navbar=document.getElementById('navbar'),backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',scrollY>50);backToTop.classList.toggle('visible',scrollY>500)});
const hamburger=document.getElementById('hamburger'),navMenu=document.getElementById('navMenu');
hamburger.addEventListener('click',()=>{hamburger.classList.toggle('active');navMenu.classList.toggle('active')});
document.querySelectorAll('.nav-menu a').forEach(l=>l.addEventListener('click',()=>{hamburger.classList.remove('active');navMenu.classList.remove('active')}));
document.addEventListener('click',e=>{if(!navMenu.contains(e.target)&&!hamburger.contains(e.target)){hamburger.classList.remove('active');navMenu.classList.remove('active')}});
backToTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){const t=document.querySelector(this.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));
document.querySelectorAll('.menu-tab').forEach(t=>t.addEventListener('click',()=>{
document.querySelectorAll('.menu-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
const c=t.dataset.category;
document.querySelectorAll('.menu-card').forEach((card,i)=>{if(card.dataset.category===c){setTimeout(()=>card.classList.add('show'),i*60)}else{card.classList.remove('show')}})}));
const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('active');obs.unobserve(x.target)}}),{threshold:.1,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
document.getElementById('date').min=new Date().toISOString().split('T')[0];
const form=document.getElementById('bookingForm'),msg=document.getElementById('formMessage'),msgText=document.getElementById('formMessageText');
form.addEventListener('submit',e=>{e.preventDefault();
const v=id=>document.getElementById(id).value.trim();
let ok=true;
['name','phone','date','time','pax'].forEach(f=>{const el=document.getElementById(f),err=el.parentElement.querySelector('.form-error');
if(!v(f)){el.classList.add('error');err.style.display='block';ok=false}else{el.classList.remove('error');err.style.display='none'}});
if(!ok){msg.className='form-message show error';msgText.textContent='Sila lengkapkan semua medan.';setTimeout(()=>msg.classList.remove('show'),3000);return}
const m='${'Tempahan Meja - '}${name}\\nNama: '+v('name')+'\\nTelefon: '+v('phone')+'\\nTarikh: '+v('date')+'\\nMasa: '+v('time')+'\\nBilangan: '+v('pax')+'\\nCatatan: '+(v('notes')||'-');
msg.className='form-message show success';msgText.textContent='Tempahan dihantar! Dialihkan ke WhatsApp...';
setTimeout(()=>window.open('https://wa.me/${wa}?text='+encodeURIComponent(m),'_blank'),1500);
setTimeout(()=>{form.reset();msg.classList.remove('show')},4000)});
['name','phone','date','time','pax'].forEach(f=>{const el=document.getElementById(f);el.addEventListener('input',()=>{el.classList.remove('error');const e=el.parentElement.querySelector('.form-error');if(e)e.style.display='none'})});
document.querySelectorAll('.gallery-item').forEach(i=>i.addEventListener('click',()=>{const bg=i.style.backgroundImage;if(bg)window.open(bg.replace(/^url\\(['"]?/,'').replace(/['"]?\\)$/,''),'_blank')}));
</script>
</body>
</html>`;
}
