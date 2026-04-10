// app/fitness/fitness-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = {
  green:     '#1a3d28',
  midgreen:  '#245235',
  forest:    '#f0ebe0',
  gold:      '#c9a84c',
  goldDim:   '#9b7d38',
  goldPale:  '#f0e4c0',
  cream:     '#faf8f2',
  white:     '#ffffff',
  grey:      '#6b7c6e',
  rule:      '#ddd8cc',
  ruleLight: '#e8e3d8',
  text:      '#0d1a0f',
  orange:    '#e07b39',
  blue:      '#4a9eca',
}

const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const FAMILY = [
  { id: 'yahya', name: 'Yahya', sports: ['Tennis', 'Athletics', 'Football'] },
  { id: 'isa', name: 'Isa', sports: ['Tennis', 'Athletics', 'Football'] },
  { id: 'linah', name: 'Linah', sports: ['Gymnastics', 'Swimming'] },
  { id: 'dana', name: 'Dana', sports: ['General Play', 'Activity'] },
  { id: 'muhammad', name: 'Muhammad', sports: ['Gym', 'Running'] },
  { id: 'camilla', name: 'Camilla', sports: ['Pilates', 'Yoga'] }
]

export default function HealthFitness() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  
  const [formData, setFormData] = useState({ member_id: 'yahya', activity: '', duration: 30, notes: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: lData } = await supabase.from('activity_logs').select('*').order('logged_at', { ascending: false })
    const { data: gData } = await supabase.from('health_goals').select('*').order('created_at', { ascending: false })
    if (lData) setLogs(lData)
    if (gData) setGoals(gData)
    setLoading(false)
  }

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('activity_logs').insert([{
      member_id: formData.member_id,
      activity: formData.activity,
      duration_min: formData.duration,
      notes: formData.notes
    }])
    if (!error) {
      fetchData()
      setFormData({ ...formData, activity: '', notes: '' })
      alert('Activity logged!')
    }
  }

  const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS, color: C.text, backgroundColor: C.cream, minHeight: '100vh' },
    header: { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    arabic: { fontFamily: F_ARAB, fontSize: '32px', color: C.green },
    tabs: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: `1px solid ${C.ruleLight}` },
    tab: (active: boolean) => ({
      padding: '12px 20px', cursor: 'pointer', borderBottom: active ? `3px solid ${C.orange}` : '3px solid transparent',
      color: active ? C.green : C.grey, fontWeight: active ? '600' : '400'
    }),
    card: { backgroundColor: C.white, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' },
    btn: { padding: '10px 16px', backgroundColor: C.green, color: C.white, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    chip: { padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', border: `1px solid ${C.rule}`, cursor: 'pointer', backgroundColor: C.white }
  }

  if (loading) return <div style={styles.container}>Loading Health Module...</div>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: C.green }}>Health & Fitness</h1>
          <div style={{ color: C.grey, fontSize: '0.9rem' }}>B26 Al Reem Gardens · Doha, Qatar</div>
        </div>
        <div style={styles.arabic}>الصحة والنشاط</div>
      </header>

      <div style={styles.tabs}>
        <div style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>🏃 Overview</div>
        <div style={styles.tab(activeTab === 'log')} onClick={() => setActiveTab('log')}>📝 Log Activity</div>
        <div style={styles.tab(activeTab === 'goals')} onClick={() => setActiveTab('goals')}>🎯 Goals</div>
        <div style={styles.tab(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>📊 Stats</div>
      </div>

      {activeTab === 'overview' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {FAMILY.map(member => {
              const memberLogs = logs.filter(l => l.member_id === member.id)
              const latest = memberLogs[0]
              return (
                <div key={member.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, color: C.green }}>{member.name}</h3>
                    <div style={{ color: C.orange, fontWeight: 'bold', fontSize: '0.8rem' }}>{memberLogs.length} logs</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: C.grey }}>
                    <strong>Latest:</strong> {latest ? `${latest.activity} (${latest.duration_min}m)` : 'No logs yet'}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {member.sports.map(s => <span key={s} style={{ fontSize: '0.7rem', color: C.midgreen, backgroundColor: C.forest, padding: '2px 6px', borderRadius: '4px' }}>{s}</span>)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {activeTab === 'log' && (
        <section style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form style={styles.card} onSubmit={handleLogSubmit}>
            <h3 style={{ margin: '0 0 16px 0' }}>New Activity</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Member</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                value={formData.member_id}
                onChange={e => setFormData({ ...formData, member_id: e.target.value })}
              >
                {FAMILY.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Activity</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {['Tennis', 'Football', 'Athletics', 'Gym', 'Run', 'Swim', 'Walk'].map(act => (
                  <div key={act} style={styles.chip} onClick={() => setFormData({ ...formData, activity: act })}>{act}</div>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Or type activity..."
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                value={formData.activity}
                onChange={e => setFormData({ ...formData, activity: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Duration (min)</label>
              <input 
                type="number" 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${C.rule}` }}
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
            <button type="submit" style={{ ...styles.btn, width: '100%' }}>Log Session</button>
          </form>
        </section>
      )}

      {activeTab === 'goals' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {goals.map(goal => (
              <div key={goal.id} style={{ ...styles.card, borderLeft: `4px solid ${C.orange}` }}>
                <div style={{ fontSize: '0.7rem', color: C.grey, marginBottom: '4px' }}>{FAMILY.find(m => m.id === goal.member_id)?.name} · {goal.category}</div>
                <h4 style={{ margin: '0 0 8px 0' }}>{goal.title}</h4>
                <div style={{ fontSize: '0.85rem', color: C.text }}>Target: {goal.target}</div>
                <div style={{ fontSize: '0.75rem', color: C.grey, marginTop: '8px' }}>Deadline: {goal.deadline}</div>
              </div>
            ))}
            {goals.length === 0 && <div style={{ color: C.grey, gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No goals yet. Set one — even small ones count.</div>}
          </div>
        </section>
      )}

      {activeTab === 'stats' && (
        <section>
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>Monthly Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAMILY.map(m => {
                const mLogs = logs.filter(l => l.member_id === m.id)
                const totalMins = mLogs.reduce((acc, curr) => acc + (curr.duration_min || 0), 0)
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '100px', fontWeight: 'bold' }}>{m.name}</div>
                    <div style={{ flex: 1, height: '20px', backgroundColor: C.forest, borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', backgroundColor: C.midgreen, width: `${Math.min(100, (totalMins / 500) * 100)}%` }}></div>
                      <span style={{ position: 'absolute', right: '10px', top: '0', fontSize: '0.7rem', lineHeight: '20px', color: C.text }}>{totalMins} mins</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}