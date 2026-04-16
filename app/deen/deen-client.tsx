// app/deen/deen-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  fetchPrayerTimes,
  getPrayerList,
  getNextPrayer,
  getCountdownTime,
  getWeekStart,
  getWeekDates,
  formatDateISO,
  type AladhanData,
  type PrayerTime
} from '@/lib/prayer-times-utils'
import { MEMBERS, PRAYERS } from './constants'
import QuranRecitation from './sections/quran-recitation'
import QuranHifz from './sections/quran-hifz'
import QuranRevision from './sections/quran-revision'
import QuranCalculator from './sections/quran-calculator'
import QuranExam from './sections/quran-exam'

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

export default function DeenTracker() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('salah')
  const [activeQuranTab, setActiveQuranTab] = useState('recitation')
  const [loading, setLoading] = useState(true)
  const [salahLogs, setSalahLogs] = useState<any[]>([])
  const [quranLogs, setQuranLogs] = useState<any[]>([])
  const [hifzLogs, setHifzLogs] = useState<any[]>([])
  const [revisionLogs, setRevisionLogs] = useState<any[]>([])
  const [examLogs, setExamLogs] = useState<any[]>([])
  const [ilmGoals, setIlmGoals] = useState<any[]>([])
  const [today] = useState(new Date().toISOString().split('T')[0])

  // Prayer times state
  const [prayerTimesData, setPrayerTimesData] = useState<AladhanData | null>(null)
  const [prayerList, setPrayerList] = useState<PrayerTime[]>([])
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null)
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Weekly view state
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [weekDates, setWeekDates] = useState(getWeekDates(getWeekStart(new Date())))

  useEffect(() => {
    fetchData()
    fetchPrayerTimesData()
  }, [])

  // Fetch prayer times once
  async function fetchPrayerTimesData() {
    const data = await fetchPrayerTimes()
    if (data) {
      setPrayerTimesData(data)
      const prayers = getPrayerList(data)
      setPrayerList(prayers)

      // Get next prayer
      const now = new Date()
      const nowMins = now.getHours() * 60 + now.getMinutes()
      const next = getNextPrayer(prayers, nowMins)
      setNextPrayer(next)
    }
  }

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!nextPrayer) return
      const now = new Date()
      const nowMins = now.getHours() * 60 + now.getMinutes()
      const nowSecs = now.getSeconds()
      const cd = getCountdownTime(nextPrayer.mins, nowMins, nowSecs)
      setCountdown({ hours: cd.hours, minutes: cd.minutes, seconds: cd.seconds })
    }, 1000)
    return () => clearInterval(interval)
  }, [nextPrayer])

  async function fetchData() {
    setLoading(true)

    // Get week start/end dates
    const wStart = getWeekStart(new Date())
    const wDates = getWeekDates(wStart)
    const dateStrings = wDates.map(d => formatDateISO(d))

    // Fetch salah logs for entire week
    const { data: sData } = await supabase
      .from('salah_logs')
      .select('*')
      .in('log_date', dateStrings)

    // Fetch Quran progress (recitation logs)
    const { data: qData } = await supabase
      .from('quran_progress')
      .select('*')
      .eq('section', 'recitation')
      .order('logged_at', { ascending: false })
      .limit(10)

    // Fetch Hifz logs
    const { data: hData } = await supabase
      .from('hifz_progress')
      .select('*')
      .order('logged_at', { ascending: false })

    // Fetch Revision logs
    const { data: rData } = await supabase
      .from('quran_revision_logs')
      .select('*')
      .order('logged_at', { ascending: false })

    // Fetch Exam logs
    const { data: eData } = await supabase
      .from('quran_exams')
      .select('*')
      .order('exam_date', { ascending: false })

    // Fetch Ilm notes
    const { data: iData } = await supabase.from('ilm_notes').select('*').order('created_at', { ascending: false })

    if (sData) setSalahLogs(sData)
    if (qData) setQuranLogs(qData)
    if (hData) setHifzLogs(hData)
    if (rData) setRevisionLogs(rData)
    if (eData) setExamLogs(eData)
    if (iData) setIlmGoals(iData)
    setLoading(false)
  }

  // Handle week navigation
  function goToPreviousWeek() {
    const newStart = new Date(weekStart)
    newStart.setDate(newStart.getDate() - 7)
    setWeekStart(newStart)
    setWeekDates(getWeekDates(newStart))
  }

  function goToNextWeek() {
    const newStart = new Date(weekStart)
    newStart.setDate(newStart.getDate() + 7)
    setWeekStart(newStart)
    setWeekDates(getWeekDates(newStart))
  }

  function goToThisWeek() {
    const newStart = getWeekStart(new Date())
    setWeekStart(newStart)
    setWeekDates(getWeekDates(newStart))
  }

  const toggleSalah = async (memberId: string, prayer: typeof PRAYERS[number], logDate: string) => {
    const existing = salahLogs.find(l => l.member_id === memberId && l.log_date === logDate)
    const currentVal = existing ? existing[prayer] : false
    const newVal = !currentVal

    const updateObj = {
      member_id: memberId,
      log_date: logDate,
      [prayer]: newVal
    }

    const { error } = await supabase
      .from('salah_logs')
      .upsert(updateObj, { onConflict: 'member_id,log_date' })

    if (!error) {
      setSalahLogs(prev => {
        const idx = prev.findIndex(p => p.member_id === memberId && p.log_date === logDate)
        if (idx > -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], [prayer]: newVal }
          return next
        }
        return [...prev, updateObj]
      })
    }
  }

  // Calculate weekly stats for a member
  const getWeeklyStats = (memberId: string) => {
    const weekDateStrings = weekDates.map(d => formatDateISO(d))
    const memberLogs = salahLogs.filter(
      l => l.member_id === memberId && weekDateStrings.includes(l.log_date)
    )

    // Total prayers completed
    let totalCompleted = 0
    const prayerStats: Record<string, number> = {}

    PRAYERS.forEach(prayer => {
      let count = 0
      memberLogs.forEach(log => {
        if (log[prayer]) count++
      })
      prayerStats[prayer] = count
      totalCompleted += count
    })

    const totalPossible = 5 * 7 // 5 prayers × 7 days
    const percentage = Math.round((totalCompleted / totalPossible) * 100)

    return { totalCompleted, totalPossible, percentage, prayerStats }
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
          {/* Prayer Times Display */}
          {prayerList.length > 0 && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: C.green }}>Prayer Times</h3>
                  <div style={{ fontSize: '0.8rem', color: C.grey }}>Doha, Qatar</div>
                </div>
                {nextPrayer && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: C.grey, textTransform: 'uppercase' }}>Next Prayer</div>
                    <div style={{ fontSize: '1.1rem', color: C.gold, fontWeight: 'bold' }}>{nextPrayer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.goldDim }}>
                      {countdown.hours > 0 ? `${countdown.hours}h ` : ''}
                      {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {prayerList.map(prayer => {
                  const isNext = nextPrayer?.name === prayer.name
                  return (
                    <div
                      key={prayer.name}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        backgroundColor: isNext ? C.goldPale : C.forest,
                        border: `1px solid ${isNext ? C.gold : C.rule}`,
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: C.grey, textTransform: 'uppercase', marginBottom: '4px' }}>
                        {prayer.name}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isNext ? C.gold : C.text }}>
                        {prayer.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Weekly Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <button
              onClick={goToPreviousWeek}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${C.rule}`,
                backgroundColor: C.white,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Previous Week
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 4px 0', color: C.green }}>
                Week of {weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </h3>
              <div style={{ fontSize: '0.8rem', color: C.grey }}>
                {weekDates[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} –{' '}
                {weekDates[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button
              onClick={goToNextWeek}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${C.rule}`,
                backgroundColor: C.white,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Next Week →
            </button>
          </div>

          {/* Weekly Stats Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {MEMBERS.map(m => {
              const stats = getWeeklyStats(m.id)
              return (
                <div
                  key={m.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: C.white,
                    border: `1px solid ${C.ruleLight}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: C.green, marginBottom: '4px' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.gold, marginBottom: '2px' }}>
                    {stats.percentage}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: C.grey }}>
                    {stats.totalCompleted}/{stats.totalPossible} prayers
                  </div>
                </div>
              )
            })}
          </div>

          {/* Salah Grid - Weekly View */}
          <div style={styles.card}>
            <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Daily Salah Tracker</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.rule}` }}>
                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.8rem', color: C.grey, fontWeight: 'bold' }}>
                      Member
                    </th>
                    {weekDates.map((date, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          color: formatDateISO(date) === today ? C.gold : C.grey,
                          fontWeight: 'bold',
                        }}
                      >
                        <div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</div>
                        <div style={{ fontSize: '0.7rem' }}>{date.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map(member => (
                    <tr key={member.id} style={{ borderBottom: `1px solid ${C.ruleLight}` }}>
                      <td style={{ padding: '8px', fontSize: '0.9rem', fontWeight: '500', color: C.text }}>
                        {member.name}
                      </td>
                      {weekDates.map((date, idx) => {
                        const dateStr = formatDateISO(date)
                        const log = salahLogs.find(l => l.member_id === member.id && l.log_date === dateStr)
                        const isToday = dateStr === today

                        // Count prayers for this day
                        const prayerCount = PRAYERS.filter(p => log?.[p]).length
                        const allPrayersCompleted = prayerCount === 5

                        return (
                          <td
                            key={idx}
                            style={{
                              padding: '8px',
                              textAlign: 'center',
                              backgroundColor: isToday ? C.goldPale : 'transparent',
                              borderRight: `1px solid ${C.ruleLight}`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              {PRAYERS.map(prayer => (
                                <label
                                  key={prayer}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    backgroundColor: log?.[prayer] ? C.goldPale : 'transparent',
                                  }}
                                  title={prayer}
                                >
                                  <input
                                    type="checkbox"
                                    checked={log?.[prayer] || false}
                                    onChange={() => toggleSalah(member.id, prayer, dateStr)}
                                    style={{ cursor: 'pointer', accentColor: C.gold }}
                                  />
                                </label>
                              ))}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: C.grey, textAlign: 'center', marginTop: '20px' }}>
            <span style={{ color: C.goldDim }}>★</span> Growth is slow, consistent, and intentional.
          </div>
        </section>
      )}

      {activeTab === 'quran' && (
        <section>
          {/* Quran Sub-tabs */}
          <div style={{ ...styles.tabs, marginBottom: '20px' }}>
            <div
              style={styles.tab(activeQuranTab === 'recitation')}
              onClick={() => setActiveQuranTab('recitation')}
            >
              تلاوة Recitation
            </div>
            <div
              style={styles.tab(activeQuranTab === 'hifz')}
              onClick={() => setActiveQuranTab('hifz')}
            >
              حفظ Memorization
            </div>
            <div
              style={styles.tab(activeQuranTab === 'revision')}
              onClick={() => setActiveQuranTab('revision')}
            >
              مراجعة Revision
            </div>
            <div
              style={styles.tab(activeQuranTab === 'calculator')}
              onClick={() => setActiveQuranTab('calculator')}
            >
              📊 Progress
            </div>
            <div
              style={styles.tab(activeQuranTab === 'exam')}
              onClick={() => setActiveQuranTab('exam')}
            >
              امتحان Exams
            </div>
          </div>

          {/* Recitation Tab */}
          {activeQuranTab === 'recitation' && (
            <QuranRecitation
              recentLogs={quranLogs}
              onLogAdded={() => fetchData()}
              styles={styles}
            />
          )}

          {/* Memorization Tab */}
          {activeQuranTab === 'hifz' && (
            <QuranHifz
              hifzLogs={hifzLogs}
              onLogAdded={() => fetchData()}
              styles={styles}
            />
          )}

          {/* Revision Tab */}
          {activeQuranTab === 'revision' && (
            <QuranRevision
              revisionLogs={revisionLogs}
              onLogAdded={() => fetchData()}
              styles={styles}
            />
          )}

          {/* Calculator Tab */}
          {activeQuranTab === 'calculator' && (
            <QuranCalculator
              hifzLogs={hifzLogs}
              styles={styles}
            />
          )}

          {/* Exam Tab */}
          {activeQuranTab === 'exam' && (
            <QuranExam
              examLogs={examLogs}
              onLogAdded={() => fetchData()}
              styles={styles}
            />
          )}
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