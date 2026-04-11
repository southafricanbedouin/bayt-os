// app/daily-rhythm/daily-rhythm-client.tsx
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

const DEFAULT_SCHEDULE = [
  { id: '1', day_type: 'weekday', time_slot: '05:30', icon: '🕌', label: 'Fajr Salah', category: 'salah', applies_to: 'family', active: true },
  { id: '2', day_type: 'weekday', time_slot: '06:00', icon: '🍳', label: 'Breakfast together', category: 'family', applies_to: 'family', active: true },
  { id: '3', day_type: 'weekday', time_slot: '07:15', icon: '🚌', label: 'School run', category: 'school', applies_to: 'family', active: true },
  { id: '4', day_type: 'weekday', time_slot: '07:30', icon: '💼', label: 'Work begins', category: 'work', applies_to: 'adults', active: true },
  { id: '5', day_type: 'weekday', time_slot: '13:00', icon: '🕌', label: 'Dhuhr Salah', category: 'salah', applies_to: 'family', active: true },
  { id: '6', day_type: 'weekday', time_slot: '15:00', icon: '🕌', label: 'Asr', category: 'salah', applies_to: 'family', active: true },
  { id: '7', day_type: 'weekday', time_slot: '15:30', icon: '🏠', label: 'Children home', category: 'family', applies_to: 'children', active: true },
  { id: '8', day_type: 'weekday', time_slot: '15:45', icon: '📚', label: 'Homework & reading', category: 'school', applies_to: 'children', active: true },
  { id: '9', day_type: 'weekday', time_slot: '16:30', icon: '🏃', label: 'Activity / outdoor', category: 'activity', applies_to: 'children', active: true },
  { id: '10', day_type: 'weekday', time_slot: '18:30', icon: '🍽️', label: 'Family dinner', category: 'family', applies_to: 'family', active: true },
  { id: '11', day_type: 'weekday', time_slot: '19:15', icon: '🕌', label: 'Maghrib Salah', category: 'salah', applies_to: 'family', active: true },
  { id: '12', day_type: 'weekday', time_slot: '20:00', icon: '👨‍👩‍👧‍👦', label: 'Family time', category: 'family', applies_to: 'family', active: true },
  { id: '13', day_type: 'weekday', time_slot: '21:00', icon: '🕌', label: 'Isha Salah', category: 'salah', applies_to: 'family', active: true },
  { id: '14', day_type: 'weekday', time_slot: '21:30', icon: '📖', label: 'Children bedtime', category: 'rest', applies_to: 'children', active: true },
  { id: '15', day_type: 'weekday', time_slot: '22:30', icon: '💤', label: 'Parents wind down', category: 'rest', applies_to: 'adults', active: true },
]

const CAT_COLORS: Record<string, string> = {
  salah: C.gold, school: C.blue, family: C.green, work: C.midgreen, rest: C.grey, activity: C.orange
}

export default function DailyRhythm() {
  const [tab, setTab] = useState('today')
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeDayType, setActiveDayType] = useState('weekday')
  const [schedules, setSchedules] = useState<any[]>([])
  
  const [editTab, setEditTab] = useState('weekday')
  const [editForm, setEditForm] = useState({ time_slot: '08:00', icon: '📝', label: '', category: 'family', applies_to: 'family' })

  const [reviewData, setReviewData] = useState({ wins: '', improvement: '' })

  const supabase = createClient()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    
    const day = new Date().getDay()
    setActiveDayType((day === 5 || day === 6) ? 'weekend' : 'weekday')
    
    fetchData()
    return () => clearInterval(timer)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('daily_schedules').select('*').order('time_slot', { ascending: true })
      if (data && data.length > 0) {
        setSchedules(data)
      } else {
        const ls = localStorage.getItem('bayt-daily-schedules-v1')
        setSchedules(ls ? JSON.parse(ls) : DEFAULT_SCHEDULE)
      }
      
      const rWins = localStorage.getItem('bayt-rhythm-wins-v1')
      const rImp = localStorage.getItem('bayt-rhythm-imp-v1')
      setReviewData({ wins: rWins || '', improvement: rImp || '' })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveSchedules = async (newSchedules: any[]) => {
    const sorted = [...newSchedules].sort((a,b) => a.time_slot.localeCompare(b.time_slot))
    setSchedules(sorted)
    localStorage.setItem('bayt-daily-schedules-v1', JSON.stringify(sorted))
  }

  const addBlock = async () => {
    if (!editForm.label) return
    const newBlock = { id: crypto.randomUUID(), day_type: editTab, ...editForm, active: true }
    saveSchedules([...schedules, newBlock])
    setEditForm({ time_slot: '08:00', icon: '📝', label: '', category: 'family', applies_to: 'family' })
    try { await supabase.from('daily_schedules').insert(newBlock) } catch(e) {}
  }

  const deleteBlock = async (id: string) => {
    if (!confirm('Remove this block?')) return
    saveSchedules(schedules.filter(s => s.id !== id))
    try { await supabase.from('daily_schedules').delete().eq('id', id) } catch(e) {}
  }

  const saveReview = (field: 'wins' | 'improvement', val: string) => {
    setReviewData(prev => ({ ...prev, [field]: val }))
    localStorage.setItem(`bayt-rhythm-${field === 'wins' ? 'wins' : 'imp'}-v1`, val)
  }

  const currentHM = `${String(currentTime.getHours()).padStart(2,'0')}:${String(currentTime.getMinutes()).padStart(2,'0')}`
  const activeSchedule = schedules.filter(s => s.day_type === activeDayType && s.active)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Syncing rhythm...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nizam · Structure creates freedom</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Daily Rhythm</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>النظام اليومي</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 300, fontFamily: F_MONO, color: C.gold }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.8rem', color: C.forest }}>{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          <div style={{ display: 'inline-block', background: C.midgreen, color: C.goldPale, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontFamily: F_MONO, marginTop: '0.5rem', textTransform: 'uppercase' }}>
            {activeDayType}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'today', label: '☀️ Today\'s Schedule' },
          { id: 'edit', label: '✏️ Edit Schedule' },
          { id: 'review', label: '📊 Rhythm Review' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'today' && (
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <select value={activeDayType} onChange={e => setActiveDayType(e.target.value)} style={inputStyle}>
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
                <option value="school-holiday">School Holiday</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', paddingLeft: '2rem' }}>
              <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: C.ruleLight }} />
              
              {activeSchedule.map((s, i) => {
                const isPast = s.time_slot < currentHM
                const isNext = !isPast && (i === 0 || activeSchedule[i-1].time_slot < currentHM)
                const cColor = CAT_COLORS[s.category] || C.grey

                return (
                  <div key={s.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isNext ? C.forest : C.white, borderRadius: '8px', border: `1px solid ${isNext ? C.gold : C.ruleLight}`, opacity: isPast ? 0.6 : 1, transition: 'all 0.3s' }}>
                    
                    <div style={{ position: 'absolute', left: '-2.5rem', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: isNext ? C.gold : C.rule, border: `2px solid ${C.white}`, zIndex: 2 }} />
                    {isNext && <div style={{ position: 'absolute', left: '-3.5rem', top: '50%', width: '3rem', height: '2px', background: C.gold, zIndex: 1 }} />}

                    <div style={{ width: '4px', height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, background: cColor, borderRadius: '8px 0 0 8px' }} />
                    
                    <div style={{ fontFamily: F_MONO, fontSize: '1.1rem', color: isNext ? C.goldDim : C.text, fontWeight: isNext ? 700 : 400, width: '60px' }}>{s.time_slot}</div>
                    <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: C.text }}>{s.label}</div>
                      <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase', marginTop: '2px' }}>{s.applies_to}</div>
                    </div>
                  </div>
                )
              })}
              {activeSchedule.length === 0 && <div style={emptyState}>No schedule defined for {activeDayType}.</div>}
            </div>
          </div>
        )}

        {tab === 'edit' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {['weekday', 'weekend', 'school-holiday'].map(t => (
                <button key={t} onClick={() => setEditTab(t)} style={{ ...btnStyle, background: editTab === t ? C.blue : C.white, color: editTab === t ? C.white : C.grey, border: `1px solid ${editTab === t ? C.blue : C.rule}` }}>
                  {t.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Add Block to {editTab}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 80px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="time" value={editForm.time_slot} onChange={e => setEditForm({...editForm, time_slot: e.target.value})} style={inputStyle} />
                <input placeholder="Icon" value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} style={inputStyle} />
                <input placeholder="Label (e.g. Dhuhr Salah)" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} style={inputStyle}>
                  {Object.keys(CAT_COLORS).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
                <select value={editForm.applies_to} onChange={e => setEditForm({...editForm, applies_to: e.target.value})} style={inputStyle}>
                  <option value="family">Family</option><option value="adults">Adults</option><option value="children">Children</option>
                </select>
                <button onClick={addBlock} style={{ ...btnStyle, background: C.green, color: C.white, border: 'none' }}>ADD BLOCK</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {schedules.filter(s => s.day_type === editTab).map(s => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '80px 40px 1fr 100px 100px 40px', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', border: `1px solid ${C.ruleLight}`, borderRadius: '6px', background: C.white }}>
                  <div style={{ fontFamily: F_MONO }}>{s.time_slot}</div>
                  <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: CAT_COLORS[s.category] }}>{s.category.toUpperCase()}</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>{s.applies_to.toUpperCase()}</div>
                  <button onClick={() => deleteBlock(s.id)} style={{ background: 'none', border: 'none', color: C.orange, cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'review' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, textAlign: 'center' }}>Weekly Rhythm Review</h2>
            
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <label style={labelStyle}>FAMILY WINS THIS WEEK</label>
              <textarea 
                value={reviewData.wins} onChange={e => saveReview('wins', e.target.value)}
                placeholder="What went well with our routine?"
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', width: '100%', marginBottom: '1.5rem' }} 
              />
              
              <label style={labelStyle}>ONE THING TO IMPROVE NEXT WEEK</label>
              <textarea 
                value={reviewData.improvement} onChange={e => saveReview('improvement', e.target.value)}
                placeholder="Where did we slip? How do we fix it?"
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', width: '100%' }} 
              />
            </div>

            <div style={{ background: C.forest, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, textAlign: 'center' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.goldDim, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Istiqama</div>
              <p style={{ margin: 0, fontStyle: 'italic', color: C.text, lineHeight: 1.5 }}>
                Consistency over intensity. Missing a block is human; missing a day is a slip; missing two is a new habit. Guard the Salah times above all.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const inputStyle = { padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }
const btnStyle = { padding: '0.75rem 1.5rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }
const emptyState = { padding: '3rem', textAlign: 'center' as const, color: C.grey, background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}`, fontStyle: 'italic' }