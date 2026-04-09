// app/subscriptions/subscriptions-client.tsx
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

const DEFAULT_SUBS = [
  { id: '1', name: 'Doha College', icon: '🏫', category: 'Education', amount_qar: 0, frequency: 'annual', billing_day: 1, active: true },
  { id: '2', name: 'QFS', icon: '🏫', category: 'Education', amount_qar: 0, frequency: 'annual', billing_day: 1, active: true },
  { id: '3', name: 'Netflix', icon: '🎬', category: 'Streaming', amount_qar: 50, frequency: 'monthly', billing_day: 15, active: true },
  { id: '4', name: 'Spotify', icon: '🎵', category: 'Streaming', amount_qar: 35, frequency: 'monthly', billing_day: 5, active: true },
  { id: '5', name: 'Apple iCloud', icon: '📱', category: 'Software', amount_qar: 15, frequency: 'monthly', billing_day: 12, active: true },
  { id: '6', name: 'ChatGPT Plus', icon: '🤖', category: 'Software', amount_qar: 80, frequency: 'monthly', billing_day: 20, active: true },
  { id: '7', name: 'Claude Pro', icon: '🤖', category: 'Software', amount_qar: 80, frequency: 'monthly', billing_day: 22, active: true },
  { id: '8', name: 'Gym', icon: '💪', category: 'Health', amount_qar: 0, frequency: 'monthly', billing_day: 1, active: true },
]

export default function SubscriptionsTracker() {
  const [tab, setTab] = useState('all')
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setSubs(data)
      } else {
        const ls = localStorage.getItem('bayt-subs')
        if (ls) setSubs(JSON.parse(ls))
        else setSubs(DEFAULT_SUBS)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveSubs = async (newSubs: any[]) => {
    setSubs(newSubs)
    localStorage.setItem('bayt-subs', JSON.stringify(newSubs))
    try {
      // Supabase sync omitted for brevity in inline save, assuming localStorage fallback is primary for this demo
    } catch (e) {}
  }

  const handleEdit = (sub: any) => {
    setEditingId(sub.id)
    setEditForm({ ...sub })
  }

  const handleSave = () => {
    const updated = subs.map(s => s.id === editingId ? { ...editForm, amount_qar: Number(editForm.amount_qar) } : s)
    saveSubs(updated)
    setEditingId(null)
  }

  const toggleActive = (id: string) => {
    const updated = subs.map(s => s.id === id ? { ...s, active: !s.active } : s)
    saveSubs(updated)
  }

  const monthlyTotal = subs.filter(s => s.active && s.frequency === 'monthly').reduce((acc, s) => acc + Number(s.amount_qar), 0)
  const annualTotal = subs.filter(s => s.active).reduce((acc, s) => acc + (s.frequency === 'monthly' ? Number(s.amount_qar) * 12 : Number(s.amount_qar)), 0)

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading subscriptions...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS</div>
          <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 300 }}>Subscriptions</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>الاشتراكات</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>MONTHLY</div>
            <div style={{ fontSize: '1.2rem', color: C.gold }}>QAR {monthlyTotal.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>ANNUAL COMMITMENT</div>
            <div style={{ fontSize: '1.2rem', color: C.white }}>QAR {annualTotal.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['all', 'calendar', 'analysis'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'all' ? '📋 All Subs' : t === 'calendar' ? '📅 Calendar' : '📊 Analysis'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '400px' }}>
        
        {tab === 'all' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                onClick={() => {
                  const newSub = { id: Date.now().toString(), name: 'New Sub', icon: '📝', category: 'Other', amount_qar: 0, frequency: 'monthly', billing_day: 1, active: true }
                  saveSubs([newSub, ...subs])
                  handleEdit(newSub)
                }}
                style={{ padding: '8px 16px', background: C.gold, color: C.white, border: 'none', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.7rem', cursor: 'pointer' }}
              >
                + ADD SUBSCRIPTION
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {subs.map(sub => (
                <div key={sub.id} style={{ border: `1px solid ${C.rule}`, borderRadius: '8px', padding: '1.2rem', background: sub.active ? C.white : C.cream, opacity: sub.active ? 1 : 0.6 }}>
                  {editingId === sub.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} style={{ width: '40px', padding: '4px', textAlign: 'center' }} />
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ flex: 1, padding: '4px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" value={editForm.amount_qar} onChange={e => setEditForm({...editForm, amount_qar: e.target.value})} style={{ flex: 1, padding: '4px' }} placeholder="Amount" />
                        <select value={editForm.frequency} onChange={e => setEditForm({...editForm, frequency: e.target.value})} style={{ flex: 1, padding: '4px' }}>
                          <option value="monthly">Monthly</option><option value="annual">Annual</option>
                        </select>
                      </div>
                      <input type="number" placeholder="Billing Day (1-31)" value={editForm.billing_day} onChange={e => setEditForm({...editForm, billing_day: e.target.value})} style={{ padding: '4px' }} />
                      <button onClick={handleSave} style={{ background: C.green, color: C.white, border: 'none', padding: '6px', borderRadius: '4px', marginTop: '4px' }}>Save</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.5rem' }}>{sub.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{sub.name}</div>
                            <div style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.grey, background: C.ruleLight, padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>{sub.category.toUpperCase()}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: F_MONO, fontSize: '1.1rem', color: C.text }}>QAR {sub.amount_qar}</div>
                          <div style={{ fontSize: '0.65rem', color: C.grey }}>/{sub.frequency === 'monthly' ? 'mo' : 'yr'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.ruleLight}`, paddingTop: '12px', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: C.grey }}>{sub.frequency === 'monthly' ? `Renews on day ${sub.billing_day}` : 'Annual renewal'}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => toggleActive(sub.id)} style={{ fontSize: '0.7rem', border: `1px solid ${C.rule}`, background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>{sub.active ? 'Pause' : 'Activate'}</button>
                          <button onClick={() => handleEdit(sub)} style={{ fontSize: '0.7rem', border: `1px solid ${C.rule}`, background: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Monthly Billing Cycle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '2rem' }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const daySubs = subs.filter(s => s.active && s.frequency === 'monthly' && Number(s.billing_day) === day)
                const isToday = day === new Date().getDate()
                return (
                  <div key={day} style={{ border: `1px solid ${isToday ? C.gold : C.ruleLight}`, borderRadius: '6px', padding: '8px', minHeight: '80px', background: isToday ? C.cream : C.white }}>
                    <div style={{ fontSize: '0.7rem', color: isToday ? C.goldDim : C.grey, fontFamily: F_MONO, marginBottom: '4px' }}>{day}</div>
                    {daySubs.map(s => (
                      <div key={s.id} style={{ fontSize: '0.65rem', background: C.ruleLight, padding: '2px 4px', borderRadius: '2px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.icon} QAR {s.amount_qar}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'analysis' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>ANNUAL SPEND BREAKDOWN</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from(new Set(subs.map(s => s.category))).map(cat => {
                  const catTotal = subs.filter(s => s.active && s.category === cat).reduce((acc, s) => acc + (s.frequency === 'monthly' ? Number(s.amount_qar) * 12 : Number(s.amount_qar)), 0)
                  const pct = annualTotal > 0 ? (catTotal / annualTotal) * 100 : 0
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>{cat}</span>
                        <span style={{ fontFamily: F_MONO }}>QAR {catTotal.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '6px', background: C.rule, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: C.green }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <div style={{ border: `1px solid ${C.ruleLight}`, padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>MOST EXPENSIVE</div>
                {(() => {
                  const max = [...subs.filter(s => s.active)].sort((a,b) => (b.frequency==='monthly'?b.amount_qar*12:b.amount_qar) - (a.frequency==='monthly'?a.amount_qar*12:a.amount_qar))[0]
                  if(!max) return <div style={{marginTop:'8px'}}>-</div>
                  return <div style={{ fontSize: '1.2rem', marginTop: '8px' }}>{max.icon} {max.name} (QAR {max.amount_qar}/{max.frequency==='monthly'?'mo':'yr'})</div>
                })()}
              </div>
              <p style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic', padding: '1rem', background: C.forest, borderRadius: '8px' }}>
                "Sabr: review these regularly. Cancel what doesn't serve the family's growth."
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}