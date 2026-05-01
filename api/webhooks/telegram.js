import { randomInt, createHash } from 'crypto';
import { getDb } from '../_lib/db.js';
import { cors } from '../_lib/cors.js';

async function sendMessage(chatId, text) {
  const token = process.env.TG_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  let update;
  try {
    update = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
  } catch {
    return res.status(400).end();
  }

  const message = update?.message;
  if (!message) return res.json({ ok: true });

  const chatId = message.chat.id;
  const text = String(message.text || '').trim();

  if (text.startsWith('/start')) {
    const code = String(randomInt(100000, 999999));
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const db = getDb();
    await db.from('otp_codes').delete().eq('telegram_id', String(chatId));
    await db.from('otp_codes').insert({
      telegram_id: String(chatId),
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    await sendMessage(chatId,
      `🐾 <b>UltraVet</b>\n\nВаш код для входу на сайт:\n\n<code>${code}</code>\n\nВведіть його у вікні браузера. Код дійсний 10 хвилин.`
    );
  } else {
    await sendMessage(chatId,
      `Надішліть /start щоб отримати код для входу на сайт ultravet.ua`
    );
  }

  res.json({ ok: true });
}
