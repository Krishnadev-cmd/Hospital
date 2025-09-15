import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client (for browser usage)
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // We'll handle this manually
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
);

// Server-side Supabase client (for API routes)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabaseClient;
export { supabaseServer };
