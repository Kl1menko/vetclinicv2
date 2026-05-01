import { createHash } from 'crypto';
import { getDb } from '../_lib/db.js';
import { signAccess, generateRefreshToken, hashToken, refreshCookieOptions } from '../_lib/jwt.js';
import { cors, err, readBody } from '../_lib/cors.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { code, name } = body;
  if (!code?.trim()) return err(res, 400, 'code обовʼязковий');

  const inputHash = createHash('sha256').update(code.trim()).digest('hex');
  const db = getDb();

  // look up OTP by code hash (viber_id is not known to frontend)
  const { data: otp } = await db
    .from('otp_codes')
    .select('id, viber_id, expires_at, attempts')
    .eq('code_hash', inputHash)
    .single();

  if (!otp) return err(res, 401, 'Невірний код');
  if (new Date(otp.expires_at) < new Date()) {
    await db.from('otp_codes').delete().eq('id', otp.id);
    return err(res, 400, 'Код протерміновано. Запросіть новий через бот.');
  }
  if (otp.attempts >= 5) return err(res, 429, 'Забагато спроб. Запросіть новий код.');

  await db.from('otp_codes').delete().eq('id', otp.id);

  let isNew = false;
  let { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, viber_id, created_at')
    .eq('viber_id', otp.viber_id)
    .single();

  if (!user) {
    isNew = true;
    const displayName = name?.trim() || 'Клієнт Viber';
    const { data: created, error } = await db
      .from('users')
      .insert({ name: displayName, viber_id: otp.viber_id, role: 'client' })
      .select('id, name, email, phone, role, viber_id, created_at')
      .single();

    if (error) return err(res, 500, 'Помилка створення акаунту');
    user = created;
  }

  const accessToken = await signAccess({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await db.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; ${refreshCookieOptions()}`);
  res.status(200).json({ accessToken, user, isNew });
}
