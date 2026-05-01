import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasRealtimeConfig = Boolean(url && anonKey);

export const supabaseClient = hasRealtimeConfig
  ? createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 8 } },
  })
  : null;

