import { cors, err } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return err(res, 405, 'Method not allowed');

  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();
  const q = String(req.query.q || '').trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  let query = db.from('users').select('id, name, role, email, phone').neq('id', user.id).limit(limit);

  if (user.role === 'client') {
    query = query.in('role', ['doctor', 'receptionist', 'admin']);
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await query.order('name', { ascending: true });
  if (error) return err(res, 500, 'Не вдалося завантажити список користувачів');

  return res.status(200).json({ users: data || [] });
}
