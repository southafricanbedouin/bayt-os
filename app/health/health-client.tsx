// app/health/health-client.tsx
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

const FAMILY_MEMBERS = [
  { id: 'muhammad', name: 'Muhammad' },
  { id: 'camilla', name: 'Camilla' },
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const DEFAULT_CLINICS = [
  { id: '1', name: 'Al Ahli Hospital', type: 'General', area: 'Al Rumaila' },
  { id: '2', name: 'Sidra Medicine', type: 'Specialist / Paediatrics', area: 'Education City' },
  { id: '3', name: 'HMC Primary', type: 'GP', area: 'Multiple' },
  { id: '4', name: 'Qatar Dental', type: 'Dental', area: 'Various' }
]

export default function MedicalHealth() {
  const supabase = createClient()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [meds, setMeds] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])

  // Forms
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [recordForm, setRecordForm] = useState({ person_id: 'yahya', type: 'checkup', title: '', date: '', doctor: '', clinic: '', notes: '', next_due: '' })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: rData } = await supabase.from('health_records').select('*').order('date', { ascending: false })
      const { data: mData } = await supabase.from('medications').select('*')
      
      setRecords(rData || JSON.parse(localStorage.getItem('bayt-health-records') || '[]'))
      setMeds(mData || JSON.parse(localStorage.getItem('bayt-health-meds') || '[]'))
      setClinics(JSON.parse(localStorage.getItem('bayt-clinics') || JSON.stringify(DEFAULT_CLINICS)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveRecord = () => {
    if (!recordForm.title || !recordForm.date) return
    const newRecord = { id: Date.now().toString(), ...recordForm, created_at: new Date().toISOString() }
    const updated = [newRecord, ...records]
    setRecords(updated)
    localStorage.setItem('bayt-health-records', JSON.stringify(updated))
    setRecordForm({ person_id: 'yahya', type: 'checkup', title: '', date: '', doctor: '', clinic: '', notes: '', next_due: '' })
    setShowAddRecord(false)
  }

  const getPersonName = (id: string) => FAMILY_MEMBERS.find(m => m.id === id)?.name || id

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Accessing medical records...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldPale }}>BAYT OS · WELLBEING</div>
        <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>Medical & Health</h1>
        <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>الصحة والرعاية</div>
        <p style={{ marginTop: '10px', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>"Taqwa: the body is an amanah (trust); we care for it."</p>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['overview', 'records', 'medications', 'vaccinations', 'clinics'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'overview' ? '👨‍👩‍👧‍👦 Family' : t === 'records' ? '📋 Records' : t === 'medications' ? '💊 Meds' : t === 'vaccinations' ? '💉 Vaccines' : '🏥 Clinics'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {FAMILY_MEMBERS.map(member => {
                const pRecords = records.filter(r => r.person_id === member.id)
                const lastCheckup = pRecords.find(r => r.type === 'checkup')?.date || 'No record'
                const activeMeds = meds.filter(m => m.person_id === member.id && m.active).length
                
                return (
                  <div key={member.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: C.green }}>{member.name}</h3>
                      <button style={{ background: 'none', border: `1px solid ${C.green}`, color: C.green, padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Book Appt</button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: C.text, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '4px' }}>
                        <span style={{ color: C.grey }}>Last Checkup:</span> <span>{lastCheckup}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '4px' }}>
                        <span style={{ color: C.grey }}>Active Meds:</span> <span>{activeMeds}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <h3 style={{ fontWeight: 300 }}>Upcoming Due Dates</h3>
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              {records.filter(r => r.next_due && new Date(r.next_due) > new Date()).sort((a,b) => new Date(a.next_due).getTime() - new Date(b.next_due).getTime()).slice(0,5).map((r, i) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: i % 2 === 0 ? C.white : C.cream, borderBottom: `1px solid ${C.ruleLight}` }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{getPersonName(r.person_id)}</span> — {r.title}
                  </div>
                  <div style={{ fontFamily: F_MONO, color: C.orange, fontWeight: 600 }}>{r.next_due}</div>
                </div>
              ))}
              {records.filter(r => r.next_due && new Date(r.next_due) > new Date()).length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: C.grey, fontFamily: F_MONO, fontSize: '0.8rem' }}>No upcoming health due dates.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'records' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 300 }}>Health Records</h3>
              <button onClick={() => setShowAddRecord(!showAddRecord)} style={{ background: C.gold, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>
                {showAddRecord ? 'CANCEL' : '＋ ADD RECORD'}
              </button>
            </div>

            {showAddRecord && (
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <select value={recordForm.person_id} onChange={e => setRecordForm({...recordForm, person_id: e.target.value})} style={inputStyle}>
                    {FAMILY_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select value={recordForm.type} onChange={e => setRecordForm({...recordForm, type: e.target.value})} style={inputStyle}>
                    <option value="checkup">Checkup</option><option value="vaccination">Vaccination</option>
                    <option value="dental">Dental</option><option value="illness">Illness</option>
                    <option value="allergy">Allergy</option><option value="other">Other</option>
                  </select>
                  <input placeholder="Title / Description" value={recordForm.title} onChange={e => setRecordForm({...recordForm, title: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input type="date" value={recordForm.date} onChange={e => setRecordForm({...recordForm, date: e.target.value})} style={inputStyle} />
                  <input placeholder="Doctor" value={recordForm.doctor} onChange={e => setRecordForm({...recordForm, doctor: e.target.value})} style={inputStyle} />
                  <select value={recordForm.clinic} onChange={e => setRecordForm({...recordForm, clinic: e.target.value})} style={inputStyle}>
                    <option value="">Select Clinic</option>
                    {clinics.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input placeholder="Notes" value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} style={{...inputStyle, flex: 2}} />
                  <input type="date" placeholder="Next Due" value={recordForm.next_due} onChange={e => setRecordForm({...recordForm, next_due: e.target.value})} style={{...inputStyle, flex: 1}} title="Next Due Date" />
                  <button onClick={saveRecord} style={{ background: C.green, color: C.white, border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>SAVE</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {records.map(r => (
                <div key={r.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.2rem', background: C.white }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 600 }}>{getPersonName(r.person_id)}</span>
                      <span style={{ fontSize: '0.65rem', background: C.ruleLight, padding: '2px 6px', borderRadius: '4px', fontFamily: F_MONO, textTransform: 'uppercase' }}>{r.type}</span>
                    </div>
                    <span style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', marginBottom: '8px', color: C.green }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: C.grey, display: 'flex', gap: '15px' }}>
                    {r.doctor && <span>👨‍⚕️ {r.doctor}</span>}
                    {r.clinic && <span>🏥 {r.clinic}</span>}
                    {r.next_due && <span style={{ color: C.orange }}>⏳ Next Due: {r.next_due}</span>}
                  </div>
                  {r.notes && <div style={{ marginTop: '8px', fontSize: '0.85rem', fontStyle: 'italic', color: C.text }}>"{r.notes}"</div>}
                </div>
              ))}
              {records.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: C.grey }}>No health records found. "Sidq: honest record-keeping for health."</div>}
            </div>
          </div>
        )}

        {tab === 'medications' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: C.grey, background: C.cream, borderRadius: '8px', border: `1px dashed ${C.ruleLight}` }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💊</div>
            <div>No active medications. Alhamdulillah.</div>
          </div>
        )}

        {tab === 'vaccinations' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Vaccination Schedule Reference (Qatar/UK)</h3>
            <div style={{ background: C.forest, padding: '1rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <strong>Standard Course:</strong> BCG, HepB, DTaP, Hib, IPV, PCV, Rota, MenC, MMR, Varicella, HPV. <br/>
              <em>Keep physical vaccination cards in the red folder.</em>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {FAMILY_MEMBERS.filter(m => m.id !== 'muhammad' && m.id !== 'camilla').map(child => {
                const vaxRecords = records.filter(r => r.person_id === child.id && r.type === 'vaccination')
                return (
                  <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1rem', background: C.white }}>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '4px' }}>{child.name}</h4>
                    {vaxRecords.length > 0 ? vaxRecords.map(v => (
                      <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                        <span>{v.title}</span>
                        <span style={{ fontFamily: F_MONO, color: C.grey }}>{v.date}</span>
                      </div>
                    )) : <div style={{ fontSize: '0.75rem', color: C.grey, fontStyle: 'italic' }}>No records logged.</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'clinics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {clinics.map(c => (
              <div key={c.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px', color: C.green }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', fontFamily: F_MONO, color: C.goldDim, marginBottom: '8px' }}>{c.type.toUpperCase()}</div>
                <div style={{ fontSize: '0.85rem', color: C.text }}>📍 {c.area}</div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '8px 12px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_SANS, fontSize: '0.85rem', outline: 'none' }