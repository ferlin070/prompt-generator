import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com https://www.gstatic.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "connect-src 'self' https://cloudflareinsights.com https://unpkg.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percubaan. Sila cuba semula kemudian.' },
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Sila cuba semula kemudian.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

const API_DIR = path.join(__dirname, 'api');
const handlers = {};
for (const file of fs.readdirSync(API_DIR)) {
  if (!file.endsWith('.js')) continue;
  const name = file.slice(0, -3);
  handlers[name] = await import(path.join(API_DIR, file));
}

async function invoke(method, req, res) {
  const handler = handlers[req.params.name];
  if (!handler) {
    return res.status(404).json({ error: 'Not found' });
  }
  const fn = handler[method];
  if (!fn) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else headers.append(k, v);
  }
  if (req.headers['content-type']?.includes('application/json') && req.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  let body;
  if (method === 'GET' || method === 'DELETE' || method === 'HEAD') {
    body = undefined;
  } else if (req.headers['content-type']?.includes('application/json')) {
    body = JSON.stringify(req.body ?? {});
  } else {
    body = req.body;
  }

  const webReq = new Request(url, { method, headers, body });
  try {
    const webRes = await fn(webReq);
    res.status(webRes.status);
    for (const [k, v] of webRes.headers.entries()) res.setHeader(k, v);
    const text = await webRes.text();
    res.send(text);
  } catch (err) {
    console.error(`[api/${req.params.name}]`, err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
}

app.get('/api/:name', (req, res) => invoke('GET', req, res));
app.post('/api/:name', (req, res) => invoke('POST', req, res));
app.put('/api/:name', (req, res) => invoke('PUT', req, res));
app.delete('/api/:name', (req, res) => invoke('DELETE', req, res));

app.use(express.static(__dirname, {
  index: 'index.html',
  extensions: ['html'],
}));

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Prompt Generator running on http://localhost:${PORT}`);
});
