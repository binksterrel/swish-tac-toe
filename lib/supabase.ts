import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for Public Operations (Read-only mostly, relies on RLS)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

// Client for Server-Side Operations (Bypasses RLS)
// Use this in API Routes to Create/Update battles freely
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
