'use client'

import { useState, useEffect } from 'react'
import { getRoles, getModules, getRolePermissions, getAccessLogs, getUserRoles } from './access-control-actions'
import RoleManager from './role-manager'
import PermissionMatrix from './permission-matrix'
import UserRoleAssignment from './user-role-assignment'
import AccessAuditLog from './access-audit-log'
import ModuleInventory from './module-inventory'

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

type TabType = 'roles' | 'permissions' | 'user-assignments' | 'audit-log' | 'modules'

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

interface AccessLog {
  id: string
  user_id: string
  module: string
  action: string
  resource_id?: string
  timestamp: string
  ip_address?: string
  full_name?: string
}

interface AllProfiles {
  id: string
  full_name: string
  relationship?: string
  created_at?: string
}

export default function AccessControlPage({ allProfiles }: { allProfiles: AllProfiles[] }) {
  const [activeTab, setActiveTab] = useState<TabType>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [rolesData, modulesData, logsData] = await Promise.all([
        getRoles(),
        getModules(),
        getAccessLogs(100),
      ])
      setRoles(rolesData)
      setModules(modulesData)
      setAccessLogs(logsData)
      if (rolesData.length > 0) {
        setSelectedRoleForPermissions(rolesData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading access control data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'roles' as const, label: '📋 Roles', icon: '👥' },
    { id: 'permissions' as const, label: '🔐 Permissions', icon: '⚙️' },
    { id: 'user-assignments' as const, label: '👤 User Assignments', icon: '🎯' },
    { id: 'audit-log' as const, label: '📊 Audit Log', icon: '📈' },
    { id: 'modules' as const, label: '🧩 Modules', icon: '📦' },
  ]

  return (
    <div style={{ fontFamily: F_SANS, color: C.black }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          🔒 Access Control
        </h1>
        <p style={{ color: C.gray, margin: 0, fontSize: '0.95rem' }}>
          Manage roles, permissions, and module access across Bayt OS
        </p>
      </div>

      {/* Status Messages */}
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

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: C.gray }}>
          <p>Loading access control data...</p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              borderBottom: `2px solid ${C.lightGray}`,
              overflowX: 'auto',
              paddingBottom: '1rem',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: activeTab === tab.id ? C.blue : 'transparent',
                  color: activeTab === tab.id ? C.white : C.gray,
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = C.lightGray
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'roles' && (
              <RoleManager
                roles={roles}
                onRolesUpdated={loadInitialData}
                onSelectRole={setSelectedRoleForPermissions}
              />
            )}

            {activeTab === 'permissions' && selectedRoleForPermissions && (
              <PermissionMatrix
                roleId={selectedRoleForPermissions}
                roles={roles}
                modules={modules}
                onRoleChange={setSelectedRoleForPermissions}
                onPermissionsUpdated={loadInitialData}
              />
            )}

            {activeTab === 'user-assignments' && (
              <UserRoleAssignment
                profiles={allProfiles}
                roles={roles}
                onAssignmentsUpdated={loadInitialData}
              />
            )}

            {activeTab === 'audit-log' && (
              <AccessAuditLog
                initialLogs={accessLogs}
                modules={modules}
                profiles={allProfiles}
                onRefresh={async () => {
                  const updatedLogs = await getAccessLogs(100)
                  setAccessLogs(updatedLogs)
                }}
              />
            )}

            {activeTab === 'modules' && (
              <ModuleInventory
                modules={modules}
                onModulesUpdated={loadInitialData}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
