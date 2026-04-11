// app/isa-project/isa-project-client.tsx
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

const QUOTES = [
  "Be the hardest worker in the room.",
  "Champions are made in the moments they don't want to try.",
  "Show up. Every day. That's it.",
  "Big goals. Small steps. Every day.",
  "Be the reason someone believes anything is possible.",
  "Winners never quit and quitters never win.",
  "Your only competition is who you were yesterday.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Work until you no longer have to introduce yourself.",
  "Fall seven times. Stand up eight.",
  "Talent is given. Greatness is earned.",
  "New year. New chapter. Same hustle."
]

const MOODS = ['Excited', 'Focused', 'Stuck', 'Proud', 'Learning']
const MOOD_EMOJIS: Record<string, string> = { Excited: '🤩', Focused: '🎯', Stuck: '🤔', Proud: '🏆', Learning: '📚' }

export default function IsaProject() {
  const [activeTab, setActiveTab] = useState('project')
  const [loading, setLoading] = useState(true)
  
  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [journal, setJournal] = useState<any[]>([])
  
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectForm, setProjectForm] = useState({ title: '', description: '', category: 'sport', status: 'idea' })
  
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' })
  const [journalForm, setJournalForm] = useState({ entry: '', mood: 'Excited' })

  const supabase = createClient()
  const MEMBER_ID = 'isa'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, mRes, jRes] = await Promise.all([
        supabase.from('child_projects').select('*').eq('member_id', MEMBER_ID).order('created_at', { ascending: false }),
        supabase.from('child_project_milestones').select('*, child_projects!inner(member_id)').eq('child_projects.member_id', MEMBER_ID).order('created_at', { ascending: true }),
        supabase.from('child_project_journal').select('*, child_projects!inner(member_id)').eq('child_projects.member_id', MEMBER_ID).order('logged_at', { ascending: false })
      ])

      setProjects(pRes.data || JSON.parse(localStorage.getItem(`bayt-projects-${MEMBER_ID}-v1`) || '[]'))
      setMilestones(mRes.data || JSON.parse(localStorage.getItem(`bayt-milestones-${MEMBER_ID}-v1`) || '[]'))
      setJournal(jRes.data || JSON.parse(localStorage.getItem(`bayt-journal-${MEMBER_ID}-v1`) || '[]'))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveProject = async () => {
    if (!projectForm.title) return
    const newP = { id: crypto.randomUUID(), member_id: MEMBER_ID, ...projectForm, started_at: new Date().toISOString(), created_at: new Date().toISOString() }
    const updated = [newP, ...projects]
    setProjects(updated)
    localStorage.setItem(`bayt-projects-${MEMBER_ID}-v1`, JSON.stringify(updated))
    setShowProjectForm(false)
    setProjectForm({ title: '', description: '', category: 'sport', status: 'idea' })
    try { await supabase.from('child_projects').insert(newP) } catch(e) {}
  }

  const makeActive = async (id: string) => {
    const updated = projects.map(p => ({ ...p, status: p.id === id ? 'active' : (p.status === 'active' ? 'paused' : p.status) }))
    setProjects(updated)
    localStorage.setItem(`bayt-projects-${MEMBER_ID}-v1`, JSON.stringify(updated))
    try {
      await supabase.from('child_projects').update({ status: 'paused' }).eq('member_id', MEMBER_ID).eq('status', 'active')
      await supabase.from('child_projects').update({ status: 'active' }).eq('id', id)
    } catch(e) {}
  }

  const addMilestone = async (projectId: string) => {
    if (!milestoneForm.title) return
    const newM = { id: crypto.randomUUID(), project_id: projectId, ...milestoneForm, done: false, created_at: new Date().toISOString() }
    const updated = [...milestones, newM]
    setMilestones(updated)
    localStorage.setItem(`bayt-milestones-${MEMBER_ID}-v1`, JSON.stringify(updated))
    setMilestoneForm({ title: '', description: '', due_date: '' })
    try { await supabase.from('child_project_milestones').insert(newM) } catch(e) {}
  }

  const toggleMilestone = async (id: string) => {
    const updated = milestones.map(m => m.id === id ? { ...m, done: !m.done, completed_at: !m.done ? new Date().toISOString() : null } : m)
    setMilestones(updated)
    localStorage.setItem(`bayt-milestones-${MEMBER_ID}-v1`, JSON.stringify(updated))
    try {
      const m = updated.find(x => x.id === id)
      if (m) await supabase.from('child_project_milestones').update({ done: m.done, completed_at: m.completed_at }).eq('id', id)
    } catch(e) {}
  }

  const addJournal = async (projectId: string) => {
    if (!journalForm.entry) return
    const newJ = { id: crypto.randomUUID(), project_id: projectId, ...journalForm, logged_at: new Date().toISOString() }
    const updated = [newJ, ...journal]
    setJournal(updated)
    localStorage.setItem(`bayt-journal-${MEMBER_ID}-v1`, JSON.stringify(updated))
    setJournalForm({ entry: '', mood: 'Excited' })
    try { await supabase.from('child_project_journal').insert(newJ) } catch(e) {}
  }

  const activeProject = projects.find(p => p.status === 'active')
  const currentQuote = QUOTES[new Date().getMonth()]

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading workspace...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.goldDim, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.cream, textTransform: 'uppercase', marginBottom: '0.5rem' }}>We build, we don't just consume</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Isa's Project Hub</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.cream, marginTop: '0.5rem' }}>مشروع عيسى</div>
          <div style={{ fontSize: '0.8rem', color: C.cream, opacity: 0.9, marginTop: '0.5rem', fontFamily: F_MONO }}>Isa · Age 10 · Doha College</div>
        </div>
        <div style={{ maxWidth: '300px', textAlign: 'right', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9 }}>
          "{currentQuote}"
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'project', label: '🚀 My Project' },
          { id: 'ideas', label: '💡 Project Ideas' },
          { id: 'journal', label: '📓 Journal' },
          { id: 'achievements', label: '🏆 Achievements' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.goldDim}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.goldDim : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'project' && (
          <div>
            {activeProject ? (
              <div>
                <div style={{ background: C.cream, border: `1px solid ${C.goldDim}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ background: C.goldDim, color: C.white, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontFamily: F_MONO, textTransform: 'uppercase' }}>{activeProject.category}</span>
                    <span style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>Started: {new Date(activeProject.started_at).toLocaleDateString()}</span>
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: C.text, fontSize: '1.5rem' }}>{activeProject.title}</h2>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: C.grey, lineHeight: 1.5 }}>{activeProject.description}</p>
                  
                  {(() => {
                    const pMilestones = milestones.filter(m => m.project_id === activeProject.id)
                    const doneCount = pMilestones.filter(m => m.done).length
                    const pct = pMilestones.length > 0 ? (doneCount / pMilestones.length) * 100 : 0
                    return (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, marginBottom: '0.25rem' }}>
                          <span>MILESTONES</span><span>{doneCount} / {pMilestones.length}</span>
                        </div>
                        <div style={{ height: '8px', background: C.white, borderRadius: '4px', overflow: 'hidden', border: `1px solid ${C.ruleLight}` }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: C.goldDim, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Milestones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {milestones.filter(m => m.project_id === activeProject.id).map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: `1px solid ${C.ruleLight}`, borderRadius: '6px', background: m.done ? C.forest : C.white }}>
                          <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(m.id)} style={{ transform: 'scale(1.2)', cursor: 'pointer', marginTop: '4px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: m.done ? C.grey : C.text, textDecoration: m.done ? 'line-through' : 'none', fontWeight: 600 }}>{m.title}</div>
                            {m.description && <div style={{ fontSize: '0.8rem', color: C.grey, marginTop: '2px' }}>{m.description}</div>}
                            {m.due_date && !m.done && <div style={{ fontSize: '0.7rem', color: C.orange, fontFamily: F_MONO, marginTop: '4px' }}>Due: {m.due_date}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input placeholder="New milestone title..." value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                      <input type="date" value={milestoneForm.due_date} onChange={e => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })} style={inputStyle} />
                      <button onClick={() => addMilestone(activeProject.id)} style={{ ...primaryBtn, background: C.goldDim }}>ADD</button>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Log Progress</h3>
                    <div style={{ background: C.cream, padding: '1rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                      <select value={journalForm.mood} onChange={e => setJournalForm({...journalForm, mood: e.target.value})} style={{ ...inputStyle, marginBottom: '0.5rem', width: '100%' }}>
                        {MOODS.map(m => <option key={m} value={m}>{MOOD_EMOJIS[m]} {m}</option>)}
                      </select>
                      <textarea placeholder="What did you build today?" value={journalForm.entry} onChange={e => setJournalForm({...journalForm, entry: e.target.value})} style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical', marginBottom: '0.5rem' }} />
                      <button onClick={() => addJournal(activeProject.id)} style={{ ...primaryBtn, background: C.goldDim, width: '100%' }}>SAVE JOURNAL</button>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {journal.filter(j => j.project_id === activeProject.id).slice(0, 3).map(j => (
                        <div key={j.id} style={{ fontSize: '0.8rem', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                          <span style={{ marginRight: '4px' }}>{MOOD_EMOJIS[j.mood]}</span>
                          <span style={{ color: C.text }}>{j.entry}</span>
                          <div style={{ color: C.grey, fontFamily: F_MONO, fontSize: '0.65rem', marginTop: '2px' }}>{new Date(j.logged_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ ...emptyState, borderColor: C.goldDim }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ color: C.goldDim, margin: '0 0 0.5rem 0' }}>Ready for an adventure?</h3>
                <p style={{ margin: '0 0 1.5rem 0' }}>You don't have an active project right now. Head to Ideas to start one.</p>
                <button onClick={() => setActiveTab('ideas')} style={{ ...primaryBtn, background: C.goldDim }}>GO TO IDEAS</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Project Ideas</h2>
              <button onClick={() => setShowProjectForm(!showProjectForm)} style={{ ...primaryBtn, background: C.goldDim }}>
                {showProjectForm ? 'CANCEL' : 'ADD NEW IDEA'}
              </button>
            </div>

            {showProjectForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input placeholder="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} style={inputStyle} />
                  <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} style={inputStyle}>
                    {['business', 'creative', 'tech', 'sport', 'community', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})} style={inputStyle}>
                    {['idea', 'active', 'paused', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <textarea placeholder="What is this project about?" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '60px', resize: 'vertical'}} />
                <button onClick={saveProject} style={{ ...primaryBtn, background: C.goldDim }}>SAVE PROJECT</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {projects.map(p => (
                <div key={p.id} style={{ border: `1px solid ${p.status === 'active' ? C.goldDim : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: p.status === 'active' ? C.white : C.cream, opacity: p.status === 'completed' ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{p.category.toUpperCase()}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: p.status === 'active' ? C.goldDim : C.grey, fontWeight: 600 }}>{p.status.toUpperCase()}</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: C.text, fontSize: '1.1rem' }}>{p.title}</h3>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: C.grey, lineHeight: 1.5 }}>{p.description}</p>
                  {p.status !== 'active' && p.status !== 'completed' && (
                    <button onClick={() => makeActive(p.id)} style={{ ...primaryBtn, background: C.white, color: C.goldDim, border: `1px solid ${C.goldDim}`, width: '100%' }}>MAKE ACTIVE</button>
                  )}
                  {p.status === 'active' && (
                    <div style={{ fontSize: '0.75rem', color: C.goldDim, textAlign: 'center', fontFamily: F_MONO }}>CURRENTLY WORKING ON THIS</div>
                  )}
                </div>
              ))}
              {projects.length === 0 && <div style={{ ...emptyState, gridColumn: '1 / -1' }}>No ideas logged yet. What do you want to build?</div>}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>My Project Journal</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {journal.map(j => {
                const project = projects.find(p => p.id === j.project_id)?.title || 'Unknown Project'
                return (
                  <div key={j.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.2rem', background: C.white }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.goldDim }}>{project}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{new Date(j.logged_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '1rem', color: C.text, lineHeight: 1.5, marginBottom: '0.8rem' }}>{j.entry}</div>
                    <div style={{ fontSize: '0.8rem', color: C.grey, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{MOOD_EMOJIS[j.mood]}</span> Feeling {j.mood.toLowerCase()}
                    </div>
                  </div>
                )
              })}
              {journal.length === 0 && <div style={{ ...emptyState, gridColumn: '1 / -1' }}>Start writing. Even one sentence a day builds a record of growth.</div>}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Achievements & Stats</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontSize: '2.5rem', color: C.goldDim, fontWeight: 300, marginBottom: '0.5rem' }}>{projects.length}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em' }}>PROJECTS LOGGED</div>
              </div>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontSize: '2.5rem', color: C.green, fontWeight: 300, marginBottom: '0.5rem' }}>{milestones.filter(m => m.done).length}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em' }}>MILESTONES DONE</div>
              </div>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontSize: '2.5rem', color: C.orange, fontWeight: 300, marginBottom: '0.5rem' }}>{journal.length}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em' }}>JOURNAL ENTRIES</div>
              </div>
            </div>

            <div style={{ background: C.forest, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, position: 'relative' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Baba's Note</div>
              <p style={{ margin: 0, fontSize: '1.1rem', color: C.text, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Isa — you have something special. The way you throw yourself into things, the way you make everyone laugh, the way you don't give up. Use it. Channel it. I believe in you completely. — Baba"
              </p>
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