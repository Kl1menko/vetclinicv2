import { getDb } from '../../lib/db.js';
import { verifyPassword } from '../../lib/hash.js';
import { signAccess, generateRefreshToken, hashToken, refreshCookieOptions } from '../../lib/jwt.js';
import { cors, err, readBody } from '../../lib/cors.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { email, phone, password } = body;
  if (!password) return err(res, 400, 'Пароль обовʼязковий');
  if (!email?.trim() && !phone?.trim()) return err(res, 400, 'Email або телефон обовʼязкові');

  const db = getDb();

  const query = db.from('users').select('id, name, email, phone, role, password_hash, created_at');
  if (email?.trim()) query.eq('email', email.trim().toLowerCase());
  else query.eq('phone', phone.trim());

  const { data: users } = await query.limit(1);
  const user = users?.[0];

  if (!user || !user.password_hash) return err(res, 401, 'Невірний логін або пароль');

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return err(res, 401, 'Невірний логін або пароль');

  const accessToken = await signAccess({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
  });

  const { password_hash: _, ...safeUser } = user;
  res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; ${refreshCookieOptions()}`);
  res.status(200).json({ accessToken, user: safeUser });
}
