import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfig = {
  boardId: import.meta.env.VITE_SUPABASE_BOARD_ID,
  isConfigured: Boolean(url && anonKey && import.meta.env.VITE_SUPABASE_BOARD_ID),
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
