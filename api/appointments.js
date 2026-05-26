import { getDb } from '../lib/db.js';
import { verifyAccess } from '../lib/jwt.js';
import { cors, err, readBody } from '../lib/cors.js';

const clean = (v) => String(v || '').trim();

async function authUser(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) { err(res, 401, 'Unauthorized'); return null; }
  try {
    return await verifyAccess(token);
  } catch {
    err(res, 401, 'Invalid token');
    return null;
  }
}

const APPOINTMENT_SELECT = `
  id, client_id, doctor_id, pet_id, service_id,
  date, time, status, payment_status, notes,
  created_at, updated_at,
  pet:pets(id, name, species, breed),
  service:services(id, name, price, duration_min),
  client:users!client_id(id, name, email, phone)
`.trim();

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const payload = await authUser(req, res);
  if (!payload?.sub) return;

  const db = getDb();
  const isStaff = payload.role === 'doctor' || payload.role === 'admin';

  // GET /api/appointments or /api/appointments?id=<id>
  if (req.method === 'GET') {
    const appointmentId = clean(req.query?.id);

    // Single appointment
    if (appointmentId) {
      const { data, error } = await db
        .from('appointments')
        .select(APPOINTMENT_SELECT)
        .eq('id', appointmentId)
        .single();
      if (error) return err(res, 404, 'Запис не знайдено');
      // clients can only see their own
      if (!isStaff && data.client_id !== payload.sub) return err(res, 403, 'Forbidden');
      return res.status(200).json(data);
    }

    // List
    let q = db.from('appointments').select(APPOINTMENT_SELECT);

    if (!isStaff) {
      q = q.eq('client_id', payload.sub);
    } else {
      if (req.query?.clientId) q = q.eq('client_id', clean(req.query.clientId));
      if (req.query?.doctorId) q = q.eq('doctor_id', clean(req.query.doctorId));
    }

    if (req.query?.status) q = q.eq('status', clean(req.query.status));
    if (req.query?.date) q = q.eq('date', clean(req.query.date));

    q = q.order('date', { ascending: true }).order('time', { ascending: true });

    const { data, error } = await q;
    if (error) return err(res, 500, 'Не вдалося завантажити записи');
    return res.status(200).json(data ?? []);
  }

  // POST /api/appointments — create
  if (req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }

    const pet_id = clean(body.pet_id);
    const service_id = clean(body.service_id);
    const date = clean(body.date);
    const time = clean(body.time);

    if (!pet_id) return err(res, 400, 'Вкажіть тварину');
    if (!service_id) return err(res, 400, 'Вкажіть послугу');
    if (!date) return err(res, 400, 'Вкажіть дату');
    if (!time) return err(res, 400, 'Вкажіть час');

    const clientId = isStaff && body.client_id ? clean(body.client_id) : payload.sub;

    const { data, error } = await db
      .from('appointments')
      .insert({
        client_id: clientId,
        pet_id,
        service_id,
        date,
        time,
        notes: clean(body.notes) || null,
        status: 'scheduled',
        payment_status: 'unpaid',
      })
      .select(APPOINTMENT_SELECT)
      .single();

    if (error) return err(res, 500, error.message || 'Не вдалося створити запис');
    return res.status(201).json(data);
  }

  // PATCH /api/appointments?id=<id>
  if (req.method === 'PATCH') {
    const appointmentId = clean(req.query?.id);
    if (!appointmentId) return err(res, 400, 'Вкажіть id запису');

    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }

    // check ownership
    const { data: existing } = await db
      .from('appointments')
      .select('client_id')
      .eq('id', appointmentId)
      .single();

    if (!existing) return err(res, 404, 'Запис не знайдено');
    if (!isStaff && existing.client_id !== payload.sub) return err(res, 403, 'Forbidden');

    const allowed = isStaff
      ? ['status', 'notes', 'date', 'time', 'doctor_id', 'payment_status']
      : ['notes'];

    const updates = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    );

    if (Object.keys(updates).length === 0) return err(res, 400, 'Нічого оновлювати');

    const { data, error } = await db
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error) return err(res, 500, 'Не вдалося оновити запис');
    return res.status(200).json(data);
  }

  // POST /api/appointments?id=<id>&action=cancel
  if (req.method === 'DELETE') {
    const appointmentId = clean(req.query?.id);
    if (!appointmentId) return err(res, 400, 'Вкажіть id запису');

    const { data: existing } = await db
      .from('appointments')
      .select('client_id, status')
      .eq('id', appointmentId)
      .single();

    if (!existing) return err(res, 404, 'Запис не знайдено');
    if (!isStaff && existing.client_id !== payload.sub) return err(res, 403, 'Forbidden');

    const { error } = await db
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (error) return err(res, 500, 'Не вдалося скасувати запис');
    return res.status(200).json({ success: true });
  }

  return err(res, 405, 'Method not allowed');
}
