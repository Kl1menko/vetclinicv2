import { getDb } from '../../../lib/db.js';
import { verifyAccess } from '../../../lib/jwt.js';
import { cors, err, readBody } from '../../../lib/cors.js';

const clean = (v) => String(v || '').trim();
const asNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

async function authUser(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    err(res, 401, 'Unauthorized');
    return null;
  }
  try {
    return await verifyAccess(token);
  } catch {
    err(res, 401, 'Invalid token');
    return null;
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const payload = await authUser(req, res);
  if (!payload?.sub) return;

  const db = getDb();

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('pets')
      .select('id, owner_user_id, name, species, breed, birth_date, age, weight, alerts, last_visit, sterilized, created_at, updated_at')
      .eq('owner_user_id', payload.sub)
      .order('created_at', { ascending: false });
    if (error) return err(res, 500, 'Не вдалося завантажити тварин');
    return res.status(200).json({ pets: data || [] });
  }

  if (req.method === 'POST') {
    let body;
    try { body = await readBody(req); }
    catch { return err(res, 400, 'Invalid JSON'); }

    const name = clean(body.name);
    if (!name) return err(res, 400, 'Вкажіть кличку тварини.');

    const payloadRow = {
      owner_user_id: payload.sub,
      name,
      species: clean(body.species) || null,
      breed: clean(body.breed) || null,
      birth_date: clean(body.birthDate) || null,
      age: asNumber(body.age, 0),
      weight: asNumber(body.weight, 0),
      alerts: Array.isArray(body.alerts) ? body.alerts.map(clean).filter(Boolean) : [],
      last_visit: clean(body.lastVisit) || null,
      sterilized: Boolean(body.sterilized),
    };

    const { data, error } = await db
      .from('pets')
      .insert(payloadRow)
      .select('id, owner_user_id, name, species, breed, birth_date, age, weight, alerts, last_visit, sterilized, created_at, updated_at')
      .single();

    if (error) return err(res, 500, 'Не вдалося зберегти тварину');
    return res.status(200).json({ pet: data });
  }

  return err(res, 405, 'Method not allowed');
}
