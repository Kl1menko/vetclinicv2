import path from 'path';
import { cors, err, readBody } from '../lib/cors.js';
import { getDb } from '../lib/db.js';
import { requireAuth, isConversationParticipant } from '../lib/auth.js';
import { DOCTORS } from '../src/data.js';

const staffRoles = new Set(['doctor', 'receptionist', 'admin']);
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const CHAT_BUCKET = process.env.SUPABASE_CHAT_BUCKET || 'chat-files';
const slug = (value = '') => String(value).toLowerCase().replace(/['’"`]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

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

function parseDataUrl(value) {
  const raw = String(value || '');
  const m = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { contentType: m[1], base64: m[2] };
}

function safeFileName(name) {
  const base = path.basename(String(name || 'file'));
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();
  const action = String(req.query.action || '').trim();

  if (req.method === 'GET' && action === 'conversations') {
    const { data: myRows, error: myErr } = await db
      .from('conversation_participants')
      .select('conversation_id, last_read_at, last_read_message_id')
      .eq('user_id', user.id);
    if (myErr) {
      const msg = String(myErr.message || '');
      if (msg.includes('conversation_participants')) {
        return err(res, 500, 'Чат ще не ініціалізовано в БД. Застосуйте supabase/schema.sql');
      }
      return err(res, 500, 'Не вдалося завантажити чати');
    }

    const conversationIds = (myRows || []).map((r) => r.conversation_id);
    if (!conversationIds.length) return res.status(200).json({ conversations: [] });

    const [convResp, partResp, msgResp] = await Promise.all([
      db.from('conversations').select('id, title, created_by, created_at, updated_at').in('id', conversationIds).order('updated_at', { ascending: false }),
      db.from('conversation_participants').select('conversation_id, user_id').in('conversation_id', conversationIds),
      db.from('messages').select('id, conversation_id, sender_user_id, text, attachments, created_at').in('conversation_id', conversationIds).order('created_at', { ascending: false }).limit(500),
    ]);

    if (convResp.error || partResp.error || msgResp.error) return err(res, 500, 'Не вдалося завантажити чати');

    const userIds = Array.from(new Set((partResp.data || []).map((row) => row.user_id).filter(Boolean)));
    const usersById = new Map();
    if (userIds.length) {
      const { data: userRows } = await db.from('users').select('id, name, role').in('id', userIds);
      for (const u of userRows || []) usersById.set(u.id, u);
    }

    const myMap = new Map((myRows || []).map((r) => [r.conversation_id, r]));
    const partsByConv = new Map();
    for (const row of partResp.data || []) {
      const arr = partsByConv.get(row.conversation_id) || [];
      arr.push(usersById.get(row.user_id) || null);
      partsByConv.set(row.conversation_id, arr);
    }

    const lastByConv = new Map();
    const unreadByConv = new Map();
    for (const m of msgResp.data || []) {
      if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
      const myReadAt = myMap.get(m.conversation_id)?.last_read_at;
      const isUnread = m.sender_user_id !== user.id && (!myReadAt || new Date(m.created_at) > new Date(myReadAt));
      if (isUnread) unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) || 0) + 1);
    }

    const conversations = (convResp.data || []).map((c) => {
      const participants = (partsByConv.get(c.id) || []).filter(Boolean);
      const peer = participants.find((p) => p.id !== user.id);
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

  if (req.method === 'POST' && action === 'conversations') {
    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }

    const participantUserId = String(body.participantUserId || '').trim();
    const title = String(body.title || '').trim();
    if (!participantUserId) return err(res, 400, 'participantUserId is required');
    if (participantUserId === user.id) return err(res, 400, 'Неможливо створити чат із собою');

    const { data: otherUser } = await db.from('users').select('id, role').eq('id', participantUserId).maybeSingle();
    if (!otherUser) return err(res, 404, 'Користувача не знайдено');
    if (user.role === 'client' && !staffRoles.has(otherUser.role)) return err(res, 403, 'Клієнт може писати лише персоналу клініки');

    const { data: conversation, error: cErr } = await db
      .from('conversations')
      .insert({ title: title || null, created_by: user.id })
      .select('id, title, created_at, updated_at')
      .single();
    if (cErr || !conversation) return err(res, 500, 'Не вдалося створити чат');

    const { error: pErr } = await db.from('conversation_participants').insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: participantUserId },
    ]);
    if (pErr) {
      await db.from('conversations').delete().eq('id', conversation.id);
      return err(res, 500, 'Не вдалося додати учасників');
    }
    return res.status(201).json({ conversation });
  }

  if (req.method === 'GET' && action === 'users') {
    const q = String(req.query.q || '').trim().toLowerCase();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    let query = db.from('users').select('id, name, role, email, phone').neq('id', user.id).limit(limit);
    if (user.role === 'client') query = query.in('role', ['doctor', 'receptionist', 'admin']);
    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    let { data, error } = await query.order('name', { ascending: true });
    if (error) return err(res, 500, 'Не вдалося завантажити список користувачів');

    // Bootstrap staff directory for chat when DB has no doctors/reception.
    if (user.role === 'client' && (!data || data.length === 0)) {
      const staffSeed = [
        { name: 'Реєстратура UltraVet', role: 'receptionist', email: 'reception@ultravet.local' },
        ...DOCTORS.map((d) => ({ name: d.name, role: 'doctor', email: `doctor-${slug(d.name)}@ultravet.local` })),
      ];

      // Try bulk upsert first.
      const { error: seedErr } = await db.from('users').upsert(
        staffSeed.map((s) => ({
          name: s.name,
          role: s.role,
          email: s.email,
          phone: null,
          password_hash: null,
        })),
        { onConflict: 'email', ignoreDuplicates: false },
      );

      // If bulk insert fails on some projects, fallback to per-row upsert.
      if (seedErr) {
        for (const s of staffSeed) {
          await db.from('users').upsert(
            { name: s.name, role: s.role, email: s.email, phone: null, password_hash: null },
            { onConflict: 'email', ignoreDuplicates: false },
          );
        }
      }

      const seeded = await db
        .from('users')
        .select('id, name, role, email, phone')
        .in('role', ['doctor', 'receptionist', 'admin'])
        .neq('id', user.id)
        .order('name', { ascending: true })
        .limit(limit);
      if (!seeded.error) data = seeded.data || data;

      // Last resort: make sure at least reception user exists.
      if (!data || data.length === 0) {
        const receptionEmail = 'reception@ultravet.local';
        const existingReception = await db
          .from('users')
          .select('id, name, role, email, phone')
          .eq('email', receptionEmail)
          .maybeSingle();
        if (!existingReception.data) {
          await db.from('users').insert({
            name: 'Реєстратура UltraVet',
            role: 'receptionist',
            email: receptionEmail,
            phone: null,
            password_hash: null,
          });
        }
        const reception = await db
          .from('users')
          .select('id, name, role, email, phone')
          .eq('email', receptionEmail)
          .maybeSingle();
        if (reception.data && reception.data.id !== user.id) data = [reception.data];
      }
    }

    return res.status(200).json({ users: data || [] });
  }

  if (req.method === 'GET' && action === 'messages') {
    const conversationId = String(req.query.conversationId || '').trim();
    if (!conversationId) return err(res, 400, 'conversationId is required');
    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    const [msgResp, partResp] = await Promise.all([
      db.from('messages').select('id, conversation_id, sender_user_id, text, attachments, created_at').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(500),
      db.from('conversation_participants').select('user_id, last_read_at').eq('conversation_id', conversationId),
    ]);
    if (msgResp.error || partResp.error) return err(res, 500, 'Не вдалося завантажити повідомлення');

    const senderIds = Array.from(new Set((msgResp.data || []).map((m) => m.sender_user_id).filter(Boolean)));
    const usersById = new Map();
    if (senderIds.length) {
      const { data: senderRows } = await db.from('users').select('id, name, role').in('id', senderIds);
      for (const row of senderRows || []) usersById.set(row.id, row);
    }

    const messages = (msgResp.data || []).map((m) => ({
      ...m,
      users: usersById.get(m.sender_user_id) || null,
    }));

    const otherReadAts = (partResp.data || []).filter((row) => row.user_id !== user.id && row.last_read_at).map((row) => row.last_read_at).sort((a, b) => String(b).localeCompare(String(a)));
    return res.status(200).json({ messages, readMeta: { lastReadAtByOthers: otherReadAts[0] || null } });
  }

  if (req.method === 'POST' && action === 'messages') {
    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }
    const conversationId = String(body.conversationId || '').trim();
    const text = String(body.text || '').trim();
    const attachments = normalizeAttachments(body.attachments);
    if (!conversationId) return err(res, 400, 'conversationId is required');
    if (!text && !attachments.length) return err(res, 400, 'Порожнє повідомлення');
    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    const { data: message, error: mErr } = await db
      .from('messages')
      .insert({ conversation_id: conversationId, sender_user_id: user.id, text: text || null, attachments })
      .select('id, conversation_id, sender_user_id, text, attachments, created_at')
      .single();
    if (mErr || !message) return err(res, 500, 'Не вдалося відправити повідомлення');

    await db.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    return res.status(201).json({ message });
  }

  if (req.method === 'POST' && action === 'read') {
    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }
    const conversationId = String(body.conversationId || '').trim();
    const lastReadMessageId = String(body.lastReadMessageId || '').trim() || null;
    if (!conversationId) return err(res, 400, 'conversationId is required');

    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    const { error } = await db.from('conversation_participants').update({ last_read_at: new Date().toISOString(), last_read_message_id: lastReadMessageId }).eq('conversation_id', conversationId).eq('user_id', user.id);
    if (error) return err(res, 500, 'Не вдалося оновити статус прочитання');
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST' && action === 'upload') {
    let body;
    try { body = await readBody(req); } catch { return err(res, 400, 'Invalid JSON'); }

    const conversationId = String(body.conversationId || '').trim();
    const fileName = safeFileName(body.fileName);
    const parsed = parseDataUrl(body.dataUrl);
    if (!conversationId) return err(res, 400, 'conversationId is required');
    if (!parsed) return err(res, 400, 'Невірний формат файла');

    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до чату');

    let fileBuffer;
    try { fileBuffer = Buffer.from(parsed.base64, 'base64'); } catch { return err(res, 400, 'Пошкоджений файл'); }
    if (fileBuffer.length > MAX_FILE_BYTES) return err(res, 413, 'Файл завеликий. Максимум 8MB');

    const objectPath = `chat/${conversationId}/${Date.now()}_${fileName}`;
    const { error: uploadError } = await db.storage.from(CHAT_BUCKET).upload(objectPath, fileBuffer, { contentType: parsed.contentType, upsert: false, cacheControl: '3600' });
    if (uploadError) return err(res, 500, 'Не вдалося завантажити файл');

    return res.status(201).json({ attachment: { path: objectPath, name: fileName, contentType: parsed.contentType, size: fileBuffer.length, bucket: CHAT_BUCKET } });
  }

  if (req.method === 'GET' && action === 'file') {
    const objectPath = String(req.query.path || '').trim();
    if (!objectPath.startsWith('chat/')) return err(res, 400, 'Невірний шлях файла');
    const chunks = objectPath.split('/');
    const conversationId = chunks[1];
    if (!conversationId) return err(res, 400, 'Невірний шлях файла');

    const isMember = await isConversationParticipant(db, conversationId, user.id);
    if (!isMember) return err(res, 403, 'Немає доступу до файла');

    const { data, error } = await db.storage.from(CHAT_BUCKET).createSignedUrl(objectPath, 60 * 30);
    if (error || !data?.signedUrl) return err(res, 500, 'Не вдалося згенерувати посилання');
    return res.status(200).json({ url: data.signedUrl });
  }

  return err(res, 404, 'Unknown chat action');
}
