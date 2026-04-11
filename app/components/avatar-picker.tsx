'use client'

import React, { useState } from 'react'

interface AvatarPickerProps {
  onSelect: (emoji: string) => void
  currentEmoji?: string
  onClose: () => void
}

// Emoji presets by relationship
const EMOJI_PRESETS: Record<string, string[]> = {
  son: ['👦', '🧒', '👨‍🦰', '👨‍🦱', '👨‍🦲'],
  daughter: ['👧', '🧒', '👩‍🦰', '👩‍🦱', '👩‍🦲'],
  mother: ['👩', '👩‍🦰', '👩‍🦱', '👩‍🦲', '👩‍🦳'],
  father: ['👨', '👨‍🦰', '👨‍🦱', '👨‍🦲', '👨‍🦳'],
  guardian: ['🛡️', '💂', '👮', '🧑‍⚖️', '👨‍💼'],
  maid: ['👩‍💼', '👩‍🍳', '🧑‍🍳', '👩‍⚕️', '👨‍⚕️'],
  nanny: ['👩‍🍼', '🧑‍🍼', '👨‍🍼', '👩‍🏫', '👨‍🏫'],
  grandmother: ['👵', '👩‍🦳', '👩‍🦲', '👩‍🎓', '🧓'],
  grandfather: ['👴', '👨‍🦳', '👨‍🦲', '👨‍🎓', '🧓'],
}

// All emojis for general selection
const ALL_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '🤢', '🤮', '🤮', '🤔', '🤡', '😈', '👿', '👹',
  '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '😺',
  '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  '👦', '👧', '👨', '👩', '👴', '👵', '👶', '👨‍🦰',
  '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧔',
  '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳',
  '👨‍🌾', '👩‍🌾', '👨‍⚖️', '👩‍⚖️', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻',
  '💂', '👮', '👷', '🕵️', '🧑‍🍼', '👩‍🍼', '👨‍🍼', '🧑‍🚀',
  '🛡️', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤',
  '⭐', '✨', '🌟', '💫', '⚡', '🔥', '💥', '🎉',
]

export default function AvatarPicker({ onSelect, currentEmoji = '👤', onClose }: AvatarPickerProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji)
  const [customEmoji, setCustomEmoji] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    onSelect(emoji)
  }

  const handleCustom = () => {
    if (customEmoji.trim()) {
      handleSelect(customEmoji.trim())
    }
  }

  const C = {
    white: '#ffffff',
    black: '#0a0a0a',
    rule: '#e0e0e0',
    green: '#10b981',
    red: '#ef4444',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
    darkGray: '#374151',
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: C.white,
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  }

  const titleStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: C.black,
  }

  const previewStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '4rem',
    lineHeight: '1',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  }

  const emojiButtonStyle: React.CSSProperties = {
    padding: '0.75rem',
    fontSize: '1.5rem',
    border: `2px solid ${C.rule}`,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: C.white,
    transition: 'all 0.2s',
  }

  const customInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${C.rule}`,
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  }

  const buttonStyle: React.CSSProperties = {
    background: C.green,
    color: C.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    marginRight: '0.5rem',
  }

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: C.gray,
  }

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>SELECT AVATAR</h2>

        <div style={previewStyle}>{selectedEmoji}</div>

        {!showCustom ? (
          <>
            <p style={{ fontSize: '0.9rem', color: C.darkGray, marginBottom: '1rem' }}>
              Choose from popular emojis or enter a custom one
            </p>

            <div style={gridStyle}>
              {ALL_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  style={{
                    ...emojiButtonStyle,
                    borderColor: selectedEmoji === emoji ? C.green : C.rule,
                    backgroundColor: selectedEmoji === emoji ? '#d1fae5' : C.white,
                  }}
                  onClick={() => handleSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                marginBottom: '1rem',
              }}
              onClick={() => setShowCustom(true)}
            >
              USE CUSTOM EMOJI
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: C.darkGray, marginBottom: '1rem' }}>
              Enter a custom emoji or text
            </p>

            <input
              type="text"
              style={customInputStyle}
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              placeholder="e.g., 🎨, 📚, 🚀, or custom text"
              maxLength={5}
            />

            <button
              style={{
                ...buttonStyle,
                marginRight: '0.5rem',
              }}
              onClick={handleCustom}
            >
              APPLY CUSTOM
            </button>

            <button
              style={secondaryButtonStyle}
              onClick={() => setShowCustom(false)}
            >
              BACK
            </button>
          </>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button style={secondaryButtonStyle} onClick={onClose}>
            CLOSE
          </button>
          <button style={buttonStyle} onClick={onClose}>
            DONE
          </button>
        </div>
      </div>
    </div>
  )
}
