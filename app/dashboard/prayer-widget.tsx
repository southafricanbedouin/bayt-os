'use client'

import { useState, useEffect } from 'react'

// ── Token map (mirrors dashboard tokens) ──────────────────────────────────
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

const F_SANS   = 'var(--font-sans), Georgia, serif'
const F_MONO   = 'var(--font-mono), monospace'
const F_ARABIC = 'var(--font-arabic), serif'

// ── Prayer names shown in widget ──────────────────────────────────────────
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
type PrayerName = typeof PRAYERS[number]

interface AladhanTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
  Firstthird: string
  Lastthird: string
}

interface AladhanHijri {
  date: string        // e.g. "07-09-1447"
  day: string         // e.g. "7"
  weekday: { en: string; ar: string }
  month: { number: number; en: string; ar: string }
  year: string        // e.g. "1447"
  designation: { abbreviated: string; expanded: string }
  holidays: string[]
}

interface AladhanData {
  timings: AladhanTimings
  date: {
    readable: string  // e.g. "07 Apr 2026"
    timestamp: string
    gregorian: {
      date: string; day: string; weekday: { en: string }
      month: { number: number; en: string }
      year: string
    }
    hijri: AladhanHijri
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
/** Convert "HH:MM" (24h, may have trailing " (XYZ)") to total minutes from midnight */
function timeToMinutes(t: string): number {
  const clean = t.split(' ')[0] // strip any "(TZ)" suffix
  const [h, m] = clean.split(':').map(Number)
  return h * 60 + m
}

function pad(n: number) { return String(n).padStart(2, '0') }

// ── Component ─────────────────────────────────────────────────────────────
export default function PrayerWidget() {
  const [data, setData]     = useState<AladhanData | null>(null)
  const [error, setError]   = useState(false)
  const [now, setNow]       = useState(new Date())

  // Fetch prayer times once on mount
  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Doha&country=Qatar&method=3')
      .then(r => r.json())
      .then((d: { code: number; data: AladhanData }) => {
        if (d.code === 200) setData(d.data)
        else setError(true)
      })
      .catch(() => setError(true))
  }, [])

  // Tick every second for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Derived values ───────────────────────────────────────────────────────
  const nowTotalSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const nowMins      = now.getHours() * 60 + now.getMinutes()

  const prayerList = data
    ? PRAYERS.map(p => ({
        name: p as PrayerName,
        time: data.timings[p],
        mins: timeToMinutes(data.timings[p]),
      }))
    : []

  // Next prayer = first prayer whose time (in minutes) is still in the future
  // If all have passed, wrap to Fajr (next day)
  const nextPrayer = prayerList.find(p => p.mins > nowMins) ?? prayerList[0]

  // Seconds until next prayer (with second-level precision)
  const nextPrayerSecs = nextPrayer
    ? nextPrayer.mins > nowMins
      ? nextPrayer.mins * 60 - nowTotalSecs
      : (24 * 60 - nowMins + nextPrayer.mins) * 60 - now.getSeconds()
    : 0

  const cdHrs  = Math.floor(nextPrayerSecs / 3600)
  const cdMins = Math.floor((nextPrayerSecs % 3600) / 60)
  const cdSecs = nextPrayerSecs % 60

  // Dates
  const gregStr = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const hijri = data?.date.hijri
  const hijriEn  = hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year} AH` : ''
  const hijriAr  = hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : ''

  // ── Loading / error states ───────────────────────────────────────────────
  if (error) return (
    <div style={{
      background: `linear-gradient(135deg, ${C.green} 0%, ${C.midgreen} 100%)`,
      border: `1px solid ${C.ruleLight}`, borderTop: `2px solid ${C.goldDim}`,
      borderRadius: 8, padding: '0.9rem 1.5rem', marginBottom: '1.2rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ fontSize: '1rem' }}>🕌</span>
      <span style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.1em', color: C.grey }}>
        PRAYER TIMES UNAVAILABLE — CHECK CONNECTION
      </span>
    </div>
  )

  if (!data) return (
    <div style={{
      background: `linear-gradient(135deg, ${C.green} 0%, ${C.midgreen} 100%)`,
      border: `1px solid ${C.ruleLight}`, borderTop: `2px solid ${C.goldDim}`,
      borderRadius: 8, padding: '0.9rem 1.5rem', marginBottom: '1.2rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ fontSize: '1rem' }}>🕌</span>
      <span style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.1em', color: C.grey }}>
        LOADING PRAYER TIMES · DOHA, QATAR…
      </span>
    </div>
  )

  // ── Full widget ──────────────────────────────────────────────────────────
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.green} 0%, ${C.midgreen} 100%)`,
      border: `1px solid ${C.goldDim}`,
      borderTop: `2px solid ${C.gold}`,
      borderRadius: 8,
      padding: '1.1rem 1.5rem',
      marginBottom: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.8rem',
      flexWrap: 'wrap',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle background bismillah watermark */}
      <div style={{
        position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
        fontFamily: F_ARABIC, fontSize: '3.5rem', color: C.gold, opacity: 0.04,
        pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
      }}>
        بِسْمِ اللّٰهِ
      </div>

      {/* ── SECTION 1 · Mosque icon + location ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 'fit-content' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(201,168,76,0.12)',
          border: `1px solid rgba(201,168,76,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', flexShrink: 0,
        }}>
          🕌
        </div>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.2em', color: C.goldDim }}>
            PRAYER TIMES
          </div>
          <div style={{ fontFamily: F_SANS, fontSize: '0.78rem', color: C.cream, marginTop: 2 }}>
            Doha, Qatar
          </div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.42rem', letterSpacing: '0.08em', color: C.grey, marginTop: 1 }}>
            MWL · ISNA METHOD
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 52, background: 'rgba(201,168,76,0.2)', flexShrink: 0 }} />

      {/* ── SECTION 2 · Dates ──────────────────────────────────────────── */}
      <div style={{ minWidth: 190 }}>
        {/* Gregorian */}
        <div style={{ fontFamily: F_SANS, fontSize: '0.9rem', color: C.gold, fontWeight: 500, lineHeight: 1.3 }}>
          {gregStr}
        </div>
        {/* Hijri Arabic */}
        <div style={{
          fontFamily: F_ARABIC, fontSize: '1rem', color: 'rgba(240,228,192,0.8)',
          marginTop: 3, lineHeight: 1.4, direction: 'rtl',
        }}>
          {hijriAr}
        </div>
        {/* Hijri English */}
        <div style={{ fontFamily: F_MONO, fontSize: '0.48rem', letterSpacing: '0.1em', color: C.grey, marginTop: 1 }}>
          {hijriEn}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 52, background: 'rgba(201,168,76,0.2)', flexShrink: 0 }} />

      {/* ── SECTION 3 · Next prayer countdown ─────────────────────────── */}
      <div style={{ textAlign: 'center', minWidth: 110 }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.42rem', letterSpacing: '0.2em', color: C.grey }}>
          NEXT PRAYER
        </div>
        <div style={{ fontFamily: F_SANS, fontSize: '1.15rem', color: C.gold, fontWeight: 600, marginTop: 2 }}>
          {nextPrayer?.name ?? '—'}
        </div>
        <div style={{ fontFamily: F_MONO, fontSize: '0.78rem', color: C.cream, marginTop: 1 }}>
          {nextPrayer?.time ?? '—'}
        </div>
        {/* Live countdown */}
        <div style={{
          fontFamily: F_MONO, fontSize: '0.58rem', color: C.goldPale,
          marginTop: 4, letterSpacing: '0.05em',
        }}>
          {cdHrs > 0 ? `${cdHrs}h ` : ''}{pad(cdMins)}m {pad(cdSecs)}s
        </div>
        <div style={{ fontFamily: F_MONO, fontSize: '0.38rem', letterSpacing: '0.12em', color: C.grey, marginTop: 2 }}>
          REMAINING
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 52, background: 'rgba(201,168,76,0.2)', flexShrink: 0 }} />

      {/* ── SECTION 4 · All five prayers ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.4rem', flex: 1, justifyContent: 'space-between' }}>
        {prayerList.map(p => {
          const isNext  = nextPrayer?.name === p.name
          const isPast  = p.mins < nowMins && !isNext
          return (
            <div
              key={p.name}
              style={{
                textAlign: 'center',
                opacity: isPast ? 0.4 : 1,
                transition: 'opacity 0.3s',
                minWidth: 48,
              }}
            >
              {/* Prayer name */}
              <div style={{
                fontFamily: F_MONO, fontSize: '0.42rem', letterSpacing: '0.12em',
                color: isNext ? C.gold : C.grey,
                textTransform: 'uppercase',
              }}>
                {p.name}
              </div>
              {/* Time */}
              <div style={{
                fontFamily: F_SANS, fontSize: '0.9rem',
                color: isNext ? C.gold : C.cream,
                fontWeight: isNext ? 700 : 400,
                marginTop: 3,
              }}>
                {p.time.split(' ')[0]}
              </div>
              {/* Active indicator bar */}
              <div style={{ height: 2, marginTop: 4, borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 1,
                  background: isNext ? C.gold : 'transparent',
                  transition: 'background 0.3s',
                }} />
              </div>
              {/* Checkmark for completed prayers */}
              {isPast && (
                <div style={{ fontFamily: F_MONO, fontSize: '0.42rem', color: C.goldDim, marginTop: 2 }}>✓</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
