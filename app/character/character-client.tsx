// app/character/character-client.tsx
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

const MEMBERS = [
  { id: 'muhammad', name: 'Muhammad' },
  { id: 'camilla', name: 'Camilla' },
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const TRAITS = ['Honesty', 'Patience', 'Kindness', 'Courage', 'Discipline', 'Gratitude']

export default function CharacterEthics() {
  const [activeTab, setActiveTab] = useState('deeds')
  const [loading, setLoading] = useState(true)
  const [deeds, setDeeds] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [reflections, setReflections] = useState<Record<string, string>>({})
  
  const [showDeedForm, setShowDeedForm] = useState(false)
  const [deedForm, setDeedForm] = useState({ member_id: 'yahya', deed: '', category: 'Honesty', witnessed_by: '' })
  
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalForm, setGoalForm] = useState({ member_id: 'yahya', title: '', trait: 'Honesty', description: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: deedsData } = await supabase.from('good_deeds').select('*').order('logged_at', { ascending: false })
      const { data: goalsData } = await supabase.from('character_goals').select('*').order('created_at', { ascending: false })
      
      setDeeds(deedsData?.length ? deedsData : JSON.parse(localStorage.getItem('bayt-deeds-v1') || '[]'))
      setGoals(goalsData?.length ? goalsData : JSON.parse(localStorage.getItem('bayt-char-goals-v1') || '[]'))
      setReflections(JSON.parse(localStorage.getItem('bayt-character-reflection-v1') || '{}'))
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const saveDeed = async () => {
    if (!deedForm.deed) return
    const newDeed = { id: crypto.randomUUID(), ...deedForm, logged_at: new Date().toISOString() }
    const updated = [newDeed, ...deeds]
    setDeeds(updated)
    localStorage.setItem('bayt-deeds-v1', JSON.stringify(updated))
    setShowDeedForm(false)
    setDeedForm({ member_id: 'yahya', deed: '', category: 'Honesty', witnessed_by: '' })
    try { await supabase.from('good_deeds').insert(newDeed) } catch (e) {}
  }

  const saveGoal = async () => {
    if (!goalForm.title) return
    const newGoal = { id: crypto.randomUUID(), ...goalForm, active: true, created_at: new Date().toISOString() }
    const updated = [newGoal, ...goals]
    setGoals(updated)
    localStorage.setItem('bayt-char-goals-v1', JSON.stringify(updated))
    setShowGoalForm(false)
    setGoalForm({ member_id: 'yahya', title: '', trait: 'Honesty', description: '' })
    try { await supabase.from('character_goals').insert(newGoal) } catch (e) {}
  }

  const toggleGoal = async (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, active: !g.active } : g)
    setGoals(updated)
    localStorage.setItem('bayt-char-goals-v1', JSON.stringify(updated))
    try { 
      const goal = updated.find(g => g.id === id)
      if (goal) await supabase.from('character_goals').update({ active: goal.active }).eq('id', id) 
    } catch (e) {}
  }

  const saveReflection = (week: number, text: string) => {
    const updated = { ...reflections, [week]: text }
    setReflections(updated)
    localStorage.setItem('bayt-character-reflection-v1', JSON.stringify(updated))
  }

  const currentWeek = getWeekNumber(new Date())
  const reflectionQuestions = [
    "Who showed patience this week and how?",
    "Did anyone tell the truth when it was hard? Share the story.",
    "How did we help someone outside our family this week?",
    "What are we grateful for that we often take for granted?"
  ]
  const currentQuestion = reflectionQuestions[currentWeek % 4]

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Reflecting...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Akhlāq before achievement</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Character & Ethics</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>الأخلاق</div>
        </div>
        <div style={{ maxWidth: '300px', textAlign: 'right', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9 }}>
          "The best of you are those with the best character."<br/>— Prophet Muhammad ﷺ
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'deeds', label: '🌟 Good Deeds Log' },
          { id: 'goals', label: '🎯 Character Goals' },
          { id: 'tracker', label: '📊 Trait Tracker' },
          { id: 'reflection', label: '📝 Family Reflection' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'deeds' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Recent Good Deeds</h2>
              <button onClick={() => setShowDeedForm(!showDeedForm)} style={primaryBtn}>
                {showDeedForm ? 'CANCEL' : 'LOG A GOOD DEED'}
              </button>
            </div>

            {showDeedForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={deedForm.member_id} onChange={e => setDeedForm({...deedForm, member_id: e.target.value})} style={inputStyle}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select value={deedForm.category} onChange={e => setDeedForm({...deedForm, category: e.target.value})} style={inputStyle}>
                    {TRAITS.concat('Helpfulness', 'General').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input placeholder="Witnessed by (e.g. Baba)" value={deedForm.witnessed_by} onChange={e => setDeedForm({...deedForm, witnessed_by: e.target.value})} style={inputStyle} />
                </div>
                <textarea placeholder="Describe the good deed..." value={deedForm.deed} onChange={e => setDeedForm({...deedForm, deed: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '80px', resize: 'vertical'}} />
                <button onClick={saveDeed} style={primaryBtn}>SAVE DEED</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {MEMBERS.map(m => {
                const count = deeds.filter(d => d.member_id === m.id).length
                return (
                  <div key={m.id} style={{ background: C.forest, padding: '1rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: C.text }}>{m.name}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: '1.5rem', color: C.green }}>{count}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deeds.map(d => {
                const member = MEMBERS.find(m => m.id === d.member_id)?.name || d.member_id
                return (
                  <div key={d.id} style={{ border: `1px solid ${C.ruleLight}`, padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: C.goldPale, color: C.goldDim, padding: '0.5rem', borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', minWidth: '90px', textAlign: 'center' }}>
                      {d.category}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.25rem', fontSize: '1rem', color: C.text }}><strong>{member}</strong>: {d.deed}</div>
                      <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>
                        {new Date(d.logged_at).toLocaleDateString()} {d.witnessed_by && `· Witnessed by: ${d.witnessed_by}`}
                      </div>
                    </div>
                  </div>
                )
              })}
              {deeds.length === 0 && <div style={emptyState}>No deeds logged yet. Look for the small things today.</div>}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Character Goals</h2>
              <button onClick={() => setShowGoalForm(!showGoalForm)} style={primaryBtn}>
                {showGoalForm ? 'CANCEL' : 'ADD GOAL'}
              </button>
            </div>

            {showGoalForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={goalForm.member_id} onChange={e => setGoalForm({...goalForm, member_id: e.target.value})} style={inputStyle}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input placeholder="Goal Title" value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} style={inputStyle} />
                  <select value={goalForm.trait} onChange={e => setGoalForm({...goalForm, trait: e.target.value})} style={inputStyle}>
                    {TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <textarea placeholder="How will we practice this?" value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '60px', resize: 'vertical'}} />
                <button onClick={saveGoal} style={primaryBtn}>SAVE GOAL</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {goals.sort((a,b) => (a.active === b.active ? 0 : a.active ? -1 : 1)).map(g => {
                const member = MEMBERS.find(m => m.id === g.member_id)?.name
                return (
                  <div key={g.id} style={{ border: `1px solid ${g.active ? C.green : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: g.active ? C.white : C.cream, opacity: g.active ? 1 : 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{member}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.green }}>{g.trait.toUpperCase()}</span>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: C.text, fontSize: '1.1rem', textDecoration: g.active ? 'none' : 'line-through' }}>{g.title}</h3>
                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: C.grey, lineHeight: 1.5 }}>{g.description}</p>
                    <button onClick={() => toggleGoal(g.id)} style={{ ...primaryBtn, background: g.active ? C.white : C.green, color: g.active ? C.text : C.white, border: `1px solid ${g.active ? C.rule : C.green}`, width: '100%' }}>
                      {g.active ? 'MARK COMPLETE' : 'REACTIVATE'}
                    </button>
                  </div>
                )
              })}
              {goals.length === 0 && <div style={{ ...emptyState, gridColumn: '1 / -1' }}>Character is built in private moments. Set your first goal.</div>}
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Trait Distribution</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {TRAITS.map(trait => {
                const traitDeeds = deeds.filter(d => d.category === trait)
                const count = traitDeeds.length
                const max = Math.max(...TRAITS.map(t => deeds.filter(d => d.category === t).length), 1)
                const pct = (count / max) * 100

                return (
                  <div key={trait}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: F_MONO, fontSize: '0.85rem' }}>
                      <span style={{ color: C.text }}>{trait}</span>
                      <span style={{ color: C.grey }}>{count} logs</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: C.ruleLight, borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.gold, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ marginTop: '3rem', fontSize: '0.85rem', color: C.grey, fontStyle: 'italic', textAlign: 'center' }}>
              Istiqama: consistency in small things builds great people.
            </p>
          </div>
        )}

        {activeTab === 'reflection' && (
          <div>
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem' }}>Week {currentWeek} Reflection</div>
              <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: 400, color: C.green, fontSize: '1.5rem', lineHeight: 1.4 }}>"{currentQuestion}"</h2>
              <textarea 
                value={reflections[currentWeek] || ''} 
                onChange={e => saveReflection(currentWeek, e.target.value)}
                placeholder="Type your family's reflection here..."
                style={{ ...inputStyle, width: '100%', minHeight: '120px', resize: 'vertical', fontSize: '1rem', padding: '1rem' }}
              />
            </div>

            <h3 style={{ fontWeight: 300, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Past Reflections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3, 4].map(offset => {
                const pastWeek = currentWeek - offset
                if (pastWeek <= 0 || !reflections[pastWeek]) return null
                const q = reflectionQuestions[pastWeek % 4]
                return (
                  <div key={pastWeek} style={{ padding: '1.5rem', border: `1px solid ${C.ruleLight}`, borderRadius: '8px' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginBottom: '0.5rem' }}>Week {pastWeek}</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{q}</div>
                    <div style={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.5 }}>{reflections[pastWeek]}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Helpers
function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
}

// Shared Styles
const inputStyle = {
  padding: '0.75rem',
  border: `1px solid ${C.rule}`,
  borderRadius: '6px',
  fontFamily: F_SANS,
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box' as const
}

const primaryBtn = {
  background: C.green,
  color: C.white,
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontFamily: F_MONO,
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.05em'
}

const emptyState = {
  padding: '3rem',
  textAlign: 'center' as const,
  color: C.grey,
  background: C.cream,
  borderRadius: '8px',
  border: `1px dashed ${C.rule}`,
  fontStyle: 'italic'
}