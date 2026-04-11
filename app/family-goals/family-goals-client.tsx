// app/family-goals/family-goals-client.tsx
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
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const AREAS = ['deen', 'family', 'health', 'education', 'financial', 'personal']

export default function FamilyGoals() {
  const [tab, setTab] = useState('scoreboard')
  const [loading, setLoading] = useState(true)
  
  const [goals, setGoals] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [activityPts, setActivityPts] = useState<Record<string, number>>({})
  
  const [theme, setTheme] = useState('The Year of Roots')
  
  const supabase = createClient()
  const year = 2026
  const currQ = Math.floor(new Date().getMonth()/3)+1

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [gRes, kRes, aRes] = await Promise.all([
        supabase.from('annual_goals').select('*').eq('year', year),
        supabase.from('kpi_reviews').select('*').eq('year', year),
        supabase.from('activity_log').select('member_id, points')
      ])

      setGoals(gRes.data?.length ? gRes.data : JSON.parse(localStorage.getItem('bayt-annual-goals-v1') || '[]'))
      setKpis(kRes.data || [])
      setTheme(localStorage.getItem('bayt-year-theme-v1') || 'The Year of Roots')

      const pts: Record<string, number> = {}
      if (aRes.data) {
        aRes.data.forEach((r: any) => { pts[r.member_id] = (pts[r.member_id] || 0) + (r.points || 0) })
      }
      setActivityPts(pts)
      
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const updateGoalProgress = async (id: string, progress: number) => {
    const updated = goals.map(g => g.id === id ? { ...g, progress, status: progress >= 100 ? 'achieved' : 'active' } : g)
    setGoals(updated)
    localStorage.setItem('bayt-annual-goals-v1', JSON.stringify(updated))
    try { await supabase.from('annual_goals').update({ progress, status: progress >= 100 ? 'achieved' : 'active' }).eq('id', id) } catch(e) {}
  }

  // Calculations
  const familyGoals = goals.filter(g => g.member_id === null)
  const familyScore = kpis.filter(k => k.quarter === currQ).length > 0 
    ? Math.round(kpis.filter(k => k.quarter === currQ).reduce((a,b) => a + (b.overall_score||0), 0) / kpis.filter(k => k.quarter === currQ).length)
    : 8 // default fallback

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading dashboard...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{year} Scoreboard</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>Family Goals</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>أهداف الأسرة</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontFamily: F_MONO, color: C.gold, fontWeight: 300, lineHeight: 1 }}>{familyScore}<span style={{fontSize:'1.2rem',color:C.grey}}>/10</span></div>
          <div style={{ fontSize: '0.7rem', color: C.forest, fontFamily: F_MONO, marginTop: '0.5rem', letterSpacing: '0.05em' }}>
            FAMILY HEALTH SCORE
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'scoreboard', label: '🌟 Family Scoreboard' },
          { id: 'all_goals', label: '📋 All Goals' },
          { id: 'kpi', label: '📊 KPI Review Hub' },
          { id: 'unlocks', label: '🏆 Unlocks & Gamification' }
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

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'scoreboard' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Theme of the Year</div>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 300, color: C.green }}>"{theme}"</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              {AREAS.map(a => {
                const aGoals = familyGoals.filter(g => g.area === a)
                const done = aGoals.filter(g => g.status === 'achieved').length
                const pct = aGoals.length ? (done/aGoals.length)*100 : 0
                return (
                  <div key={a} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize', color: C.green, fontSize: '1.2rem' }}>{a}</span>
                      <span style={{ fontFamily: F_MONO, fontSize: '1.2rem', color: C.goldDim, fontWeight: 300 }}>{Math.round(pct)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: C.white, borderRadius: '4px', overflow: 'hidden', border: `1px solid ${C.ruleLight}`, marginBottom: '1rem' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.green }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{done} COMPLETED / {aGoals.length} TOTAL</div>
                  </div>
                )
              })}
            </div>

            <h3 style={{ fontWeight: 300, textAlign: 'center', marginBottom: '2rem', color: C.text }}>Member Contributions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
              {MEMBERS.map(m => {
                const mGoals = goals.filter(g => g.member_id === m.id.toLowerCase())
                const mDone = mGoals.filter(g => g.status === 'achieved').length
                const mPct = mGoals.length ? (mDone/mGoals.length)*100 : 0
                
                return (
                  <div key={m.id} style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: C.forest, border: `2px solid ${C.green}`, margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: C.green, fontFamily: F_MONO }}>
                      {m.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>{activityPts[m.id.toLowerCase()] || 0} pts</div>
                    <div style={{ fontSize: '0.75rem', color: C.goldDim, fontFamily: F_MONO, marginTop: '4px' }}>{Math.round(mPct)}% goals</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'all_goals' && (
          <div>
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2.5fr 1fr 2fr', background: C.forest, padding: '12px 16px', fontFamily: F_MONO, fontSize: '0.65rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Member</div><div>Area</div><div>Goal</div><div>Status</div><div>Progress</div>
              </div>
              {goals.sort((a,b) => (a.member_id === null ? -1 : 1)).map((g, i) => (
                <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2.5fr 1fr 2fr', padding: '16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: g.member_id ? C.text : C.green }}>{g.member_id ? MEMBERS.find(m => m.id.toLowerCase() === g.member_id)?.name : 'FAMILY'}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, textTransform: 'uppercase' }}>{g.area}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{g.title}</div>
                    <div style={{ fontSize: '0.75rem', color: C.grey }}>Target: {g.target || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: g.status === 'achieved' ? C.goldPale : C.ruleLight, color: g.status === 'achieved' ? C.goldDim : C.grey, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{g.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="range" min="0" max="100" value={g.progress} onChange={e => updateGoalProgress(g.id, Number(e.target.value))} style={{ flex: 1, accentColor: C.green }} />
                    <span style={{ fontFamily: F_MONO, fontSize: '0.8rem', width: '30px', textAlign: 'right' }}>{g.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'kpi' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300 }}>Q{currQ} {year} KPI Reviews</h2>
              <button style={{ background: C.white, border: `1px solid ${C.rule}`, padding: '0.5rem 1rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.7rem', cursor: 'pointer', color: C.text }}>
                SEND REVIEW REMINDERS
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {MEMBERS.map(m => {
                const review = kpis.find(k => k.member_id === m.id.toLowerCase() && k.quarter === currQ)
                return (
                  <div key={m.id} style={{ border: `1px solid ${review ? C.green : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: review ? C.white : C.cream }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{m.name}</div>
                      {review ? (
                        <div style={{ fontSize: '1.5rem', fontWeight: 300, fontFamily: F_MONO, color: C.green }}>{review.overall_score}/10</div>
                      ) : (
                        <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.orange, background: '#ffebee', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>PENDING</div>
                      )}
                    </div>
                    
                    {review ? (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '0.5rem' }}><strong>Wins:</strong> {review.wins?.substring(0, 50)}...</div>
                        <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '1rem' }}><strong>Improve:</strong> {review.improvements?.substring(0, 50)}...</div>
                        <button style={{ width: '100%', background: C.forest, border: `1px solid ${C.green}`, color: C.green, padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: F_MONO, cursor: 'pointer' }}>VIEW FULL REVIEW</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic' }}>Review has not been submitted yet.</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'unlocks' && (
          <div>
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, marginBottom: '3rem', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontWeight: 300, color: C.goldDim }}>Gamification & Rewards Engine</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: C.text, maxWidth: '600px', marginInline: 'auto' }}>
                "Istiqama: the system measures consistency, not peaks. Rewards flow automatically to those who show up every day."
              </p>
            </div>

            <h3 style={{ fontWeight: 300, marginBottom: '1rem' }}>Active Unlock Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Complete online grocery order', target: 'Yahya', reward: '100 Coins + QAR 10' },
                { title: 'Log 5 Salah in one day', target: 'Any Child', reward: '20 Bonus Coins' },
                { title: 'Complete all chores in a week', target: 'Any Child', reward: '50 Bonus Coins' },
                { title: 'Read every day for 7 days', target: 'Any Member', reward: '30 Coins + Badge' },
                { title: 'Complete KPI review on time', target: 'Any Member', reward: '25 Bonus Coins' },
                { title: 'Log a Sadaqah entry', target: 'Any Member', reward: '15 Bonus Coins' }
              ].map((r, i) => (
                <div key={i} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '6px', padding: '1rem', background: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, textTransform: 'uppercase' }}>Target: {r.target}</div>
                  </div>
                  <div style={{ background: C.goldPale, color: C.goldDim, padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontFamily: F_MONO, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {r.reward}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}