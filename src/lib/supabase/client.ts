/**
 * Re-export Supabase clients for backwards compatibility
 *
 * For Client Components: import { createClient } from '@/lib/supabase/browser'
 * For Server Components: import { createServerSupabaseClient, getUser, getSession } from '@/lib/supabase/server'
 */

// Client-side
export { createClient } from "./browser";

// Server-side
export { createServerSupabaseClient, getSession, getUser } from "./server";
