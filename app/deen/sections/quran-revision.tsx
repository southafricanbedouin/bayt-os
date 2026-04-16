'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MEMBERS } from '../constants'
import { getSurahName } from '@/lib/quran-utils'

const C = {
  green: '#1a3d28',
  gold: '#c9a84c',
  goldDim: '#9b7d38',
  goldPale: '#f0e4c0',
  cream: '#faf8f2',
  white: '#ffffff',
  grey: '#6b7c6e',
  rule: '#ddd8cc',
  ruleLight: '#e8e3d8',
  text: '#0d1a0f',
  forest: '#f0ebe0',
}

const F_SANS = 'var(--font-sans), Georgia, serif'

interface RevisionLog {
  id: string
  member_id: string
  surah: number
  ayah_start: number
  ayah_end: number
  type: 'solo' | 'with_parent' | 'with_shaikh'
  duration_minutes: number
  logged_at: string
  notes?: string
}

interface QuranRevisionProps {
  revisionLogs: RevisionLog[]
  onLogAdded: () => void
  styles: any
}

export default function QuranRevision({ revisionLogs, onLogAdded, styles }: QuranRevisionProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_id: MEMBERS[0]?.id || '',
    surah: 1,
    ayah_start: 1,
    ayah_end: 7,
    type: 'solo' as const,
    duration_minutes: 30,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('quran_revision_logs').insert({
      ...formData,
      logged_at: new Date().toISOString(),
    })

    if (!error) {
      setFormData({
        member_id: MEMBERS[0]?.id || '',
        surah: 1,
        ayah_start: 1,
        ayah_end: 7,
        type: 'solo',
        duration_minutes: 30,
        notes: '',
      })
      setShowForm(false)
      onLogAdded()
    }

    setLoading(false)
  }

  // Weekly stats
  const getWeeklyStats = (memberId: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyLogs = revisionLogs.filter(
      (l) => l.member_id === memberId && new Date(l.logged_at) >= sevenDaysAgo
    )

    const totalMinutes = weeklyLogs.reduce((sum, l) => sum + l.duration_minutes, 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10

    return {
      totalHours,
      sessionCount: weeklyLogs.length,
      averageDuration: weeklyLogs.length > 0 ? Math.round(totalMinutes / weeklyLogs.length) : 0,
    }
  }

  return (
    <div>
      {/* Weekly Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {MEMBERS.filter((m: any) => m.age).map((member: any) => {
          const stats = getWeeklyStats(member.id)
          return (
            <div key={member.id} style={styles.card}>
              <h4 style={{ margin: '0 0 12px 0', color: C.green, fontSize: '0.95rem' }}>
                {member.name}
              </h4>
              <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: C.grey }}>This Week:</span>
                  <br />
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.gold }}>{stats.totalHours}h</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: C.grey }}>
                  {stats.sessionCount} sessions
                  {stats.averageDuration > 0 && ` • ~${stats.averageDuration}min each`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Log Revision Form */}
      {showForm && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Log Revision Session</h4>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: C.text, fontWeight: '500' }}>
                Family Member
              </label>
              <select
                value={formData.member_id}
                onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${C.rule}`,
                  fontFamily: F_SANS,
                }}
              >
                {MEMBERS.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Surah
                </label>
                <input
                  type="number"
                  min="1"
                  max="114"
                  value={formData.surah}
                  onChange={(e) => setFormData({ ...formData, surah: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  From
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ayah_start}
                  onChange={(e) => setFormData({ ...formData, ayah_start: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  To
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ayah_end}
                  onChange={(e) => setFormData({ ...formData, ayah_end: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Revision Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${C.rule}`,
                    fontFamily: F_SANS,
                  }}
                >
                  <option value="solo">Solo</option>
                  <option value="with_parent">With Parent</option>
                  <option value="with_shaikh">With Shaikh</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any challenges or progress notes..."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${C.rule}`,
                  fontFamily: F_SANS,
                  minHeight: '60px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: C.green,
                  color: C.white,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Log Session'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: C.white,
                  color: C.text,
                  border: `1px solid ${C.rule}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: C.goldPale,
            color: C.gold,
            border: `2px solid ${C.gold}`,
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          + Log Revision Session
        </button>
      )}

      {/* Recent Sessions Table */}
      {revisionLogs.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Recent Sessions</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `1px solid ${C.rule}` }}>
                <th style={{ padding: '8px' }}>Member</th>
                <th style={{ padding: '8px' }}>Surah</th>
                <th style={{ padding: '8px' }}>Type</th>
                <th style={{ padding: '8px' }}>Duration</th>
                <th style={{ padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {revisionLogs.slice(0, 8).map((log: any) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                  <td style={{ padding: '8px' }}>{MEMBERS.find((m: any) => m.id === log.member_id)?.name}</td>
                  <td style={{ padding: '8px' }}>{getSurahName(log.surah)}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>
                    {log.type.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: C.gold }}>
                    {log.duration_minutes}m
                  </td>
                  <td style={{ padding: '8px', fontSize: '0.8rem', color: C.grey }}>
                    {new Date(log.logged_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
