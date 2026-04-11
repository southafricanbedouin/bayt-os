// app/monthly-council/monthly-council-client.tsx
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
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const MEMBERS = ['Muhammad', 'Camilla', 'Yahya', 'Isa', 'Linah', 'Dana']

const STANDARD_AGENDA = [
  "Opening dua",
  "Last month's wins — what went well?",
  "Last month's struggles — what was hard?",
  "Goals review — are we on track?",
  "Budget review — how did we spend this month?",
  "Children's segment — what do the children want to raise?",
  "Next month's focus — one family intention",
  "Closing dua + family declaration"
]

function getLastSunday() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

export default function MonthlyCouncil() {
  const [tab, setTab] = useState('run')
  const [loading, setLoading] = useState(true)
  const [councils, setCouncils] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])

  const [form, setForm] = useState({ council_date: getLastSunday(), attendees: ['Muhammad', 'Camilla'], decisions: '', next_actions: '', agenda_notes: {} as Record<string, string> })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: cData } = await supabase.from('monthly_councils').select('*').order('council_date', { ascending: false })
      const { data: gData } = await supabase.from('annual_goals').select('*').eq('year', new Date().getFullYear())
      
      setCouncils(cData?.length ? cData : JSON.parse(localStorage.getItem('bayt-councils-v1') || '[]'))
      setGoals(gData?.length ? gData : JSON.parse(localStorage.getItem('bayt-annual-goals-v1') || '[]'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const toggleAttendee = (m: string) => {
    const att = form.attendees.includes(m) ? form.attendees.filter(x => x !== m) : [...form.attendees, m]
    setForm({ ...form, attendees: att })
  }

  const saveCouncil = async () => {
    const d = new Date(form.council_date)
    const newC = { id: crypto.randomUUID(), council_date: form.council_date, month: d.getMonth()+1, year: d.getFullYear(), attendees: form.attendees, agenda_items: form.agenda_notes, decisions: form.decisions, next_actions: form.next_actions, created_at: new Date().toISOString() }
    const updated = [newC, ...councils].sort((a,b) => new Date(b.council_date).getTime() - new Date(a.council_date).getTime())
    setCouncils(updated)
    localStorage.setItem('bayt-councils-v1', JSON.stringify(updated))
    try { await supabase.from('monthly_councils').insert(newC) } catch(e) {}
    alert('Council sealed. May Allah put barakah in these decisions.')
  }

  const updateGoal = async (id: string, progress: number, status: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, progress, status } : g)
    setGoals(updated)
    localStorage.setItem('bayt-annual-goals-v1', JSON.stringify(updated))
    try { await supabase.from('annual_goals').update({ progress, status }).eq('id', id) } catch(e) {}
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Calling the council...</div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shura — consultation — is how great families govern.</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>Monthly Council</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>مجلس الشهر</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontFamily: F_MONO, color: C.white }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
          <div style={{ fontSize: '0.7rem', color: C.goldPale, marginTop: '4px', fontFamily: F_MONO }}>NEXT: {getLastSunday()}</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['run', 'archive', 'goals'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t === 'run' ? '📋 Run Council' : t === 'archive' ? '📚 Archive' : '🎯 Goals Review'}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'run' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={labelStyle}>COUNCIL DATE</label>
                <input type="date" value={form.council_date} onChange={e => setForm({...form, council_date: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{...labelStyle, textAlign: 'right'}}>ATTENDEES</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {MEMBERS.map(m => (
                    <button key={m} onClick={() => toggleAttendee(m)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', border: `1px solid ${form.attendees.includes(m) ? C.green : C.rule}`, background: form.attendees.includes(m) ? C.green : C.white, color: form.attendees.includes(m) ? C.white : C.grey, cursor: 'pointer', fontFamily: F_MONO }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {STANDARD_AGENDA.map((item, i) => (
                <div key={i} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                  <div style={{ fontWeight: 600, color: C.green, fontSize: '1.1rem', marginBottom: '0.8rem' }}>{i+1}. {item}</div>
                  <textarea 
                    value={form.agenda_notes[item] || ''} onChange={e => setForm({...form, agenda_notes: {...form.agenda_notes, [item]: e.target.value}})}
                    placeholder="Notes..." style={{...inputStyle, width: '100%', minHeight: '60px', resize: 'vertical', background: C.cream}} 
                  />
                </div>
              ))}
            </div>

            <div style={{ background: C.forest, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}` }}>
              <label style={{...labelStyle, color: C.goldDim}}>DECISIONS MADE (Shura Output)</label>
              <textarea value={form.decisions} onChange={e => setForm({...form, decisions: e.target.value})} style={{...inputStyle, width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '1.5rem'}} placeholder="What was firmly decided today?" />
              
              <label style={{...labelStyle, color: C.goldDim}}>NEXT ACTIONS</label>
              <textarea value={form.next_actions} onChange={e => setForm({...form, next_actions: e.target.value})} style={{...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '1.5rem'}} placeholder="Who is doing what?" />
              
              <button onClick={saveCouncil} style={{ background: C.green, color: C.white, border: 'none', padding: '1rem', width: '100%', borderRadius: '6px', fontFamily: F_MONO, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }}>SEAL COUNCIL MINUTES</button>
            </div>
          </div>
        )}

        {tab === 'archive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {councils.map(c => (
              <div key={c.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                  <div style={{ fontFamily: F_MONO, fontWeight: 600, color: C.green, fontSize: '1.1rem' }}>{c.council_date}</div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>{c.attendees?.length || 0} ATTENDEES</div>
                </div>
                {c.decisions && (
                  <div style={{ background: C.goldPale, padding: '1rem', borderRadius: '6px', marginBottom: '1rem', borderLeft: `4px solid ${C.goldDim}` }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Decisions Made</div>
                    <div style={{ fontSize: '0.9rem', color: C.text, whiteSpace: 'pre-wrap' }}>{c.decisions}</div>
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: C.grey }}>
                  <strong>Next Actions:</strong> {c.next_actions || 'None recorded.'}
                </div>
              </div>
            ))}
            {councils.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.cream, borderRadius: '8px' }}>No councils held yet. Call the family together.</div>}
          </div>
        )}

        {tab === 'goals' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300, color: C.text, marginBottom: '2rem' }}>Inline Goals Review</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {goals.sort((a,b) => (a.member_id === null ? -1 : 1)).map(g => (
                <div key={g.id} style={{ border: `1px solid ${C.ruleLight}`, padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '2rem', alignItems: 'center', background: g.member_id === null ? C.cream : C.white }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{g.member_id?.toUpperCase() || 'FAMILY'}</span>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.forest, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.green }}>{g.area?.toUpperCase()}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text, marginBottom: '0.25rem' }}>{g.title}</div>
                    <div style={{ fontSize: '0.8rem', color: C.grey }}>Target: {g.target}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F_MONO, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      <span>Progress</span><span>{g.progress}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={g.progress} onChange={e => updateGoal(g.id, Number(e.target.value), g.status)} style={{ width: '100%', accentColor: C.green }} />
                  </div>
                  <div>
                    <select value={g.status} onChange={e => updateGoal(g.id, g.progress, e.target.value)} style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: `1px solid ${C.rule}`, fontFamily: F_MONO }}>
                      <option value="active">Active</option><option value="achieved">Achieved</option><option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              ))}
              {goals.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.cream, borderRadius: '8px' }}>No goals found. Set them in Annual Planning.</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const inputStyle = { padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }