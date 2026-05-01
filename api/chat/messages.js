import { cors, err, readBody } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth, isConversationParticipant } from '../_lib/auth.js';

const normalizeAttachments = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter(Boolean)
    .map((it) => ({
      path: String(it.path || '').trim(),
      name: String(it.name || 'file').trim(),
      contentType: String(it.contentType || 'application/octet-stream').trim(),
      size: Number(it.size || 0),
    }))
    .filter((it) => it.path);
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();

  if (req.method === 'GET') {
    const conversationId = String(req.query.conversationId || '').trim();
    if (!conversationId) return err(res, 400, 'conversationId is required');

    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    const [msgResp, partResp] = await Promise.all([
      db
        .from('messages')
        .select('id, conversation_id, sender_user_id, text, attachments, created_at, users(id, name, role)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(500),
      db
        .from('conversation_participants')
        .select('user_id, last_read_at')
        .eq('conversation_id', conversationId),
    ]);

    if (msgResp.error || partResp.error) return err(res, 500, 'Не вдалося завантажити повідомлення');

    const otherReadAts = (partResp.data || [])
      .filter((row) => row.user_id !== user.id && row.last_read_at)
      .map((row) => row.last_read_at)
      .sort((a, b) => String(b).localeCompare(String(a)));

    return res.status(200).json({
      messages: msgResp.data || [],
      readMeta: {
        lastReadAtByOthers: otherReadAts[0] || null,
      },
    });
  }

  if (req.method === 'POST') {
    let body;
    try { body = await readBody(req); }
    catch { return err(res, 400, 'Invalid JSON'); }

    const conversationId = String(body.conversationId || '').trim();
    const text = String(body.text || '').trim();
    const attachments = normalizeAttachments(body.attachments);
    if (!conversationId) return err(res, 400, 'conversationId is required');
    if (!text && !attachments.length) return err(res, 400, 'Порожнє повідомлення');

    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    const { data: message, error: mErr } = await db
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_user_id: user.id,
        text: text || null,
        attachments,
      })
      .select('id, conversation_id, sender_user_id, text, attachments, created_at')
      .single();

    if (mErr || !message) return err(res, 500, 'Не вдалося відправити повідомлення');

    await db.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    return res.status(201).json({ message });
  }

  return err(res, 405, 'Method not allowed');
}
