/**
 * Re-export Supabase clients for backwards compatibility
 *
 * For Client Components: import { createClient } from '@/lib/supabase/browser'
 * For Server Components: import { createServerSupabaseClient, getUser, getSession } from '@/lib/supabase/server'
 */

export { createClient } from "./browser";

export { createServerSupabaseClient, getSession, getUser } from "./server";
