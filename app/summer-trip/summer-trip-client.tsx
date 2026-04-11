// app/summer-trip/summer-trip-client.tsx
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
  red:       '#c0392b'
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const PACKING_CATEGORIES = ['Documents', 'Clothing', 'Toiletries', 'Electronics', 'Kids Items', 'Other']
const DEFAULT_PACKING = [
  { member_id: 'Family', item: 'Passports (all 6)', category: 'Documents' },
  { member_id: 'Family', item: 'Travel insurance documents', category: 'Documents' },
  { member_id: 'Family', item: 'Hotel booking confirmations', category: 'Documents' },
  { member_id: 'Family', item: 'Flight e-tickets', category: 'Documents' },
  { member_id: 'Family', item: 'Phone chargers', category: 'Electronics' },
  { member_id: 'Family', item: 'Universal travel adapter', category: 'Electronics' },
  { member_id: 'Family', item: 'Sunscreen SPF 50+', category: 'Kids Items' },
  { member_id: 'Family', item: "Kids' medicines (Calpol, antihistamine)", category: 'Kids Items' }
]

const MEMBERS = ['Muhammad', 'Camilla', 'Yahya', 'Isa', 'Linah', 'Dana', 'Family']

export default function SummerTrip() {
  const [activeTab, setActiveTab] = useState('itinerary')
  const [loading, setLoading] = useState(true)
  
  const [trip, setTrip] = useState<any>({ trip_name: 'Summer Holiday 2025', destination: 'TBD', depart_date: '', return_date: '', budget_qar: 0, status: 'planning', notes: '' })
  const [itinerary, setItinerary] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [packing, setPacking] = useState<any[]>([])

  const [activePackMember, setActivePackMember] = useState('Family')

  // Forms
  const [itinForm, setItinForm] = useState({ day_number: '1', time_slot: 'morning', activity: '', location: '', notes: '' })
  const [expForm, setExpForm] = useState({ category: 'flights', description: '', amount_qar: '', paid: false })
  const [packForm, setPackForm] = useState({ member_id: 'Family', item: '', category: 'Clothing', quantity: '1' })

  const supabase = createClient()
  const TRIP_ID = 'summer-2025-id' // hardcoded ID for this specific trip module

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const lsTrip = localStorage.getItem('bayt-summertrip-meta-v1')
      if (lsTrip) setTrip(JSON.parse(lsTrip))

      const { data: iData } = await supabase.from('trip_itinerary').select('*').eq('trip_id', TRIP_ID).order('day_number', { ascending: true })
      const { data: eData } = await supabase.from('trip_expenses').select('*').eq('trip_id', TRIP_ID).order('created_at', { ascending: false })
      const { data: pData } = await supabase.from('packing_lists').select('*').eq('trip_id', TRIP_ID)
      
      setItinerary(iData?.length ? iData : JSON.parse(localStorage.getItem('bayt-summertrip-itin-v1') || '[]'))
      setExpenses(eData?.length ? eData : JSON.parse(localStorage.getItem('bayt-summertrip-exp-v1') || '[]'))
      
      if (pData && pData.length > 0) {
        setPacking(pData)
      } else {
        const lsPack = localStorage.getItem('bayt-summertrip-pack-v1')
        if (lsPack) setPacking(JSON.parse(lsPack))
        else {
          const initPack = DEFAULT_PACKING.map(p => ({ id: crypto.randomUUID(), trip_id: TRIP_ID, ...p, packed: false, quantity: '1' }))
          setPacking(initPack)
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveSettings = () => {
    localStorage.setItem('bayt-summertrip-meta-v1', JSON.stringify(trip))
    alert('Settings saved locally.')
  }

  const addItin = async () => {
    if (!itinForm.activity) return
    const newItem = { id: crypto.randomUUID(), trip_id: TRIP_ID, ...itinForm, day_number: Number(itinForm.day_number), done: false, created_at: new Date().toISOString() }
    const updated = [...itinerary, newItem]
    setItinerary(updated)
    localStorage.setItem('bayt-summertrip-itin-v1', JSON.stringify(updated))
    setItinForm({ day_number: itinForm.day_number, time_slot: 'morning', activity: '', location: '', notes: '' })
    try { await supabase.from('trip_itinerary').insert(newItem) } catch(e) {}
  }

  const addExpense = async () => {
    if (!expForm.description || !expForm.amount_qar) return
    const newExp = { id: crypto.randomUUID(), trip_id: TRIP_ID, ...expForm, amount_qar: Number(expForm.amount_qar), created_at: new Date().toISOString(), paid_date: expForm.paid ? new Date().toISOString() : null }
    const updated = [newExp, ...expenses]
    setExpenses(updated)
    localStorage.setItem('bayt-summertrip-exp-v1', JSON.stringify(updated))
    setExpForm({ category: 'flights', description: '', amount_qar: '', paid: false })
    try { await supabase.from('trip_expenses').insert(newExp) } catch(e) {}
  }

  const addPackItem = async () => {
    if (!packForm.item) return
    const newItem = { id: crypto.randomUUID(), trip_id: TRIP_ID, ...packForm, packed: false, created_at: new Date().toISOString() }
    const updated = [...packing, newItem]
    setPacking(updated)
    localStorage.setItem('bayt-summertrip-pack-v1', JSON.stringify(updated))
    setPackForm({ ...packForm, item: '', quantity: '1' })
    try { await supabase.from('packing_lists').insert(newItem) } catch(e) {}
  }

  const togglePack = async (id: string) => {
    const updated = packing.map(p => p.id === id ? { ...p, packed: !p.packed } : p)
    setPacking(updated)
    localStorage.setItem('bayt-summertrip-pack-v1', JSON.stringify(updated))
    try { 
      const item = updated.find(p => p.id === id)
      if (item) await supabase.from('packing_lists').update({ packed: item.packed }).eq('id', id) 
    } catch(e) {}
  }

  // Calculations
  const daysTotal = trip.depart_date && trip.return_date 
    ? Math.ceil((new Date(trip.return_date).getTime() - new Date(trip.depart_date).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0
  
  const daysUntil = trip.depart_date 
    ? Math.ceil((new Date(trip.depart_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
    : null

  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount_qar), 0)
  const budgetStatusColor = totalSpent > trip.budget_qar ? C.red : totalSpent > (trip.budget_qar * 0.9) ? C.orange : C.green

  const totalPacked = packing.filter(p => p.packed).length

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading itinerary...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.blue, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.cream, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{trip.trip_name}</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>{trip.destination}</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.cream, marginTop: '0.5rem' }}>رحلة الصيف ٢٠٢٥</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
          {daysUntil !== null && (
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, fontFamily: F_MONO, color: C.goldPale }}>{Math.max(0, daysUntil)}</div>
              <div style={{ fontSize: '0.6rem', fontFamily: F_MONO, color: C.white, opacity: 0.8 }}>DAYS TO GO</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 300, fontFamily: F_MONO, color: C.white }}>{daysTotal}</div>
            <div style={{ fontSize: '0.6rem', fontFamily: F_MONO, color: C.white, opacity: 0.8 }}>DAY TRIP</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'itinerary', label: '📅 Itinerary' },
          { id: 'budget', label: '💰 Budget' },
          { id: 'packing', label: '🎒 Packing Lists' },
          { id: 'settings', label: '⚙️ Settings' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.blue}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.blue : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'itinerary' && (
          <div>
            {!trip.depart_date && (
              <div style={{ background: C.goldPale, color: C.goldDim, padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                ⚠️ Set departure and return dates in Settings to build a day-by-day plan.
              </div>
            )}

            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300, fontSize: '1.1rem' }}>Add Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="number" placeholder="Day (e.g. 1)" value={itinForm.day_number} onChange={e => setItinForm({...itinForm, day_number: e.target.value})} style={inputStyle} />
                <select value={itinForm.time_slot} onChange={e => setItinForm({...itinForm, time_slot: e.target.value})} style={inputStyle}>
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>
                <input placeholder="Activity description..." value={itinForm.activity} onChange={e => setItinForm({...itinForm, activity: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem' }}>
                <input placeholder="Location" value={itinForm.location} onChange={e => setItinForm({...itinForm, location: e.target.value})} style={inputStyle} />
                <input placeholder="Notes" value={itinForm.notes} onChange={e => setItinForm({...itinForm, notes: e.target.value})} style={inputStyle} />
                <button onClick={addItin} style={{...primaryBtn, background: C.blue}}>ADD TO PLAN</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Array.from(new Set(itinerary.map(i => i.day_number))).sort((a,b) => a-b).map(day => {
                const dayItems = itinerary.filter(i => i.day_number === day)
                return (
                  <div key={day} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: C.blue, color: C.white, padding: '0.8rem 1rem', fontWeight: 600 }}>Day {day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {['morning', 'afternoon', 'evening', 'night'].map(slot => {
                        const slotItems = dayItems.filter(i => i.time_slot === slot)
                        if (slotItems.length === 0) return null
                        return (
                          <div key={slot} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', borderBottom: `1px solid ${C.ruleLight}` }}>
                            <div style={{ background: C.forest, padding: '1rem', fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, textTransform: 'uppercase', display: 'flex', alignItems: 'center' }}>
                              {slot}
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {slotItems.map(item => (
                                <div key={item.id}>
                                  <div style={{ fontWeight: 600, color: C.text, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{item.activity}</div>
                                  <div style={{ fontSize: '0.8rem', color: C.grey, display: 'flex', gap: '1rem' }}>
                                    {item.location && <span>📍 {item.location}</span>}
                                    {item.notes && <span>📝 {item.notes}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {itinerary.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: C.blue }}>Suggested Flow</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: C.grey }}>Day 1: Arrive & settle · Day 2: Museum/Culture · Day 3: Beach/Nature · Day 4: Rest</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>TRIP BUDGET</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 300, color: C.text, marginBottom: '1rem' }}>QAR {Number(trip.budget_qar).toLocaleString()}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: F_MONO, marginBottom: '0.5rem', color: budgetStatusColor }}>
                  <span>Spent: QAR {totalSpent.toLocaleString()}</span>
                  <span>Rem: QAR {(trip.budget_qar - totalSpent).toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: C.ruleLight, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((totalSpent / trip.budget_qar) * 100, 100)}%`, height: '100%', background: budgetStatusColor, transition: 'width 0.5s' }} />
                </div>
              </div>

              <div style={{ background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Log Expense</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})} style={inputStyle}>
                    {['flights', 'accommodation', 'food', 'activities', 'transport', 'shopping', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="Amount QAR" value={expForm.amount_qar} onChange={e => setExpForm({...expForm, amount_qar: e.target.value})} style={inputStyle} />
                </div>
                <input placeholder="Description..." value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} style={{...inputStyle, marginBottom: '1rem', width: '100%'}} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={expForm.paid} onChange={e => setExpForm({...expForm, paid: e.target.checked})} style={{ transform: 'scale(1.2)' }} />
                    Already Paid
                  </label>
                  <button onClick={addExpense} style={{ ...primaryBtn, background: C.blue }}>SAVE EXPENSE</button>
                </div>
              </div>
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', background: C.forest, padding: '0.8rem 1rem', fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, textTransform: 'uppercase' }}>
                <div>Date</div><div>Category</div><div>Description</div><div style={{textAlign:'right'}}>Amount</div>
              </div>
              {expenses.map((e, i) => (
                <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', padding: '1rem', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{new Date(e.created_at).toLocaleDateString()}</div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, color: C.grey, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{e.category}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.description}</div>
                    {e.paid && <div style={{ fontSize: '0.65rem', color: C.green, marginTop: '2px' }}>✓ Paid</div>}
                  </div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.9rem', fontWeight: 600, textAlign: 'right', color: C.text }}>
                    QAR {Number(e.amount_qar).toLocaleString()}
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey, fontStyle: 'italic' }}>No expenses logged yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'packing' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.ruleLight}` }}>
              {MEMBERS.map(m => (
                <button
                  key={m} onClick={() => setActivePackMember(m)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: `1px solid ${activePackMember === m ? C.blue : C.ruleLight}`,
                    background: activePackMember === m ? C.blue : C.white, color: activePackMember === m ? C.white : C.text,
                    cursor: 'pointer', fontFamily: F_MONO, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap'
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '1rem' }}>
                <select value={packForm.category} onChange={e => setPackForm({...packForm, category: e.target.value})} style={inputStyle}>
                  {PACKING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder={`Add item for ${activePackMember}...`} value={packForm.item} onChange={e => setPackForm({...packForm, item: e.target.value})} style={inputStyle} />
                <input placeholder="Qty (e.g. 3 pairs)" value={packForm.quantity} onChange={e => setPackForm({...packForm, quantity: e.target.value})} style={inputStyle} />
                <button onClick={() => { setPackForm({...packForm, member_id: activePackMember}); addPackItem(); }} style={{ ...primaryBtn, background: C.blue }}>ADD</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {PACKING_CATEGORIES.map(cat => {
                const catItems = packing.filter(p => p.member_id === activePackMember && p.category === cat)
                if (catItems.length === 0) return null
                
                return (
                  <div key={cat}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: C.blue, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>{cat}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {catItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: item.packed ? C.forest : C.white, padding: '1rem', borderRadius: '6px', border: `1px solid ${item.packed ? C.green : C.ruleLight}` }}>
                          <input type="checkbox" checked={item.packed} onChange={() => togglePack(item.id)} style={{ transform: 'scale(1.3)', cursor: 'pointer' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', color: item.packed ? C.grey : C.text, textDecoration: item.packed ? 'line-through' : 'none' }}>{item.item}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, marginTop: '2px' }}>Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {packing.filter(p => p.member_id === activePackMember).length === 0 && <div style={{ color: C.grey, fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No items added for {activePackMember} yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Trip Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              
              <div>
                <label style={labelStyle}>TRIP NAME</label>
                <input value={trip.trip_name} onChange={e => setTrip({...trip, trip_name: e.target.value})} style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>DESTINATION</label>
                <input value={trip.destination} onChange={e => setTrip({...trip, destination: e.target.value})} style={inputStyle} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>DEPARTURE DATE</label>
                  <input type="date" value={trip.depart_date} onChange={e => setTrip({...trip, depart_date: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>RETURN DATE</label>
                  <input type="date" value={trip.return_date} onChange={e => setTrip({...trip, return_date: e.target.value})} style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>TOTAL BUDGET (QAR)</label>
                  <input type="number" value={trip.budget_qar} onChange={e => setTrip({...trip, budget_qar: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>STATUS</label>
                  <select value={trip.status} onChange={e => setTrip({...trip, status: e.target.value})} style={inputStyle}>
                    <option value="planning">Planning</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>NOTES / FLIGHT DETAILS</label>
                <textarea value={trip.notes} onChange={e => setTrip({...trip, notes: e.target.value})} style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} />
              </div>

              <button onClick={saveSettings} style={{ ...primaryBtn, background: C.blue, marginTop: '1rem', padding: '1rem' }}>SAVE SETTINGS</button>
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
  boxSizing: 'border-box' as const,
  width: '100%'
}

const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  fontFamily: F_MONO,
  color: C.grey,
  marginBottom: '0.5rem',
  letterSpacing: '0.1em'
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