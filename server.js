import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '5mb' }));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Prompt Generator running on http://localhost:${PORT}`);
});
