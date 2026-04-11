// app/jummah/jummah-client.tsx
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

const INSPIRATION = [
  { type: 'Quran', content: 'Whoever reads Surah Al-Kahf on Friday, he will be illuminated with light between the two Fridays.', ar: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ' },
  { type: 'Hadith', content: 'The best day on which the sun has risen is Friday.', ar: 'خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ' },
  { type: 'Reflection', content: 'What did the khutbah teach us today? How can we apply one lesson from it this weekend?', ar: '' },
  { type: 'Dua', content: 'Sayyid Al-Istighfar: O Allah, You are my Lord. There is no god but You. You created me, and I am Your slave...', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ...' },
  { type: 'Seerah', content: 'Remember the patience of the Prophet ﷺ in Makkah. How does our patience compare this week?', ar: '' },
  { type: 'Question', content: 'To the children: What is the best deed you did this week that only Allah knows about?', ar: '' }
]

const MOODS = [
  { id: 'excellent', label: 'Excellent', icon: '🌟' },
  { id: 'good', label: 'Good', icon: '✅' },
  { id: 'okay', label: 'Okay', icon: '🟡' },
  { id: 'tough', label: 'Tough', icon: '🔴' }
]

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
}

function getLastFriday() {
  const d = new Date()
  const day = d.getDay()
  const diff = (day <= 5) ? (7 - 5 + day) : (day - 5)
  if (day !== 5) d.setDate(d.getDate() - diff)
  return d.toISOString().split('T')[0]
}

export default function JummahReview() {
  const [tab, setTab] = useState('review')
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  
  const targetDate = getLastFriday()
  const weekNum = getWeekNumber(new Date(targetDate))
  const isTodayFriday = new Date().getDay() === 5

  const [form, setForm] = useState({ review_date: targetDate, week_number: weekNum, wins: '', struggles: '', gratitude: '', intentions: '', quran_ayah: '', family_mood: 'good' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('jummah_reviews').select('*').order('review_date', { ascending: false })
      const loaded = data?.length ? data : JSON.parse(localStorage.getItem('bayt-jummah-v1') || '[]')
      setReviews(loaded)
      
      const current = loaded.find((r: any) => r.review_date === targetDate)
      if (current) setForm(current)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveReview = async () => {
    const newR = { id: form.id || crypto.randomUUID(), ...form, created_at: new Date().toISOString() }
    const updated = [...reviews.filter(r => r.review_date !== form.review_date), newR].sort((a,b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())
    setReviews(updated)
    localStorage.setItem('bayt-jummah-v1', JSON.stringify(updated))
    try { await supabase.from('jummah_reviews').upsert(newR, { onConflict: 'review_date' }) } catch(e) {}
    alert('Jumu\'ah review saved. May Allah bless the week ahead.')
  }

  const insp = INSPIRATION[weekNum % 6]

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Gathering family records...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Every Friday. After Jumu'ah. Together.</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Jumu'ah Review</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>مراجعة الجمعة</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 300, fontFamily: F_MONO, color: isTodayFriday ? C.gold : C.white }}>
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.8rem', color: C.forest, fontFamily: F_MONO, marginTop: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
            WEEK {weekNum} OF {new Date().getFullYear()}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'review', label: '📝 This Week\'s Review' },
          { id: 'archive', label: '📚 Archive' },
          { id: 'inspiration', label: '📖 Jumu\'ah Inspiration' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.cream, padding: '1rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.text }}>Reviewing for: <strong style={{ color: C.green }}>{form.review_date}</strong></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {MOODS.map(m => (
                  <button 
                    key={m.id} onClick={() => setForm({...form, family_mood: m.id})}
                    style={{ padding: '4px 8px', background: form.family_mood === m.id ? C.white : 'transparent', border: `1px solid ${form.family_mood === m.id ? C.goldDim : 'transparent'}`, borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
                    title={m.label}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>🌟 WINS — What went well this week?</label>
              <textarea value={form.wins} onChange={e => setForm({...form, wins: e.target.value})} style={textAreaStyle} placeholder="Celebrate the small victories..." />
            </div>
            
            <div>
              <label style={labelStyle}>🧗 STRUGGLES — What was hard? Be honest.</label>
              <textarea value={form.struggles} onChange={e => setForm({...form, struggles: e.target.value})} style={textAreaStyle} placeholder="Where did we fall short?" />
            </div>

            <div>
              <label style={labelStyle}>🤲 GRATITUDE — What are we grateful for?</label>
              <textarea value={form.gratitude} onChange={e => setForm({...form, gratitude: e.target.value})} style={textAreaStyle} placeholder="Alhamdulillah for..." />
            </div>

            <div>
              <label style={labelStyle}>🎯 INTENTIONS — What do we commit to next week?</label>
              <textarea value={form.intentions} onChange={e => setForm({...form, intentions: e.target.value})} style={textAreaStyle} placeholder="Next week, we will focus on..." />
            </div>

            <div>
              <label style={labelStyle}>📖 QURAN / DEEN MOMENT — Insight for the week</label>
              <textarea value={form.quran_ayah} onChange={e => setForm({...form, quran_ayah: e.target.value})} style={{...textAreaStyle, minHeight: '60px'}} placeholder="An ayah, hadith, or lesson..." />
            </div>

            <button onClick={saveReview} style={{ background: C.green, color: C.white, border: 'none', padding: '1rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem' }}>
              SEAL REVIEW FOR WEEK {weekNum}
            </button>
          </div>
        )}

        {tab === 'archive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                  <div style={{ fontFamily: F_MONO, fontWeight: 600, color: C.green }}>{r.review_date} <span style={{ color: C.grey, fontWeight: 400, marginLeft: '8px' }}>Week {r.week_number}</span></div>
                  <div style={{ fontSize: '1.2rem' }}>{MOODS.find(m => m.id === r.family_mood)?.icon}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase', marginBottom: '4px' }}>Wins</div>
                    <div style={{ fontSize: '0.9rem', color: C.text, whiteSpace: 'pre-wrap' }}>{r.wins || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase', marginBottom: '4px' }}>Struggles</div>
                    <div style={{ fontSize: '0.9rem', color: C.text, whiteSpace: 'pre-wrap' }}>{r.struggles || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase', marginBottom: '4px' }}>Intentions</div>
                    <div style={{ fontSize: '0.9rem', color: C.text, whiteSpace: 'pre-wrap' }}>{r.intentions || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase', marginBottom: '4px' }}>Deen Focus</div>
                    <div style={{ fontSize: '0.9rem', color: C.text, fontStyle: 'italic' }}>{r.quran_ayah || '—'}</div>
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.cream, borderRadius: '8px' }}>No past reviews found. Start a new tradition today.</div>}
          </div>
        )}

        {tab === 'inspiration' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ background: C.forest, padding: '3rem', borderRadius: '12px', border: `1px solid ${C.goldDim}`, maxWidth: '600px', textAlign: 'center' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{insp.type}</div>
              {insp.ar && <div style={{ fontFamily: F_ARAB, fontSize: '1.8rem', color: C.green, marginBottom: '1.5rem', lineHeight: 1.6 }}>{insp.ar}</div>}
              <div style={{ fontSize: '1.2rem', color: C.text, lineHeight: 1.6, fontWeight: 300 }}>"{insp.content}"</div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontFamily: F_MONO, color: C.green, letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }
const textAreaStyle = { width: '100%', padding: '1rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, minHeight: '100px', resize: 'vertical' as const, background: C.cream }