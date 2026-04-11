// app/milestones/milestones-client.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = { green: '#1a3d28', forest: '#f0ebe0', gold: '#c9a84c', goldDim: '#9b7d38', cream: '#faf8f2', white: '#ffffff', grey: '#6b7c6e', rule: '#ddd8cc', ruleLight: '#e8e3d8', text: '#0d1a0f' }
const F_SANS = 'var(--font-sans), Georgia, serif'; const F_MONO = 'var(--font-mono), monospace'; const F_ARAB = 'var(--font-arabic), serif'

export default function MilestonesClient() {
  const [data, setData] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', story: '', date: '', member_id: 'Family' })
  const [show, setShow] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const ls = localStorage.getItem('bayt-milestones-v1')
    if (ls) setData(JSON.parse(ls))
  }, [])

  const save = () => {
    if (!form.title) return
    const updated = [{ id: Date.now().toString(), ...form }, ...data]
    setData(updated)
    localStorage.setItem('bayt-milestones-v1', JSON.stringify(updated))
    setForm({ title: '', story: '', date: '', member_id: 'Family' })
    setShow(false)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0' }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Memory Layer</div>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Milestones & Stories</h1>
      </header>
      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontWeight: 300 }}>Timeline</h2>
          <button onClick={() => setShow(!show)} style={{ background: C.gold, color: C.white, border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', cursor: 'pointer' }}>+ ADD MILESTONE</button>
        </div>

        {show && (
          <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} style={{ padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS }} />
              <select value={form.member_id} onChange={e=>setForm({...form, member_id: e.target.value})} style={{ padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS }}>
                <option>Family</option><option>Yahya</option><option>Isa</option><option>Linah</option><option>Dana</option>
              </select>
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} style={{ padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS }} />
            </div>
            <textarea placeholder="The story..." value={form.story} onChange={e=>setForm({...form, story: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, minHeight: '80px', marginBottom: '1rem' }} />
            <button onClick={save} style={{ background: C.green, color: C.white, border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontFamily: F_MONO, cursor: 'pointer' }}>SAVE MEMORY</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `2px solid ${C.ruleLight}`, paddingLeft: '1.5rem', marginLeft: '1rem' }}>
          {data.map(d => (
            <div key={d.id} style={{ position: 'relative', background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ position: 'absolute', left: '-1.85rem', top: '1.5rem', width: '12px', height: '12px', borderRadius: '50%', background: C.goldDim, border: `2px solid ${C.white}` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.green, fontWeight: 600 }}>{d.date}</span>
                <span style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, background: C.white, padding: '2px 6px', borderRadius: '4px' }}>{d.member_id}</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: C.text }}>{d.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: C.grey, lineHeight: 1.6 }}>{d.story}</p>
            </div>
          ))}
          {data.length === 0 && <div style={{ color: C.grey, fontStyle: 'italic' }}>No milestones logged yet.</div>}
        </div>
      </main>
    </div>
  )
}