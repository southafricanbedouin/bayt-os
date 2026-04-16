'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MEMBERS } from '../constants'
import { getSurahName, TOTAL_QURAN_AYAS } from '@/lib/quran-utils'

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
  orange: '#e07b39',
}

const F_SANS = 'var(--font-sans), Georgia, serif'

interface HifzLog {
  id: string
  member_id: string
  surah: number
  ayah_start: number
  ayah_end: number
  status: 'learning' | 'memorized' | 'revision'
  confidence_level: number
  date_completed?: string
  notes?: string
}

interface QuranHifzProps {
  hifzLogs: HifzLog[]
  onLogAdded: () => void
  styles: any
}

export default function QuranHifz({ hifzLogs, onLogAdded, styles }: QuranHifzProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_id: MEMBERS[0]?.id || '',
    surah: 1,
    ayah_start: 1,
    ayah_end: 7,
    status: 'learning' as const,
    confidence_level: 3,
    date_completed: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('hifz_progress').insert({
      ...formData,
      confidence_level: parseInt(String(formData.confidence_level)),
      logged_at: new Date().toISOString(),
    })

    if (!error) {
      setFormData({
        member_id: MEMBERS[0]?.id || '',
        surah: 1,
        ayah_start: 1,
        ayah_end: 7,
        status: 'learning',
        confidence_level: 3,
        date_completed: '',
        notes: '',
      })
      setShowForm(false)
      onLogAdded()
    }

    setLoading(false)
  }

  // Calculate member stats
  const getMemberStats = (memberId: string) => {
    const memberLogs = hifzLogs.filter((l) => l.member_id === memberId)
    const memorizedLogs = memberLogs.filter((l) => l.status === 'memorized')

    let totalAyas = 0
    const surahs: Set<number> = new Set()

    memberLogs.forEach((log) => {
      totalAyas += log.ayah_end - log.ayah_start + 1
      if (log.status === 'memorized') {
        surahs.add(log.surah)
      }
    })

    return {
      totalAyas,
      totalMemorized: totalAyas,
      percentage: Math.round((totalAyas / TOTAL_QURAN_AYAS) * 100),
      surahs: Array.from(surahs),
      logsCount: memberLogs.length,
    }
  }

  return (
    <div>
      {/* Member Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {MEMBERS.filter((m: any) => m.age).map((member: any) => {
          const stats = getMemberStats(member.id)
          return (
            <div key={member.id} style={styles.card}>
              <h4 style={{ margin: '0 0 12px 0', color: C.green }}>{member.name}'s Hifz</h4>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: C.gold, marginBottom: '4px' }}>
                  {stats.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: C.grey }}>
                  {stats.totalAyas.toLocaleString()} / {TOTAL_QURAN_AYAS.toLocaleString()} Ayas
                </div>
              </div>
              {stats.surahs.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: C.grey }}>
                  {stats.surahs.length} Surahs memorized
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Hifz Form */}
      {showForm && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Track Memorization</h4>
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
                  From Ayah
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
                  To Ayah
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${C.rule}`,
                  fontFamily: F_SANS,
                }}
              >
                <option value="learning">Learning</option>
                <option value="memorized">Memorized</option>
                <option value="revision">Revision</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Confidence Level: {formData.confidence_level}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.confidence_level}
                onChange={(e) => setFormData({ ...formData, confidence_level: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            {formData.status === 'memorized' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Date Memorized
                </label>
                <input
                  type="date"
                  value={formData.date_completed}
                  onChange={(e) => setFormData({ ...formData, date_completed: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Challenges, insights, or progress notes..."
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
                {loading ? 'Saving...' : 'Save Hifz'}
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
          + Track Memorization
        </button>
      )}

      {/* Hifz Progress Table */}
      {hifzLogs.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Memorization Progress</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `1px solid ${C.rule}` }}>
                <th style={{ padding: '8px' }}>Member</th>
                <th style={{ padding: '8px' }}>Surah</th>
                <th style={{ padding: '8px' }}>Ayas</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {hifzLogs.slice(0, 8).map((log: any) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                  <td style={{ padding: '8px' }}>{MEMBERS.find((m: any) => m.id === log.member_id)?.name}</td>
                  <td style={{ padding: '8px' }}>{getSurahName(log.surah)}</td>
                  <td style={{ padding: '8px' }}>
                    {log.ayah_start}:{log.ayah_end}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor:
                          log.status === 'memorized'
                            ? C.goldPale
                            : log.status === 'revision'
                              ? C.forest
                              : '#e8f4f8',
                        color:
                          log.status === 'memorized'
                            ? C.gold
                            : log.status === 'revision'
                              ? C.text
                              : C.blue,
                      }}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '8px', color: C.gold, fontWeight: 'bold' }}>
                    {'⭐'.repeat(log.confidence_level)}
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
