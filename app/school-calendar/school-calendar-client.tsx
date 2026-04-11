// app/school-calendar/school-calendar-client.tsx
'use client'

import React, { useState, useEffect } from 'react'

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
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const TERMS = {
  DC: [
    { term: 'Autumn Term', start: '2025-08-28', end: '2025-12-18' },
    { term: 'Spring Term', start: '2026-01-07', end: '2026-03-26' },
    { term: 'Summer Term', start: '2026-04-14', end: '2026-06-18' }
  ],
  QFS: [
    { term: 'Term 1', start: '2025-09-01', end: '2025-12-20' },
    { term: 'Term 2', start: '2026-01-05', end: '2026-03-30' },
    { term: 'Term 3', start: '2026-04-12', end: '2026-06-25' }
  ]
}

const EVENTS = [
  { id: '1', school: 'DC', event_type: 'parent-evening', title: 'Year 7 Parent Evening', date: '2026-02-15' },
  { id: '2', school: 'QFS', event_type: 'sports', title: 'QFS Sports Day', date: '2026-03-10' },
  { id: '3', school: 'both', event_type: 'holiday', title: 'National Day', date: '2025-12-18' }
]

export default function SchoolCalendar() {
  const [tab, setTab] = useState('upcoming')
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const ls = localStorage.getItem('bayt-schoolevents-v1')
    setEvents(ls ? JSON.parse(ls) : EVENTS)
  }, [])

  const sColor = (school: string) => school === 'DC' ? C.blue : school === 'QFS' ? C.green : C.goldDim

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Doha College & QFS</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>School Calendar</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>التقويم المدرسي</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: C.white, color: C.blue, borderRadius: '4px', fontWeight: 600, fontFamily: F_MONO, fontSize: '0.8rem' }}>DC (Yahya, Isa)</div>
          <div style={{ padding: '0.5rem 1rem', background: C.white, color: C.green, borderRadius: '4px', fontWeight: 600, fontFamily: F_MONO, fontSize: '0.8rem' }}>QFS (Linah, Dana)</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'upcoming', label: '📋 Upcoming Events' },
          { id: 'terms', label: '🗓️ Term Dates' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'upcoming' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', border: `1px solid ${C.ruleLight}`, borderRadius: '8px', background: C.white, borderLeft: `6px solid ${sColor(ev.school)}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '1.2rem', color: C.text, width: '120px', fontWeight: 600 }}>{ev.date}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: sColor(ev.school) }}>{ev.school.toUpperCase()}</span>
                    <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: C.cream, border: `1px solid ${C.rule}`, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.grey }}>{ev.event_type.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ev.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'terms' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ color: C.blue, borderBottom: `2px solid ${C.blue}`, paddingBottom: '0.5rem' }}>Doha College 2025-2026</h3>
              {TERMS.DC.map((t, i) => (
                <div key={i} style={{ padding: '1rem', background: C.cream, borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${C.ruleLight}` }}>
                  <div style={{ fontWeight: 600, color: C.blue, marginBottom: '0.5rem' }}>{t.term}</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.85rem', color: C.text }}>{t.start} <span style={{ color: C.grey }}>to</span> {t.end}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ color: C.green, borderBottom: `2px solid ${C.green}`, paddingBottom: '0.5rem' }}>QFS 2025-2026</h3>
              {TERMS.QFS.map((t, i) => (
                <div key={i} style={{ padding: '1rem', background: C.cream, borderRadius: '8px', marginBottom: '1rem', border: `1px solid ${C.ruleLight}` }}>
                  <div style={{ fontWeight: 600, color: C.green, marginBottom: '0.5rem' }}>{t.term}</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.85rem', color: C.text }}>{t.start} <span style={{ color: C.grey }}>to</span> {t.end}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}