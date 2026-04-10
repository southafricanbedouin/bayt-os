// app/transport/transport-client.tsx
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

const DEFAULT_VEHICLES = [
  { id: '1', name: "Muhammad's Car", make: 'Toyota', model: 'Land Cruiser', year: 2022, color: 'White', icon: '🚙' },
  { id: '2', name: "Camilla's Car", make: 'Nissan', model: 'Patrol', year: 2020, color: 'Silver', icon: '🚗' }
]

const SCHOOL_RUN = [
  { id: 'yahya', name: 'Yahya', morning: 'School Bus (Doha College)', afternoon: 'Hamilton Transport' },
  { id: 'isa', name: 'Isa', morning: 'School Bus (Doha College)', afternoon: 'Hamilton Transport' },
  { id: 'linah', name: 'Linah', morning: 'School Bus (QFS)', afternoon: 'Hamilton Transport' },
  { id: 'dana', name: 'Dana', morning: 'School Bus (QFS)', afternoon: 'Hamilton Transport' }
]

const MAINT_COLORS: Record<string, string> = {
  'oil_change': C.orange,
  'service': C.gold,
  'tires': C.blue,
  'repair': '#c0392b',
  'wash': C.grey,
  'registration': C.green,
  'other': C.text
}

export default function TransportVehicles() {
  const supabase = createClient()
  const [tab, setTab] = useState('vehicles')
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  // Forms
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({ vehicle_id: '1', type: 'service', title: '', date: '', mileage_km: '', cost_qar: '', next_due_date: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: vData } = await supabase.from('vehicles').select('*')
      const { data: lData } = await supabase.from('maintenance_logs').select('*').order('date', { ascending: false })
      
      setVehicles(vData?.length ? vData : JSON.parse(localStorage.getItem('bayt-vehicles') || JSON.stringify(DEFAULT_VEHICLES)))
      setLogs(lData || JSON.parse(localStorage.getItem('bayt-maintenance') || '[]'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveLog = () => {
    if (!logForm.title || !logForm.date) return
    const newLog = { id: Date.now().toString(), ...logForm, created_at: new Date().toISOString() }
    const updated = [newLog, ...logs]
    setLogs(updated)
    localStorage.setItem('bayt-maintenance', JSON.stringify(updated))
    setLogForm({ vehicle_id: '1', type: 'service', title: '', date: '', mileage_km: '', cost_qar: '', next_due_date: '' })
    setShowLogForm(false)
  }

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Unknown'

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading fleet data...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · LOGISTICS</div>
          <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>Transport & Vehicles</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>المواصلات</div>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>🚙</div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['vehicles', 'maintenance', 'school_run', 'upcoming'].map(t => (
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
        
        {tab === 'vehicles' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {vehicles.map(v => {
                const vLogs = logs.filter(l => l.vehicle_id === v.id)
                const lastService = vLogs.find(l => l.type === 'service')
                
                return (
                  <div key={v.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{v.icon}</div>
                        <h3 style={{ margin: 0, color: C.green }}>{v.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, marginTop: '4px' }}>{v.year} {v.make} {v.model} · {v.color}</div>
                      </div>
                      <div style={{ background: C.green, color: C.white, width: '12px', height: '12px', borderRadius: '50%' }} title="Status: Good" />
                    </div>
                    
                    <div style={{ background: C.white, padding: '1rem', borderRadius: '6px', border: `1px solid ${C.ruleLight}` }}>
                      <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: '8px' }}>MAINTENANCE STATUS</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>Last Service:</span>
                        <span style={{ fontWeight: 600 }}>{lastService ? lastService.date : 'Unknown'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Next Due:</span>
                        <span style={{ fontWeight: 600, color: C.orange }}>{lastService?.next_due_date || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'maintenance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 300 }}>Maintenance Log</h3>
              <button onClick={() => setShowLogForm(!showLogForm)} style={{ background: C.gold, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>
                {showLogForm ? 'CANCEL' : '＋ LOG MAINTENANCE'}
              </button>
            </div>

            {showLogForm && (
              <div style={{ background: C.forest, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select value={logForm.vehicle_id} onChange={e => setLogForm({...logForm, vehicle_id: e.target.value})} style={inputStyle}>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <select value={logForm.type} onChange={e => setLogForm({...logForm, type: e.target.value})} style={inputStyle}>
                    <option value="service">Service</option><option value="oil_change">Oil Change</option>
                    <option value="tires">Tires</option><option value="repair">Repair</option>
                    <option value="registration">Registration (Istimara)</option><option value="wash">Wash</option>
                  </select>
                  <input placeholder="Title / Description" value={logForm.title} onChange={e => setLogForm({...logForm, title: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input type="date" value={logForm.date} onChange={e => setLogForm({...logForm, date: e.target.value})} style={inputStyle} title="Date" />
                  <input type="number" placeholder="Mileage (KM)" value={logForm.mileage_km} onChange={e => setLogForm({...logForm, mileage_km: e.target.value})} style={inputStyle} />
                  <input type="number" placeholder="Cost (QAR)" value={logForm.cost_qar} onChange={e => setLogForm({...logForm, cost_qar: e.target.value})} style={inputStyle} />
                  <input type="date" placeholder="Next Due Date" value={logForm.next_due_date} onChange={e => setLogForm({...logForm, next_due_date: e.target.value})} style={inputStyle} title="Next Due Date" />
                </div>
                <button onClick={saveLog} style={{ width: '100%', background: C.green, color: C.white, border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>SAVE LOG</button>
              </div>
            )}

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr', background: C.cream, padding: '10px 16px', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Date</div><div>Vehicle</div><div>Details</div><div>Mileage</div><div style={{textAlign:'right'}}>Cost</div>
              </div>
              {logs.map((l, i) => (
                <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr', padding: '12px 16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.8rem' }}>{l.date}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{getVehicleName(l.vehicle_id)}</div>
                  <div>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: MAINT_COLORS[l.type] || C.grey, marginRight: '6px' }} />
                    <span style={{ fontSize: '0.9rem' }}>{l.title}</span>
                  </div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{l.mileage_km ? `${l.mileage_km} km` : '—'}</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>QAR {l.cost_qar || 0}</div>
                </div>
              ))}
              {logs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey }}>No maintenance logs found.</div>}
            </div>
          </div>
        )}

        {tab === 'school_run' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontWeight: 300 }}>School Transport Logistics</h3>
              <div style={{ background: C.goldPale, color: C.goldDim, padding: '8px 16px', borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600 }}>
                MONTHLY COST: QAR 2,900
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {SCHOOL_RUN.map(child => (
                <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: C.green }}>{child.name}</h4>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, marginBottom: '4px' }}>MORNING (DROP-OFF)</div>
                        <div style={{ fontWeight: 600 }}>{child.morning}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, marginBottom: '4px' }}>AFTERNOON (PICKUP)</div>
                        <div style={{ fontWeight: 600 }}>{child.afternoon}</div>
                      </div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: `1px solid ${C.rule}`, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: C.grey }}>Edit</button>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: C.grey, marginTop: '1.5rem', fontStyle: 'italic' }}>Note: Monthly cost consists of Hamilton Transport (QAR 1,400) and School Bus x2 (QAR 1,500).</p>
          </div>
        )}

        {tab === 'upcoming' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Upcoming Renewals & Logistics</h3>
            <div style={{ background: C.goldPale, border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '1rem', color: C.goldDim, fontFamily: F_MONO, fontSize: '0.8rem', marginBottom: '2rem' }}>
              ⚠️ Check Istimara (Registration) dates for all vehicles.
            </div>
            
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              {logs.filter(l => l.next_due_date && new Date(l.next_due_date) > new Date()).sort((a,b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()).map((l, i) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: i % 2 === 0 ? C.white : C.cream, borderBottom: `1px solid ${C.ruleLight}` }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{getVehicleName(l.vehicle_id)}</span> — Next {l.type}
                  </div>
                  <div style={{ fontFamily: F_MONO, color: C.orange, fontWeight: 600 }}>{l.next_due_date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '8px 12px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_SANS, fontSize: '0.85rem', outline: 'none' }