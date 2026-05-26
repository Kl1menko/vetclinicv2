import { getDb } from '../lib/db.js';
import { cors, err } from '../lib/cors.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return err(res, 405, 'Method not allowed');

  const db = getDb();
  const { data, error } = await db
    .from('services')
    .select('id, name, price, duration_min, description')
    .order('name');

  if (error) return err(res, 500, 'Не вдалося завантажити послуги');
  return res.status(200).json(data ?? []);
}
