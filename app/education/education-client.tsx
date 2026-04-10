// app/education/education-client.tsx
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

const CHILDREN = [
  { id: 'yahya', name: 'Yahya', school: 'Doha College (DC)', subjects: ['English', 'Maths', 'Science', 'Arabic', 'Computing', 'PE', 'Art'] },
  { id: 'isa', name: 'Isa', school: 'Doha College (DC)', subjects: ['English', 'Maths', 'Science', 'Arabic', 'Computing', 'PE', 'Art'] },
  { id: 'linah', name: 'Linah', school: 'QFS', subjects: ['Literacy', 'Numeracy', 'Arabic', 'Creative Arts', 'PE'] },
  { id: 'dana', name: 'Dana', school: 'QFS', subjects: ['Literacy', 'Numeracy', 'Arabic', 'Creative Arts', 'PE'] }
]

export default function EducationSkills() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('academic')
  const [selectedChild, setSelectedChild] = useState('yahya')
  const [academicGoals, setAcademicGoals] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: aData } = await supabase.from('academic_goals').select('*')
    const { data: sData } = await supabase.from('skill_progress').select('*')
    if (aData) setAcademicGoals(aData)
    if (sData) setSkills(sData)
    setLoading(false)
  }

  const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS, color: C.text, backgroundColor: C.cream, minHeight: '100vh' },
    header: { marginBottom: '32px', borderBottom: `2px solid ${C.green}`, paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    tabBar: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: (active: boolean) => ({
      padding: '10px 16px', borderRadius: '8px 8px 0 0', cursor: 'pointer', backgroundColor: active ? C.white : 'transparent',
      border: `1px solid ${active ? C.rule : 'transparent'}`, borderBottom: active ? `2px solid ${C.white}` : 'none',
      color: active ? C.green : C.grey, fontWeight: active ? 'bold' : 'normal', marginBottom: '-1px'
    }),
    card: { backgroundColor: C.white, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' },
    childBtn: (active: boolean) => ({
      padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${C.rule}`,
      backgroundColor: active ? C.midgreen : C.white, color: active ? C.white : C.text, fontSize: '0.85rem'
    }),
    levelBar: (level: string) => {
      const levels: any = { beginner: '25%', developing: '50%', intermediate: '75%', advanced: '100%' }
      return { width: levels[level.toLowerCase()] || '10%', height: '100%', backgroundColor: C.blue, borderRadius: '4px' }
    }
  }

  const childData = CHILDREN.find(c => c.id === selectedChild)

  if (loading) return <div style={styles.container}>Loading Education Module...</div>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <div style={{ fontFamily: F_ARAB, fontSize: '24px', color: C.green }}>العلم والمهارات</div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Education & Skills</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: C.midgreen }}>Academic Year 2025–2026</div>
          <div style={{ fontSize: '0.85rem', color: C.grey }}>Seedat Family · Doha</div>
        </div>
      </header>

      <div style={styles.tabBar}>
        <div style={styles.tab(activeTab === 'academic')} onClick={() => setActiveTab('academic')}>🏫 Academic</div>
        <div style={styles.tab(activeTab === 'skills')} onClick={() => setActiveTab('skills')}>🌍 Skills</div>
        <div style={styles.tab(activeTab === 'reading')} onClick={() => setActiveTab('reading')}>📚 Reading</div>
        <div style={styles.tab(activeTab === 'homework')} onClick={() => setActiveTab('homework')}>🗓️ Homework</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {CHILDREN.map(c => (
          <button key={c.id} style={styles.childBtn(selectedChild === c.id)} onClick={() => setSelectedChild(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {activeTab === 'academic' && (
        <section>
          <div style={{ marginBottom: '16px', color: C.grey, fontSize: '0.9rem' }}>School: <strong>{childData?.school}</strong></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {childData?.subjects.map(subject => {
              const goal = academicGoals.find(g => g.member_id === selectedChild && g.subject === subject)
              return (
                <div key={subject} style={styles.card}>
                  <h4 style={{ margin: '0 0 12px 0', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '8px' }}>{subject}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span>Current: <strong style={{ color: C.midgreen }}>{goal?.current_grade || '—'}</strong></span>
                    <span>Target: <strong style={{ color: C.goldDim }}>{goal?.target_grade || '—'}</strong></span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, fontStyle: 'italic' }}>
                    {goal?.notes || 'No notes for this term yet.'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {activeTab === 'skills' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {skills.filter(s => s.member_id === selectedChild).map(skill => (
              <div key={skill.id} style={styles.card}>
                <h4 style={{ margin: '0 0 4px 0' }}>{skill.skill}</h4>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: C.blue, fontWeight: 'bold', marginBottom: '12px' }}>{skill.level}</div>
                <div style={{ height: '6px', backgroundColor: C.forest, borderRadius: '3px', marginBottom: '12px' }}>
                  <div style={styles.levelBar(skill.level)}></div>
                </div>
                <p style={{ fontSize: '0.8rem', color: C.grey, margin: 0 }}>{skill.notes}</p>
              </div>
            ))}
          </div>
          <button style={{ ...styles.childBtn(false), marginTop: '20px', width: '100%', borderStyle: 'dashed' }}>+ Add Custom Skill</button>
        </section>
      )}

      {activeTab === 'reading' && (
        <section style={{ maxWidth: '600px' }}>
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>Log Reading Session</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input type="text" placeholder="Book Title" style={{ flex: 2, padding: '10px', borderRadius: '6px', border: `1px solid ${C.rule}` }} />
              <input type="number" placeholder="Pages" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${C.rule}` }} />
            </div>
            <button style={{ width: '100%', padding: '12px', backgroundColor: C.green, color: C.white, border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Add to Log
            </button>
          </div>
          <div style={styles.card}>
            <h4 style={{ margin: '0 0 12px 0' }}>Recent Books</h4>
            <div style={{ fontSize: '0.9rem', color: C.grey }}>Tracking logic to be synchronized with Supabase...</div>
          </div>
        </section>
      )}

      {activeTab === 'homework' && (
        <section style={{ maxWidth: '600px' }}>
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>Assignments</h3>
            {['English Essay', 'Maths Worksheet', 'Arabic Vocab'].map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${C.ruleLight}` }}>
                <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{task}</div>
                  <div style={{ fontSize: '0.75rem', color: C.orange }}>Due: Tomorrow</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}