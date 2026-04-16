'use client'

import { useState, useEffect } from 'react'
import { getUserRoles, assignRoleToUser, removeRoleFromUser } from './access-control-actions'

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

interface Profile {
  id: string
  full_name: string
  relationship?: string
  created_at?: string
}

interface Role {
  id: string
  name: string
  description?: string
  system_role: boolean
  created_at: string
}

interface UserRole {
  user_id: string
  role_id: string
  role_name: string
  granted_at: string
}

interface UserRoleAssignmentProps {
  profiles: Profile[]
  roles: Role[]
  onAssignmentsUpdated: () => void
}

export default function UserRoleAssignment({
  profiles,
  roles,
  onAssignmentsUpdated,
}: UserRoleAssignmentProps) {
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({})
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string[]>>({})

  useEffect(() => {
    loadUserRoles()
  }, [])

  const loadUserRoles = async () => {
    try {
      setIsLoading(true)
      const rolesData: Record<string, UserRole[]> = {}
      for (const profile of profiles) {
        rolesData[profile.id] = await getUserRoles(profile.id)
      }
      setUserRoles(rolesData)

      // Initialize selected roles from current assignments
      const selected: Record<string, string[]> = {}
      for (const [userId, userRolesList] of Object.entries(rolesData)) {
        selected[userId] = userRolesList.map((ur) => ur.role_id)
      }
      setSelectedRoles(selected)
    } catch (err) {
      console.error('Error loading user roles:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleToggle = async (userId: string, roleId: string, isAssigning: boolean) => {
    try {
      setIsSaving(true)
      if (isAssigning) {
        await assignRoleToUser(userId, roleId)
      } else {
        await removeRoleFromUser(userId, roleId)
      }

      // Update local state
      setSelectedRoles((prev) => {
        const userSelected = prev[userId] || []
        if (isAssigning) {
          return { ...prev, [userId]: [...userSelected, roleId] }
        } else {
          return { ...prev, [userId]: userSelected.filter((id) => id !== roleId) }
        }
      })

      setMessage({ type: 'success', text: 'Role assignment updated' })
      setTimeout(() => setMessage(null), 2000)
      onAssignmentsUpdated()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update role assignment',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getUserEmoji = (relationship?: string): string => {
    const emojiMap: Record<string, string> = {
      son: '👦',
      daughter: '👧',
      mother: '👩',
      father: '👨',
      guardian: '🛡️',
      maid: '🧹',
      nanny: '👩‍🍼',
      grandmother: '👵',
      grandfather: '👴',
    }
    return emojiMap[relationship?.toLowerCase() || ''] || '👤'
  }

  return (
    <div style={{ fontFamily: F_SANS }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          User Role Assignment
        </h2>
        <p style={{ color: C.gray, margin: 0, fontSize: '0.9rem' }}>
          Assign one or more roles to each user. Users inherit all permissions from their assigned roles.
        </p>
      </div>

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
          Loading user role assignments...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {profiles.map((profile) => {
            const userRolesList = userRoles[profile.id] || []
            const selectedUserRoles = selectedRoles[profile.id] || []
            const isExpanded = expandedUser === profile.id

            return (
              <div
                key={profile.id}
                style={{
                  border: `1px solid ${C.rule}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isExpanded ? '#f9fafb' : C.white,
                }}
                onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                  e.currentTarget.style.borderColor = C.blue
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = C.rule
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getUserEmoji(profile.relationship)}</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                          {profile.full_name}
                        </h3>
                        <p
                          style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.9rem',
                            color: C.gray,
                            textTransform: 'capitalize',
                          }}
                        >
                          {profile.relationship || 'No relationship'}
                        </p>
                      </div>
                    </div>

                    {/* Current Roles Badge */}
                    {selectedUserRoles.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {selectedUserRoles.map((roleId) => {
                          const role = roles.find((r) => r.id === roleId)
                          return (
                            <span
                              key={roleId}
                              style={{
                                background: C.blue,
                                color: C.white,
                                fontSize: '0.8rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontWeight: 500,
                              }}
                            >
                              {role?.name || 'Unknown'}
                            </span>
                          )
                        })}
                      </div>
                    )}
                    {selectedUserRoles.length === 0 && (
                      <p
                        style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.9rem',
                          color: C.yellow,
                          fontWeight: 500,
                        }}
                      >
                        ⚠️ No roles assigned
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '1.5rem',
                      color: isExpanded ? C.blue : C.gray,
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      marginLeft: '1rem',
                    }}
                  >
                    ▼
                  </div>
                </div>

                {/* Role Assignment Form */}
                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.lightGray}` }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
                      Available Roles
                    </h4>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {roles.map((role) => {
                        const isSelected = selectedUserRoles.includes(role.id)

                        return (
                          <label
                            key={role.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: isSelected ? '#f0f9ff' : C.white,
                              border: `1px solid ${isSelected ? C.blue : C.rule}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              gap: '0.75rem',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = isSelected ? '#f0f9ff' : C.lightGray
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = isSelected ? '#f0f9ff' : C.white
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleRoleToggle(profile.id, role.id, e.target.checked)
                              }
                              disabled={isSaving}
                              style={{
                                cursor: 'pointer',
                                width: '18px',
                                height: '18px',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                              </div>
                              {role.description && (
                                <p
                                  style={{
                                    margin: '0.25rem 0 0 0',
                                    fontSize: '0.85rem',
                                    color: C.gray,
                                  }}
                                >
                                  {role.description}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {profiles.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: C.lightGray,
            borderRadius: '8px',
            color: C.gray,
          }}
        >
          <p>No users found. Create users from the main settings page.</p>
        </div>
      )}
    </div>
  )
}
