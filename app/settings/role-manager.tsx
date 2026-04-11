'use client'

import { useState } from 'react'

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

interface RoleManagerProps {
  roles: Role[]
  onRolesUpdated: () => void
  onSelectRole: (roleId: string) => void
}

export default function RoleManager({ roles, onRolesUpdated, onSelectRole }: RoleManagerProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  const getRoleEmoji = (roleName: string): string => {
    const emojiMap: Record<string, string> = {
      admin: '👑',
      parent: '👨‍👩‍👧‍👦',
      guardian: '🛡️',
      teenager: '👨‍🎓',
      child: '👧',
      staff: '👔',
      maid: '🧹',
      nanny: '👩‍🍼',
    }
    return emojiMap[roleName.toLowerCase()] || '👥'
  }

  const getRoleDescription = (roleName: string): string => {
    const descriptions: Record<string, string> = {
      admin: 'Full administrative access to all modules and settings',
      parent: 'Parent/guardian with full access and user management',
      guardian: 'Guardian with management access (secondary parent)',
      teenager: 'Older children with curated module access',
      child: 'Younger children with limited module access',
      staff: 'Household staff access (operations-focused)',
      maid: 'Maid role with operations permissions',
      nanny: 'Nanny role with childcare and operations access',
    }
    return descriptions[roleName.toLowerCase()] || roleName
  }

  return (
    <div style={{ fontFamily: F_SANS }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          Role Management
        </h2>
        <p style={{ color: C.gray, margin: 0, fontSize: '0.9rem' }}>
          Predefined roles that can be assigned to users. System roles cannot be deleted.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {roles.map((role) => (
          <div
            key={role.id}
            style={{
              border: `1px solid ${C.rule}`,
              borderRadius: '8px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: expandedRole === role.id ? '#f9fafb' : C.white,
              boxShadow: expandedRole === role.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
            onClick={() => {
              setExpandedRole(expandedRole === role.id ? null : role.id)
              onSelectRole(role.id)
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
              e.currentTarget.style.borderColor = C.blue
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = expandedRole === role.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              e.currentTarget.style.borderColor = C.rule
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getRoleEmoji(role.name)}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {role.name}
                    </h3>
                    {role.system_role && (
                      <span
                        style={{
                          display: 'inline-block',
                          background: C.blue,
                          color: C.white,
                          fontSize: '0.7rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '3px',
                          marginTop: '0.25rem',
                          fontWeight: 600,
                        }}
                      >
                        SYSTEM ROLE
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ color: C.gray, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  {getRoleDescription(role.name)}
                </p>
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  color: expandedRole === role.id ? C.blue : C.gray,
                  transition: 'transform 0.2s',
                  transform: expandedRole === role.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  marginLeft: '1rem',
                }}
              >
                ▼
              </div>
            </div>

            {expandedRole === role.id && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.lightGray}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>CREATED</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                      {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>STATUS</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: C.green }}>
                      ✓ Active
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Navigate to permission matrix for this role
                      onSelectRole(role.id)
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: C.blue,
                      color: C.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    → Configure Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: C.lightGray,
            borderRadius: '8px',
            color: C.gray,
          }}
        >
          <p>No roles found. Initialize access control by executing the migration.</p>
        </div>
      )}
    </div>
  )
}
