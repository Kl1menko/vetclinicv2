import { createClient } from '@supabase/supabase-js';

let client;

export function getDb() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
