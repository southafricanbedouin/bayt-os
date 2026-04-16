'use client'

import React, { useMemo } from 'react'

interface ProfileData {
  avatarEmoji?: string
  bio?: string
  currentFocus?: string
  interests?: string[]
  loveLanguage?: string
  fullName?: string
  email?: string
}

interface ProfileCompletenessMeterProps {
  profile: ProfileData
  onStartWizard?: () => void
  showLabel?: boolean
  compact?: boolean
}

const C = {
  white: '#ffffff',
  black: '#0a0a0a',
  green: '#10b981',
  darkGreen: '#065f46',
  orange: '#f59e0b',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
  blue: '#3b82f6',
  red: '#ef4444',
}

export default function ProfileCompletenessMeter({
  profile,
  onStartWizard,
  showLabel = true,
  compact = false,
}: ProfileCompletenessMeterProps) {
  const completion = useMemo(() => {
    const fields = [
      'fullName',
      'email',
      'avatarEmoji',
      'bio',
      'currentFocus',
      'loveLanguage',
      'interests',
    ]

    let completedFields = 0
    let filledFields = 0

    // Required fields: fullName, email
    if (profile.fullName?.trim()) filledFields++
    if (profile.email?.trim()) filledFields++

    // Optional fields
    if (profile.avatarEmoji && profile.avatarEmoji !== '👤') filledFields++
    if (profile.bio?.trim()) filledFields++
    if (profile.currentFocus?.trim()) filledFields++
    if (profile.loveLanguage?.trim()) filledFields++
    if (profile.interests && profile.interests.length > 0) filledFields++

    // Calculate: (required + optional) / total
    completedFields = Math.round((filledFields / fields.length) * 100)

    return {
      percent: completedFields,
      filledFields,
      totalFields: fields.length,
    }
  }, [profile])

  const isComplete = completion.percent === 100
  const needsAttention = completion.percent < 50
  const isGood = completion.percent >= 50 && completion.percent < 100

  const meterColor = isComplete ? C.darkGreen : needsAttention ? C.orange : C.green

  if (compact) {
    // Minimal inline version
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: C.lightGray,
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: meterColor,
              width: `${completion.percent}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <span style={{ color: C.gray, whiteSpace: 'nowrap' }}>
          {completion.percent}%
        </span>
      </div>
    )
  }

  // Full version with label and button
  return (
    <div
      style={{
        background: isComplete ? '#d1fae5' : needsAttention ? '#fef3c7' : '#dbeafe',
        border: `1px solid ${isComplete ? '#a7f3d0' : needsAttention ? '#fde68a' : '#bfdbfe'}`,
        padding: '1rem',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        {showLabel && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.darkGray }}>
              PROFILE COMPLETENESS
            </div>
            <div style={{ fontSize: '0.75rem', color: C.gray, marginTop: '0.25rem' }}>
              {completion.filledFields} of {completion.totalFields} fields
            </div>
          </div>
        )}
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: meterColor,
          }}
        >
          {completion.percent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '8px',
          backgroundColor: C.lightGray,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: meterColor,
            width: `${completion.percent}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Status Message */}
      {!isComplete && (
        <div style={{ marginBottom: '1rem' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: needsAttention ? '#92400e' : '#0369a1',
            }}
          >
            {needsAttention
              ? '📝 Add more details to complete your profile'
              : '✨ Almost there! Fill in a few more details'}
          </p>
        </div>
      )}

      {isComplete && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: C.darkGreen,
            fontWeight: 600,
          }}
        >
          ✅ Your profile is complete!
        </div>
      )}

      {/* Call to Action */}
      {!isComplete && onStartWizard && (
        <button
          onClick={onStartWizard}
          style={{
            width: '100%',
            background: meterColor,
            color: C.white,
            border: 'none',
            padding: '0.75rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {completion.percent === 0 ? 'START PROFILE SETUP' : 'CONTINUE PROFILE SETUP'}
        </button>
      )}
    </div>
  )
}
