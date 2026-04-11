// app/prayer-times/prayer-times-client.tsx
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
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

const PRAYERS = [
  { id: 'Fajr', ar: 'الفجر', icon: '🌙' },
  { id: 'Sunrise', ar: 'الشروق', icon: '🌅' },
  { id: 'Dhuhr', ar: 'الظهر', icon: '☀️' },
  { id: 'Asr', ar: 'العصر', icon: '🌤️' },
  { id: 'Maghrib', ar: 'المغرب', icon: '🌇' },
  { id: 'Isha', ar: 'العشاء', icon: '🌃' }
]

// Fallback exact times for Doha approx
const FALLBACK_TIMES: Record<string, string> = {
  Fajr: "04:15", Sunrise: "05:30", Dhuhr: "11:45", Asr: "15:15", Maghrib: "18:00", Isha: "19:30"
}

export default function PrayerTimes() {
  const [loading, setLoading] = useState(true)
  const [times, setTimes] = useState<Record<string, string>>(FALLBACK_TIMES)
  const [hijri, setHijri] = useState('')
  const [now, setNow] = useState(new Date())
  const [prayed, setPrayed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchTimes()
    
    // Checkboxes sync
    const todayStr = new Date().toISOString().split('T')[0]
    setPrayed(JSON.parse(localStorage.getItem(`bayt-salah-${todayStr}-v1`) || '{}'))

    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchTimes = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Doha&country=Qatar&method=4')
      if (res.ok) {
        const data = await res.json()
        setTimes(data.data.timings)
        setHijri(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`)
      }
    } catch (e) {
      console.log('Using fallback prayer times')
    }
    setLoading(false)
  }

  const togglePrayed = (p: string) => {
    if (p === 'Sunrise') return
    const todayStr = new Date().toISOString().split('T')[0]
    const updated = { ...prayed, [p]: !prayed[p] }
    setPrayed(updated)
    localStorage.setItem(`bayt-salah-${todayStr}-v1`, JSON.stringify(updated))
  }

  // Next prayer calc
  let nextP = 'Fajr'
  let minDiff = Infinity
  const currentMins = now.getHours() * 60 + now.getMinutes()

  PRAYERS.forEach(p => {
    if (times[p.id]) {
      const [h, m] = times[p.id].split(':').map(Number)
      const pMins = h * 60 + m
      let diff = pMins - currentMins
      if (diff < 0) diff += 24 * 60 // wrap to next day
      if (diff < minDiff) { minDiff = diff; nextP = p.id; }
    }
  })

  const countdownStr = `${Math.floor(minDiff / 60)}h ${minDiff % 60}m`

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Determining sun position...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <main style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.ruleLight}`, overflow: 'hidden' }}>
        
        <header style={{ background: C.green, color: C.white, padding: '3rem 2rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', letterSpacing: '0.2em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '1rem' }}>Doha, Qatar</div>
          <div style={{ fontSize: '1.2rem', fontFamily: F_SANS, opacity: 0.9 }}>{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div style={{ fontSize: '1.5rem', fontFamily: F_ARAB, color: C.gold, marginTop: '0.5rem' }}>{hijri || 'التقويم الهجري'}</div>
          
          <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', display: 'inline-block' }}>
            <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.goldPale, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{nextP} in</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300, fontFamily: F_MONO }}>{countdownStr}</div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, fontFamily: F_ARAB, fontSize: '1.5rem', color: 'rgba(255,255,255,0.1)' }}>الله أكبر</div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', background: C.forest }}>
          {PRAYERS.map(p => {
            const isNext = p.id === nextP
            const t24 = times[p.id] || '--:--'
            let t12 = '--:--'
            if (t24 !== '--:--') {
              let [h, m] = t24.split(':').map(Number)
              const ampm = h >= 12 ? 'PM' : 'AM'
              h = h % 12 || 12
              t12 = `${h}:${String(m).padStart(2, '0')} ${ampm}`
            }

            return (
              <div key={p.id} style={{ padding: '2rem 1.5rem', textAlign: 'center', borderRight: `1px solid ${C.ruleLight}`, borderBottom: `1px solid ${C.ruleLight}`, background: isNext ? C.goldPale : 'transparent', position: 'relative' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{p.icon}</div>
                <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: isNext ? C.goldDim : C.green, marginBottom: '0.2rem' }}>{p.ar}</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text, marginBottom: '0.5rem' }}>{p.id}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '1.5rem', color: isNext ? C.text : C.grey, marginBottom: '0.2rem' }}>{t12}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, opacity: 0.7 }}>{t24}</div>
                
                {p.id !== 'Sunrise' && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: prayed[p.id] ? C.green : C.grey, fontWeight: prayed[p.id] ? 600 : 400 }}>
                      <input type="checkbox" checked={prayed[p.id] || false} onChange={() => togglePrayed(p.id)} style={{ transform: 'scale(1.2)' }} />
                      Prayed
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}