// app/outings/outings-client.tsx
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

const DOHA_VENUES = [
  { name: 'Aspire Park', category: 'Park', area: 'Aspire Zone', icon: '🌿' },
  { name: 'Katara Cultural Village', category: 'Culture', area: 'Katara', icon: '🏛️' },
  { name: 'The Pearl', category: 'Entertainment', area: 'The Pearl', icon: '🎡' },
  { name: 'Souq Waqif', category: 'Culture', area: 'Old Doha', icon: '🛍️' },
  { name: 'MIA Park', category: 'Park', area: 'Corniche', icon: '🌿' },
  { name: 'Inland Sea (Khor Al Adaid)', category: 'Nature', area: 'South Qatar', icon: '🌊' },
  { name: 'Lusail Boulevard', category: 'Entertainment', area: 'Lusail', icon: '🏙️' },
  { name: '3-2-1 Olympic Sports Museum', category: 'Museum', area: 'Aspire', icon: '⚽' },
]

export default function FamilyOutings() {
  const [tab, setTab] = useState('weekend')
  const [loading, setLoading] = useState(true)
  const [outings, setOutings] = useState<any[]>([])

  // Form
  const [newOuting, setNewOuting] = useState({ name: '', location: '', date: '', category: 'Park', cost_qar: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data } = await supabase.from('outings').select('*')
      setOutings(data || JSON.parse(localStorage.getItem('bayt-outings') || '[]'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveOutings = (newData: any[]) => {
    setOutings(newData)
    localStorage.setItem('bayt-outings', JSON.stringify(newData))
  }

  const addOuting = (status: string) => {
    if (!newOuting.name) return
    const outing = { id: Date.now().toString(), ...newOuting, status, cost_qar: Number(newOuting.cost_qar), rating: 0, children_who: [], created_at: new Date().toISOString() }
    saveOutings([outing, ...outings])
    setNewOuting({ name: '', location: '', date: '', category: 'Park', cost_qar: '' })
  }

  const markCompleted = (id: string) => {
    saveOutings(outings.map(o => o.id === id ? { ...o, status: 'completed', rating: 5 } : o))
  }

  const rateOuting = (id: string, rating: number) => {
    saveOutings(outings.map(o => o.id === id ? { ...o, rating } : o))
  }

  const planned = outings.filter(o => o.status === 'planned')
  const ideas = outings.filter(o => o.status === 'idea')
  const completed = outings.filter(o => o.status === 'completed')

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Planning the weekend...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · LIFESTYLE</div>
        <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>Family Outings</h1>
        <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>النزهات العائلية</div>
        <p style={{ marginTop: '10px', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>"Sabr: not every weekend has to be extraordinary; presence is enough."</p>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['weekend', 'ideas', 'completed', 'guide'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'weekend' ? '🗓️ This Weekend' : t === 'ideas' ? '💡 Ideas Bank' : t === 'completed' ? '✅ Completed' : '📍 Doha Guide'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'weekend' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 300 }}>Upcoming Plans</h3>
            </div>
            
            {planned.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {planned.map(o => (
                  <div key={o.id} style={{ border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '1.5rem', background: C.goldPale }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: C.text }}>{o.name}</div>
                    <div style={{ fontSize: '0.8rem', fontFamily: F_MONO, color: C.goldDim, marginTop: '4px' }}>📅 {o.date || 'TBD'} · 📍 {o.location}</div>
                    <button onClick={() => markCompleted(o.id)} style={{ marginTop: '1rem', background: C.green, color: C.white, border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>Mark Completed</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
                <p style={{ color: C.grey, marginBottom: '1rem' }}>No plans yet. Take it easy, or pick an idea from the Guide!</p>
                <button onClick={() => setTab('guide')} style={{ background: C.green, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>View Guide</button>
              </div>
            )}
          </div>
        )}

        {tab === 'ideas' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input placeholder="Idea Name" value={newOuting.name} onChange={e => setNewOuting({...newOuting, name: e.target.value})} style={inputStyle} />
                <input placeholder="Location" value={newOuting.location} onChange={e => setNewOuting({...newOuting, location: e.target.value})} style={inputStyle} />
                <button onClick={() => addOuting('idea')} style={{ background: C.green, color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Idea</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {ideas.map(o => (
                <div key={o.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{o.name}</div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, marginTop: '4px' }}>📍 {o.location}</div>
                  <button onClick={() => saveOutings(outings.map(item => item.id === o.id ? {...item, status: 'planned'} : item))} style={{ marginTop: '10px', background: C.gold, color: C.white, border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Plan It</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'completed' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {completed.map(o => (
                <div key={o.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{o.name}</div>
                    <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, marginTop: '4px' }}>{o.date} · {o.location}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => rateOuting(o.id, star)} style={{ cursor: 'pointer', color: star <= (o.rating || 0) ? C.gold : C.ruleLight, fontSize: '1.5rem' }}>★</span>
                    ))}
                  </div>
                </div>
              ))}
              {completed.length === 0 && <div style={{ color: C.grey, textAlign: 'center', padding: '2rem' }}>No outings completed yet.</div>}
            </div>
          </div>
        )}

        {tab === 'guide' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Doha Favorites</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {DOHA_VENUES.map(v => (
                <div key={v.name} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{v.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{v.name}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, marginTop: '4px' }}>{v.category.toUpperCase()} · {v.area}</div>
                  <button onClick={() => {setNewOuting({...newOuting, name: v.name, location: v.area}); setTab('ideas');}} style={{ marginTop: '1rem', background: 'transparent', border: `1px solid ${C.green}`, color: C.green, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Add to Ideas</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_SANS }