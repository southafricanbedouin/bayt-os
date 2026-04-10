// app/school/school-client.tsx
'use client'

import { useState, useEffect } from 'react'
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

const CHILD_COLORS: Record<string, string> = {
  yahya: '#4a9eca',
  isa:   '#c9a84c',
  linah: '#e07b39',
  dana:  '#7ab87a',
}

const CHILDREN = [
  { id: 'yahya', name: 'Yahya', school: 'doha_college' },
  { id: 'isa', name: 'Isa', school: 'doha_college' },
  { id: 'linah', name: 'Linah', school: 'qfs' },
  { id: 'dana', name: 'Dana', school: 'qfs' }
]

const DEFAULT_SUBJECTS = [
  { id: '1', child_id: 'yahya', name: 'Maths', color: '#4a9eca' },
  { id: '2', child_id: 'yahya', name: 'Science', color: '#e07b39' },
  { id: '3', child_id: 'isa', name: 'English', color: '#c9a84c' },
  { id: '4', child_id: 'linah', name: 'Islamic Studies', color: '#1a3d28' },
  { id: '5', child_id: 'dana', name: 'Art', color: '#7ab87a' }
]

export default function SchoolManagement() {
  const supabase = createClient()
  const [tab, setTab] = useState('today')
  const [loading, setLoading] = useState(true)
  const [activeChild, setActiveChild] = useState('yahya')
  const [homework, setHomework] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])

  // Forms
  const [showAddHw, setShowAddHw] = useState(false)
  const [hwForm, setHwForm] = useState({ title: '', subject_id: '', type: 'homework', due_date: '', notes: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [hwRes, subRes, evRes] = await Promise.all([
        supabase.from('homework').select('*').order('due_date', { ascending: true }),
        supabase.from('school_subjects').select('*'),
        supabase.from('school_events').select('*').order('event_date', { ascending: true })
      ])

      const lsHw = localStorage.getItem('bayt-homework')
      const lsSub = localStorage.getItem('bayt-subjects')
      const lsEv = localStorage.getItem('bayt-events')

      setHomework(hwRes.data?.length ? hwRes.data : (lsHw ? JSON.parse(lsHw) : []))
      setSubjects(subRes.data?.length ? subRes.data : (lsSub ? JSON.parse(lsSub) : DEFAULT_SUBJECTS))
      setEvents(evRes.data?.length ? evRes.data : (lsEv ? JSON.parse(lsEv) : []))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveHomework = (newHw: any[]) => {
    setHomework(newHw)
    localStorage.setItem('bayt-homework', JSON.stringify(newHw))
  }

  const addHomework = () => {
    if (!hwForm.title || !hwForm.due_date) return
    const newItem = {
      id: Date.now().toString(),
      child_id: activeChild,
      ...hwForm,
      completed: false,
      created_at: new Date().toISOString()
    }
    saveHomework([...homework, newItem])
    setHwForm({ title: '', subject_id: '', type: 'homework', due_date: '', notes: '' })
    setShowAddHw(false)
  }

  const toggleComplete = (id: string) => {
    const updated = homework.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
    saveHomework(updated)
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isOverdue = (dateStr: string, completed: boolean) => {
    if (completed) return false
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  const getSubjectColor = (subId: string) => subjects.find(s => s.id === subId)?.color || C.grey
  const getSubjectName = (subId: string) => subjects.find(s => s.id === subId)?.name || 'General'

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading school data...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · EDUCATION</div>
        <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>School Management</h1>
        <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>إدارة المدرسة</div>
        <p style={{ marginTop: '10px', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>"Ilmu: knowledge is worship; track their learning with intention."</p>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['today', 'all', 'calendar', 'subjects', 'transport'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'today' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
              {CHILDREN.map(child => (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: `1px solid ${CHILD_COLORS[child.id]}`,
                    background: activeChild === child.id ? CHILD_COLORS[child.id] : 'transparent',
                    color: activeChild === child.id ? C.white : CHILD_COLORS[child.id],
                    cursor: 'pointer', fontFamily: F_MONO, fontWeight: 600, fontSize: '0.8rem'
                  }}
                >
                  {child.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontWeight: 300 }}>Assignments & Tests</h3>
              <button onClick={() => setShowAddHw(!showAddHw)} style={{ background: C.gold, color: C.white, border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>
                {showAddHw ? 'CANCEL' : '＋ ADD HOMEWORK'}
              </button>
            </div>

            {showAddHw && (
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input placeholder="Title" value={hwForm.title} onChange={e => setHwForm({...hwForm, title: e.target.value})} style={inputStyle} />
                  <select value={hwForm.subject_id} onChange={e => setHwForm({...hwForm, subject_id: e.target.value})} style={inputStyle}>
                    <option value="">Select Subject</option>
                    {subjects.filter(s => s.child_id === activeChild).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={hwForm.type} onChange={e => setHwForm({...hwForm, type: e.target.value})} style={inputStyle}>
                    <option value="homework">Homework</option><option value="test">Test/Exam</option>
                    <option value="project">Project</option><option value="reading">Reading</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="date" value={hwForm.due_date} onChange={e => setHwForm({...hwForm, due_date: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input placeholder="Notes" value={hwForm.notes} onChange={e => setHwForm({...hwForm, notes: e.target.value})} style={{...inputStyle, flex: 2}} />
                  <button onClick={addHomework} style={{ background: C.green, color: C.white, border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>SAVE</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {homework.filter(h => h.child_id === activeChild).sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(h => {
                const isLate = isOverdue(h.due_date, h.completed)
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', background: h.completed ? C.cream : C.white, border: `1px solid ${isLate ? C.orange : C.ruleLight}`, borderRadius: '8px', opacity: h.completed ? 0.6 : 1 }}>
                    <input type="checkbox" checked={h.completed} onChange={() => toggleComplete(h.id)} style={{ transform: 'scale(1.3)', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, textDecoration: h.completed ? 'line-through' : 'none', color: h.completed ? C.grey : C.text }}>{h.title}</span>
                        {h.type === 'test' && <span style={{ background: C.goldPale, color: C.goldDim, padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontFamily: F_MONO, textTransform: 'uppercase' }}>Test</span>}
                        {isLate && <span style={{ background: C.orange, color: C.white, padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontFamily: F_MONO, textTransform: 'uppercase' }}>OVERDUE</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, marginTop: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: getSubjectColor(h.subject_id), fontWeight: 600 }}>{getSubjectName(h.subject_id)}</span>
                        <span>Due: {h.due_date} {isToday(h.due_date) && <strong style={{color: C.orange}}>(TODAY)</strong>}</span>
                        {h.notes && <span>· {h.notes}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {homework.filter(h => h.child_id === activeChild && !h.completed).length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: C.grey, background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
                  "No homework pending. Enjoy the quiet."
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'all' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>All Family Homework</h3>
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', background: C.forest, padding: '10px 16px', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Child</div><div>Task</div><div>Subject</div><div>Due</div><div>Status</div>
              </div>
              {homework.sort((a,b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map((h, i) => {
                const child = CHILDREN.find(c => c.id === h.child_id)
                return (
                  <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '12px 16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                    <div>
                      <span style={{ background: CHILD_COLORS[h.child_id]+'22', color: CHILD_COLORS[h.child_id], padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {child?.name}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, textDecoration: h.completed ? 'line-through' : 'none', color: h.completed ? C.grey : C.text }}>{h.title}</div>
                    <div style={{ fontSize: '0.8rem', color: getSubjectColor(h.subject_id) }}>{getSubjectName(h.subject_id)}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: isOverdue(h.due_date, h.completed) ? C.orange : C.text }}>{h.due_date}</div>
                    <div style={{ fontSize: '0.8rem', color: h.completed ? C.green : C.grey }}>{h.completed ? 'Done' : 'Pending'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'subjects' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {CHILDREN.map(child => (
              <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                <h3 style={{ marginTop: 0, color: CHILD_COLORS[child.id], borderBottom: `1px solid ${CHILD_COLORS[child.id]}`, paddingBottom: '8px' }}>
                  {child.name} ({child.school === 'doha_college' ? 'DC' : 'QFS'})
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {subjects.filter(s => s.child_id === child.id).map(s => (
                    <li key={s.id} style={{ padding: '8px 0', borderBottom: `1px dashed ${C.ruleLight}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'transport' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '10px' }}>TRANSPORT OVERVIEW</div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>For detailed vehicle and maintenance tracking, visit the primary <strong>Transport & Vehicles</strong> module.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {CHILDREN.map(child => (
                <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, borderTop: `4px solid ${CHILD_COLORS[child.id]}` }}>
                  <h3 style={{ marginTop: 0, fontWeight: 600, fontSize: '1.2rem' }}>{child.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                    <span style={{ color: C.grey, fontSize: '0.8rem' }}>Morning Drop-off</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>🚌 School Bus</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: C.grey, fontSize: '0.8rem' }}>Afternoon Pickup</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>🚘 Hamilton Transport</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: C.grey, background: C.cream, borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <div>Calendar view implementation ready for integration. All event hooks prepared.</div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '8px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_SANS, fontSize: '0.85rem' }