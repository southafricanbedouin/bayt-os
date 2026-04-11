'use server'

import { createClient } from '@/lib/supabase/server'
import { generateSecurePassword } from '@/lib/utils/password'

interface CreateUserResult {
  success: boolean
  error?: string
  userId?: string
  tempPassword?: string
}

export async function createUser({
  fullName,
  relationship,
  email,
}: {
  fullName: string
  relationship: string
  email: string
}): Promise<CreateUserResult> {
  try {
    const supabase = await createClient()

    // Verify current user is authenticated and is parent/guardian
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('relationship')
      .eq('id', currentUser.id)
      .single()

    const isAuthorized =
      currentProfile?.relationship &&
      ['mother', 'father', 'parent', 'guardian'].includes(currentProfile.relationship)

    if (!isAuthorized) {
      return { success: false, error: 'Only parents/guardians can create users' }
    }

    // Validate input
    if (!fullName.trim() || !email.trim() || !relationship.trim()) {
      return { success: false, error: 'All fields are required' }
    }

    if (!['son', 'daughter', 'mother', 'father', 'guardian', 'maid', 'nanny', 'grandmother', 'grandfather'].includes(relationship)) {
      return { success: false, error: 'Invalid relationship type' }
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .single()

    if (existingUser) {
      return { success: false, error: 'Email already exists' }
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword()

    // Create auth user (note: requires admin access)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError || !authUser) {
      return { success: false, error: authError?.message || 'Failed to create auth user' }
    }

    // Create profile record
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        auth_user_id: authUser.user.id,
        full_name: fullName.trim(),
        relationship: relationship.trim(),
        email: email.trim(),
        profile_complete: false,
        avatar_emoji: getEmojiForRelationship(relationship),
      })
      .select('id')
      .single()

    if (profileError || !newProfile) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: 'Failed to create user profile' }
    }

    return {
      success: true,
      userId: newProfile.id,
      tempPassword,
    }
  } catch (err) {
    console.error('Error creating user:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

function getEmojiForRelationship(relationship: string): string {
  const emojiMap: Record<string, string> = {
    son: '👦',
    daughter: '👧',
    mother: '👩',
    father: '👨',
    guardian: '🛡️',
    maid: '👩‍💼',
    nanny: '👩‍🍼',
    grandmother: '👵',
    grandfather: '👴',
  }
  return emojiMap[relationship] || '👤'
}
