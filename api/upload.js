import { sql } from '../lib/db.js';
import { getAuthUser, json } from '../lib/auth.js';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://192.168.1.218:8000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'websites-media';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya gambar dibenarkan'));
  },
});

export const config = { api: { bodyParser: false } };

async function uploadToStorage(buffer, path, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Storage upload failed: ${err.slice(0, 200)}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function deleteFromStorage(path) {
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` },
  });
}

export async function GET(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('websiteId');
    const { rows } = await sql`SELECT id, filename, public_url, mime_type, size_bytes, width, height, created_at
      FROM media_assets WHERE user_id = ${auth.userId}
      ${websiteId ? sql`AND (website_id = ${websiteId} OR website_id IS NULL)` : sql``}
      ORDER BY created_at DESC LIMIT 100`;
    return json({ files: rows });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

export async function POST(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  return new Promise((resolve) => {
    multerUpload(request, resolve);
  }).then(async () => {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('websiteId') || request.body.websiteId;
    const files = request.files || [];
    if (!files.length) return json({ error: 'Tiada fail diupload' }, 400);

    const results = [];
    for (const file of files) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      const rand = crypto.randomBytes(4).toString('hex');
      const path = `${auth.userId}/${rand}.${ext === 'jpg' ? 'jpg' : 'webp'}`;

      const processed = ext === 'gif'
        ? file.buffer
        : await sharp(file.buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

      const finalExt = ext === 'gif' ? ext : 'webp';
      const finalPath = `${auth.userId}/${rand}.${finalExt}`;
      const contentType = ext === 'gif' ? 'image/gif' : 'image/webp';

      const publicUrl = await uploadToStorage(processed, finalPath, contentType);
      const metadata = await sharp(processed).metadata();

      const { rows } = await sql`INSERT INTO media_assets (user_id, website_id, filename, storage_path, public_url, mime_type, size_bytes, width, height)
        VALUES (${auth.userId}, ${websiteId || null}, ${file.originalname}, ${finalPath}, ${publicUrl}, ${contentType}, ${processed.length}, ${metadata.width || 0}, ${metadata.height || 0})
        RETURNING id, filename, public_url, mime_type, size_bytes, width, height`;

      results.push(rows[0]);
    }

    return json({ files: results }, 201);
  }).catch(err => json({ error: err.message }, 500));
}

const multerUpload = (req, resolve) => {
  upload.array('files', 10)(req, {}, (err) => {
    if (err) resolve(json({ error: err.message }, 400));
    resolve();
  });
};

export async function DELETE(request) {
  const auth = getAuthUser(request);
  if (!auth) return json({ error: 'Unauthorized' }, 401);
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'id required' }, 400);

    const { rows } = await sql`SELECT storage_path FROM media_assets WHERE id = ${id} AND user_id = ${auth.userId}`;
    if (rows.length === 0) return json({ error: 'Not found' }, 404);

    await deleteFromStorage(rows[0].storage_path);
    await sql`DELETE FROM media_assets WHERE id = ${id} AND user_id = ${auth.userId}`;
    return json({ success: true });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
