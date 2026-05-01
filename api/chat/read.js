import { cors, err, readBody } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth, isConversationParticipant } from '../_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  const user = await requireAuth(req, res);
  if (!user) return;

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const conversationId = String(body.conversationId || '').trim();
  const lastReadMessageId = String(body.lastReadMessageId || '').trim() || null;
  if (!conversationId) return err(res, 400, 'conversationId is required');

  const db = getDb();
  const isMember = await isConversationParticipant(db, conversationId, user.id);
  if (!isMember) return err(res, 403, 'Немає доступу до чату');

  const { error } = await db
    .from('conversation_participants')
    .update({
      last_read_at: new Date().toISOString(),
      last_read_message_id: lastReadMessageId,
    })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);

  if (error) return err(res, 500, 'Не вдалося оновити статус прочитання');
  return res.status(200).json({ ok: true });
}
