import { createHash, createHmac } from 'crypto';
import { getDb } from '../_lib/db.js';
import { signAccess, generateRefreshToken, hashToken, refreshCookieOptions } from '../_lib/jwt.js';
import { cors, err, readBody } from '../_lib/cors.js';

function verifyTelegramHash(data) {
  const { hash, ...fields } = data;
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) throw new Error('Missing TG_BOT_TOKEN');

  // auth_date must be within 24h
  const age = Date.now() / 1000 - Number(fields.auth_date);
  if (age > 86400) return false;

  const checkString = Object.keys(fields)
    .sort()
    .map(k => `${k}=${fields[k]}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey).update(checkString).digest('hex');
  return expectedHash === hash;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;
  if (!id || !hash) return err(res, 400, 'Missing Telegram data');

  if (!verifyTelegramHash({ id, first_name, last_name, username, photo_url, auth_date, hash })) {
    return err(res, 401, 'Telegram hash verification failed');
  }

  const db = getDb();
  const telegramId = Number(id);

  let { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, telegram_username, created_at')
    .eq('telegram_id', telegramId)
    .single();

  if (!user) {
    const name = [first_name, last_name].filter(Boolean).join(' ') || username || `tg_${id}`;
    const { data: created, error } = await db
      .from('users')
      .insert({ name, telegram_id: telegramId, telegram_username: username || null, role: 'client' })
      .select('id, name, email, phone, role, telegram_username, created_at')
      .single();

    if (error) return err(res, 500, 'Помилка створення акаунту');
    user = created;
  } else if (username && user.telegram_username !== username) {
    await db.from('users').update({ telegram_username: username }).eq('id', user.id);
    user.telegram_username = username;
  }

  const accessToken = await signAccess({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  await db.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; ${refreshCookieOptions()}`);
  res.status(200).json({ accessToken, user });
}
