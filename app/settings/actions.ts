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
      .maybe_single()

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

export interface UpdateUserResult {
  success: boolean
  error?: string
}

export async function updateUser({
  userId,
  fullName,
  email,
  relationship,
  avatarEmoji,
}: {
  userId: string
  fullName?: string
  email?: string
  relationship?: string
  avatarEmoji?: string
}): Promise<UpdateUserResult> {
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
      return { success: false, error: 'Only parents/guardians can update users' }
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (fullName !== undefined) updateData.full_name = fullName.trim()
    if (relationship !== undefined) updateData.relationship = relationship.trim()
    if (avatarEmoji !== undefined) updateData.avatar_emoji = avatarEmoji

    if (email !== undefined) {
      // Check if email already exists (excluding current user)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .neq('id', userId)
        .maybe_single()

      if (existingUser) {
        return { success: false, error: 'Email already exists' }
      }

      updateData.email = email.trim()

      // Update auth email if changed
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        email: email.trim(),
      })

      if (authError) {
        return { success: false, error: `Failed to update email: ${authError.message}` }
      }
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (profileError) {
      return { success: false, error: `Failed to update profile: ${profileError.message}` }
    }

    return { success: true }
  } catch (err) {
    console.error('Error updating user:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface ResetPasswordResult {
  success: boolean
  error?: string
  tempPassword?: string
}

export async function resetUserPassword(userId: string): Promise<ResetPasswordResult> {
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
      return { success: false, error: 'Only parents/guardians can reset passwords' }
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword()

    // Update auth password
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: tempPassword,
    })

    if (authError) {
      return { success: false, error: `Failed to reset password: ${authError.message}` }
    }

    return { success: true, tempPassword }
  } catch (err) {
    console.error('Error resetting password:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface DeleteUserResult {
  success: boolean
  error?: string
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
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
      return { success: false, error: 'Only parents/guardians can delete users' }
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    // Delete auth user (this cascades to linked records via FK constraints)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      return { success: false, error: `Failed to delete user: ${authError.message}` }
    }

    // Profile will be deleted via cascade if configured, otherwise delete explicitly
    await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    return { success: true }
  } catch (err) {
    console.error('Error deleting user:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface BulkImportResult {
  success: boolean
  error?: string
  created: number
  failed: number
  failures: Array<{ row: number; email: string; error: string }>
}

export async function bulkImportUsers(
  csvData: Array<{ fullName: string; relationship: string; email: string }>
): Promise<BulkImportResult> {
  try {
    const supabase = await createClient()

    // Verify current user is authenticated and is parent/guardian
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, created: 0, failed: 0, failures: [], error: 'Not authenticated' }
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
      return {
        success: false,
        created: 0,
        failed: 0,
        failures: [],
        error: 'Only parents/guardians can import users',
      }
    }

    let created = 0
    let failed = 0
    const failures: Array<{ row: number; email: string; error: string }> = []

    for (let i = 0; i < csvData.length; i++) {
      const { fullName, relationship, email } = csvData[i]
      const row = i + 2 // Row numbers in CSV (1-indexed + header)

      // Validate row
      if (!fullName?.trim() || !email?.trim() || !relationship?.trim()) {
        failures.push({ row, email, error: 'Missing required fields' })
        failed++
        continue
      }

      if (!['son', 'daughter', 'mother', 'father', 'guardian', 'maid', 'nanny', 'grandmother', 'grandfather'].includes(relationship)) {
        failures.push({ row, email, error: 'Invalid relationship type' })
        failed++
        continue
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybe_single()

      if (existingUser) {
        failures.push({ row, email, error: 'Email already exists' })
        failed++
        continue
      }

      // Generate temporary password
      const tempPassword = generateSecurePassword()

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: tempPassword,
        email_confirm: true,
      })

      if (authError || !authUser) {
        failures.push({ row, email, error: authError?.message || 'Failed to create auth user' })
        failed++
        continue
      }

      // Create profile record
      const { error: profileError } = await supabase
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

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id)
        failures.push({ row, email, error: 'Failed to create user profile' })
        failed++
        continue
      }

      created++
    }

    return {
      success: failures.length === 0,
      created,
      failed,
      failures,
    }
  } catch (err) {
    console.error('Error bulk importing users:', err)
    return {
      success: false,
      created: 0,
      failed: csvData.length,
      failures: csvData.map((row, i) => ({
        row: i + 2,
        email: row.email,
        error: 'Unexpected error during import',
      })),
      error: 'An unexpected error occurred',
    }
  }
}

export interface ActivityLog {
  id: string
  user_id: string
  full_name: string
  action: string
  timestamp: string
  ip_address?: string
}

export async function getUserActivity(
  userId: string,
  limit: number = 50
): Promise<{ success: boolean; error?: string; logs?: ActivityLog[] }> {
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
      return { success: false, error: 'Only parents/guardians can view activity logs' }
    }

    // Get activity logs from audit_log table (if it exists) or create a basic version
    // For now, return basic last_sign_in_at from profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return { success: false, error: 'User not found' }
    }

    // Create basic activity log structure from profile timestamps
    const logs: ActivityLog[] = []

    if (profile.created_at) {
      logs.push({
        id: `created-${profile.id}`,
        user_id: profile.id,
        full_name: profile.full_name,
        action: 'user_created',
        timestamp: profile.created_at,
      })
    }

    // TODO: When audit_log table is created, fetch from there with full history
    // For now, return basic activity

    return { success: true, logs }
  } catch (err) {
    console.error('Error fetching activity logs:', err)
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
