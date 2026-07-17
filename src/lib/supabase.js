import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfig = {
  boardId: env.VITE_SUPABASE_BOARD_ID,
  isConfigured: Boolean(url && anonKey && env.VITE_SUPABASE_BOARD_ID),
};

export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase || !supabaseConfig.isConfigured) {
    throw new Error('Supabase no está configurado. Revisa las variables VITE_SUPABASE_* del entorno.');
  }
  return supabase;
}
