'use client'

import { useState } from 'react'
import { getAccessLogs } from './access-control-actions'

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

interface Profile {
  id: string
  full_name: string
  relationship?: string
  created_at?: string
}

interface AccessAuditLogProps {
  initialLogs: AccessLog[]
  modules: Module[]
  profiles: Profile[]
  onRefresh: () => Promise<void>
}

export default function AccessAuditLog({
  initialLogs,
  modules,
  profiles,
  onRefresh,
}: AccessAuditLogProps) {
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [moduleFilter, setModuleFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      await onRefresh()
      const updatedLogs = await getAccessLogs(100, moduleFilter || undefined, userFilter || undefined)
      setLogs(updatedLogs)
    } catch (err) {
      console.error('Error refreshing logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = async () => {
    try {
      setIsLoading(true)
      const filteredLogs = await getAccessLogs(100, moduleFilter || undefined, userFilter || undefined)
      setLogs(filteredLogs)
    } catch (err) {
      console.error('Error filtering logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionEmoji = (action: string): string => {
    const emojiMap: Record<string, string> = {
      view: '👁️',
      create: '✨',
      edit: '✏️',
      delete: '🗑️',
    }
    return emojiMap[action.toLowerCase()] || '📝'
  }

  const getActionColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      view: C.blue,
      create: C.green,
      edit: C.yellow,
      delete: C.red,
    }
    return colorMap[action.toLowerCase()] || C.gray
  }

  const getModuleIcon = (moduleSlug: string): string => {
    const module = modules.find((m) => m.slug === moduleSlug)
    return module?.icon || '📦'
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredLogs = logs.filter((log) => {
    const matchesModule = !moduleFilter || log.module === moduleFilter
    const matchesUser = !userFilter || log.user_id === userFilter
    return matchesModule && matchesUser
  })

  return (
    <div style={{ fontFamily: F_SANS }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Access Audit Log
        </h2>
        <p style={{ color: C.gray, margin: 0, fontSize: '0.9rem' }}>
          Complete audit trail of all module access. Filter by user or module for detailed analysis.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: C.lightGray,
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Module Filter
          </label>
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value)
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${C.rule}`,
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontFamily: F_SANS,
            }}
          >
            <option value="">All Modules</option>
            {modules.map((module) => (
              <option key={module.id} value={module.slug}>
                {module.icon} {module.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            User Filter
          </label>
          <select
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value)
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${C.rule}`,
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontFamily: F_SANS,
            }}
          >
            <option value="">All Users</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            onClick={handleFilterChange}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: C.blue,
              color: C.white,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = isLoading ? '0.6' : '0.9'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = isLoading ? '0.6' : '1'
            }}
          >
            🔍 Filter
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: C.green,
              color: C.white,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'opacity 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = isLoading ? '0.6' : '0.9'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = isLoading ? '0.6' : '1'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Log List */}
      <div>
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: C.gray, fontWeight: 600 }}>
          Showing {filteredLogs.length} access events
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: C.gray }}>
            Loading logs...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const isExpanded = expandedLog === log.id
                const profile = profiles.find((p) => p.id === log.user_id)
                const actionColor = getActionColor(log.action)

                return (
                  <div
                    key={log.id}
                    style={{
                      border: `1px solid ${C.rule}`,
                      borderRadius: '6px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isExpanded ? '#f9fafb' : C.white,
                    }}
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
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
                          <span style={{ fontSize: '1.25rem' }}>{getModuleIcon(log.module)}</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                              {log.module.charAt(0).toUpperCase() + log.module.slice(1)}
                            </h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: C.gray }}>
                              {profile?.full_name || 'Unknown User'} •{' '}
                              <span
                                style={{
                                  background: actionColor,
                                  color: C.white,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '3px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  display: 'inline-block',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                {getActionEmoji(log.action)} {log.action.toUpperCase()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          fontSize: '0.85rem',
                          color: C.gray,
                          marginLeft: '1rem',
                        }}
                      >
                        <div>{formatTimestamp(log.timestamp)}</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
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

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${C.lightGray}`,
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>USER ID</span>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                              {log.user_id}
                            </p>
                          </div>
                          {log.resource_id && (
                            <div>
                              <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>RESOURCE ID</span>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                {log.resource_id}
                              </p>
                            </div>
                          )}
                          {log.ip_address && (
                            <div>
                              <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>IP ADDRESS</span>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                {log.ip_address}
                              </p>
                            </div>
                          )}
                          <div>
                            <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>TIMESTAMP</span>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: C.lightGray,
                  borderRadius: '8px',
                  color: C.gray,
                }}
              >
                <p>No access logs found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
