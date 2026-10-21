import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables directly with production fallbacks
const supabaseUrl: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://lpoconfurcrrkndguycr.supabase.co";

const supabaseAnonKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA";

/**
 * Factory for creating fresh browser clients (e.g. within React components).
 */
export const createClient = (): SupabaseClient =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Singleton Browser Client: Used for client-side authentication, realtime subscriptions,
 * and standard client queries.
 */
export const supabase: SupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
export const supabaseClient: SupabaseClient = supabase;

/**
 * Singleton Server Client: Used for server-side API routes, background jobs,
 * and edge functions without needing cookie serialization.
 */
export const supabaseServer: SupabaseClient = createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Helper to obtain the server client instance.
 */
export const getServerClient = (): SupabaseClient => supabaseServer;

export default supabase;
