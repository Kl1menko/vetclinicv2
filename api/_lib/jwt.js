import { SignJWT, jwtVerify } from 'jose';
import { randomBytes, createHash } from 'crypto';

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('Missing JWT_SECRET');
  return new TextEncoder().encode(s);
};

export async function signAccess(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret());
}

export async function verifyAccess(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}

export function generateRefreshToken() {
  return randomBytes(48).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshCookieOptions() {
  return [
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 30}`,
    process.env.APP_URL?.startsWith('https') ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}
