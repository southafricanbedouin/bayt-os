'use client'

import { useState, useEffect } from 'react'
import { getRolePermissions, updateRolePermission } from './access-control-actions'

const C = {
  white: '#ffffff',
  black: '#0a0a0a',
  rule: '#e0e0e0',
  green: '#10b981',
  darkGreen: '#065f46',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
}

const F_SANS = 'Inter, system-ui, -apple-system, sans-serif'

interface Role {
  id: string
  name: string
  description?: string
  system_role: boolean
  created_at: string
}

interface Module {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  category?: string
  display_order: number
  created_at: string
}

interface RoleModulePermission {
  id: string
  role_id: string
  module_id: string
  can_view: boolean
  can_create: boolean
  can_edit_own: boolean
  can_edit_all: boolean
  can_delete: boolean
}

interface PermissionMatrixProps {
  roleId: string
  roles: Role[]
  modules: Module[]
  onRoleChange: (roleId: string) => void
  onPermissionsUpdated: () => void
}

export default function PermissionMatrix({
  roleId,
  roles,
  modules,
  onRoleChange,
  onPermissionsUpdated,
}: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<RoleModulePermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const selectedRole = roles.find((r) => r.id === roleId)

  useEffect(() => {
    loadPermissions()
  }, [roleId])

  const loadPermissions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getRolePermissions(roleId)
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionToggle = async (moduleId: string, field: string, value: boolean) => {
    const permission = permissions.find((p) => p.module_id === moduleId)
    if (!permission) return

    const updatedPermission = {
      ...permission,
      [field]: value,
    }

    try {
      setIsSaving(true)
      await updateRolePermission(roleId, moduleId, {
        can_view: updatedPermission.can_view,
        can_create: updatedPermission.can_create,
        can_edit_own: updatedPermission.can_edit_own,
        can_edit_all: updatedPermission.can_edit_all,
        can_delete: updatedPermission.can_delete,
      })

      // Update local state
      setPermissions((prev) =>
        prev.map((p) => (p.module_id === moduleId ? updatedPermission : p))
      )

      setMessage({ type: 'success', text: 'Permission updated' })
      setTimeout(() => setMessage(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permission')
      setMessage({ type: 'error', text: 'Failed to update permission' })
    } finally {
      setIsSaving(false)
    }
  }

  const groupedModules = modules.reduce(
    (acc, mod) => {
      const category = mod.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push(mod)
      return acc
    },
    {} as Record<string, Module[]>
  )

  const categoryLabels: Record<string, string> = {
    foundation: '📋 Foundation',
    operations: '⚙️ Daily Operations',
    planning: '📅 Planning & Strategy',
    financial: '💰 Financial',
    learning: '📚 Learning & Development',
    wellness: '🏥 Health & Wellness',
    impact: '🌍 Community & Impact',
    growth: '📈 Personal Growth',
    social: '💬 Social & Connection',
    special: '🎪 Special',
    admin: '⚙️ Settings & Admin',
  }

  return (
    <div style={{ fontFamily: F_SANS }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Permission Matrix
        </h2>

        {/* Role Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Select Role
          </label>
          <select
            value={roleId}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: `1px solid ${C.rule}`,
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontFamily: F_SANS,
            }}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {selectedRole && (
          <div style={{ background: '#f0f9ff', border: `1px solid ${C.blue}`, padding: '1rem', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>{selectedRole.name}</strong>
              {selectedRole.description && ` — ${selectedRole.description}`}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            border: `1px solid #fca5a5`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: C.gray }}>
          Loading permissions...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(groupedModules).map(([category, categoryModules]) => {
            const isExpanded = expandedCategory === category
            const categoryPermissions = categoryModules.filter((mod) =>
              permissions.some((p) => p.module_id === mod.id)
            )

            return (
              <div key={category} style={{ border: `1px solid ${C.rule}`, borderRadius: '8px', overflow: 'hidden' }}>
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: isExpanded ? C.lightGray : C.white,
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = C.lightGray
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isExpanded ? C.lightGray : C.white
                  }}
                >
                  <span>{categoryLabels[category] || category}</span>
                  <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${C.rule}` }}>
                    {categoryModules.map((module, index) => {
                      const perm = permissions.find((p) => p.module_id === module.id)
                      if (!perm) return null

                      return (
                        <div
                          key={module.id}
                          style={{
                            padding: '1rem',
                            borderBottom: index < categoryModules.length - 1 ? `1px solid ${C.lightGray}` : 'none',
                            background: index % 2 === 0 ? C.white : '#fafafa',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '1rem',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
                                {module.icon} {module.name}
                              </h4>
                              {module.description && (
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: C.gray }}>
                                  {module.description}
                                </p>
                              )}
                            </div>

                            {/* Permission Toggles */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '0.5rem',
                              }}
                            >
                              {[
                                { key: 'can_view', label: 'View' },
                                { key: 'can_create', label: 'Create' },
                                { key: 'can_edit_own', label: 'Edit Own' },
                                { key: 'can_edit_all', label: 'Edit All' },
                                { key: 'can_delete', label: 'Delete' },
                              ].map(({ key, label }) => (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      gap: '0.5rem',
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={perm[key as keyof RoleModulePermission] as boolean}
                                      onChange={(e) =>
                                        handlePermissionToggle(module.id, key, e.target.checked)
                                      }
                                      disabled={isSaving}
                                      style={{
                                        cursor: 'pointer',
                                        width: '18px',
                                        height: '18px',
                                      }}
                                    />
                                  </label>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      color: C.gray,
                                      fontWeight: 500,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
