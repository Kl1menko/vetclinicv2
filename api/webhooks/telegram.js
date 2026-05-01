import { randomInt, createHash } from 'crypto';
import { getDb } from '../../lib/db.js';
import { cors } from '../../lib/cors.js';

const TOKEN = () => process.env.TG_BOT_TOKEN;

async function tgApi(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

const CODE_KEYBOARD = {
  keyboard: [[{ text: '🔑 Отримати код для входу' }]],
  resize_keyboard: true,
  persistent: true,
};

async function sendCode(chatId) {
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

  await tgApi('sendMessage', {
    chat_id: chatId,
    text: `🐾 <b>UltraVet</b> — ваш код для входу:\n\n<code>${code}</code>\n\n<i>Введіть його на сайті. Дійсний 10 хвилин.</i>`,
    parse_mode: 'HTML',
    reply_markup: CODE_KEYBOARD,
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).send('OK');
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

  if (text.startsWith('/start') || text === '🔑 Отримати код для входу') {
    await sendCode(chatId);
  } else if (text === '/help' || text === '/start@' + (process.env.TG_BOT_USERNAME || '')) {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `🐾 <b>UltraVet — вхід на сайт</b>\n\nНатисніть кнопку нижче або надішліть /start щоб отримати 6-значний код для входу на сайт <b>ultravet.ua</b>`,
      parse_mode: 'HTML',
      reply_markup: CODE_KEYBOARD,
    });
  } else {
    await tgApi('sendMessage', {
      chat_id: chatId,
      text: `Натисніть кнопку «🔑 Отримати код для входу» щоб увійти на сайт ultravet.ua`,
      reply_markup: CODE_KEYBOARD,
    });
  }

  res.json({ ok: true });
}
