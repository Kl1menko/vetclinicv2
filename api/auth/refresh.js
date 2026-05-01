import { getDb } from '../../lib/db.js';
import { signAccess, generateRefreshToken, hashToken, refreshCookieOptions } from '../../lib/jwt.js';
import { cors, err } from '../../lib/cors.js';

function parseCookie(str = '') {
  return Object.fromEntries(str.split(';').map(p => p.trim().split('=').map(decodeURIComponent)));
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // DELETE = logout
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');
    return res.status(204).end();
  }

  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  const cookies = parseCookie(req.headers.cookie || '');
  const token = cookies.refreshToken;
  if (!token) return err(res, 401, 'No refresh token');

  const db = getDb();
  const tokenHash = hashToken(token);

  const { data: stored } = await db
    .from('refresh_tokens')
    .select('id, user_id, expires_at')
    .eq('token_hash', tokenHash)
    .single();

  if (!stored || new Date(stored.expires_at) < new Date()) {
    return err(res, 401, 'Refresh token expired or not found');
  }

  const { data: user } = await db
    .from('users')
    .select('id, name, email, phone, role, created_at')
    .eq('id', stored.user_id)
    .single();

  if (!user) return err(res, 401, 'User not found');

  // rotate token
  await db.from('refresh_tokens').delete().eq('id', stored.id);
  const newRefresh = generateRefreshToken();
  await db.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: hashToken(newRefresh),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const accessToken = await signAccess({ sub: user.id, role: user.role });
  res.setHeader('Set-Cookie', `refreshToken=${newRefresh}; ${refreshCookieOptions()}`);
  res.status(200).json({ accessToken, user });
}
