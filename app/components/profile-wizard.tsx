'use client'

import React, { useState, useEffect } from 'react'
import AvatarPicker from './avatar-picker'

interface ProfileWizardStep {
  step: number
  title: string
  description: string
}

interface ProfileWizardData {
  avatarEmoji: string
  bio: string
  currentFocus: string
  interests: string[]
  loveLanguage: string
}

const LOVE_LANGUAGES = [
  'Quality Time',
  'Words of Affirmation',
  'Acts of Service',
  'Receiving Gifts',
  'Physical Touch',
]

const C = {
  white: '#ffffff',
  black: '#0a0a0a',
  rule: '#e0e0e0',
  green: '#10b981',
  darkGreen: '#065f46',
  red: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
  blue: '#3b82f6',
}

const STEPS: ProfileWizardStep[] = [
  { step: 1, title: 'Choose Your Avatar', description: 'Pick an emoji or custom text to represent you' },
  { step: 2, title: 'Tell Us About You', description: 'Share your bio and current focus' },
  { step: 3, title: 'Your Interests', description: 'What are you passionate about?' },
  { step: 4, title: 'Love Language', description: 'How do you prefer to receive appreciation?' },
  { step: 5, title: 'Review & Complete', description: 'Ready to finish?' },
]

interface ProfileWizardProps {
  onComplete: (data: ProfileWizardData) => Promise<void>
  initialData?: Partial<ProfileWizardData>
  memberId: string
  onDismiss: () => void
}

export default function ProfileWizard({
  onComplete,
  initialData = {},
  memberId,
  onDismiss,
}: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isShowingAvatarPicker, setIsShowingAvatarPicker] = useState(false)
  const [interestInput, setInterestInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Initialize from localStorage or props
  const storageKey = `bayt-wizard-${memberId}`
  const [data, setData] = useState<ProfileWizardData>(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      avatarEmoji: initialData.avatarEmoji || '👤',
      bio: initialData.bio || '',
      currentFocus: initialData.currentFocus || '',
      interests: initialData.interests || [],
      loveLanguage: initialData.loveLanguage || '',
    }
  })

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data, storageKey])

  const updateData = (updates: Partial<ProfileWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleAddInterest = () => {
    if (interestInput.trim() && !data.interests.includes(interestInput.trim())) {
      updateData({ interests: [...data.interests, interestInput.trim()] })
      setInterestInput('')
    }
  }

  const handleRemoveInterest = (index: number) => {
    updateData({ interests: data.interests.filter((_, i) => i !== index) })
  }

  const handleNext = () => {
    setError('')
    // Validate current step
    if (currentStep === 1 && !data.avatarEmoji) {
      setError('Please select an avatar')
      return
    }
    if (currentStep === 5 && (!data.bio || !data.currentFocus || !data.loveLanguage)) {
      setError('Please fill in required fields before completing')
      return
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setError('')
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    setError('')
    setSaving(true)
    try {
      await onComplete(data)
      localStorage.removeItem(storageKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      setSaving(false)
    }
  }

  const progressPercent = Math.round((currentStep / STEPS.length) * 100)

  // Step 1: Avatar Picker
  const renderStep1 = () => (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '5rem',
          marginBottom: '2rem',
          cursor: 'pointer',
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: C.lightGray,
          transition: 'all 0.2s',
        }}
        onClick={() => setIsShowingAvatarPicker(true)}
      >
        {data.avatarEmoji}
      </div>
      <p style={{ color: C.gray, marginBottom: '1.5rem' }}>
        Click above to select or browse emoji options
      </p>
      <button
        style={{
          background: C.green,
          color: C.white,
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        onClick={() => setIsShowingAvatarPicker(true)}
      >
        CHOOSE EMOJI
      </button>
    </div>
  )

  // Step 2: Bio & Current Focus
  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: C.black }}>
          Bio (optional)
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => updateData({ bio: e.target.value })}
          placeholder="Tell us about yourself..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${C.rule}`,
            borderRadius: '6px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            minHeight: '100px',
            resize: 'vertical',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: C.black }}>
          Current Focus (optional)
        </label>
        <input
          type="text"
          value={data.currentFocus}
          onChange={(e) => updateData({ currentFocus: e.target.value })}
          placeholder="What are you focused on right now?"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${C.rule}`,
            borderRadius: '6px',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  )

  // Step 3: Interests
  const renderStep3 = () => (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: C.black }}>
          Add Interests
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddInterest()
              }
            }}
            placeholder="e.g., reading, coding, sports..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: `1px solid ${C.rule}`,
              borderRadius: '6px',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleAddInterest}
            style={{
              background: C.green,
              color: C.white,
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            ADD
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: C.black }}>
          Your Interests ({data.interests.length})
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {data.interests.length === 0 ? (
            <p style={{ color: C.gray, fontSize: '0.9rem' }}>No interests added yet</p>
          ) : (
            data.interests.map((interest, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: C.lightGray,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                }}
              >
                {interest}
                <button
                  onClick={() => handleRemoveInterest(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: C.red,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  // Step 4: Love Language
  const renderStep4 = () => (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '1rem', color: C.black }}>
        Select your Love Language
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {LOVE_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => updateData({ loveLanguage: lang })}
            style={{
              padding: '1rem',
              border: `2px solid ${data.loveLanguage === lang ? C.green : C.rule}`,
              borderRadius: '6px',
              background: data.loveLanguage === lang ? '#d1fae5' : C.white,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: data.loveLanguage === lang ? 600 : 500,
              color: data.loveLanguage === lang ? C.darkGreen : C.black,
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  )

  // Step 5: Summary
  const renderStep5 = () => (
    <div>
      <div
        style={{
          background: C.lightGray,
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: C.black }}>
          Profile Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: C.gray, marginBottom: '0.25rem' }}>Avatar</div>
            <div style={{ fontSize: '2rem' }}>{data.avatarEmoji}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.9rem', color: C.gray, marginBottom: '0.25rem' }}>Love Language</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: C.darkGreen }}>
              {data.loveLanguage || 'Not selected'}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.9rem', color: C.gray, marginBottom: '0.25rem' }}>Bio</div>
            <div style={{ fontSize: '1rem', color: C.black }}>
              {data.bio || '(Not filled in)'}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.9rem', color: C.gray, marginBottom: '0.25rem' }}>Current Focus</div>
            <div style={{ fontSize: '1rem', color: C.black }}>
              {data.currentFocus || '(Not filled in)'}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.9rem', color: C.gray, marginBottom: '0.5rem' }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.interests.length === 0 ? (
                <span style={{ fontSize: '0.9rem', color: C.gray }}>(No interests added)</span>
              ) : (
                data.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: C.green,
                      color: C.white,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {interest}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#fef3c7',
          border: `1px solid #fcd34d`,
          padding: '1rem',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: '#78350f',
        }}
      >
        ℹ️ You can edit any of these details later from your profile page.
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return null
    }
  }

  const step = STEPS[currentStep - 1]

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={onDismiss}
      >
        <div
          style={{
            backgroundColor: C.white,
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: C.black }}>
                Complete Your Profile
              </h2>
              <button
                onClick={onDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: C.gray,
                }}
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  height: '6px',
                  backgroundColor: C.lightGray,
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: C.green,
                    width: `${progressPercent}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: C.gray,
                  marginTop: '0.25rem',
                  textAlign: 'right',
                }}
              >
                Step {currentStep} of {STEPS.length}
              </div>
            </div>
          </div>

          {/* Step Title & Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: C.black }}>
              {step.title}
            </h3>
            <p style={{ margin: 0, color: C.gray, fontSize: '0.95rem' }}>
              {step.description}
            </p>
          </div>

          {/* Step Content */}
          <div style={{ marginBottom: '2rem', minHeight: '200px' }}>
            {renderStepContent()}
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: `1px solid #fecaca`,
                padding: '0.75rem',
                borderRadius: '6px',
                color: '#991b1b',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={saving}
                style={{
                  background: C.gray,
                  color: C.white,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                BACK
              </button>
            )}

            {currentStep < STEPS.length && (
              <button
                onClick={handleSkip}
                disabled={saving}
                style={{
                  background: C.lightGray,
                  color: C.gray,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                SKIP
              </button>
            )}

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={saving}
                style={{
                  background: C.green,
                  color: C.white,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                NEXT
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                style={{
                  background: C.darkGreen,
                  color: C.white,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'SAVING...' : 'COMPLETE PROFILE'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {isShowingAvatarPicker && (
        <AvatarPicker
          onSelect={(emoji) => {
            updateData({ avatarEmoji: emoji })
            setIsShowingAvatarPicker(false)
          }}
          currentEmoji={data.avatarEmoji}
          onClose={() => setIsShowingAvatarPicker(false)}
        />
      )}
    </>
  )
}
