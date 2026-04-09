// app/sadaqah/sadaqah-client.tsx
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

export default function SadaqahLedger() {
  const supabase = createClient()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [goal, setGoal] = useState(null)
  const [isLogging, setIsLogging] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: rec } = await supabase.from('sadaqah_records').select('*').order('created_at', { ascending: false })
    const { data: g } = await supabase.from('savings_goals').select('*').eq('name', 'Family Sadaqah Target').single()
    setRecords(rec || [])
    setGoal(g)
    setLoading(false)
  }

  const ytdTotal = records
    .filter(r => new Date(r.created_at).getFullYear() === new Date().getFullYear())
    .reduce((acc, r) => acc + Number(r.amount_qar), 0)

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO }}>Khidma in progress...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ background: C.midgreen, padding: '40px', borderRadius: '15px', color: C.white, marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ margin: 0, fontWeight: 300, fontSize: '2.5rem' }}>Sadaqah</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.8rem', color: C.goldPale }}>صدقة</div>
          <p style={{ marginTop: '20px', fontStyle: 'italic', maxWidth: '500px', opacity: 0.9 }}>
            "We are not the final destination of what Allah gives us. We are a channel."
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '10rem', opacity: 0.1 }}>🤲</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: C.white, padding: '25px', borderRadius: '12px', border: `1px solid ${C.rule}`, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO }}>YTD GIVEN</div>
          <div style={{ fontSize: '2.2rem', color: C.green, fontWeight: 'bold', margin: '10px 0' }}>QAR {ytdTotal}</div>
          <div style={{ fontSize: '0.7rem', color: C.midgreen }}>All Allah's Provision</div>
        </div>
        <div style={{ background: C.white, padding: '25px', borderRadius: '12px', border: `1px solid ${C.rule}`, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO }}>ALL-TIME GIVEN</div>
          <div style={{ fontSize: '2.2rem', color: C.goldDim, fontWeight: 'bold', margin: '10px 0' }}>QAR {records.reduce((acc, r) => acc + Number(r.amount_qar), 0)}</div>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          style={{ background: C.gold, border: 'none', borderRadius: '12px', color: C.white, fontSize: '1.2rem', cursor: 'pointer', fontFamily: F_MONO }}
        >
          LOG SADAQAH
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', borderBottom: `1px solid ${C.rule}`, marginBottom: '30px' }}>
        {['ledger', 'goals'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            style={{ padding: '10px 30px', background: 'none', border: 'none', borderBottom: tab === t ? `3px solid ${C.green}` : 'none', color: tab === t ? C.green : C.grey, cursor: 'pointer', fontFamily: F_MONO, textTransform: 'uppercase' }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {records.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px 150px 1fr 120px', gap: '20px', background: C.white, padding: '20px', borderRadius: '12px', border: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{new Date(r.created_at).toLocaleDateString()}</div>
              <div>
                <span style={{ padding: '4px 12px', background: C.forest, borderRadius: '20px', fontSize: '0.7rem', color: C.midgreen, fontWeight: 'bold' }}>
                  {r.child_id ? r.child_id.toUpperCase() : 'FAMILY'}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{r.recipient}</div>
                <div style={{ fontSize: '0.8rem', color: C.grey }}>{r.note}</div>
              </div>
              <div style={{ fontFamily: F_MONO, fontWeight: 'bold', textAlign: 'right', color: C.green }}>QAR {r.amount_qar}</div>
            </div>
          ))}
          {records.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px', color: C.grey, fontStyle: 'italic' }}>
              "The best of deeds are those done consistently, even if small."
            </div>
          )}
        </div>
      )}

      {tab === 'goals' && goal && (
        <div style={{ background: C.white, padding: '40px', borderRadius: '15px', border: `1px solid ${C.rule}` }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>2026 Sadaqah Target</h2>
          <div style={{ height: '40px', background: C.cream, borderRadius: '20px', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ width: `${(ytdTotal / goal.target_coins) * 100}%`, height: '100%', background: C.midgreen, transition: 'width 1s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F_MONO }}>
            <span>QAR {ytdTotal} given</span>
            <span>Target: QAR {goal.target_coins}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
            {[25, 50, 75, 100].map(m => (
              <div key={m} style={{ textAlign: 'center', color: (ytdTotal / goal.target_coins * 100) >= m ? C.midgreen : C.rule }}>
                <div style={{ fontSize: '1.5rem' }}>{m}%</div>
                <div style={{ fontSize: '0.6rem' }}>{m === 100 ? 'COMPLETE' : 'MILESTONE'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}