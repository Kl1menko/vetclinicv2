import { getDb } from '../../lib/db.js';
import { hashPassword } from '../../lib/hash.js';
import { signAccess, generateRefreshToken, hashToken, refreshCookieOptions } from '../../lib/jwt.js';
import { cors, err, readBody } from '../../lib/cors.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { name, email, phone, password } = body;

  if (!name?.trim()) return err(res, 400, 'Імʼя обовʼязкове');
  if (!password || password.length < 6) return err(res, 400, 'Пароль мінімум 6 символів');
  if (!email?.trim()) return err(res, 400, 'Email обовʼязковий');

  const db = getDb();

  // duplicate check
  const filters = [];
  if (email?.trim()) filters.push(`email.eq.${email.trim().toLowerCase()}`);
  if (phone?.trim()) filters.push(`phone.eq.${phone.trim()}`);

  const { data: existing } = await db
    .from('users')
    .select('id')
    .or(filters.join(','))
    .limit(1);

  if (existing?.length) return err(res, 409, 'Користувач з таким email або телефоном вже існує');

  const password_hash = await hashPassword(password);

  const { data: user, error } = await db
    .from('users')
    .insert({
      name: name.trim(),
      email: email?.trim().toLowerCase() || null,
      phone: phone?.trim() || null,
      password_hash,
      role: 'client',
    })
    .select('id, name, email, phone, role, created_at')
    .single();

  if (error) return err(res, 500, 'Помилка реєстрації');

  const accessToken = await signAccess({ sub: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
  });

  res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; ${refreshCookieOptions()}`);
  res.status(201).json({ accessToken, user, isNew: true });
}
