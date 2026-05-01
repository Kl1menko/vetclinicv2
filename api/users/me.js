import { getDb } from '../_lib/db.js';
import { verifyAccess } from '../_lib/jwt.js';
import { cors, err, readBody } from '../_lib/cors.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'PATCH') return err(res, 405, 'Method not allowed');

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return err(res, 401, 'Unauthorized');

  let payload;
  try { payload = await verifyAccess(token); }
  catch { return err(res, 401, 'Invalid token'); }

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { name, email, phone } = body;
  const patch = {};
  if (name?.trim()) patch.name = name.trim();
  if (email?.trim()) patch.email = email.trim().toLowerCase();
  if (phone?.trim()) patch.phone = phone.trim();

  if (!Object.keys(patch).length) return err(res, 400, 'Нічого оновлювати');

  const db = getDb();
  const { data: user, error } = await db
    .from('users')
    .update(patch)
    .eq('id', payload.sub)
    .select('id, name, email, phone, role, created_at')
    .single();

  if (error) return err(res, 500, 'Помилка збереження');
  res.status(200).json({ user });
}
