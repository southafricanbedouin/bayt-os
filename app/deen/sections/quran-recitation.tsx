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

interface RecitationLog {
  id: string
  member_id: string
  surah_from: number
  ayah_from: number
  surah_to: number
  ayah_to: number
  pages_read: number
  logged_at: string
  notes?: string
}

interface QuranRecitationProps {
  recentLogs: any[]
  onLogAdded: () => void
  C: typeof C
  F_SANS: typeof F_SANS
  styles: any
}

export default function QuranRecitation({ recentLogs, onLogAdded, styles }: QuranRecitationProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_id: MEMBERS[0]?.id || '',
    surah_from: 1,
    ayah_from: 1,
    surah_to: 1,
    ayah_to: 7,
    pages_read: 1,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('quran_progress').insert({
      section: 'recitation',
      ...formData,
      logged_at: new Date().toISOString(),
    })

    if (!error) {
      setFormData({
        member_id: MEMBERS[0]?.id || '',
        surah_from: 1,
        ayah_from: 1,
        surah_to: 1,
        ayah_to: 7,
        pages_read: 1,
        notes: '',
      })
      setShowForm(false)
      onLogAdded()
    }

    setLoading(false)
  }

  // Calculate weekly stats
  const getMemberWeeklyStats = (memberId: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyLogs = recentLogs.filter(
      log =>
        log.member_id === memberId &&
        log.section === 'recitation' &&
        new Date(log.logged_at) >= sevenDaysAgo
    )

    const totalPages = weeklyLogs.reduce((sum, log) => sum + (log.pages_read || 0), 0)
    const weeklyGoal = 5

    return {
      totalPages,
      weeklyGoal,
      percentage: Math.round((totalPages / weeklyGoal) * 100),
      logsCount: weeklyLogs.length,
    }
  }

  return (
    <div>
      {/* Member Cards with Weekly Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {MEMBERS.filter((m: any) => m.age).map((member: any) => {
          const stats = getMemberWeeklyStats(member.id)
          return (
            <div key={member.id} style={styles.card}>
              <h4 style={{ margin: '0 0 12px 0', color: C.green }}>{member.name}'s Reading</h4>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ color: C.grey }}>Weekly Goal</span>
                  <span style={{ fontWeight: 'bold', color: C.goldDim }}>{stats.totalPages}/{stats.weeklyGoal} pages</span>
                </div>
                <div style={{ height: '8px', backgroundColor: C.forest, borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, stats.percentage)}%`,
                      height: '100%',
                      backgroundColor: C.gold,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: C.grey }}>
                {stats.logsCount} readings logged
              </div>
            </div>
          )
        })}
      </div>

      {/* Log Reading Form */}
      {showForm && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Log Reading</h4>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  From Surah
                </label>
                <input
                  type="number"
                  min="1"
                  max="114"
                  value={formData.surah_from}
                  onChange={(e) => setFormData({ ...formData, surah_from: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  From Ayah
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ayah_from}
                  onChange={(e) => setFormData({ ...formData, ayah_from: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  To Surah
                </label>
                <input
                  type="number"
                  min="1"
                  max="114"
                  value={formData.surah_to}
                  onChange={(e) => setFormData({ ...formData, surah_to: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  To Ayah
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.ayah_to}
                  onChange={(e) => setFormData({ ...formData, ayah_to: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Pages Read
              </label>
              <input
                type="number"
                min="1"
                value={formData.pages_read}
                onChange={(e) => setFormData({ ...formData, pages_read: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="E.g., studied Surah Al-Baqarah, learned about patience..."
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
                {loading ? 'Saving...' : 'Log Reading'}
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

            <div style={{ fontSize: '0.8rem', color: C.grey, textAlign: 'center' }}>
              <a
                href="https://www.quranly.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.gold, textDecoration: 'none', fontWeight: 'bold' }}
              >
                📱 Log readings in Quranly App →
              </a>
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
          + Log New Reading
        </button>
      )}

      {/* Recent Logs Table */}
      {recentLogs.filter((l) => l.section === 'recitation').length > 0 && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Recent Readings</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `1px solid ${C.rule}` }}>
                <th style={{ padding: '8px' }}>Member</th>
                <th style={{ padding: '8px' }}>Range</th>
                <th style={{ padding: '8px' }}>Pages</th>
                <th style={{ padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs
                .filter((l) => l.section === 'recitation')
                .slice(0, 5)
                .map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                    <td style={{ padding: '8px' }}>{MEMBERS.find((m: any) => m.id === log.member_id)?.name}</td>
                    <td style={{ padding: '8px' }}>
                      {getSurahName(log.surah_from)}:{log.ayah_from} → {getSurahName(log.surah_to)}:{log.ayah_to}
                    </td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{log.pages_read}</td>
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
