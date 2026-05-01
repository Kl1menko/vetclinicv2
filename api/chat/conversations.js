import { cors, err, readBody } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

const staffRoles = new Set(['doctor', 'receptionist', 'admin']);

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();

  if (req.method === 'GET') {
    const { data: myRows, error: myErr } = await db
      .from('conversation_participants')
      .select('conversation_id, last_read_at, last_read_message_id')
      .eq('user_id', user.id);
    if (myErr) return err(res, 500, 'Не вдалося завантажити чати');

    const conversationIds = (myRows || []).map(r => r.conversation_id);
    if (!conversationIds.length) return res.status(200).json({ conversations: [] });

    const [convResp, partResp, msgResp] = await Promise.all([
      db.from('conversations').select('id, title, created_by, created_at, updated_at').in('id', conversationIds).order('updated_at', { ascending: false }),
      db.from('conversation_participants').select('conversation_id, user_id, users(id, name, role)').in('conversation_id', conversationIds),
      db.from('messages').select('id, conversation_id, sender_user_id, text, attachments, created_at').in('conversation_id', conversationIds).order('created_at', { ascending: false }).limit(500),
    ]);

    if (convResp.error || partResp.error || msgResp.error) return err(res, 500, 'Не вдалося завантажити чати');

    const myMap = new Map((myRows || []).map(r => [r.conversation_id, r]));
    const partsByConv = new Map();
    for (const row of (partResp.data || [])) {
      const arr = partsByConv.get(row.conversation_id) || [];
      arr.push(row.users);
      partsByConv.set(row.conversation_id, arr);
    }

    const lastByConv = new Map();
    const unreadByConv = new Map();
    for (const m of (msgResp.data || [])) {
      if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
      const myReadAt = myMap.get(m.conversation_id)?.last_read_at;
      const isUnread = m.sender_user_id !== user.id && (!myReadAt || new Date(m.created_at) > new Date(myReadAt));
      if (isUnread) unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) || 0) + 1);
    }

    const conversations = (convResp.data || []).map(c => {
      const participants = (partsByConv.get(c.id) || []).filter(Boolean);
      const peer = participants.find(p => p.id !== user.id);
      return {
        id: c.id,
        title: c.title || peer?.name || 'Чат',
        participants,
        lastMessage: lastByConv.get(c.id) || null,
        unread: unreadByConv.get(c.id) || 0,
        updatedAt: c.updated_at,
        createdAt: c.created_at,
      };
    });

    return res.status(200).json({ conversations });
  }

  if (req.method === 'POST') {
    let body;
    try { body = await readBody(req); }
    catch { return err(res, 400, 'Invalid JSON'); }

    const participantUserId = String(body.participantUserId || '').trim();
    const title = String(body.title || '').trim();
    if (!participantUserId) return err(res, 400, 'participantUserId is required');
    if (participantUserId === user.id) return err(res, 400, 'Неможливо створити чат із собою');

    const { data: otherUser } = await db
      .from('users')
      .select('id, role')
      .eq('id', participantUserId)
      .maybeSingle();
    if (!otherUser) return err(res, 404, 'Користувача не знайдено');

    // Rule: client can start only with staff, staff can start with anyone.
    if (user.role === 'client' && !staffRoles.has(otherUser.role)) {
      return err(res, 403, 'Клієнт може писати лише персоналу клініки');
    }

    const { data: conversation, error: cErr } = await db
      .from('conversations')
      .insert({ title: title || null, created_by: user.id })
      .select('id, title, created_at, updated_at')
      .single();

    if (cErr || !conversation) return err(res, 500, 'Не вдалося створити чат');

    const { error: pErr } = await db
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: participantUserId },
      ]);

    if (pErr) {
      await db.from('conversations').delete().eq('id', conversation.id);
      return err(res, 500, 'Не вдалося додати учасників');
    }

    return res.status(201).json({ conversation });
  }

  return err(res, 405, 'Method not allowed');
}
