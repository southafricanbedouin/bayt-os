// app/hajj/hajj-client.tsx
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

const PILLARS = [
  { icon: '⚪', ar: 'الإحرام والنية', en: 'Ihram + Niyyah', desc: 'Entering the state of purity and making the intention for Hajj.', note: 'Shedding the world to meet the Creator as equals.' },
  { icon: '🕋', ar: 'طواف القدوم', en: 'Tawaf Al-Qudoom', desc: 'The arrival circumambulation around the Ka’bah.', note: 'Placing Allah at the center of our lives.' },
  { icon: '🚶‍♂️', ar: 'السعي', en: "Sa'i between Safa and Marwa", desc: 'Walking seven times between the hills of Safa and Marwa.', note: 'Honoring Hajar’s search for water and her Tawakkul.' },
  { icon: '⛰️', ar: 'الوقوف بعرفة', en: 'Wuquf at Arafah', desc: 'Standing at Mount Arafah on the 9th of Dhul Hijjah.', note: 'The essence of Hajj. A rehearsal for the Day of Judgment.' },
  { icon: '⛺', ar: 'مزدلفة', en: 'Muzdalifah overnight', desc: 'Spending the night under the stars and collecting pebbles.', note: 'Stripped of comfort, relying entirely on His provision.' },
  { icon: '🎯', ar: 'رمي الجمرات', en: 'Rami Al-Jamarat', desc: 'Stoning the pillars representing the devil.', note: 'Rejecting our internal desires that lead away from Him.' },
  { icon: '🐑', ar: 'الهدي', en: 'Sacrifice (Udhiyyah)', desc: 'Offering a sacrifice in gratitude and obedience.', note: 'Willingness to give up what we love for what He loves.' },
  { icon: '🕋', ar: 'طواف الإفاضة', en: 'Tawaf Al-Ifadah', desc: 'The mandatory Tawaf after returning from Mina.', note: 'Returning to the House after the major rites are complete.' },
  { icon: '👋', ar: 'طواف الوداع', en: 'Farewell Tawaf', desc: 'The final circumambulation before leaving Makkah.', note: 'A tearful goodbye to the holiest place on earth.' }
]

const DEFAULT_CHECKLIST = [
  { category: 'Spiritual', title: 'Learn the rites of Hajj', assigned: 'Muhammad', due: '' },
  { category: 'Spiritual', title: 'Complete reading of Hajj-related chapters', assigned: 'Family', due: '' },
  { category: 'Spiritual', title: 'Attend a Hajj preparation course', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Spiritual', title: 'Make Tawbah and settle any debts', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Financial', title: 'Set aside Hajj savings target', assigned: 'Muhammad', due: '' },
  { category: 'Financial', title: 'Book Hajj package', assigned: 'Muhammad', due: '' },
  { category: 'Financial', title: 'Arrange Udhiyyah (Qurbani) for family', assigned: 'Muhammad', due: '' },
  { category: 'Financial', title: 'Leave funds for family during absence', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Documents', title: 'Renew passports if needed', assigned: 'Family', due: '' },
  { category: 'Documents', title: 'Apply for Hajj visa', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Documents', title: 'Vaccination certificates', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Health', title: 'Meningitis vaccination', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Health', title: 'General health check-up', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Health', title: 'Pack personal medications', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Logistics', title: 'Arrange childcare for Yahya, Isa, Linah, Dana', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Logistics', title: 'Arrange school absence permission', assigned: 'Muhammad + Camilla', due: '' },
  { category: 'Logistics', title: 'Pre-book airport transfers', assigned: 'Muhammad', due: '' },
  { category: 'Packing', title: 'Ihram (2 sets)', assigned: 'Muhammad', due: '' },
  { category: 'Packing', title: 'Comfortable walking shoes', assigned: 'Family', due: '' },
  { category: 'Packing', title: 'Small Quran and dua booklet', assigned: 'Muhammad + Camilla', due: '' }
]

export default function HajjPlanning() {
  const [activeTab, setActiveTab] = useState('spiritual')
  const [loading, setLoading] = useState(true)
  
  const [checklist, setChecklist] = useState<any[]>([])
  const [fund, setFund] = useState<any[]>([])
  const [targetFund, setTargetFund] = useState(25000)
  const [activitiesDone, setActivitiesDone] = useState<Record<number, boolean>>({})

  const [clForm, setClForm] = useState({ category: 'Spiritual', title: '', assigned: 'Muhammad', due: '' })
  const [fundForm, setFundForm] = useState({ type: 'deposit', amount: '', desc: '', category: 'saving' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: clData } = await supabase.from('hajj_checklist').select('*')
      const { data: fundData } = await supabase.from('hajj_fund').select('*').order('created_at', { ascending: false })
      
      if (clData && clData.length > 0) {
        setChecklist(clData)
      } else {
        const lsCL = localStorage.getItem('bayt-hajj-checklist-v1')
        if (lsCL) setChecklist(JSON.parse(lsCL))
        else {
          const defaultCL = DEFAULT_CHECKLIST.map(c => ({ id: crypto.randomUUID(), ...c, done: false }))
          setChecklist(defaultCL)
        }
      }

      setFund(fundData?.length ? fundData : JSON.parse(localStorage.getItem('bayt-hajj-fund-v1') || '[]'))
      
      const lsTarget = localStorage.getItem('bayt-hajj-target-v1')
      if (lsTarget) setTargetFund(Number(lsTarget))

      setActivitiesDone(JSON.parse(localStorage.getItem('bayt-hajj-spiritual-v1') || '{}'))

    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveChecklist = async (newItems: any[]) => {
    setChecklist(newItems)
    localStorage.setItem('bayt-hajj-checklist-v1', JSON.stringify(newItems))
  }

  const toggleClItem = async (id: string) => {
    const updated = checklist.map(c => c.id === id ? { ...c, done: !c.done } : c)
    saveChecklist(updated)
    try { 
      const item = updated.find(i => i.id === id)
      if (item) await supabase.from('hajj_checklist').update({ done: item.done }).eq('id', id) 
    } catch(e) {}
  }

  const addClItem = async () => {
    if (!clForm.title) return
    const newItem = { id: crypto.randomUUID(), ...clForm, done: false, created_at: new Date().toISOString() }
    const updated = [...checklist, newItem]
    saveChecklist(updated)
    setClForm({ category: 'Spiritual', title: '', assigned: 'Muhammad', due: '' })
    try { await supabase.from('hajj_checklist').insert(newItem) } catch(e) {}
  }

  const addFundEntry = async () => {
    if (!fundForm.amount || !fundForm.desc) return
    const newEntry = { id: crypto.randomUUID(), entry_type: fundForm.type, amount_qar: Number(fundForm.amount), description: fundForm.desc, category: fundForm.category, entry_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() }
    const updated = [newEntry, ...fund]
    setFund(updated)
    localStorage.setItem('bayt-hajj-fund-v1', JSON.stringify(updated))
    setFundForm({ type: 'deposit', amount: '', desc: '', category: 'saving' })
    try { await supabase.from('hajj_fund').insert(newEntry) } catch(e) {}
  }

  const toggleActivity = (idx: number) => {
    const updated = { ...activitiesDone, [idx]: !activitiesDone[idx] }
    setActivitiesDone(updated)
    localStorage.setItem('bayt-hajj-spiritual-v1', JSON.stringify(updated))
  }

  // Calculate approx countdown to June 15, 2026 (approx Hajj 1446/1447)
  const targetDate = new Date('2026-06-15').getTime()
  const daysLeft = Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24))

  const savedTotal = fund.filter(f => f.entry_type === 'deposit').reduce((acc, f) => acc + f.amount_qar, 0)
  const spentTotal = fund.filter(f => f.entry_type === 'expense').reduce((acc, f) => acc + f.amount_qar, 0)
  const currentBalance = savedTotal - spentTotal
  const fundPct = Math.min((currentBalance / targetFund) * 100, 100)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Preparing the journey...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>The Family's Hajj Project</div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, fontFamily: F_ARAB, color: C.gold }}>لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</h1>
            <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.9 }}>Preparation begins today.</div>
            <div style={{ display: 'inline-block', background: C.goldDim, color: C.white, padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontFamily: F_MONO, marginTop: '1rem', textTransform: 'uppercase' }}>Planning Phase</div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', border: `1px solid rgba(255,255,255,0.2)` }}>
            <div style={{ fontSize: '2rem', fontWeight: 300, fontFamily: F_MONO, color: C.goldPale }}>{Math.max(0, daysLeft)}</div>
            <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.white, opacity: 0.8 }}>DAYS TO DHUL HIJJAH</div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '10rem', opacity: 0.05, zIndex: 1 }}>🕋</div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'spiritual', label: '🕋 Spiritual Prep' },
          { id: 'checklist', label: '📋 Checklist' },
          { id: 'fund', label: '💰 Hajj Fund' },
          { id: 'guide', label: '🗺️ Makkah Guide' }
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
        
        {activeTab === 'spiritual' && (
          <div>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, color: C.green }}>The Pillars of Hajj</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {PILLARS.map((p, i) => (
                <div key={i} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2rem', opacity: 0.5 }}>{p.icon}</div>
                  <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldDim, marginBottom: '0.2rem' }}>{p.ar}</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: C.text, marginBottom: '0.8rem' }}>{p.en}</div>
                  <div style={{ fontSize: '0.85rem', color: C.text, marginBottom: '0.8rem', lineHeight: 1.4 }}>{p.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: C.midgreen, fontStyle: 'italic', borderLeft: `2px solid ${C.gold}`, paddingLeft: '0.5rem' }}>{p.note}</div>
                </div>
              ))}
            </div>

            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300, color: C.text, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>Learn Together</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                "Read Surah Al-Hajj (22) together — one page per week.",
                "Watch a documentary on Hajj and discuss as a family.",
                "Make dua together each Fajr: 'Ya Allah, grant us Hajj mabrur.'"
              ].map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: activitiesDone[i] ? '#e8f5e9' : C.white, border: `1px solid ${activitiesDone[i] ? C.green : C.ruleLight}`, padding: '1rem', borderRadius: '8px' }}>
                  <input type="checkbox" checked={activitiesDone[i] || false} onChange={() => toggleActivity(i)} style={{ transform: 'scale(1.3)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.95rem', color: activitiesDone[i] ? C.midgreen : C.text, textDecoration: activitiesDone[i] ? 'line-through' : 'none' }}>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select value={clForm.category} onChange={e => setClForm({...clForm, category: e.target.value})} style={inputStyle}>
                  {['Spiritual', 'Financial', 'Documents', 'Health', 'Logistics', 'Packing'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Task description..." value={clForm.title} onChange={e => setClForm({...clForm, title: e.target.value})} style={{...inputStyle, flex: 1}} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select value={clForm.assigned} onChange={e => setClForm({...clForm, assigned: e.target.value})} style={inputStyle}>
                  {['Muhammad', 'Camilla', 'Muhammad + Camilla', 'Family'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input type="date" value={clForm.due} onChange={e => setClForm({...clForm, due: e.target.value})} style={inputStyle} />
                <button onClick={addClItem} style={primaryBtn}>ADD TASK</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {['Spiritual', 'Financial', 'Documents', 'Health', 'Logistics', 'Packing'].map(cat => {
                const catItems = checklist.filter(c => c.category === cat)
                if (catItems.length === 0) return null
                const doneCount = catItems.filter(c => c.done).length
                const pct = (doneCount / catItems.length) * 100
                
                return (
                  <div key={cat} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: C.forest, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.ruleLight}` }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: C.green }}>{cat}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{doneCount} / {catItems.length}</span>
                        <div style={{ width: '60px', height: '6px', background: C.white, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: C.goldDim }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 1rem' }}>
                      {catItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input type="checkbox" checked={item.done} onChange={() => toggleClItem(item.id)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.9rem', color: item.done ? C.grey : C.text, textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {item.due && <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.orange }}>⏳ {item.due}</span>}
                            <span style={{ fontSize: '0.7rem', background: C.cream, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey, fontFamily: F_MONO }}>{item.assigned}</span>
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

        {activeTab === 'fund' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldPale, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>CURRENT SAVINGS</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 300, color: C.gold, marginBottom: '1rem' }}>QAR {currentBalance.toLocaleString()}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: F_MONO, marginBottom: '0.5rem' }}>
                  <span>Progress</span>
                  <span>Target: QAR {targetFund.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${fundPct}%`, height: '100%', background: C.goldDim, transition: 'width 0.5s' }} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button onClick={() => { const t = prompt('Set target amount (QAR):', targetFund.toString()); if (t && !isNaN(Number(t))) { setTargetFund(Number(t)); localStorage.setItem('bayt-hajj-target-v1', t); } }} style={{ background: 'none', border: `1px solid ${C.goldPale}`, color: C.goldPale, padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: F_MONO }}>EDIT TARGET</button>
                </div>
              </div>

              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Log Transaction</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={fundForm.type} onChange={e => setFundForm({...fundForm, type: e.target.value})} style={inputStyle}>
                    <option value="deposit">Deposit (Save)</option>
                    <option value="expense">Expense (Spend)</option>
                  </select>
                  <input type="number" placeholder="Amount QAR" value={fundForm.amount} onChange={e => setFundForm({...fundForm, amount: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input placeholder="Description..." value={fundForm.desc} onChange={e => setFundForm({...fundForm, desc: e.target.value})} style={inputStyle} />
                  <select value={fundForm.category} onChange={e => setFundForm({...fundForm, category: e.target.value})} style={inputStyle}>
                    {['saving', 'package', 'flights', 'accommodation', 'spending', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={addFundEntry} style={{ ...primaryBtn, width: '100%' }}>SAVE ENTRY</button>
              </div>
            </div>

            <h3 style={{ fontWeight: 300, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>Transaction History</h3>
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', background: C.forest, padding: '0.8rem 1rem', fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Date</div><div>Type</div><div>Description</div><div style={{textAlign:'right'}}>Amount</div>
              </div>
              {fund.map((f, i) => (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', padding: '1rem', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{f.entry_date}</div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: f.entry_type === 'deposit' ? '#e8f5e9' : '#ffebee', color: f.entry_type === 'deposit' ? C.green : C.orange, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{f.entry_type}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.description}</div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, textTransform: 'capitalize' }}>{f.category}</div>
                  </div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.9rem', fontWeight: 600, textAlign: 'right', color: f.entry_type === 'deposit' ? C.green : C.text }}>
                    {f.entry_type === 'deposit' ? '+' : '-'} {f.amount_qar.toLocaleString()}
                  </div>
                </div>
              ))}
              {fund.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey, fontStyle: 'italic' }}>No financial entries yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Makkah & Madinah Guide</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
              <div>
                <h3 style={{ color: C.green, borderBottom: `2px solid ${C.gold}`, paddingBottom: '0.5rem', display: 'inline-block' }}>Al-Masjid Al-Haram (Makkah)</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                  {[
                    { n: "Ka'bah", d: "The House of Allah, the Qiblah." },
                    { n: "Zamzam Well", d: "The miraculous spring provided to Hajar and Ismail." },
                    { n: "Safa and Marwa", d: "The hills of Sa'i, remembering a mother's trust." },
                    { n: "Mount Arafah", d: "Jabal Al-Rahmah (Mount of Mercy), where Hajj is realized." },
                    { n: "Mina & Muzdalifah", d: "The tent city and the open plain of stars." },
                    { n: "Jamarat", d: "The pillars where Ismail rejected shaytan's whispers." }
                  ].map((p, i) => (
                    <li key={i} style={{ padding: '0.8rem 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                      <strong style={{ color: C.text }}>{p.n}</strong>
                      <div style={{ fontSize: '0.85rem', color: C.grey, marginTop: '2px' }}>{p.d}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{ color: C.green, borderBottom: `2px solid ${C.gold}`, paddingBottom: '0.5rem', display: 'inline-block' }}>Al-Masjid Al-Nabawi (Madinah)</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                  {[
                    { n: "The Prophet's Mosque", d: "The second holiest site, established by the Prophet ﷺ." },
                    { n: "Rawdah Sharif", d: "A garden from the gardens of Paradise." },
                    { n: "The Blessed Grave", d: "Sending salam to the Messenger of Allah ﷺ." },
                    { n: "Baqi' Cemetery", d: "Resting place of thousands of companions." },
                    { n: "Masjid Quba", d: "The first mosque built in Islam." }
                  ].map((p, i) => (
                    <li key={i} style={{ padding: '0.8rem 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                      <strong style={{ color: C.text }}>{p.n}</strong>
                      <div style={{ fontSize: '0.85rem', color: C.grey, marginTop: '2px' }}>{p.d}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}` }}>
              <h3 style={{ margin: '0 0 1rem 0', color: C.goldDim, fontWeight: 300, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>💡</span> Family Questions to Discuss</h3>
              <p style={{ fontSize: '0.85rem', color: C.grey, marginBottom: '1.5rem' }}>Engage the children before the journey begins.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  "Why do we go to Hajj?",
                  "Who built the Ka'bah and why?",
                  "What is Ihram and what does it teach us?",
                  "What happened at Arafah and why is it the most important day?",
                  "What will we feel when we first see the Ka'bah?"
                ].map((q, i) => (
                  <div key={i} style={{ background: C.white, padding: '1rem', borderRadius: '6px', border: `1px solid ${C.ruleLight}`, fontWeight: 600, color: C.green, fontSize: '0.95rem' }}>
                    {i+1}. {q}
                  </div>
                ))}
              </div>
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