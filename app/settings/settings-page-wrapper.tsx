'use client'

import { useState } from 'react'
import SettingsClient from './settings-client'
import AccessControlPage from './access-control-page'

const C = {
  white: '#ffffff',
  black: '#0a0a0a',
  rule: '#e0e0e0',
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

interface SettingsPageWrapperProps {
  currentUser: Profile | null
  allProfiles: Profile[]
}

type TabType = 'users' | 'access-control'

export default function SettingsPageWrapper({
  currentUser,
  allProfiles,
}: SettingsPageWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users')

  const tabs = [
    { id: 'users' as const, label: '👥 User Management', icon: '👥' },
    { id: 'access-control' as const, label: '🔒 Access Control', icon: '🔒' },
  ]

  return (
    <div style={{ fontFamily: F_SANS, color: C.black }}>
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
        {activeTab === 'users' && (
          <SettingsClient currentUser={currentUser} allProfiles={allProfiles} />
        )}

        {activeTab === 'access-control' && (
          <AccessControlPage allProfiles={allProfiles} />
        )}
      </div>
    </div>
  )
}
