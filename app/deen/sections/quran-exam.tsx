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

interface ExamLog {
  id: string
  member_id: string
  exam_date: string
  type: 'self_test' | 'parent_test' | 'formal_exam'
  surah: number
  ayah_start: number
  ayah_end: number
  performance_rating: number
  errors_count: number
  fluency_rating: number
  feedback_notes?: string
}

interface QuranExamProps {
  examLogs: ExamLog[]
  onLogAdded: () => void
  styles: any
}

export default function QuranExam({ examLogs, onLogAdded, styles }: QuranExamProps) {
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_id: MEMBERS[0]?.id || '',
    exam_date: new Date().toISOString().split('T')[0],
    type: 'parent_test' as const,
    surah: 1,
    ayah_start: 1,
    ayah_end: 7,
    performance_rating: 3,
    errors_count: 0,
    fluency_rating: 3,
    feedback_notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('quran_exams').insert({
      ...formData,
      performance_rating: parseInt(String(formData.performance_rating)),
      fluency_rating: parseInt(String(formData.fluency_rating)),
      errors_count: parseInt(String(formData.errors_count)),
    })

    if (!error) {
      setFormData({
        member_id: MEMBERS[0]?.id || '',
        exam_date: new Date().toISOString().split('T')[0],
        type: 'parent_test',
        surah: 1,
        ayah_start: 1,
        ayah_end: 7,
        performance_rating: 3,
        errors_count: 0,
        fluency_rating: 3,
        feedback_notes: '',
      })
      setShowForm(false)
      onLogAdded()
    }

    setLoading(false)
  }

  // Calculate member stats
  const getMemberStats = (memberId: string) => {
    const memberExams = examLogs.filter((l) => l.member_id === memberId)

    if (memberExams.length === 0) {
      return {
        totalExams: 0,
        avgPerformance: 0,
        avgFluency: 0,
        totalErrors: 0,
      }
    }

    const avgPerformance = Math.round(
      memberExams.reduce((sum, e) => sum + e.performance_rating, 0) / memberExams.length
    )
    const avgFluency = Math.round(
      memberExams.reduce((sum, e) => sum + e.fluency_rating, 0) / memberExams.length
    )
    const totalErrors = memberExams.reduce((sum, e) => sum + e.errors_count, 0)

    return {
      totalExams: memberExams.length,
      avgPerformance,
      avgFluency,
      totalErrors,
    }
  }

  return (
    <div>
      {/* Member Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {MEMBERS.filter((m: any) => m.age).map((member: any) => {
          const stats = getMemberStats(member.id)
          return (
            <div key={member.id} style={styles.card}>
              <h4 style={{ margin: '0 0 12px 0', color: C.green, fontSize: '0.95rem' }}>
                {member.name}
              </h4>
              <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: C.grey }}>Exams Taken:</span>
                  <br />
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.gold }}>
                    {stats.totalExams}
                  </span>
                </div>
                {stats.totalExams > 0 && (
                  <>
                    <div style={{ fontSize: '0.8rem', color: C.grey }}>
                      Avg Performance: {stats.avgPerformance}/5
                    </div>
                    <div style={{ fontSize: '0.8rem', color: C.grey }}>
                      Avg Fluency: {stats.avgFluency}/5
                    </div>
                    <div style={{ fontSize: '0.8rem', color: C.grey }}>
                      Total Errors: {stats.totalErrors}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Record Exam Form */}
      {showForm && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Record Exam</h4>
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
                  Exam Date
                </label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Exam Type
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
                  <option value="self_test">Self Test</option>
                  <option value="parent_test">Parent Test</option>
                  <option value="formal_exam">Formal Exam</option>
                </select>
              </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Performance Rating: {formData.performance_rating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({ ...formData, performance_rating: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                  Fluency Rating: {formData.fluency_rating}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.fluency_rating}
                  onChange={(e) => setFormData({ ...formData, fluency_rating: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Errors Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.errors_count}
                onChange={(e) => setFormData({ ...formData, errors_count: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: C.text }}>
                Feedback & Notes (Optional)
              </label>
              <textarea
                value={formData.feedback_notes}
                onChange={(e) => setFormData({ ...formData, feedback_notes: e.target.value })}
                placeholder="Strengths, areas to improve, specific feedback..."
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
                {loading ? 'Saving...' : 'Record Exam'}
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
          + Record Exam
        </button>
      )}

      {/* Exam History Table */}
      {examLogs.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Exam History</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `1px solid ${C.rule}` }}>
                <th style={{ padding: '8px' }}>Member</th>
                <th style={{ padding: '8px' }}>Surah</th>
                <th style={{ padding: '8px' }}>Type</th>
                <th style={{ padding: '8px' }}>Performance</th>
                <th style={{ padding: '8px' }}>Fluency</th>
                <th style={{ padding: '8px' }}>Errors</th>
                <th style={{ padding: '8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {examLogs.slice(0, 10).map((log: any) => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                  <td style={{ padding: '8px' }}>{MEMBERS.find((m: any) => m.id === log.member_id)?.name}</td>
                  <td style={{ padding: '8px' }}>{getSurahName(log.surah)}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>
                    {log.type.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '8px', color: C.gold, fontWeight: 'bold' }}>
                    {'⭐'.repeat(log.performance_rating)}
                  </td>
                  <td style={{ padding: '8px', color: C.gold, fontWeight: 'bold' }}>
                    {'⭐'.repeat(log.fluency_rating)}
                  </td>
                  <td style={{ padding: '8px' }}>{log.errors_count}</td>
                  <td style={{ padding: '8px', fontSize: '0.8rem', color: C.grey }}>
                    {new Date(log.exam_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
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
