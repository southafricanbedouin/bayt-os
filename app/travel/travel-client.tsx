// app/travel/travel-client.tsx
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

const ESCAPES = [
  { name: 'Inland Sea (Khor Al Adaid)', area: 'South Qatar', category: 'Nature', drive: '1h 15m', tips: 'Requires 4x4. Great for sunset.' },
  { name: 'Al Wakrah Beach', area: 'Al Wakrah', category: 'Beach', drive: '35m', tips: 'Family friendly, shallow waters.' },
  { name: 'Al Zubarah Fort', area: 'North Qatar', category: 'Culture', drive: '1h 10m', tips: 'UNESCO site. Good educational trip for kids.' },
  { name: 'Lusail Boulevard', area: 'Lusail', category: 'Entertainment', drive: '25m', tips: 'Best in evening. Lots of dining options.' },
  { name: 'Souq Waqif', area: 'Old Doha', category: 'Culture', drive: '25m', tips: 'Classic family outing. Pet area for kids.' }
]

const DEFAULT_PACKING = [
  { category: 'documents', item: 'Passports & Visas' }, { category: 'documents', item: 'Booking confirmations' },
  { category: 'packing', item: 'Clothes & Toiletries' }, { category: 'packing', item: 'Prayer items (mat, Quran)' },
  { category: 'kids', item: 'Snacks & Entertainment' }, { category: 'kids', item: 'Favourite comfort items' },
  { category: 'finance', item: 'Travel cash / Cards' }
]

export default function TravelPlanner() {
  const [tab, setTab] = useState('trips')
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null)

  // Forms
  const [newTrip, setNewTrip] = useState({ name: '', destination: '', start_date: '', end_date: '', budget_qar: '' })
  const [newItemText, setNewItemText] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: tData } = await supabase.from('trips').select('*')
      const { data: iData } = await supabase.from('trip_items').select('*')
      
      setTrips(tData || JSON.parse(localStorage.getItem('bayt-trips') || '[]'))
      setItems(iData || JSON.parse(localStorage.getItem('bayt-trip-items') || '[]'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveState = (newTrips: any[], newItems: any[]) => {
    setTrips(newTrips)
    setItems(newItems)
    localStorage.setItem('bayt-trips', JSON.stringify(newTrips))
    localStorage.setItem('bayt-trip-items', JSON.stringify(newItems))
  }

  const createTrip = () => {
    if (!newTrip.name) return
    const tripId = Date.now().toString()
    const trip = { id: tripId, ...newTrip, status: 'planning', budget_qar: Number(newTrip.budget_qar), actual_qar: 0, created_at: new Date().toISOString() }
    
    const initialItems = DEFAULT_PACKING.map(i => ({
      id: Math.random().toString(), trip_id: tripId, category: i.category, item: i.item, checked: false
    }))

    saveState([trip, ...trips], [...items, ...initialItems])
    setNewTrip({ name: '', destination: '', start_date: '', end_date: '', budget_qar: '' })
    setTab('trips')
  }

  const toggleItem = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i)
    saveState(trips, updated)
  }

  const addChecklistItem = (cat: string) => {
    if (!newItemText || !selectedTrip) return
    const newItem = { id: Date.now().toString(), trip_id: selectedTrip.id, category: cat, item: newItemText, checked: false }
    saveState(trips, [...items, newItem])
    setNewItemText('')
  }

  const selectAndOpenTrip = (trip: any) => {
    setSelectedTrip(trip)
    setTab('detail')
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Packing the bags...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldPale }}>BAYT OS · EXPERIENCES</div>
          <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>Travel Planning</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>السفر</div>
        </div>
        <div style={{ position: 'absolute', right: '-10px', top: '10px', fontSize: '8rem', opacity: 0.1, zIndex: 1 }}>✈️</div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['trips', selectedTrip ? 'detail' : null, 'escapes', 'stats'].filter(Boolean).map(t => (
          <button 
            key={t} onClick={() => setTab(t as string)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'trips' ? '✈️ Trips' : t === 'detail' ? '📋 Trip Detail' : t === 'escapes' ? '🗺️ Doha Escapes' : '📊 Travel Stats'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'trips' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0, fontWeight: 300 }}>Plan a Trip</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input placeholder="Trip Name (e.g. Summer in Cape Town)" value={newTrip.name} onChange={e => setNewTrip({...newTrip, name: e.target.value})} style={inputStyle} />
                <input placeholder="Destination" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="date" value={newTrip.start_date} onChange={e => setNewTrip({...newTrip, start_date: e.target.value})} style={{...inputStyle, flex: 1}} />
                  <input type="date" value={newTrip.end_date} onChange={e => setNewTrip({...newTrip, end_date: e.target.value})} style={{...inputStyle, flex: 1}} />
                </div>
                <input type="number" placeholder="Budget (QAR)" value={newTrip.budget_qar} onChange={e => setNewTrip({...newTrip, budget_qar: e.target.value})} style={inputStyle} />
              </div>
              <button onClick={createTrip} style={{ background: C.green, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO }}>CREATE TRIP</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {trips.map(trip => (
                <div key={trip.id} onClick={() => selectAndOpenTrip(trip)} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background=C.cream} onMouseLeave={e => e.currentTarget.style.background=C.white}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{trip.name}</div>
                    <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, marginTop: '4px' }}>📍 {trip.destination} · {trip.start_date} to {trip.end_date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', padding: '4px 8px', background: trip.status==='planning' ? C.goldPale : C.ruleLight, color: trip.status==='planning' ? C.goldDim : C.text, borderRadius: '4px', display: 'inline-block', marginBottom: '8px', textTransform: 'uppercase', fontFamily: F_MONO }}>{trip.status}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>QAR {trip.actual_qar || 0} / {trip.budget_qar}</div>
                  </div>
                </div>
              ))}
              {trips.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: C.grey }}>Shura principle: talk to the kids about where to go next!</div>}
            </div>
          </div>
        )}

        {tab === 'detail' && selectedTrip && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedTrip.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: C.grey, fontFamily: F_MONO, fontSize: '0.8rem' }}>📍 {selectedTrip.destination} | 📅 {selectedTrip.start_date} - {selectedTrip.end_date}</p>
              </div>
              <button onClick={() => setTab('trips')} style={{ background: 'none', border: `1px solid ${C.rule}`, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ borderBottom: `1px solid ${C.green}`, paddingBottom: '8px', color: C.green }}>Checklists</h3>
                {['documents', 'packing', 'kids', 'finance'].map(cat => {
                  const catItems = items.filter(i => i.trip_id === selectedTrip.id && i.category === cat)
                  return (
                    <div key={cat} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '8px', fontSize: '0.9rem' }}>{cat}</div>
                      {catItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} />
                          <span style={{ fontSize: '0.85rem', textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? C.grey : C.text }}>{item.item}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Add item..." style={{ padding: '4px', fontSize: '0.75rem', border: `1px solid ${C.rule}`, flex: 1 }} />
                        <button onClick={() => addChecklistItem(cat)} style={{ fontSize: '0.75rem', background: C.ruleLight, border: 'none', padding: '4px 8px', cursor: 'pointer' }}>Add</button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div>
                <h3 style={{ borderBottom: `1px solid ${C.green}`, paddingBottom: '8px', color: C.green }}>Budget</h3>
                <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontFamily: F_MONO }}>
                    <span>Budget: QAR {selectedTrip.budget_qar}</span>
                    <span>Actual: QAR {selectedTrip.actual_qar || 0}</span>
                  </div>
                  <div style={{ height: '10px', background: C.white, borderRadius: '5px', overflow: 'hidden', border: `1px solid ${C.ruleLight}` }}>
                    <div style={{ height: '100%', width: `${Math.min(((selectedTrip.actual_qar || 0) / selectedTrip.budget_qar) * 100, 100)}%`, background: C.gold }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: C.grey, marginTop: '1rem' }}>Note: Expense tracking integrates with budget module.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'escapes' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Short Escapes from Al Wajba</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {ESCAPES.map(e => (
                <div key={e.name} style={{ border: `1px solid ${C.ruleLight}`, padding: '1.5rem', borderRadius: '8px', background: C.cream }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.goldDim, textTransform: 'uppercase', marginBottom: '4px' }}>{e.category} · {e.area}</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>{e.name}</div>
                  <div style={{ fontSize: '0.8rem', color: C.text, marginBottom: '8px' }}>🚗 Drive time: {e.drive}</div>
                  <div style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic' }}>{e.tips}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, letterSpacing: '0.1em' }}>TOTAL TRIPS PLANNED</div>
              <div style={{ fontSize: '3rem', fontWeight: 300, color: C.green, margin: '10px 0' }}>{trips.length}</div>
            </div>
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, letterSpacing: '0.1em' }}>TOTAL SPEND</div>
              <div style={{ fontSize: '3rem', fontWeight: 300, color: C.gold, margin: '10px 0' }}>QAR {trips.reduce((acc, t) => acc + (t.actual_qar || 0), 0)}</div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_SANS }