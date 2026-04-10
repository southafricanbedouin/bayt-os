// app/deen/deen-client.tsx
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

const MEMBERS = [
  { id: 'muhammad', name: 'Muhammad' },
  { id: 'camilla', name: 'Camilla' },
  { id: 'yahya', name: 'Yahya', age: 11 },
  { id: 'isa', name: 'Isa', age: 10 },
  { id: 'linah', name: 'Linah', age: 7 },
  { id: 'dana', name: 'Dana', age: 6 }
]

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export default function DeenTracker() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('salah')
  const [loading, setLoading] = useState(true)
  const [salahLogs, setSalahLogs] = useState<any[]>([])
  const [quranLogs, setQuranLogs] = useState<any[]>([])
  const [ilmGoals, setIlmGoals] = useState<any[]>([])
  const [today] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: sData } = await supabase.from('salah_logs').select('*').eq('log_date', today)
    const { data: qData } = await supabase.from('quran_progress').select('*').order('logged_at', { ascending: false }).limit(10)
    const { data: iData } = await supabase.from('ilm_notes').select('*').order('created_at', { ascending: false })
    
    if (sData) setSalahLogs(sData)
    if (qData) setQuranLogs(qData)
    if (iData) setIlmGoals(iData)
    setLoading(false)
  }

  const toggleSalah = async (memberId: string, prayer: typeof PRAYERS[number]) => {
    const existing = salahLogs.find(l => l.member_id === memberId)
    const currentVal = existing ? existing[prayer] : false
    const newVal = !currentVal

    const updateObj = { 
      member_id: memberId, 
      log_date: today, 
      [prayer]: newVal 
    }

    const { error } = await supabase
      .from('salah_logs')
      .upsert(updateObj, { onConflict: 'member_id,log_date' })

    if (!error) {
      setSalahLogs(prev => {
        const idx = prev.findIndex(p => p.member_id === memberId)
        if (idx > -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], [prayer]: newVal }
          return next
        }
        return [...prev, updateObj]
      })
    }
  }

  const getWeekPrompt = () => {
    const prompts = [
      "This week: learn one new hadith as a family",
      "This week: read one story from the Seerah together",
      "This week: memorise one new dua",
      "This week: discuss one name of Allah each evening"
    ]
    const weekNum = Math.floor(new Date().getDate() / 7)
    return prompts[weekNum % 4]
  }

  const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS, color: C.text, backgroundColor: C.cream, minHeight: '100vh' },
    header: { marginBottom: '32px', borderBottom: `1px solid ${C.rule}`, paddingBottom: '16px' },
    arabic: { fontFamily: F_ARAB, fontSize: '32px', color: C.green, marginBottom: '8px' },
    quote: { fontStyle: 'italic', color: C.grey, fontSize: '0.9rem', marginTop: '8px' },
    tabs: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: `1px solid ${C.ruleLight}` },
    tab: (active: boolean) => ({
      padding: '12px 20px',
      cursor: 'pointer',
      borderBottom: active ? `3px solid ${C.gold}` : '3px solid transparent',
      color: active ? C.green : C.grey,
      fontWeight: active ? '600' : '400',
      transition: 'all 0.2s'
    }),
    card: { backgroundColor: C.white, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '150px repeat(5, 1fr)', gap: '12px', alignItems: 'center' },
    cell: { height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.ruleLight}`, borderRadius: '6px', cursor: 'pointer' },
    badge: (cat: string) => ({
      padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' as const, fontWeight: 'bold',
      backgroundColor: cat === 'aqeedah' ? C.blue : cat === 'fiqh' ? C.orange : C.midgreen, color: C.white
    })
  }

  if (loading) return <div style={styles.container}>Loading Deen Module...</div>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={styles.arabic}>الدين أولاً</div>
            <h1 style={{ margin: 0, fontSize: '24px', color: C.green }}>Deen First</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: C.grey }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}<br />
            Ramadan 1446 (Approx.)
          </div>
        </div>
        <p style={styles.quote}>"The most beloved deeds to Allah are those done consistently, even if small."</p>
      </header>

      <div style={styles.tabs}>
        <div style={styles.tab(activeTab === 'salah')} onClick={() => setActiveTab('salah')}>🕌 Salah</div>
        <div style={styles.tab(activeTab === 'quran')} onClick={() => setActiveTab('quran')}>📖 Quran</div>
        <div style={styles.tab(activeTab === 'ilm')} onClick={() => setActiveTab('ilm')}>🌟 Ilm</div>
        <div style={styles.tab(activeTab === 'checkin')} onClick={() => setActiveTab('checkin')}>📅 Check-in</div>
      </div>

      {activeTab === 'salah' && (
        <section>
          <div style={styles.card}>
            <div style={{...styles.grid, marginBottom: '16px', fontWeight: 'bold', color: C.grey, fontSize: '0.8rem' }}>
              <div>Family Member</div>
              {PRAYERS.map(p => <div key={p} style={{ textAlign: 'center' }}>{p.toUpperCase()}</div>)}
            </div>
            {MEMBERS.map(m => {
              const log = salahLogs.find(l => l.member_id === m.id)
              return (
                <div key={m.id} style={{ ...styles.grid, marginBottom: '8px' }}>
                  <div style={{ fontWeight: '500' }}>{m.name}</div>
                  {PRAYERS.map(p => (
                    <div 
                      key={p} 
                      onClick={() => toggleSalah(m.id, p)}
                      style={{ 
                        ...styles.cell, 
                        backgroundColor: log?.[p] ? C.goldPale : 'transparent',
                        borderColor: log?.[p] ? C.gold : C.ruleLight
                      }}
                    >
                      {log?.[p] && <span style={{ color: C.goldDim, fontWeight: 'bold' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: '0.85rem', color: C.grey, textAlign: 'center' }}>
            <span style={{ color: C.goldDim }}>★</span> Growth is slow, consistent, and intentional.
          </div>
        </section>
      )}

      {activeTab === 'quran' && (
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {MEMBERS.filter(m => (m as any).age).map(m => (
              <div key={m.id} style={styles.card}>
                <h3 style={{ margin: '0 0 12px 0', color: C.green }}>{m.name}'s Journey</h3>
                <div style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Weekly Goal: {(m as any).age > 8 ? '5' : '2'} pages</span>
                  <span style={{ fontWeight: 'bold', color: C.goldDim }}>Juz 30</span>
                </div>
                <div style={{ height: '8px', backgroundColor: C.forest, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', backgroundColor: C.gold }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0' }}>Recent Logs</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${C.rule}` }}>
                  <th style={{ padding: '8px' }}>Member</th>
                  <th style={{ padding: '8px' }}>Type</th>
                  <th style={{ padding: '8px' }}>Range</th>
                  <th style={{ padding: '8px' }}>Pages</th>
                </tr>
              </thead>
              <tbody>
                {quranLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                    <td style={{ padding: '8px' }}>{MEMBERS.find(m => m.id === log.member_id)?.name}</td>
                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{log.type}</td>
                    <td style={{ padding: '8px' }}>Surah {log.surah_from}:{log.ayah_from}</td>
                    <td style={{ padding: '8px' }}>{log.pages_read}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'ilm' && (
        <section>
          <div style={{ ...styles.card, backgroundColor: C.midgreen, color: C.white }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Family Learning Prompt</h3>
            <p style={{ fontSize: '1.2rem', margin: 0 }}>{getWeekPrompt()}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {ilmGoals.map(goal => (
              <div key={goal.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={styles.badge(goal.category)}>{goal.category}</span>
                  <span style={{ fontSize: '0.75rem', color: C.grey }}>{MEMBERS.find(m => m.id === goal.member_id)?.name}</span>
                </div>
                <h4 style={{ margin: '0 0 8px 0' }}>{goal.title}</h4>
                <p style={{ fontSize: '0.85rem', color: C.grey, margin: 0 }}>{goal.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'checkin' && (
        <section style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={styles.card}>
            <h3 style={{ textAlign: 'center', marginBottom: '24px' }}>Family Reflection</h3>
            {[
              "Did we pray Fajr together at least once?",
              "Did we read Quran daily?",
              "Did we make sadaqah this week?",
              "Did we do dhikr after at least one salah?"
            ].map((q, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.ruleLight}` }}>
                <span style={{ fontSize: '0.95rem' }}>{q}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${C.rule}`, backgroundColor: C.white }}>Yes</button>
                  <button style={{ padding: '6px 12px', borderRadius: '4px', border: `1px solid ${C.rule}`, backgroundColor: C.white }}>No</button>
                </div>
              </div>
            ))}
            <textarea 
              placeholder="Weekly family notes / gratitudes..."
              style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '8px', border: `1px solid ${C.rule}`, height: '100px', fontFamily: F_SANS }}
            />
            <button style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: C.green, color: C.white, border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Save Reflection
            </button>
          </div>
        </section>
      )}
    </div>
  )
}