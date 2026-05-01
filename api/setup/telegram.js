// One-time setup: sets bot commands and description
// Call once after deploy: GET /api/setup/telegram?secret=YOUR_JWT_SECRET
import { cors } from '../../lib/cors.js';

export default async function handler(req, res) {
  cors(res);

  const secret = req.query?.secret || new URL(req.url, 'http://x').searchParams.get('secret');
  if (secret !== process.env.JWT_SECRET?.slice(0, 16)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.TG_BOT_TOKEN;
  const base = `https://api.telegram.org/bot${token}`;

  const call = async (method, body) => {
    const r = await fetch(`${base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  };

  const results = await Promise.all([
    // Set commands list (shown in "/" menu)
    call('setMyCommands', {
      commands: [
        { command: 'start', description: 'Отримати код для входу на сайт' },
        { command: 'help', description: 'Довідка' },
      ],
    }),
    // Set bot description (shown before user starts)
    call('setMyDescription', {
      description: 'Офіційний бот ветеринарної клініки UltraVet 🐾\n\nНатисніть START щоб отримати код для входу в особистий кабінет на сайті ultravet.ua',
    }),
    // Set short description
    call('setMyShortDescription', {
      short_description: 'Вхід в кабінет UltraVet — отримайте код для сайту',
    }),
  ]);

  res.json({ ok: true, results });
}
