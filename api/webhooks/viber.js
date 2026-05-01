import { randomInt, createHash } from 'crypto';
import { getDb } from '../../lib/db.js';
import { cors } from '../../lib/cors.js';

// Viber Bot SDK uses CommonJS — dynamic import for ESM compat
async function getBot() {
  const { default: ViberBot, Message, Events } = await import('viber-bot');
  const bot = new ViberBot.Bot({
    authToken: process.env.VIBER_BOT_TOKEN,
    name: process.env.VIBER_BOT_NAME || 'UltraVet',
    avatar: '',
  });

  bot.onSubscribe(res => {
    res.sendMessage(new Message.Text(
      'Привіт! Я бот UltraVet 🐾\nНадішліть /start щоб отримати код для входу на сайт.',
    ));
  });

  bot.on(Events.MESSAGE_RECEIVED, async (message, response) => {
    const text = String(message.text || '').trim().toLowerCase();
    if (text === '/start' || text === 'start') {
      const viberUserId = response.userProfile.id;
      const code = String(randomInt(100000, 999999));
      const codeHash = createHash('sha256').update(code).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const db = getDb();
      await db.from('otp_codes').delete().eq('viber_id', viberUserId);
      await db.from('otp_codes').insert({
        viber_id: viberUserId,
        code_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
      });

      await response.sendMessage(
        new Message.Text(`🐾 UltraVet — ваш код входу: *${code}*\n\nВведіть його на сайті. Дійсний 10 хвилин.`),
      );
    } else {
      await response.sendMessage(
        new Message.Text('Надішліть /start щоб отримати код для входу на сайт ultravet.ua'),
      );
    }
  });

  return bot;
}

let botInstance;

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).send('OK');
  if (req.method !== 'POST') return res.status(405).end();

  try {
    if (!botInstance) botInstance = await getBot();
    await new Promise((resolve, reject) => {
      botInstance.middleware()(req, res, (e) => (e ? reject(e) : resolve()));
    });
  } catch (e) {
    console.error('Viber webhook error:', e.message);
    if (!res.headersSent) res.status(500).json({ error: 'Webhook error' });
  }
}
