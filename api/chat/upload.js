import path from 'path';
import { cors, err, readBody } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth, isConversationParticipant } from '../_lib/auth.js';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const CHAT_BUCKET = process.env.SUPABASE_CHAT_BUCKET || 'chat-files';

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
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  const user = await requireAuth(req, res);
  if (!user) return;

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const conversationId = String(body.conversationId || '').trim();
  const fileName = safeFileName(body.fileName);
  const parsed = parseDataUrl(body.dataUrl);
  if (!conversationId) return err(res, 400, 'conversationId is required');
  if (!parsed) return err(res, 400, 'Невірний формат файла');

  const db = getDb();
  const isMember = await isConversationParticipant(db, conversationId, user.id);
  if (!isMember) return err(res, 403, 'Немає доступу до чату');

  let fileBuffer;
  try {
    fileBuffer = Buffer.from(parsed.base64, 'base64');
  } catch {
    return err(res, 400, 'Пошкоджений файл');
  }

  if (fileBuffer.length > MAX_FILE_BYTES) {
    return err(res, 413, 'Файл завеликий. Максимум 8MB');
  }

  const objectPath = `chat/${conversationId}/${Date.now()}_${fileName}`;
  const { error: uploadError } = await db.storage
    .from(CHAT_BUCKET)
    .upload(objectPath, fileBuffer, {
      contentType: parsed.contentType,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) return err(res, 500, 'Не вдалося завантажити файл');

  return res.status(201).json({
    attachment: {
      path: objectPath,
      name: fileName,
      contentType: parsed.contentType,
      size: fileBuffer.length,
      bucket: CHAT_BUCKET,
    },
  });
}
