// =====================================================
// supabase-config.js — Supabase client initialization
// =====================================================
// NOTE: Anon key is publishable by Supabase design.
// Security is enforced via RLS policies, not key secrecy.

const ENV = window.__ENV__ || {};
const SUPABASE_URL  = ENV.SUPABASE_URL || 'https://YOUR_NEW_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY || 'your-new-anon-key';

// Gunakan window.sb untuk mengelakkan konflik dengan global 'supabase'
if (!window.sb) {
  try {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    throw err;
  }
}

// Global variable untuk digunakan dalam skrip lain
var sb = window.sb;
