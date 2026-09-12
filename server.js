import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com https://www.gstatic.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "connect-src 'self' https://cloudflareinsights.com https://unpkg.com https://app.grapesjs.com",
    "frame-ancestors 'self'",
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

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Had janaan AI: 5 website sejam. Sila cuba kemudian.' },
});
app.use('/api/generate', generateLimiter);

const pgPool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 5,
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

app.get('/site/:slug', async (req, res) => {
  try {
    const { rows } = await pgPool.query('SELECT html_content FROM websites WHERE slug = $1 AND status = $2', [req.params.slug, 'published']);
    if (rows.length === 0) return res.status(404).sendFile(path.join(__dirname, '404.html'));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(rows[0].html_content);
  } catch (err) {
    console.error('[/site/:slug]', err.message);
    res.status(500).sendFile(path.join(__dirname, '404.html'));
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya gambar dibenarkan'));
  },
});

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://192.168.1.218:8000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'websites-media';

async function uploadToStorage(buffer, storagePath, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${(await res.text()).slice(0, 200)}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

async function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const jwt = (await import('jsonwebtoken')).default;
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch { return null; }
}

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  const auth = await verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'Tiada fail diupload' });

  const websiteId = req.body.websiteId || null;
  const results = [];
  for (const file of files) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const rand = crypto.randomBytes(4).toString('hex');
    const isGif = ext === 'gif';
    const processed = isGif ? file.buffer : await sharp(file.buffer).resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    const finalExt = isGif ? 'gif' : 'webp';
    const finalPath = `${auth.userId}/${rand}.${finalExt}`;
    const contentType = isGif ? 'image/gif' : 'image/webp';
    const publicUrl = await uploadToStorage(processed, finalPath, contentType);
    const metadata = isGif ? { width: 0, height: 0 } : await sharp(processed).metadata();
    const { rows } = await pgPool.query(
      'INSERT INTO media_assets (user_id, website_id, filename, storage_path, public_url, mime_type, size_bytes, width, height) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, filename, public_url, mime_type, size_bytes, width, height',
      [auth.userId, websiteId, file.originalname, finalPath, publicUrl, contentType, processed.length, metadata.width || 0, metadata.height || 0]
    );
    results.push(rows[0]);
  }
  res.status(201).json({ files: results });
});

app.get('/api/upload/media', async (req, res) => {
  const auth = await verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const websiteId = req.query.websiteId;
  const { rows } = await pgPool.query(
    websiteId
      ? 'SELECT id, filename, public_url, mime_type, size_bytes, width, height, created_at FROM media_assets WHERE user_id = $1 AND (website_id = $2 OR website_id IS NULL) ORDER BY created_at DESC LIMIT 100'
      : 'SELECT id, filename, public_url, mime_type, size_bytes, width, height, created_at FROM media_assets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    websiteId ? [auth.userId, websiteId] : [auth.userId]
  );
  res.json({ files: rows });
});

app.delete('/api/upload/media', async (req, res) => {
  const auth = await verifyToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'id required' });
  const { rows } = await pgPool.query('SELECT storage_path FROM media_assets WHERE id = $1 AND user_id = $2', [id, auth.userId]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${rows[0].storage_path}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } });
  await pgPool.query('DELETE FROM media_assets WHERE id = $1 AND user_id = $2', [id, auth.userId]);
  res.json({ success: true });
});

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
