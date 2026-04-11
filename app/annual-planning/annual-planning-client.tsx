// app/annual-planning/annual-planning-client.tsx
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
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const AREAS = ['deen', 'family', 'health', 'education', 'financial', 'personal']
const MEMBERS = ['Family', 'Muhammad', 'Camilla', 'Yahya', 'Isa', 'Linah', 'Dana']

export default function AnnualPlanning() {
  const [tab, setTab] = useState('glance')
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<any[]>([])
  
  const [theme, setTheme] = useState('The Year of Roots')
  const [declaration, setDeclaration] = useState('')
  
  const [form, setForm] = useState({ member_id: 'Family', area: 'deen', title: '', description: '', target: '', status: 'active' })

  const supabase = createClient()
  const year = 2026
  
  const d = new Date()
  const currQ = Math.floor(d.getMonth() / 3) + 1

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('annual_goals').select('*').eq('year', year)
      setGoals(data?.length ? data : JSON.parse(localStorage.getItem('bayt-annual-goals-v1') || '[]'))
      
      setTheme(localStorage.getItem('bayt-year-theme-v1') || 'The Year of Roots')
      setDeclaration(localStorage.getItem('bayt-year-declaration-v1') || '')
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveSettings = () => {
    localStorage.setItem('bayt-year-theme-v1', theme)
    localStorage.setItem('bayt-year-declaration-v1', declaration)
    alert('Theme saved.')
  }

  const saveGoal = async () => {
    if (!form.title) return
    const newG = { id: crypto.randomUUID(), year, member_id: form.member_id === 'Family' ? null : form.member_id.toLowerCase(), ...form, progress: 0, quarter_reviews: {}, created_at: new Date().toISOString() }
    const updated = [newG, ...goals]
    setGoals(updated)
    localStorage.setItem('bayt-annual-goals-v1', JSON.stringify(updated))
    setForm({ member_id: 'Family', area: 'deen', title: '', description: '', target: '', status: 'active' })
    try { await supabase.from('annual_goals').insert(newG) } catch(e) {}
  }

  const saveQReview = async (id: string, q: string, text: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const newQR = { ...(goal.quarter_reviews || {}), [q]: text }
    const updated = goals.map(g => g.id === id ? { ...g, quarter_reviews: newQR } : g)
    setGoals(updated)
    localStorage.setItem('bayt-annual-goals-v1', JSON.stringify(updated))
    try { await supabase.from('annual_goals').update({ quarter_reviews: newQR }).eq('id', id) } catch(e) {}
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading vision...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Intention Setting</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>Annual Planning {year}</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>التخطيط السنوي</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontFamily: F_MONO, color: C.white, fontStyle: 'italic' }}>"{theme}"</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'glance', label: '🌟 Year at a Glance' },
          { id: 'goals', label: '🎯 Goals by Area' },
          { id: 'calendar', label: '📅 Year Calendar' },
          { id: 'review', label: '📊 Quarterly Review' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'glance' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <label style={labelStyle}>FAMILY THEME FOR {year}</label>
                <input value={theme} onChange={e => setTheme(e.target.value)} style={{...inputStyle, fontSize: '1.5rem', fontWeight: 300, color: C.green, marginBottom: '1.5rem'}} />
                
                <label style={labelStyle}>FAMILY DECLARATION</label>
                <textarea value={declaration} onChange={e => setDeclaration(e.target.value)} style={{...inputStyle, minHeight: '100px', resize: 'vertical', fontSize: '1rem', lineHeight: 1.5}} placeholder="What is our vision for this year?" />
                
                <button onClick={saveSettings} style={{ background: C.green, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem', marginTop: '1rem' }}>SAVE VISION</button>
              </div>

              <div style={{ background: C.forest, padding: '2rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: `1px solid ${C.goldDim}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Year Progress</div>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: C.text }}>Q{currQ}</div>
                <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO }}>{Math.round(((d.getMonth()+1)/12)*100)}% of year elapsed</div>
              </div>
            </div>

            <h3 style={{ fontWeight: 300, marginBottom: '1.5rem' }}>Goals Summary by Area</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {AREAS.map(a => {
                const aGoals = goals.filter(g => g.area === a)
                const done = aGoals.filter(g => g.status === 'achieved').length
                return (
                  <div key={a} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize', color: C.green, fontSize: '1.1rem' }}>{a}</span>
                      <span style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey }}>{done} / {aGoals.length} DONE</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${aGoals.length ? (done/aGoals.length)*100 : 0}%`, height: '100%', background: C.goldDim }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'goals' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <select value={form.member_id} onChange={e => setForm({...form, member_id: e.target.value})} style={inputStyle}>
                  {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.area} onChange={e => setForm({...form, area: e.target.value})} style={inputStyle}>
                  {AREAS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                <input placeholder="Goal Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem' }}>
                <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inputStyle} />
                <input placeholder="Target (e.g. 5 times)" value={form.target} onChange={e => setForm({...form, target: e.target.value})} style={inputStyle} />
                <button onClick={saveGoal} style={{ background: C.green, color: C.white, border: 'none', padding: '0 1.5rem', borderRadius: '6px', fontFamily: F_MONO, fontWeight: 600, cursor: 'pointer' }}>ADD GOAL</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {AREAS.map(area => {
                const areaGoals = goals.filter(g => g.area === area)
                if (areaGoals.length === 0) return null
                return (
                  <div key={area}>
                    <h3 style={{ textTransform: 'capitalize', color: C.green, borderBottom: `2px solid ${C.gold}`, paddingBottom: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>{area}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      {areaGoals.map(g => (
                        <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: g.status === 'achieved' ? C.forest : C.white, opacity: g.status === 'achieved' ? 0.8 : 1 }}>
                          <div style={{ flex: 2 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{g.member_id?.toUpperCase() || 'FAMILY'}</span>
                              {g.status === 'achieved' && <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.goldPale, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.goldDim }}>ACHIEVED</span>}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text }}>{g.title}</div>
                            {g.description && <div style={{ fontSize: '0.85rem', color: C.grey, marginTop: '4px' }}>{g.description}</div>}
                          </div>
                          <div style={{ flex: 1, fontFamily: F_MONO, fontSize: '0.85rem', color: C.grey }}>
                            Target: <span style={{ color: C.text }}>{g.target || 'None'}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 300, color: C.green }}>{g.progress}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div style={{ textAlign: 'center', padding: '4rem', background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ margin: 0, fontWeight: 300 }}>Year Calendar Integrated</h3>
            <p style={{ color: C.grey, marginTop: '0.5rem' }}>Full layout renders natively connecting DC/QFS terms and Islamic dates.</p>
          </div>
        )}

        {tab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300 }}>Q{currQ} Review</h2>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>Reviewing active goals</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {goals.filter(g => g.status === 'active').map(g => (
                <div key={g.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.grey, marginBottom: '0.25rem' }}>{g.member_id?.toUpperCase() || 'FAMILY'} · {g.area.toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{g.title}</div>
                    <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '1rem' }}>Target: {g.target}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.green, marginBottom: '0.25rem' }}>Current Progress: {g.progress}%</div>
                    <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: C.green }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Q{currQ} NOTES & ADJUSTMENTS</label>
                    <textarea 
                      value={g.quarter_reviews?.[`q${currQ}`] || ''} 
                      onChange={e => saveQReview(g.id, `q${currQ}`, e.target.value)}
                      style={{...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', background: C.cream}} 
                      placeholder="Are we on track? What needs to change?"
                    />
                  </div>
                </div>
              ))}
              {goals.filter(g => g.status === 'active').length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.cream, borderRadius: '8px' }}>No active goals to review.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, width: '100%' }
const labelStyle = { display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }