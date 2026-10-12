import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseKey.includes('your-supabase')
);

if (!isSupabaseConfigured) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '⚠️ [Supabase Warning] SUPABASE_URL or SUPABASE_ANON_KEY not set in backend/.env.\n' +
    '   The backend will run using local in-memory fallback state.\n' +
    '   To connect to your live database, add your Supabase credentials in backend/.env.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;
