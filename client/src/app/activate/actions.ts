'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function activateLicense(formData: FormData) {
  const key = formData.get('key') as string
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  // Check if key exists and is unused
  const { data: license, error: fetchError } = await supabase
    .from('licenses')
    .select('*')
    .eq('key', key)
    .single()

  if (fetchError || !license) {
    return { error: "Invalid license key." }
  }

  if (license.status !== 'unused') {
    return { error: "This license key has already been used." }
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return { error: "This license key has expired." }
  }

  // Clear any existing license (like an expired trial) to prevent unique constraint errors
  await supabase.from('licenses').delete().eq('user_id', user.id)

  // Claim the new license
  const { error: updateError } = await supabase
    .from('licenses')
    .update({ 
      status: 'active', 
      user_id: user.id 
    })
    .eq('id', license.id)
    .eq('status', 'unused') // Double check

  if (updateError) {
    return { error: "Failed to activate license. Please try again." }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
