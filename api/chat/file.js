import { cors, err } from '../_lib/cors.js';
import { getDb } from '../_lib/db.js';
import { requireAuth, isConversationParticipant } from '../_lib/auth.js';

const CHAT_BUCKET = process.env.SUPABASE_CHAT_BUCKET || 'chat-files';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return err(res, 405, 'Method not allowed');

  const user = await requireAuth(req, res);
  if (!user) return;

  const objectPath = String(req.query.path || '').trim();
  if (!objectPath.startsWith('chat/')) return err(res, 400, 'Невірний шлях файла');

  const chunks = objectPath.split('/');
  const conversationId = chunks[1];
  if (!conversationId) return err(res, 400, 'Невірний шлях файла');

  const db = getDb();
  const isMember = await isConversationParticipant(db, conversationId, user.id);
  if (!isMember) return err(res, 403, 'Немає доступу до файла');

  const { data, error } = await db.storage.from(CHAT_BUCKET).createSignedUrl(objectPath, 60 * 30);
  if (error || !data?.signedUrl) return err(res, 500, 'Не вдалося згенерувати посилання');

  return res.status(200).json({ url: data.signedUrl });
}
