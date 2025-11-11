import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Create a Supabase client for use in Client Components
 * This client will automatically handle session management
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
