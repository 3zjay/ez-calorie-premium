import { createClient } from '@supabase/supabase-js'

// Server-side client uses service role key (full access)
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Ensure a user row exists in our DB for a given Clerk user
export async function ensureUser(clerkId, email) {
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('users')
    .insert({ clerk_id: clerkId, email })
    .select()
    .single()

  if (error) throw new Error('Could not create user: ' + error.message)
  return created
}
