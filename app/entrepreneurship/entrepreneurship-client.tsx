// app/entrepreneurship/entrepreneurship-client.tsx
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
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const STATUSES = ['idea', 'exploring', 'active', 'paused', 'done']
const STATUS_COLORS: Record<string, string> = {
  idea: C.grey,
  exploring: C.blue,
  active: C.goldDim,
  paused: C.orange,
  done: C.green
}

const LESSONS = [
  { id: 1, title: 'What is profit?', concept: 'Buy for less, sell for more.', exercise: 'Try this: count how many items you could sell at school for 1 riyal each.' },
  { id: 2, title: 'What is a budget?', concept: "You can't spend what you don't have.", exercise: 'List three things you want to buy and map out how many weeks of saving it will take.' },
  { id: 3, title: 'What is value?', concept: 'People pay for things that solve problems.', exercise: 'What is a problem in our house that you could solve for 5 QAR?' },
  { id: 4, title: 'Saving for a goal', concept: 'Delayed gratification.', exercise: 'Draw a picture of a big goal and color in a section every time you save 10 QAR.' },
  { id: 5, title: 'What is a customer?', concept: 'Who are you building for?', exercise: 'If you started a lemonade stand, who would buy it and why?' },
  { id: 6, title: 'What is reinvesting?', concept: 'Putting earnings back in to grow faster.', exercise: 'If you make 10 QAR, how much should you keep, give (sadaqah), and reinvest?' }
]

export default function Entrepreneurship() {
  const [activeTab, setActiveTab] = useState('ideas')
  const [loading, setLoading] = useState(true)
  const [ideas, setIdeas] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [taughtLessons, setTaughtLessons] = useState<Record<number, boolean>>({})

  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [ideaForm, setIdeaForm] = useState({ member_id: 'yahya', title: '', description: '', potential_qar: '' })
  
  const [milestoneForm, setMilestoneForm] = useState({ idea_id: '', title: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: iData } = await supabase.from('business_ideas').select('*').order('created_at', { ascending: false })
      const { data: mData } = await supabase.from('mini_project_milestones').select('*').order('created_at', { ascending: true })
      
      setIdeas(iData?.length ? iData : JSON.parse(localStorage.getItem('bayt-ideas-v1') || '[]'))
      setMilestones(mData?.length ? mData : JSON.parse(localStorage.getItem('bayt-milestones-v1') || '[]'))
      setTaughtLessons(JSON.parse(localStorage.getItem('bayt-lessons-taught-v1') || '{}'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveIdea = async () => {
    if (!ideaForm.title) return
    const newIdea = { id: crypto.randomUUID(), ...ideaForm, status: 'idea', created_at: new Date().toISOString() }
    const updated = [newIdea, ...ideas]
    setIdeas(updated)
    localStorage.setItem('bayt-ideas-v1', JSON.stringify(updated))
    setShowIdeaForm(false)
    setIdeaForm({ member_id: 'yahya', title: '', description: '', potential_qar: '' })
    try { await supabase.from('business_ideas').insert(newIdea) } catch(e) {}
  }

  const cycleStatus = async (id: string, currentStatus: string) => {
    const nextIdx = (STATUSES.indexOf(currentStatus) + 1) % STATUSES.length
    const newStatus = STATUSES[nextIdx]
    const updated = ideas.map(i => i.id === id ? { ...i, status: newStatus } : i)
    setIdeas(updated)
    localStorage.setItem('bayt-ideas-v1', JSON.stringify(updated))
    try { await supabase.from('business_ideas').update({ status: newStatus }).eq('id', id) } catch(e) {}
  }

  const saveMilestone = async (ideaId: string) => {
    if (!milestoneForm.title || milestoneForm.idea_id !== ideaId) return
    const newM = { id: crypto.randomUUID(), idea_id: ideaId, title: milestoneForm.title, done: false, created_at: new Date().toISOString() }
    const updated = [...milestones, newM]
    setMilestones(updated)
    localStorage.setItem('bayt-milestones-v1', JSON.stringify(updated))
    setMilestoneForm({ idea_id: '', title: '' })
    try { await supabase.from('mini_project_milestones').insert(newM) } catch(e) {}
  }

  const toggleMilestone = async (id: string) => {
    const updated = milestones.map(m => m.id === id ? { ...m, done: !m.done } : m)
    setMilestones(updated)
    localStorage.setItem('bayt-milestones-v1', JSON.stringify(updated))
    try { 
      const m = updated.find(x => x.id === id)
      if (m) await supabase.from('mini_project_milestones').update({ done: m.done }).eq('id', id) 
    } catch(e) {}
  }

  const toggleLesson = (id: number) => {
    const updated = { ...taughtLessons, [id]: !taughtLessons[id] }
    setTaughtLessons(updated)
    localStorage.setItem('bayt-lessons-taught-v1', JSON.stringify(updated))
  }

  const totalEarnings = ideas.filter(i => i.status === 'done').reduce((acc, i) => acc + Number(i.potential_qar || 0), 0)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading enterprise data...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>We don't just consume. We build.</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Entrepreneurship</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>ريادة الأعمال</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center', fontFamily: F_MONO }}>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.white }}>{ideas.length}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>TOTAL IDEAS</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.gold }}>{ideas.filter(i => i.status === 'active').length}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>ACTIVE</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.green }}>{ideas.filter(i => i.status === 'done').length}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>COMPLETED</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.white }}>QAR {totalEarnings}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>EARNINGS</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'ideas', label: '💡 Ideas Bank' },
          { id: 'projects', label: '🚀 Active Projects' },
          { id: 'lessons', label: '💰 Money Lessons' },
          { id: 'archive', label: '📜 Archive' }
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
        
        {activeTab === 'ideas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Ideas Bank</h2>
              <button onClick={() => setShowIdeaForm(!showIdeaForm)} style={primaryBtn}>
                {showIdeaForm ? 'CANCEL' : 'ADD IDEA'}
              </button>
            </div>

            {showIdeaForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={ideaForm.member_id} onChange={e => setIdeaForm({...ideaForm, member_id: e.target.value})} style={inputStyle}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input placeholder="Idea Title" value={ideaForm.title} onChange={e => setIdeaForm({...ideaForm, title: e.target.value})} style={inputStyle} />
                  <input type="number" placeholder="Est. QAR (optional)" value={ideaForm.potential_qar} onChange={e => setIdeaForm({...ideaForm, potential_qar: e.target.value})} style={inputStyle} />
                </div>
                <textarea placeholder="Describe the business or project..." value={ideaForm.description} onChange={e => setIdeaForm({...ideaForm, description: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '60px', resize: 'vertical'}} />
                <button onClick={saveIdea} style={primaryBtn}>SAVE IDEA</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {ideas.filter(i => i.status !== 'done' && i.status !== 'paused').map(i => {
                const member = MEMBERS.find(m => m.id === i.member_id)?.name
                return (
                  <div key={i.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, background: C.forest, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{member}</span>
                      <button onClick={() => cycleStatus(i.id, i.status)} style={{ background: STATUS_COLORS[i.status], color: C.white, border: 'none', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontFamily: F_MONO, textTransform: 'uppercase', cursor: 'pointer' }}>
                        {i.status} ↺
                      </button>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: C.green, fontSize: '1.2rem' }}>{i.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: C.grey, lineHeight: 1.5 }}>{i.description}</p>
                    {i.potential_qar && <div style={{ fontSize: '0.8rem', fontFamily: F_MONO, color: C.goldDim }}>POTENTIAL: QAR {i.potential_qar}</div>}
                  </div>
                )
              })}
              {ideas.filter(i => i.status !== 'done' && i.status !== 'paused').length === 0 && <div style={{ ...emptyState, gridColumn: '1 / -1' }}>Every empire started with an idea. What's yours?</div>}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Active Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {ideas.filter(i => i.status === 'active').map(i => {
                const member = MEMBERS.find(m => m.id === i.member_id)?.name
                const projMilestones = milestones.filter(m => m.idea_id === i.id)
                const doneCount = projMilestones.filter(m => m.done).length
                const pct = projMilestones.length > 0 ? (doneCount / projMilestones.length) * 100 : 0

                return (
                  <div key={i.id} style={{ border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, color: C.text, fontSize: '1.3rem' }}>{i.title} <span style={{ fontSize: '0.8rem', color: C.grey, fontWeight: 400 }}>by {member}</span></h3>
                      <button onClick={() => cycleStatus(i.id, i.status)} style={{ background: C.goldDim, color: C.white, border: 'none', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontFamily: F_MONO, textTransform: 'uppercase', cursor: 'pointer' }}>ACTIVE ↺</button>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, marginBottom: '0.25rem' }}>
                        <span>PROGRESS</span><span>{doneCount} / {projMilestones.length}</span>
                      </div>
                      <div style={{ height: '8px', background: C.white, borderRadius: '4px', overflow: 'hidden', border: `1px solid ${C.ruleLight}` }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: C.green, transition: 'width 0.3s' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {projMilestones.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(m.id)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                          <span style={{ fontSize: '0.9rem', color: m.done ? C.grey : C.text, textDecoration: m.done ? 'line-through' : 'none' }}>{m.title}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        placeholder="New milestone..." 
                        value={milestoneForm.idea_id === i.id ? milestoneForm.title : ''} 
                        onChange={e => setMilestoneForm({ idea_id: i.id, title: e.target.value })} 
                        style={{ ...inputStyle, padding: '0.5rem', flex: 1, fontSize: '0.8rem' }} 
                      />
                      <button onClick={() => saveMilestone(i.id)} style={{ background: C.ruleLight, border: 'none', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.75rem' }}>ADD</button>
                    </div>
                  </div>
                )
              })}
              {ideas.filter(i => i.status === 'active').length === 0 && <div style={emptyState}>No active projects. Move an idea to "Active" to start planning milestones.</div>}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Pocket Money Lessons</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {LESSONS.map(l => (
                <div key={l.id} style={{ border: `1px solid ${taughtLessons[l.id] ? C.green : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: taughtLessons[l.id] ? '#e8f5e9' : C.white }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: C.text, fontSize: '1.1rem' }}>{l.id}. {l.title}</h3>
                    <input type="checkbox" checked={taughtLessons[l.id] || false} onChange={() => toggleLesson(l.id)} style={{ transform: 'scale(1.3)', cursor: 'pointer' }} title="Mark as taught" />
                  </div>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: C.green, fontWeight: 600 }}>{l.concept}</p>
                  <div style={{ background: C.cream, padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: C.text, borderLeft: `3px solid ${C.gold}` }}>
                    <strong>Exercise:</strong> {l.exercise}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Archive (Done & Paused)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ideas.filter(i => i.status === 'done' || i.status === 'paused').map(i => {
                const member = MEMBERS.find(m => m.id === i.member_id)?.name
                return (
                  <div key={i.id} style={{ border: `1px solid ${C.ruleLight}`, padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.cream }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: C.text }}>{i.title} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: C.grey }}>by {member}</span></div>
                      <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{new Date(i.created_at).toLocaleDateString()} {i.potential_qar && `· QAR ${i.potential_qar}`}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, textTransform: 'uppercase', color: STATUS_COLORS[i.status], fontWeight: 600 }}>{i.status}</span>
                      <button onClick={() => cycleStatus(i.id, i.status)} style={{ background: C.white, border: `1px solid ${C.rule}`, padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Reactivate</button>
                    </div>
                  </div>
                )
              })}
              {ideas.filter(i => i.status === 'done' || i.status === 'paused').length === 0 && <div style={emptyState}>Archive is empty.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

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