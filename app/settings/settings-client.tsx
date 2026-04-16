'use client'

import { useState } from 'react'
import { createUser, updateUser, resetUserPassword, deleteUser, bulkImportUsers } from './actions'

const C = {
  white: '#ffffff',
  black: '#0a0a0a',
  rule: '#e0e0e0',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  darkGray: '#374151',
}

const F_SANS = 'Inter, system-ui, -apple-system, sans-serif'
const F_MONO = 'Courier New, monospace'

const RELATIONSHIPS = [
  'son',
  'daughter',
  'mother',
  'father',
  'guardian',
  'maid',
  'nanny',
  'grandmother',
  'grandfather',
]

interface Profile {
  id: string
  full_name: string
  relationship?: string
  created_at?: string
}

export default function SettingsClient({
  currentUser,
  allProfiles,
}: {
  currentUser: Profile | null
  allProfiles: Profile[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: 'son',
    email: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [profiles, setProfiles] = useState(allProfiles)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', relationship: 'son', avatarEmoji: '' })
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkImportData, setBulkImportData] = useState<string>('')
  const [viewingActivityUser, setViewingActivityUser] = useState<string | null>(null)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (!formData.fullName || !formData.email || !formData.relationship) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      setIsLoading(false)
      return
    }

    try {
      const result = await createUser({
        fullName: formData.fullName,
        relationship: formData.relationship,
        email: formData.email,
      })

      if (result.success) {
        setMessage({
          type: 'success',
          text: `User ${formData.fullName} created. Temporary password: ${result.tempPassword}`,
        })
        setFormData({ fullName: '', relationship: 'son', email: '' })
        setIsModalOpen(false)

        // Add new profile to list
        if (result.userId) {
          setProfiles([
            {
              id: result.userId,
              full_name: formData.fullName,
              relationship: formData.relationship,
              created_at: new Date().toISOString(),
            },
            ...profiles,
          ])
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create user' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (profile: any) => {
    setEditFormData({
      fullName: profile.full_name,
      email: profile.email || '',
      relationship: profile.relationship || 'son',
      avatarEmoji: profile.avatar_emoji || '',
    })
    setEditingUser(profile.id)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateUser({
        userId: editingUser,
        fullName: editFormData.fullName,
        email: editFormData.email || undefined,
        relationship: editFormData.relationship,
        avatarEmoji: editFormData.avatarEmoji || undefined,
      })

      if (result.success) {
        // Update local profiles list
        setProfiles(
          profiles.map((p) =>
            p.id === editingUser
              ? {
                  ...p,
                  full_name: editFormData.fullName,
                  relationship: editFormData.relationship,
                }
              : p
          )
        )
        setMessage({ type: 'success', text: 'User updated successfully' })
        setEditingUser(null)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update user' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await resetUserPassword(userId)

      if (result.success && result.tempPassword) {
        setGeneratedPassword(result.tempPassword)
        setResetPasswordUser(userId)
        setMessage({
          type: 'success',
          text: 'Password reset. New temporary password generated below.',
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset password' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await deleteUser(userId)

      if (result.success) {
        setProfiles(profiles.filter((p) => p.id !== userId))
        setMessage({ type: 'success', text: 'User deleted successfully' })
        setDeleteConfirm(null)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete user' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkImport = async () => {
    if (!bulkImportData.trim()) {
      setMessage({ type: 'error', text: 'Please paste CSV data' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Parse CSV
      const lines = bulkImportData.trim().split('\n')
      const csvData = lines
        .slice(1) // Skip header
        .map((line) => {
          const [fullName, relationship, email] = line.split(',').map((s) => s.trim())
          return { fullName, relationship, email }
        })

      const result = await bulkImportUsers(csvData)

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Imported ${result.created} users successfully`,
        })
        setBulkImportData('')
        setIsBulkImportOpen(false)
        // Refresh profiles - in real app would fetch updated list
      } else if (result.created > 0) {
        setMessage({
          type: 'success',
          text: `Imported ${result.created} users. ${result.failed} failed.`,
        })
      } else {
        setMessage({
          type: 'error',
          text: result.error || `Import failed: ${result.failed} rows had errors`,
        })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: F_SANS,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: C.black,
    margin: 0,
  }

  const btnAddStyle: React.CSSProperties = {
    background: C.green,
    color: C.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontFamily: F_MONO,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '2rem',
  }

  const thStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: `2px solid ${C.rule}`,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: C.darkGray,
    backgroundColor: C.lightGray,
  }

  const tdStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: `1px solid ${C.rule}`,
    fontSize: '0.9rem',
    color: C.black,
  }

  const modalOverlayStyle: React.CSSProperties = {
    display: isModalOpen ? 'fixed' : 'none',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: C.white,
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  }

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: C.darkGray,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${C.rule}`,
    borderRadius: '6px',
    fontFamily: F_SANS,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  }

  const messageStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    backgroundColor: message?.type === 'success' ? '#d1fae5' : '#fee2e2',
    color: message?.type === 'success' ? '#065f46' : '#991b1b',
    border: `1px solid ${message?.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
  }

  const btnGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  }

  const btnSecondaryStyle: React.CSSProperties = {
    background: C.gray,
    color: C.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontFamily: F_MONO,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  }

  const btnDeleteStyle: React.CSSProperties = {
    background: C.red,
    color: C.white,
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontFamily: F_MONO,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  }

  return (
    <div style={containerStyle}>
      {message && <div style={messageStyle}>{message.text}</div>}

      <div style={headerStyle}>
        <h1 style={titleStyle}>MANAGE USERS</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={btnAddStyle} onClick={() => setIsBulkImportOpen(true)}>
            📤 BULK IMPORT
          </button>
          <button style={btnAddStyle} onClick={() => setIsModalOpen(true)}>
            + ADD USER
          </button>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: C.gray }}>
          <p>No users yet. Click "ADD USER" to create the first user.</p>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>NAME</th>
              <th style={thStyle}>RELATIONSHIP</th>
              <th style={thStyle}>CREATED</th>
              <th style={thStyle}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td style={tdStyle}>
                  <strong>{profile.full_name}</strong>
                </td>
                <td style={tdStyle}>{profile.relationship || '—'}</td>
                <td style={tdStyle}>
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td style={tdStyle}>
                  {deleteConfirm === profile.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={btnDeleteStyle}
                        onClick={() => handleDeleteUser(profile.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        style={btnSecondaryStyle}
                        onClick={() => setDeleteConfirm(null)}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        style={{ ...btnSecondaryStyle, fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleEditUser(profile)}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...btnSecondaryStyle, fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => handleResetPassword(profile.id)}
                      >
                        Reset Pwd
                      </button>
                      <button
                        style={btnDeleteStyle}
                        onClick={() => setDeleteConfirm(profile.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <div
        style={modalOverlayStyle}
        onClick={() => setIsModalOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setIsModalOpen(false)}
      >
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            ADD NEW USER
          </h2>

          <form onSubmit={handleAddUser}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g., Yahya"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Relationship *</label>
              <select
                style={selectStyle}
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                style={inputStyle}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., yahya@example.com"
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '1.5rem' }}>
              A temporary password will be generated. User must change it on first login.
            </p>

            <div style={btnGroupStyle}>
              <button
                type="button"
                style={btnSecondaryStyle}
                onClick={() => setIsModalOpen(false)}
              >
                CANCEL
              </button>
              <button type="submit" style={btnAddStyle} disabled={isLoading}>
                {isLoading ? 'CREATING...' : 'CREATE USER'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit User Modal */}
      <div
        style={{
          ...modalOverlayStyle,
          display: editingUser ? 'flex' : 'none',
        }}
        onClick={() => setEditingUser(null)}
        onKeyDown={(e) => e.key === 'Escape' && setEditingUser(null)}
      >
        <div
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            EDIT USER
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveEdit()
            }}
          >
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                style={inputStyle}
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle}
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Relationship *</label>
              <select
                style={selectStyle}
                value={editFormData.relationship}
                onChange={(e) => setEditFormData({ ...editFormData, relationship: e.target.value })}
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={btnGroupStyle}>
              <button
                type="button"
                style={btnSecondaryStyle}
                onClick={() => setEditingUser(null)}
              >
                CANCEL
              </button>
              <button type="submit" style={btnAddStyle} disabled={isLoading}>
                {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Password Modal */}
      <div
        style={{
          ...modalOverlayStyle,
          display: resetPasswordUser ? 'flex' : 'none',
        }}
        onClick={() => {
          setResetPasswordUser(null)
          setGeneratedPassword(null)
        }}
      >
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            PASSWORD RESET
          </h2>

          {generatedPassword && (
            <>
              <p style={{ fontSize: '0.9rem', color: C.darkGray, marginBottom: '1rem' }}>
                A temporary password has been generated. Share it with the user or ask them to
                reset it on their first login.
              </p>

              <div
                style={{
                  backgroundColor: C.lightGray,
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontFamily: F_MONO,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  color: C.black,
                  wordBreak: 'break-all',
                }}
              >
                {generatedPassword}
              </div>

              <button
                style={btnAddStyle}
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword)
                  setMessage({ type: 'success', text: 'Password copied to clipboard' })
                }}
              >
                📋 COPY PASSWORD
              </button>

              <div style={{ marginTop: '1rem' }}>
                <button
                  style={btnSecondaryStyle}
                  onClick={() => {
                    setResetPasswordUser(null)
                    setGeneratedPassword(null)
                  }}
                >
                  DONE
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bulk Import Modal */}
      <div
        style={{
          ...modalOverlayStyle,
          display: isBulkImportOpen ? 'flex' : 'none',
        }}
        onClick={() => setIsBulkImportOpen(false)}
      >
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            BULK IMPORT USERS
          </h2>

          <p style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '1rem' }}>
            Paste CSV data with headers: Full Name, Relationship, Email
          </p>

          <textarea
            style={{
              ...inputStyle,
              fontFamily: F_MONO,
              minHeight: '200px',
              fontSize: '0.85rem',
            }}
            value={bulkImportData}
            onChange={(e) => setBulkImportData(e.target.value)}
            placeholder="Full Name,Relationship,Email&#10;John Doe,son,john@example.com&#10;Jane Doe,daughter,jane@example.com"
          />

          <p style={{ fontSize: '0.75rem', color: C.gray, marginTop: '0.5rem', marginBottom: '1rem' }}>
            Passwords will be generated automatically
          </p>

          <div style={btnGroupStyle}>
            <button
              type="button"
              style={btnSecondaryStyle}
              onClick={() => {
                setIsBulkImportOpen(false)
                setBulkImportData('')
              }}
            >
              CANCEL
            </button>
            <button
              type="button"
              style={btnAddStyle}
              onClick={handleBulkImport}
              disabled={isLoading}
            >
              {isLoading ? 'IMPORTING...' : 'IMPORT USERS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
