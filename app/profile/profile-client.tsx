// app/profile/profile-client.tsx
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

const CHILD_SCHOOLS: Record<string, string> = {
  yahya: 'Doha College', isa: 'Doha College', linah: 'QFS', dana: 'QFS'
}

const AGE_MAX_IQ: Record<string, number> = { yahya: 110, isa: 100, linah: 70, dana: 60 }
const AGE_MAX_EQ: Record<string, number> = { yahya: 110, isa: 100, linah: 70, dana: 60 }

export default function UserProfile({ memberId, isOwnProfile, isParent }: { memberId: string, isOwnProfile: boolean, isParent: boolean }) {
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [devScores, setDevScores] = useState<any>(null)
  const [activityScore, setActivityScore] = useState(0)

  // Forms
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profForm, setProfForm] = useState({ display_name: '', bio: '', current_focus: '', interests: '', love_language: '' })
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', tag: 'project', due_date: '', priority: 'normal' })
  
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteForm, setNoteForm] = useState({ title: '', content: '', type: 'note' })

  const [showKpiForm, setShowKpiForm] = useState(false)
  const [kpiForm, setKpiForm] = useState({ overall_score: 5, wins: '', improvements: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [memberId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, gRes, tRes, nRes, dRes, aRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('member_id', memberId).single(),
        supabase.from('personal_goals').select('*').eq('member_id', memberId).eq('status', 'active'),
        supabase.from('personal_tasks').select('*').eq('member_id', memberId).order('created_at', { ascending: false }),
        supabase.from('personal_notes').select('*').eq('member_id', memberId).order('created_at', { ascending: false }),
        supabase.from('development_scores').select('*').eq('member_id', memberId).order('score_date', { ascending: false }).limit(1).single(),
        supabase.from('activity_log').select('points').eq('member_id', memberId)
      ])

      const lsProfile = JSON.parse(localStorage.getItem(`bayt-profile-${memberId}-v1`) || 'null')
      
      const defaultProfile = { 
        member_id: memberId, display_name: memberId.charAt(0).toUpperCase() + memberId.slice(1), 
        role: ['muhammad', 'camilla'].includes(memberId) ? 'parent' : 'child',
        bio: 'Building the foundation.', current_focus: 'Consistency', 
        interests: ['reading', 'building'], love_language: 'quality time' 
      }
      
      const pData = pRes.data || lsProfile || defaultProfile
      setProfile(pData)
      setProfForm({ ...pData, interests: pData.interests?.join(', ') || '' })

      setGoals(gRes.data || JSON.parse(localStorage.getItem(`bayt-pgoals-${memberId}-v1`) || '[]'))
      setTasks(tRes.data || JSON.parse(localStorage.getItem(`bayt-ptasks-${memberId}-v1`) || '[]'))
      setNotes(nRes.data || JSON.parse(localStorage.getItem(`bayt-pnotes-${memberId}-v1`) || '[]'))
      
      const defaultScores = { iq_raw: 85, iq_age_max: AGE_MAX_IQ[memberId] || 150, eq_raw: 80, eq_age_max: AGE_MAX_EQ[memberId] || 150, academic_raw: 90, academic_max: 100, social_raw: 85, social_max: 100, deen_raw: 75, deen_max: 100 }
      setDevScores(dRes.data || JSON.parse(localStorage.getItem(`bayt-devscores-${memberId}-v1`) || JSON.stringify(defaultScores)))
      
      const pts = (aRes.data || []).reduce((acc: number, r: any) => acc + (r.points || 0), 0)
      setActivityScore(pts || Number(localStorage.getItem(`bayt-pts-${memberId}-v1`) || 0))
      
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const saveProfile = async () => {
    const updated = { ...profile, ...profForm, interests: profForm.interests.split(',').map(s => s.trim()) }
    setProfile(updated)
    localStorage.setItem(`bayt-profile-${memberId}-v1`, JSON.stringify(updated))
    setIsEditingProfile(false)
    try { await supabase.from('user_profiles').upsert({ id: profile.id || crypto.randomUUID(), ...updated }) } catch(e) {}
  }

  const addTask = async () => {
    if (!taskForm.title) return
    const newTask = { id: crypto.randomUUID(), member_id: memberId, ...taskForm, status: 'todo', created_at: new Date().toISOString() }
    const updated = [newTask, ...tasks]
    setTasks(updated)
    localStorage.setItem(`bayt-ptasks-${memberId}-v1`, JSON.stringify(updated))
    setShowTaskForm(false)
    setTaskForm({ title: '', description: '', tag: 'project', due_date: '', priority: 'normal' })
    try { await supabase.from('personal_tasks').insert(newTask) } catch(e) {}
  }

  const updateTaskStatus = async (id: string, status: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t)
    setTasks(updated)
    localStorage.setItem(`bayt-ptasks-${memberId}-v1`, JSON.stringify(updated))
    try { await supabase.from('personal_tasks').update({ status }).eq('id', id) } catch(e) {}
  }

  const addNote = async () => {
    if (!noteForm.content) return
    const newNote = { id: crypto.randomUUID(), member_id: memberId, ...noteForm, pinned: false, created_at: new Date().toISOString() }
    const updated = [newNote, ...notes]
    setNotes(updated)
    localStorage.setItem(`bayt-pnotes-${memberId}-v1`, JSON.stringify(updated))
    setShowNoteForm(false)
    setNoteForm({ title: '', content: '', type: 'note' })
    try { await supabase.from('personal_notes').insert(newNote) } catch(e) {}
  }

  const togglePinNote = async (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n).sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    setNotes(updated)
    localStorage.setItem(`bayt-pnotes-${memberId}-v1`, JSON.stringify(updated))
    try { 
      const n = updated.find(x => x.id === id)
      if (n) await supabase.from('personal_notes').update({ pinned: n.pinned }).eq('id', id) 
    } catch(e) {}
  }

  const submitKpi = async () => {
    alert(`Q${Math.floor(new Date().getMonth()/3)+1} Self-Assessment logged!`)
    setShowKpiForm(false)
  }

  if (loading || !profile) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading profile...</div>

  const isChild = profile.role === 'child'
  const school = CHILD_SCHOOLS[memberId]
  const avatarLetter = profile.display_name?.charAt(0).toUpperCase() || '?'

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      
      <header style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: isChild ? C.blue : C.goldDim }} />
        
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: isChild ? C.blue : C.goldDim, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontFamily: F_MONO, flexShrink: 0 }}>
          {avatarLetter}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 300, color: C.text }}>{profile.display_name}</h1>
              <div style={{ display: 'flex', gap: '0.8rem', fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey, textTransform: 'uppercase' }}>
                <span style={{ background: C.ruleLight, padding: '0.2rem 0.6rem', borderRadius: '12px', color: C.text }}>{profile.role}</span>
                {school && <span style={{ background: C.forest, padding: '0.2rem 0.6rem', borderRadius: '12px', color: C.green }}>{school}</span>}
              </div>
            </div>
            {(isOwnProfile || isParent) && (
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} style={{ background: 'none', border: `1px solid ${C.rule}`, padding: '0.5rem 1rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.7rem', cursor: 'pointer', color: C.grey }}>
                {isEditingProfile ? 'CANCEL' : 'EDIT PROFILE'}
              </button>
            )}
          </div>
          
          {isEditingProfile ? (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: C.cream, padding: '1.5rem', borderRadius: '8px' }}>
              <input value={profForm.display_name} onChange={e => setProfForm({...profForm, display_name: e.target.value})} placeholder="Display Name" style={inputStyle} />
              <input value={profForm.current_focus} onChange={e => setProfForm({...profForm, current_focus: e.target.value})} placeholder="Current Focus" style={inputStyle} />
              <textarea value={profForm.bio} onChange={e => setProfForm({...profForm, bio: e.target.value})} placeholder="Bio" style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
              <input value={profForm.interests} onChange={e => setProfForm({...profForm, interests: e.target.value})} placeholder="Interests (comma separated)" style={inputStyle} />
              <select value={profForm.love_language} onChange={e => setProfForm({...profForm, love_language: e.target.value})} style={inputStyle}>
                <option value="words">Words of Affirmation</option><option value="time">Quality Time</option><option value="gifts">Receiving Gifts</option><option value="acts">Acts of Service</option><option value="touch">Physical Touch</option>
              </select>
              <button onClick={saveProfile} style={primaryBtn}>SAVE PROFILE</button>
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '1rem', color: C.text, marginBottom: '0.5rem', fontStyle: 'italic' }}>"{profile.bio}"</div>
              <div style={{ fontSize: '0.85rem', color: C.green, fontWeight: 600, marginBottom: '1rem' }}>Focus: {profile.current_focus}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.interests?.map((i: string) => <span key={i} style={{ fontSize: '0.7rem', background: C.cream, border: `1px solid ${C.rule}`, padding: '0.2rem 0.6rem', borderRadius: '12px', color: C.grey }}>#{i}</span>)}
              </div>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {[
          { id: 'overview', label: '🏠 Overview' },
          { id: 'goals', label: '🎯 Goals & KPIs' },
          { id: 'dev', label: '📊 Development' },
          { id: 'tasks', label: '✅ Tasks' },
          { id: 'notes', label: '📝 Notes' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: tab === t.id ? C.forest : 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', borderRight: `1px solid ${C.ruleLight}`
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ minHeight: '500px' }}>
        
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Family Contribution</div>
                  <div style={{ fontSize: '2rem', color: C.goldDim, fontWeight: 300 }}>{activityScore} <span style={{ fontSize: '1rem', color: C.grey }}>pts this month</span></div>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.2 }}>🌟</div>
              </div>

              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>Active Goals</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {goals.slice(0,3).map(g => (
                    <div key={g.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600 }}>{g.title}</span>
                        <span style={{ fontFamily: F_MONO, color: C.green }}>{g.progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: C.forest, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${g.progress}%`, height: '100%', background: C.green }} />
                      </div>
                    </div>
                  ))}
                  {goals.length === 0 && <div style={{ fontSize: '0.85rem', color: C.grey, fontStyle: 'italic' }}>No active goals.</div>}
                </div>
              </div>

              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 300 }}>Tasks This Week</h3>
                  <button onClick={() => setTab('tasks')} style={{ background: 'none', border: 'none', color: C.blue, fontSize: '0.75rem', cursor: 'pointer', fontFamily: F_MONO }}>View Board →</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, background: C.cream, padding: '1rem', borderRadius: '6px', textAlign: 'center', border: `1px dashed ${C.rule}` }}>
                    <div style={{ fontSize: '1.5rem', color: C.orange, fontWeight: 600 }}>{tasks.filter(t => t.status !== 'done').length}</div>
                    <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>PENDING</div>
                  </div>
                  <div style={{ flex: 1, background: '#e8f5e9', padding: '1rem', borderRadius: '6px', textAlign: 'center', border: `1px solid ${C.green}` }}>
                    <div style={{ fontSize: '1.5rem', color: C.green, fontWeight: 600 }}>{tasks.filter(t => t.status === 'done').length}</div>
                    <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.midgreen }}>COMPLETED</div>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Pinned Notes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {notes.filter(n => n.pinned).slice(0,2).map(n => (
                    <div key={n.id} style={{ background: C.cream, padding: '1rem', borderRadius: '6px', borderLeft: `3px solid ${C.goldDim}` }}>
                      {n.title && <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{n.title}</div>}
                      <div style={{ fontSize: '0.8rem', color: C.text, lineHeight: 1.4 }}>{n.content.substring(0, 80)}{n.content.length > 80 ? '...' : ''}</div>
                    </div>
                  ))}
                  {notes.filter(n => n.pinned).length === 0 && <div style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic' }}>No pinned notes.</div>}
                </div>
                <button onClick={() => setTab('notes')} style={{ marginTop: '1rem', width: '100%', background: C.forest, border: `1px solid ${C.rule}`, padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: F_MONO, cursor: 'pointer', color: C.text }}>ALL NOTES</button>
              </div>

              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Development Snapshot</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { label: 'IQ / Logic', raw: devScores.iq_raw, max: devScores.iq_age_max, color: C.blue },
                    { label: 'EQ / Empathy', raw: devScores.eq_raw, max: devScores.eq_age_max, color: C.orange },
                    { label: 'Academic', raw: devScores.academic_raw, max: devScores.academic_max, color: C.green },
                    { label: 'Social', raw: devScores.social_raw, max: devScores.social_max, color: C.goldDim },
                    { label: 'Deen', raw: devScores.deen_raw, max: devScores.deen_max, color: C.midgreen },
                  ].map(s => {
                    const pct = (s.raw / s.max) * 100
                    return (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: F_MONO, marginBottom: '0.2rem', color: C.grey }}>
                          <span>{s.label}</span><span>{s.raw}/{s.max}</span>
                        </div>
                        <div style={{ height: '4px', background: C.ruleLight, borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: s.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setTab('dev')} style={{ marginTop: '1rem', width: '100%', background: 'none', border: 'none', color: C.blue, fontSize: '0.75rem', fontFamily: F_MONO, cursor: 'pointer', textAlign: 'right' }}>DETAILS →</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'goals' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 300 }}>My Goals</h2>
                <button style={primaryBtn}>+ NEW GOAL</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {goals.map(g => (
                  <div key={g.id} style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.forest, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.green, textTransform: 'uppercase' }}>{g.area}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>Target: {g.target_date || 'None'}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{g.title}</div>
                    <div style={{ fontSize: '0.85rem', color: C.grey, marginBottom: '1rem' }}>{g.description}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, marginBottom: '0.4rem' }}>
                      <span>Progress</span><span>{g.progress}%</span>
                    </div>
                    <div style={{ height: '8px', background: C.ruleLight, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: C.green }} />
                    </div>
                  </div>
                ))}
                {goals.length === 0 && <div style={emptyState}>No personal goals set. What do you want to achieve?</div>}
              </div>
            </div>

            <div>
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, color: C.text, borderBottom: `1px solid ${C.rule}`, paddingBottom: '0.5rem' }}>
                  {isChild ? 'Your Report Card' : 'Quarterly KPI Review'}
                </h3>
                
                {showKpiForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>Q{Math.floor(new Date().getMonth()/3)+1} {new Date().getFullYear()} Self-Assessment</div>
                    
                    <div>
                      <label style={labelStyle}>SCORE (1-10)</label>
                      <input type="range" min="1" max="10" value={kpiForm.overall_score} onChange={e => setKpiForm({...kpiForm, overall_score: Number(e.target.value)})} style={{ width: '100%', accentColor: C.goldDim }} />
                      <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, color: C.goldDim }}>{kpiForm.overall_score}/10</div>
                    </div>
                    
                    <textarea placeholder="What went well?" value={kpiForm.wins} onChange={e => setKpiForm({...kpiForm, wins: e.target.value})} style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
                    <textarea placeholder="Where to improve?" value={kpiForm.improvements} onChange={e => setKpiForm({...kpiForm, improvements: e.target.value})} style={{...inputStyle, minHeight: '60px', resize: 'vertical'}} />
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={submitKpi} style={{ ...primaryBtn, flex: 1 }}>SUBMIT</button>
                      <button onClick={() => setShowKpiForm(false)} style={{ background: 'none', border: `1px solid ${C.rule}`, padding: '0.75rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', cursor: 'pointer' }}>CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <p style={{ fontSize: '0.85rem', color: C.grey, marginBottom: '1.5rem' }}>Sidq: honest self-assessment, honest effort.</p>
                    <button onClick={() => setShowKpiForm(true)} style={{ ...primaryBtn, width: '100%', background: C.goldDim }}>START Q{Math.floor(new Date().getMonth()/3)+1} REVIEW</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'dev' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 300, textAlign: 'center' }}>Development Scores</h2>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: C.grey, marginBottom: '3rem', fontStyle: 'italic' }}>
              "These scores measure YOU against YOUR best. Progress is personal."
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { key: 'iq', label: '🧠 IQ / Reasoning', desc: 'How you think, solve puzzles, and understand complex ideas.', raw: devScores.iq_raw, max: devScores.iq_age_max, color: C.blue },
                { key: 'eq', label: '❤️ EQ / Empathy', desc: 'How you understand your own feelings and connect with others.', raw: devScores.eq_raw, max: devScores.eq_age_max, color: C.orange },
                { key: 'academic', label: '🏫 Academic', desc: 'School performance and structured learning.', raw: devScores.academic_raw, max: devScores.academic_max, color: C.green },
                { key: 'social', label: '🤝 Social Skills', desc: 'Communication, teamwork, and navigating friendships.', raw: devScores.social_raw, max: devScores.social_max, color: C.goldDim },
                { key: 'deen', label: '🌙 Deen & Akhlaq', desc: 'Islamic knowledge, practice, and moral character.', raw: devScores.deen_raw, max: devScores.deen_max, color: C.midgreen },
              ].map(s => {
                const pct = (s.raw / s.max) * 100
                return (
                  <div key={s.key} style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text }}>{s.label}</div>
                        <div style={{ fontSize: '0.8rem', color: C.grey, marginTop: '4px' }}>{s.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.raw}</div>
                        <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>/ {s.max} (Age Cap)</div>
                      </div>
                    </div>
                    <div style={{ height: '8px', background: C.ruleLight, borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: s.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
            
            {isParent && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button style={{ background: 'none', border: `1px solid ${C.rule}`, color: C.grey, padding: '0.75rem 2rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', cursor: 'pointer' }}>
                  UPDATE SCORES (PARENT ONLY)
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300 }}>Task Board</h2>
              <button onClick={() => setShowTaskForm(!showTaskForm)} style={primaryBtn}>
                {showTaskForm ? 'CANCEL' : '+ ADD TASK'}
              </button>
            </div>

            {showTaskForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input placeholder="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} style={inputStyle} />
                  <select value={taskForm.tag} onChange={e => setTaskForm({...taskForm, tag: e.target.value})} style={inputStyle}>
                    <option value="project">Project</option><option value="chore">Chore</option><option value="goal">Goal</option><option value="school">School</option><option value="adhoc">Adhoc</option>
                  </select>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} style={inputStyle}>
                    <option value="low">Low Priority</option><option value="normal">Normal</option><option value="high">High Priority</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input placeholder="Description (optional)" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} style={{...inputStyle, flex: 2}} />
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <button onClick={addTask} style={primaryBtn}>SAVE TASK</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: C.forest, padding: '1.5rem', borderRadius: '8px' }}>
              
              {['todo', 'in_progress', 'done'].map(status => {
                const colTasks = tasks.filter(t => t.status === status)
                const labels: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
                return (
                  <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600, color: C.grey, textTransform: 'uppercase', borderBottom: `2px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                      {labels[status]} ({colTasks.length})
                    </div>
                    {colTasks.map(t => (
                      <div key={t.id} style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '6px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.1rem 0.4rem', borderRadius: '4px', color: C.grey, textTransform: 'uppercase' }}>{t.tag}</span>
                          {t.priority === 'high' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.orange }} title="High Priority" />}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', textDecoration: status === 'done' ? 'line-through' : 'none', color: status === 'done' ? C.grey : C.text }}>{t.title}</div>
                        {t.description && <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '0.8rem' }}>{t.description}</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: `1px dashed ${C.ruleLight}`, paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: t.due_date ? C.orange : C.rule }}>{t.due_date || 'No date'}</span>
                          <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)} style={{ padding: '2px 4px', fontSize: '0.7rem', border: `1px solid ${C.rule}`, borderRadius: '4px', background: 'transparent' }}>
                            <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}

            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300 }}>Notes & Ideas</h2>
              <button onClick={() => setShowNoteForm(!showNoteForm)} style={{...primaryBtn, background: C.goldDim}}>
                {showNoteForm ? 'CANCEL' : '+ ADD NOTE'}
              </button>
            </div>

            {showNoteForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={noteForm.type} onChange={e => setNoteForm({...noteForm, type: e.target.value})} style={{...inputStyle, flex: 1}}>
                    <option value="note">Note</option><option value="idea">Idea</option><option value="thought">Thought</option><option value="dream">Dream</option><option value="question">Question</option>
                  </select>
                  <input placeholder="Title (optional)" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} style={{...inputStyle, flex: 3}} />
                </div>
                <textarea placeholder="What's on your mind?" value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} style={{...inputStyle, width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '1rem'}} />
                <button onClick={addNote} style={{...primaryBtn, background: C.goldDim}}>SAVE NOTE</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {notes.map(n => {
                const colors: Record<string, string> = { note: C.grey, idea: C.goldDim, thought: C.blue, dream: C.green, question: C.orange }
                const cColor = colors[n.type] || C.grey
                return (
                  <div key={n.id} style={{ background: C.white, border: `1px solid ${n.pinned ? C.goldDim : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', boxShadow: n.pinned ? '0 2px 8px rgba(201,168,76,0.2)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.forest, padding: '0.2rem 0.5rem', borderRadius: '4px', color: cColor, textTransform: 'uppercase' }}>{n.type}</span>
                      <button onClick={() => togglePinNote(n.id)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: n.pinned ? 1 : 0.2 }}>📌</button>
                    </div>
                    {n.title && <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: C.text }}>{n.title}</div>}
                    <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.content}</div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, marginTop: '1rem', textAlign: 'right' }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
              {notes.length === 0 && <div style={emptyState}>A quiet mind. Add a note or idea when inspiration strikes.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }
const primaryBtn = { background: C.green, color: C.white, border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }
const emptyState = { padding: '3rem', textAlign: 'center' as const, color: C.grey, background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}`, fontStyle: 'italic', gridColumn: '1 / -1' }