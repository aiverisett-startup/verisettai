import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co";

// Use service role key if available, otherwise fallback to anon key for sandbox/dev
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
