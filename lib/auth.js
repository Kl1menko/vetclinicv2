import { verifyAccess } from './jwt.js';
import { err } from './cors.js';
import { getDb } from './db.js';

export async function requireAuth(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    err(res, 401, 'Unauthorized');
    return null;
  }

  let payload;
  try {
    payload = await verifyAccess(token);
  } catch {
    err(res, 401, 'Invalid token');
    return null;
  }

  const db = getDb();
  const { data: user, error } = await db
    .from('users')
    .select('id, name, email, phone, role, created_at')
    .eq('id', payload.sub)
    .single();

  if (error || !user) {
    err(res, 401, 'User not found');
    return null;
  }

  return user;
}

export async function isConversationParticipant(db, conversationId, userId) {
  const { data } = await db
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}
