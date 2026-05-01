import { randomInt } from 'crypto';
import { createHash } from 'crypto';
import { getDb } from '../../lib/db.js';
import { cors, err, readBody } from '../../lib/cors.js';
import ViberBot, { Message } from 'viber-bot';

function getBot() {
  return new ViberBot.Bot({
    authToken: process.env.VIBER_BOT_TOKEN,
    name: process.env.VIBER_BOT_NAME || 'UltraVet',
    avatar: '',
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return err(res, 405, 'Method not allowed');

  let body;
  try { body = await readBody(req); }
  catch { return err(res, 400, 'Invalid JSON'); }

  const { viber_id } = body;
  if (!viber_id?.trim()) return err(res, 400, 'viber_id обовʼязковий');

  const code = String(randomInt(100000, 999999));
  const codeHash = createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const db = getDb();

  // delete old OTPs for this viber_id
  await db.from('otp_codes').delete().eq('viber_id', viber_id.trim());

  await db.from('otp_codes').insert({
    viber_id: viber_id.trim(),
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
  });

  try {
    const bot = getBot();
    await bot.sendMessage({ id: viber_id.trim() }, [
      new Message.Text(`🐾 UltraVet — ваш код підтвердження: *${code}*\n\nДійсний 10 хвилин.`),
    ]);
  } catch (e) {
    console.error('Viber send error:', e.message);
    return err(res, 502, 'Не вдалося надіслати повідомлення у Viber');
  }

  res.status(200).json({ ok: true });
}
