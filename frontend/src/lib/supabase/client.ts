'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function createClient() {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if env vars are available (they won't be during build)
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build/SSG that does nothing
    // This prevents build errors when env vars aren't set
    console.warn('Supabase environment variables not set. Auth features will be disabled.');
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
      },
    } as unknown as SupabaseClient;
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}
