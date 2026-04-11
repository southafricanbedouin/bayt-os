// app/notifications/notifications-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = {
  green: '#1a3d28', midgreen: '#245235', forest: '#f0ebe0',
  gold: '#c9a84c', goldDim: '#9b7d38', goldPale: '#f0e4c0',
  cream: '#faf8f2', white: '#ffffff', grey: '#6b7c6e',
  rule: '#ddd8cc', ruleLight: '#e8e3d8', text: '#0d1a0f',
  orange: '#e07b39', blue: '#4a9eca', purple: '#8e44ad'
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

const MEMBERS = [
  { id: 'muhammad', name: 'Muhammad' },
  { id: 'camilla', name: 'Camilla' },
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const NOTIF_ICONS: Record<string, string> = {
  task_assigned: '📋', unlock_earned: '🏆', mention: '💬', review_due: '📅', letter: '✉️', request: '📨', shoutout: '🌟', goal_update: '🎯'
}

export default function NotificationsCenter() {
  const [tab, setTab] = useState('notifications')
  const [loading, setLoading] = useState(true)
  
  const [notifs, setNotifs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  
  const [taskForm, setTaskForm] = useState({ title: '', description: '', tag: 'adhoc', priority: 'normal', due_date: '', member_id: 'yahya' })
  const [showTaskForm, setShowTaskForm] = useState(false)

  const supabase = createClient()
  const currentUser = 'muhammad' // Admin user for demo
  const isParent = ['muhammad', 'camilla'].includes(currentUser)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: nData } = await supabase.from('notifications').select('*').eq('to_member_id', currentUser).order('created_at', { ascending: false })
      const { data: tData } = await supabase.from('personal_tasks').select('*').order('created_at', { ascending: false })
      
      setNotifs(nData?.length ? nData : JSON.parse(localStorage.getItem(`bayt-notifs-${currentUser}-v1`) || '[]'))
      
      let loadedTasks = tData?.length ? tData : JSON.parse(localStorage.getItem('bayt-alltasks-v1') || '[]')
      if (!isParent) loadedTasks = loadedTasks.filter((t:any) => t.member_id === currentUser)
      setTasks(loadedTasks)

    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const markRead = async (id: string) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifs(updated)
    localStorage.setItem(`bayt-notifs-${currentUser}-v1`, JSON.stringify(updated))
    try { await supabase.from('notifications').update({ read: true }).eq('id', id) } catch(e) {}
  }

  const markAllRead = async () => {
    const updated = notifs.map(n => ({ ...n, read: true }))
    setNotifs(updated)
    localStorage.setItem(`bayt-notifs-${currentUser}-v1`, JSON.stringify(updated))
    try { await supabase.from('notifications').update({ read: true }).eq('to_member_id', currentUser) } catch(e) {}
  }

  const addTask = async () => {
    if (!taskForm.title) return
    const newTask = { id: crypto.randomUUID(), ...taskForm, created_by: currentUser, status: 'todo', created_at: new Date().toISOString() }
    const updated = [newTask, ...tasks]
    setTasks(updated)
    localStorage.setItem('bayt-alltasks-v1', JSON.stringify(updated))
    setShowTaskForm(false)
    setTaskForm({ title: '', description: '', tag: 'adhoc', priority: 'normal', due_date: '', member_id: currentUser })
    try { await supabase.from('personal_tasks').insert(newTask) } catch(e) {}
    
    // Also create a notification if assigned to someone else
    if (taskForm.member_id !== currentUser) {
      const newNotif = { id: crypto.randomUUID(), to_member_id: taskForm.member_id, from_member_id: currentUser, type: 'task_assigned', title: 'New Task Assigned', body: taskForm.title, read: false, created_at: new Date().toISOString() }
      const existingStr = localStorage.getItem(`bayt-notifs-${taskForm.member_id}-v1`) || '[]'
      const existing = JSON.parse(existingStr)
      localStorage.setItem(`bayt-notifs-${taskForm.member_id}-v1`, JSON.stringify([newNotif, ...existing]))
      try { await supabase.from('notifications').insert(newNotif) } catch(e) {}
    }
  }

  const updateTaskStatus = async (id: string, status: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t)
    setTasks(updated)
    localStorage.setItem('bayt-alltasks-v1', JSON.stringify(updated))
    try { await supabase.from('personal_tasks').update({ status }).eq('id', id) } catch(e) {}
  }

  const unreadCount = notifs.filter(n => !n.read).length

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Syncing comms...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Inbox & Tasks</h1>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem', fontFamily: F_MONO }}>{MEMBERS.find(m => m.id === currentUser)?.name}'s Command Center</div>
        </div>
        {unreadCount > 0 && (
          <div style={{ background: C.goldDim, color: C.white, width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, fontFamily: F_MONO, border: `2px solid ${C.white}` }}>
            {unreadCount}
          </div>
        )}
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'notifications', label: '🔔 Notifications' },
          { id: 'tasks', label: '✅ Task Board' },
          { id: 'requests', label: '📨 Family Requests', hidden: !isParent },
          { id: 'settings', label: '⚙️ Settings' }
        ].filter(t => !t.hidden).map(t => (
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

      <main style={{ background: C.cream, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>{notifs.length} total messages</div>
              {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.75rem', textDecoration: 'underline' }}>Mark all read</button>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifs.map((n, i) => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ display: 'flex', gap: '1rem', background: C.white, padding: '1.2rem', borderRadius: '8px', border: `1px solid ${n.read ? C.ruleLight : C.goldDim}`, borderLeft: `4px solid ${n.read ? C.ruleLight : C.goldDim}`, cursor: 'pointer', opacity: n.read ? 0.7 : 1 }}>
                  <div style={{ fontSize: '1.5rem' }}>{NOTIF_ICONS[n.type] || '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: n.read ? 400 : 600, color: C.text }}>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: C.grey }}>{n.body}</div>
                  </div>
                </div>
              ))}
              {notifs.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.white, borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>Inbox zero. You're all caught up.</div>}
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Global Task Board</h2>
              <button onClick={() => setShowTaskForm(!showTaskForm)} style={{ background: C.green, color: C.white, border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', cursor: 'pointer' }}>
                {showTaskForm ? 'CANCEL' : '+ ASSIGN TASK'}
              </button>
            </div>

            {showTaskForm && (
              <div style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={taskForm.member_id} onChange={e => setTaskForm({...taskForm, member_id: e.target.value})} style={inputStyle} disabled={!isParent}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{isParent ? `Assign to: ${m.name}` : m.name}</option>)}
                  </select>
                  <input placeholder="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} style={inputStyle} />
                  <select value={taskForm.tag} onChange={e => setTaskForm({...taskForm, tag: e.target.value})} style={inputStyle}>
                    <option value="project">Project</option><option value="chore">Chore</option><option value="goal">Goal</option><option value="school">School</option><option value="adhoc">Adhoc</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem' }}>
                  <input placeholder="Description (optional)" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} style={inputStyle} />
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} style={inputStyle} />
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} style={inputStyle}>
                    <option value="low">Low Priority</option><option value="normal">Normal</option><option value="high">High Priority</option>
                  </select>
                  <button onClick={addTask} style={{ background: C.green, color: C.white, border: 'none', padding: '0 1.5rem', borderRadius: '6px', fontFamily: F_MONO, fontWeight: 600, cursor: 'pointer' }}>SAVE</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {['todo', 'in_progress', 'done'].map(status => {
                const colTasks = tasks.filter(t => t.status === status)
                const labels: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
                return (
                  <div key={status} style={{ background: C.forest, padding: '1rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600, color: C.grey, textTransform: 'uppercase', borderBottom: `2px solid ${C.ruleLight}`, paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{labels[status]}</span><span>{colTasks.length}</span>
                    </div>
                    {colTasks.map(t => {
                      const isOverdue = t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()
                      return (
                        <div key={t.id} style={{ background: C.white, border: `1px solid ${isOverdue ? C.orange : C.ruleLight}`, borderRadius: '6px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', opacity: status === 'done' ? 0.6 : 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.1rem 0.4rem', borderRadius: '4px', color: C.grey, textTransform: 'uppercase' }}>{t.tag}</span>
                            <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.text }}>{MEMBERS.find(m=>m.id===t.member_id)?.name}</span>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', textDecoration: status === 'done' ? 'line-through' : 'none' }}>
                            {t.priority === 'high' && <span style={{ color: C.orange, marginRight: '4px' }}>!</span>}
                            {t.title}
                          </div>
                          {t.description && <div style={{ fontSize: '0.75rem', color: C.grey, marginBottom: '0.8rem', lineHeight: 1.4 }}>{t.description}</div>}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: `1px dashed ${C.ruleLight}`, paddingTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: isOverdue ? C.orange : C.grey }}>{t.due_date ? `Due: ${t.due_date}` : ''}</span>
                            <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)} style={{ padding: '2px 4px', fontSize: '0.65rem', border: `1px solid ${C.rule}`, borderRadius: '4px', background: 'transparent', fontFamily: F_MONO }}>
                              <option value="todo">To Do</option><option value="in_progress">Doing</option><option value="done">Done</option>
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'requests' && isParent && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, textAlign: 'center' }}>Formal Requests Pipeline</h2>
            <div style={{ background: C.white, padding: '3rem', textAlign: 'center', borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📨</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: C.green }}>No pending requests</h3>
              <p style={{ color: C.grey, fontSize: '0.9rem', margin: 0 }}>When children submit a formal request for permissions, purchases, or ideas, they appear here for your review.</p>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300 }}>Notification Preferences</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Email Notifications</div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, marginTop: '2px' }}>Receive summaries via email</div>
                </div>
                <div style={{ background: C.ruleLight, color: C.grey, padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontFamily: F_MONO }}>COMING SOON</div>
              </div>

              <div style={{ padding: '1rem 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Receive Alerts For:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Task assignments', 'Goal updates', 'Mentions (@name)', 'KPI review deadlines'].map(l => (
                    <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: C.text }}>
                      <input type="checkbox" defaultChecked style={{ transform: 'scale(1.1)' }} /> {l}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1rem 0' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Quiet Hours</div>
                <div style={{ fontSize: '0.75rem', color: C.grey, marginBottom: '0.5rem' }}>Notifications will be silently delivered to inbox during these hours.</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="time" defaultValue="21:00" style={inputStyle} />
                  <span style={{ display: 'flex', alignItems: 'center' }}>to</span>
                  <input type="time" defaultValue="06:00" style={inputStyle} />
                </div>
              </div>

              <button style={{ width: '100%', background: C.green, color: C.white, border: 'none', padding: '1rem', borderRadius: '6px', fontFamily: F_MONO, fontWeight: 600, marginTop: '1rem', cursor: 'pointer' }}>
                SAVE PREFERENCES
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.grey, marginTop: '1rem', fontStyle: 'italic' }}>
              Email notifications require Resend integration — connect via Settings &gt; Integrations (coming soon)
            </p>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, width: '100%' }