'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

export interface Role {
  id: string
  name: string
  description?: string
  system_role: boolean
  created_at: string
}

export async function getRoles(): Promise<Role[]> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    // Verify user is admin/parent/guardian
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('relationship')
      .eq('id', currentUser.id)
      .single()

    const isAuthorized =
      currentProfile?.relationship &&
      ['mother', 'father', 'parent', 'guardian'].includes(currentProfile.relationship)

    if (!isAuthorized) {
      throw new Error('Only parents/guardians can manage roles')
    }

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching roles:', err)
    throw err
  }
}

// ============================================================================
// MODULE MANAGEMENT
// ============================================================================

export interface Module {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  category?: string
  display_order: number
  created_at: string
}

export async function getModules(): Promise<Module[]> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching modules:', err)
    throw err
  }
}

// ============================================================================
// ROLE-MODULE PERMISSIONS
// ============================================================================

export interface RoleModulePermission {
  id: string
  role_id: string
  module_id: string
  can_view: boolean
  can_create: boolean
  can_edit_own: boolean
  can_edit_all: boolean
  can_delete: boolean
}

export async function getRolePermissions(
  roleId: string
): Promise<RoleModulePermission[]> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('role_module_permissions')
      .select('*')
      .eq('role_id', roleId)
      .order('module_id', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching role permissions:', err)
    throw err
  }
}

export async function updateRolePermission(
  roleId: string,
  moduleId: string,
  permissions: {
    can_view: boolean
    can_create: boolean
    can_edit_own: boolean
    can_edit_all: boolean
    can_delete: boolean
  }
): Promise<void> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    // Verify authorization
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('relationship')
      .eq('id', currentUser.id)
      .single()

    const isAuthorized =
      currentProfile?.relationship &&
      ['mother', 'father', 'parent', 'guardian'].includes(currentProfile.relationship)

    if (!isAuthorized) {
      throw new Error('Only parents/guardians can update permissions')
    }

    const { error } = await supabase
      .from('role_module_permissions')
      .upsert({
        role_id: roleId,
        module_id: moduleId,
        ...permissions,
      })

    if (error) throw error
  } catch (err) {
    console.error('Error updating permission:', err)
    throw err
  }
}

// ============================================================================
// USER ROLE ASSIGNMENT
// ============================================================================

export interface UserRole {
  user_id: string
  role_id: string
  role_name: string
  granted_at: string
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role_id, roles(name), granted_at')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })

    if (error) throw error

    return (data || []).map((item: any) => ({
      user_id: item.user_id,
      role_id: item.role_id,
      role_name: item.roles?.name || 'Unknown',
      granted_at: item.granted_at,
    }))
  } catch (err) {
    console.error('Error fetching user roles:', err)
    throw err
  }
}

export async function assignRoleToUser(
  userId: string,
  roleId: string
): Promise<void> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    // Verify authorization
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('relationship')
      .eq('id', currentUser.id)
      .single()

    const isAuthorized =
      currentProfile?.relationship &&
      ['mother', 'father', 'parent', 'guardian'].includes(currentProfile.relationship)

    if (!isAuthorized) {
      throw new Error('Only parents/guardians can assign roles')
    }

    // Check if role already assigned
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single()

    if (existing) {
      return // Already assigned
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        granted_by: currentUser.id,
        granted_at: new Date().toISOString(),
      })

    if (error) throw error
  } catch (err) {
    console.error('Error assigning role:', err)
    throw err
  }
}

export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<void> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    // Verify authorization
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('relationship')
      .eq('id', currentUser.id)
      .single()

    const isAuthorized =
      currentProfile?.relationship &&
      ['mother', 'father', 'parent', 'guardian'].includes(currentProfile.relationship)

    if (!isAuthorized) {
      throw new Error('Only parents/guardians can remove roles')
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)

    if (error) throw error
  } catch (err) {
    console.error('Error removing role:', err)
    throw err
  }
}

// ============================================================================
// ACCESS AUDIT LOG
// ============================================================================

export interface AccessLog {
  id: string
  user_id: string
  module: string
  action: string
  resource_id?: string
  timestamp: string
  ip_address?: string
  full_name?: string
}

export async function getAccessLogs(
  limit: number = 100,
  moduleFilter?: string,
  userFilter?: string
): Promise<AccessLog[]> {
  try {
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      throw new Error('Not authenticated')
    }

    let query = supabase
      .from('access_logs')
      .select('*, profiles(full_name)')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (moduleFilter) {
      query = query.eq('module', moduleFilter)
    }

    if (userFilter) {
      query = query.eq('user_id', userFilter)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      module: item.module,
      action: item.action,
      resource_id: item.resource_id,
      timestamp: item.timestamp,
      ip_address: item.ip_address,
      full_name: item.profiles?.full_name,
    }))
  } catch (err) {
    console.error('Error fetching access logs:', err)
    throw err
  }
}

export async function logAccess(
  userId: string,
  module: string,
  action: string,
  resourceId?: string
): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        module,
        action,
        resource_id: resourceId,
        timestamp: new Date().toISOString(),
      })

    if (error) {
      console.error('Error logging access:', error)
      // Don't throw - logging failures shouldn't block application
    }
  } catch (err) {
    console.error('Error in logAccess:', err)
    // Silently fail - don't block app
  }
}

// ============================================================================
// PERMISSION UTILITY
// ============================================================================

export async function checkUserModuleAccess(
  userId: string,
  moduleSlug: string
): Promise<{
  can_view: boolean
  can_create: boolean
  can_edit_own: boolean
  can_edit_all: boolean
  can_delete: boolean
} | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .rpc('check_user_module_access', {
        p_user_id: userId,
        p_module_slug: moduleSlug,
      })

    if (error) {
      console.error('Error checking access:', error)
      return null
    }

    return data?.[0] || null
  } catch (err) {
    console.error('Error in checkUserModuleAccess:', err)
    return null
  }
}
