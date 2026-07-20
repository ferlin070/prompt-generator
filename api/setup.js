import { sql } from '../lib/db.js';
import { json } from '../lib/auth.js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await sql.unsafe(stmt);
    }
    return json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
