import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'test@example.com', // Let's just try to insert without auth to see if it's RLS
    password: 'password123'
  })

  // We don't have a user, let's just try to insert a fake UUID and see if it complains about RLS or schema
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      key: 'TRIAL-TESTING123',
      status: 'active',
      expires_at: new Date().toISOString()
    })
    .select()
    
  console.log("Error:", error)
}
test()
