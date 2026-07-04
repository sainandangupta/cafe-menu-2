import { createClient } from '@supabase/supabase-js';
import env from './environment';
import WebSocket from 'ws';

// Polyfill native WebSocket constructor (required on Node < 22 by supabase-js realtime-js package)
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket as any;
}

// Standard client for public or general tasks
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client to bypass RLS for administrative actions (like file uploads)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const BUCKET_DISH_IMAGES = 'dish-images';
export const BUCKET_QR_CODES = 'qr-codes';

export default supabase;
