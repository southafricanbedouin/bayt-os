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

interface ModuleInventoryProps {
  modules: Module[]
  onModulesUpdated: () => void
}

export default function ModuleInventory({ modules, onModulesUpdated }: ModuleInventoryProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const categories = Array.from(new Set(modules.map((m) => m.category || 'other')))
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

  const filteredModules = categoryFilter
    ? modules.filter((m) => m.category === categoryFilter)
    : modules

  const groupedByCategory = filteredModules.reduce(
    (acc, mod) => {
      const cat = mod.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(mod)
      return acc
    },
    {} as Record<string, Module[]>
  )

  return (
    <div style={{ fontFamily: F_SANS }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Module Inventory
        </h2>
        <p style={{ color: C.gray, margin: 0, fontSize: '0.9rem' }}>
          All available modules across Bayt OS. These are the features and sections users can access.
        </p>
      </div>

      {/* Category Filter */}
      <div
        style={{
          background: C.lightGray,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Filter by Category
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoryFilter('')}
            style={{
              padding: '0.5rem 1rem',
              background: !categoryFilter ? C.blue : C.white,
              color: !categoryFilter ? C.white : C.black,
              border: `1px solid ${C.rule}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (categoryFilter) {
                e.currentTarget.style.background = C.lightGray
              }
            }}
            onMouseOut={(e) => {
              if (categoryFilter) {
                e.currentTarget.style.background = C.white
              }
            }}
          >
            All Modules ({modules.length})
          </button>

          {categories.sort().map((cat) => {
            const count = modules.filter((m) => m.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  background: categoryFilter === cat ? C.blue : C.white,
                  color: categoryFilter === cat ? C.white : C.black,
                  border: `1px solid ${C.rule}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.background = C.lightGray
                  }
                }}
                onMouseOut={(e) => {
                  if (categoryFilter !== cat) {
                    e.currentTarget.style.background = C.white
                  }
                }}
              >
                {categoryLabels[cat] || cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Module Groups */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {Object.entries(groupedByCategory).map(([category, categoryModules]) => (
          <div key={category}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                margin: '0 0 1rem 0',
                color: C.darkGray,
              }}
            >
              {categoryLabels[category] || category}
            </h3>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {categoryModules
                .sort((a, b) => a.display_order - b.display_order)
                .map((module) => {
                  const isExpanded = expandedModule === module.id

                  return (
                    <div
                      key={module.id}
                      style={{
                        border: `1px solid ${C.rule}`,
                        borderRadius: '8px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isExpanded ? '#f9fafb' : C.white,
                      }}
                      onClick={() => setExpandedModule(isExpanded ? null : module.id)}
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
                            <span style={{ fontSize: '1.5rem' }}>{module.icon || '📦'}</span>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                {module.name}
                              </h4>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: C.gray }}>
                                {module.slug}
                              </p>
                            </div>
                          </div>
                          {module.description && !isExpanded && (
                            <p style={{ color: C.gray, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                              {module.description}
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginLeft: '1rem',
                          }}
                        >
                          <div
                            style={{
                              background: C.green,
                              color: C.white,
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '3px',
                              fontWeight: 600,
                            }}
                          >
                            #{module.display_order}
                          </div>

                          <div
                            style={{
                              fontSize: '1.5rem',
                              color: isExpanded ? C.blue : C.gray,
                              transition: 'transform 0.2s',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          >
                            ▼
                          </div>
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
                              <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>MODULE SLUG</span>
                              <p
                                style={{
                                  margin: '0.25rem 0 0 0',
                                  fontSize: '0.9rem',
                                  fontFamily: 'monospace',
                                  color: C.darkGray,
                                }}
                              >
                                {module.slug}
                              </p>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>
                                DISPLAY ORDER
                              </span>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                                {module.display_order}
                              </p>
                            </div>

                            {module.description && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>
                                  DESCRIPTION
                                </span>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: C.darkGray }}>
                                  {module.description}
                                </p>
                              </div>
                            )}

                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ fontSize: '0.8rem', color: C.gray, fontWeight: 600 }}>
                                CREATED
                              </span>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                                {new Date(module.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div style={{ marginTop: '1rem', padding: '1rem', background: C.lightGray, borderRadius: '6px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: C.gray }}>
                              💡 Modules define what users can access. Roles specify which permissions (view,
                              create, edit, delete) users have for each module.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: C.lightGray,
            borderRadius: '8px',
            color: C.gray,
          }}
        >
          <p>No modules found in this category.</p>
        </div>
      )}

      {/* Summary */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f9ff',
          border: `1px solid ${C.blue}`,
          borderRadius: '8px',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          <strong>📊 Total Modules:</strong> {modules.length} across{' '}
          {categories.length} categories
        </p>
      </div>
    </div>
  )
}
