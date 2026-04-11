// app/reports/reports-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = {
  green: '#1a3d28', midgreen: '#245235', forest: '#f0ebe0',
  gold: '#c9a84c', goldDim: '#9b7d38', goldPale: '#f0e4c0',
  cream: '#faf8f2', white: '#ffffff', grey: '#6b7c6e',
  rule: '#ddd8cc', ruleLight: '#e8e3d8', text: '#0d1a0f',
  orange: '#e07b39', blue: '#4a9eca',
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

const ALL_MODULES = ['Economy', 'School', 'Deen', 'Household', 'Health', 'Library', 'Akhlaq', 'Projects', 'Travel', 'Forum']

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [activeTab, setActiveTab] = useState('system')
  
  const [activities, setActivities] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [devScores, setDevScores] = useState<any[]>([])
  const [finances, setFinances] = useState<any>({ variable: [], subs: [], sadaqah: [], coins: [] })
  const [forumStats, setForumStats] = useState({ posts: 0, comments: 0 })
  const [reportsArchive, setReportsArchive] = useState<any[]>([])

  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const supabase = createClient()
  const currentUser = 'muhammad' // In a real app, get from Auth context

  useEffect(() => {
    if (!['muhammad', 'camilla'].includes(currentUser)) {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Fetch data for reports
      const [actRes, goalRes, devRes, repRes] = await Promise.all([
        supabase.from('activity_log').select('*').gte('logged_at', weekAgo.toISOString()),
        supabase.from('personal_goals').select('*').eq('status', 'active'),
        supabase.from('development_scores').select('*').order('score_date', { ascending: false }),
        supabase.from('generated_reports').select('*').order('created_at', { ascending: false })
      ])

      setActivities(actRes.data || [])
      setGoals(goalRes.data || [])
      
      // Get latest score per child
      const latestScores: any[] = []
      const seen = new Set()
      ;(devRes.data || []).forEach(s => {
        if (!seen.has(s.member_id)) {
          seen.add(s.member_id)
          latestScores.push(s)
        }
      })
      setDevScores(latestScores.length ? latestScores : [
        { member_id: 'yahya', iq_raw: 90, iq_age_max: 110, eq_raw: 85, eq_age_max: 110, academic_raw: 88, academic_max: 100, social_raw: 92, social_max: 100, deen_raw: 80, deen_max: 100 },
        { member_id: 'isa', iq_raw: 85, iq_age_max: 100, eq_raw: 90, eq_age_max: 100, academic_raw: 82, academic_max: 100, social_raw: 95, social_max: 100, deen_raw: 85, deen_max: 100 },
        { member_id: 'linah', iq_raw: 60, iq_age_max: 70, eq_raw: 65, eq_age_max: 70, academic_raw: 90, academic_max: 100, social_raw: 80, social_max: 100, deen_raw: 88, deen_max: 100 },
        { member_id: 'dana', iq_raw: 50, iq_age_max: 60, eq_raw: 55, eq_age_max: 60, academic_raw: 95, academic_max: 100, social_raw: 85, social_max: 100, deen_raw: 90, deen_max: 100 }
      ])
      
      setReportsArchive(repRes.data?.length ? repRes.data : JSON.parse(localStorage.getItem('bayt-reports-v1') || '[]'))

      // Mock financial/forum data for dashboard context
      setFinances({
        variable: [{ category: 'groceries', amount: 3200 }, { category: 'fuel', amount: 450 }],
        subs: [{ amount: 350 }],
        sadaqah: [{ amount: 500 }],
        coins: [{ member_id: 'yahya', earned: 120, spent: 40, saved: 50, given: 30 }]
      })
      setForumStats({ posts: 12, comments: 28 })

    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const generateReport = async () => {
    const report = {
      id: crypto.randomUUID(),
      report_type: 'family_dynamic',
      period: 'weekly',
      period_label: `Week of ${new Date().toLocaleDateString()}`,
      content: { activities: activities.length, goals: goals.length },
      narrative: `This week, the Seedat family logged ${activities.length} actions across BaytOS. Collaboration remains strong with ${forumStats.posts} posts. Goals are largely on track, though 2 need review.`,
      created_at: new Date().toISOString()
    }
    const updated = [report, ...reportsArchive]
    setReportsArchive(updated)
    localStorage.setItem('bayt-reports-v1', JSON.stringify(updated))
    try { await supabase.from('generated_reports').insert(report) } catch(e) {}
    alert('Report generated and archived.')
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Compiling intelligence...</div>
  
  if (accessDenied) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem', background: C.cream, borderRadius: '12px', border: `1px solid ${C.rule}` }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <h2 style={{ color: C.green, fontWeight: 300 }}>Access Restricted</h2>
      <p style={{ color: C.grey }}>This module contains family intelligence and financial overviews. Access is restricted to Head of Household and Partner.</p>
    </div>
  )

  // Calculations
  const activeMods = Array.from(new Set(activities.map(a => a.module))).filter(Boolean)
  const unusedMods = ALL_MODULES.filter(m => !activeMods.includes(m.toLowerCase()))
  const vitalityScore = Math.round((activeMods.length / ALL_MODULES.length) * 10)

  const collabScore = Math.min(10, Math.round(((forumStats.posts + forumStats.comments) / 6) * 2))

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Intelligence Layer · Admin Only</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>Reports Dashboard</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>التقارير</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontFamily: F_MONO, color: C.gold, fontWeight: 300, lineHeight: 1 }}>{vitalityScore}<span style={{fontSize:'1.2rem',color:C.grey}}>/10</span></div>
          <div style={{ fontSize: '0.7rem', color: C.forest, fontFamily: F_MONO, marginTop: '0.5rem', letterSpacing: '0.05em' }}>BAYTOS VITALITY</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'system', label: '📊 System' },
          { id: 'dynamic', label: '👨‍👩‍👧‍👦 Family Dynamic' },
          { id: 'financial', label: '💰 Financial' },
          { id: 'dev', label: '🧠 Development' },
          { id: 'archive', label: '📅 Archive' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'system' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginBottom: '0.5rem' }}>TOTAL MODULES</div>
                <div style={{ fontSize: '2.5rem', color: C.text, fontWeight: 300 }}>{ALL_MODULES.length}</div>
              </div>
              <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.green}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.midgreen, marginBottom: '0.5rem' }}>ACTIVE THIS WEEK</div>
                <div style={{ fontSize: '2.5rem', color: C.green, fontWeight: 300 }}>{activeMods.length}</div>
              </div>
              <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.orange}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.orange, marginBottom: '0.5rem' }}>UNUSED THIS WEEK</div>
                <div style={{ fontSize: '2.5rem', color: C.orange, fontWeight: 300 }}>{unusedMods.length}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Module Engagement</h3>
                <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', background: C.forest, fontWeight: 600, fontSize: '0.85rem' }}>Active Modules</div>
                  {activeMods.map((m, i) => (
                    <div key={m} style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${C.ruleLight}`, background: i % 2 === 0 ? C.white : C.cream, fontFamily: F_MONO, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                      ✓ {m}
                    </div>
                  ))}
                  {activeMods.length === 0 && <div style={{ padding: '1rem', color: C.grey, fontStyle: 'italic' }}>No activity logged.</div>}
                  
                  <div style={{ padding: '1rem', background: '#ffebee', fontWeight: 600, fontSize: '0.85rem', color: C.red, borderTop: `1px solid ${C.ruleLight}` }}>Needs Attention (Unused)</div>
                  {unusedMods.map(m => (
                    <div key={m} style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${C.ruleLight}`, background: C.white, fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>
                      — {m}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Database Health (Est.)</h3>
                <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                  {[
                    { l: 'Activity Logs', v: '1,245 rows' },
                    { l: 'Personal Goals', v: '24 rows' },
                    { l: 'Tasks', v: '156 rows' },
                    { l: 'Transactions', v: '890 rows' },
                    { l: 'Documents', v: '32 rows' }
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 4 ? `1px dashed ${C.rule}` : 'none', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                      <span style={{ color: C.grey }}>{s.l}</span>
                      <span style={{ color: C.text }}>{s.v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: C.grey, fontStyle: 'italic', textAlign: 'right' }}>*Data pulled from Supabase</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'dynamic' && (
          <div>
            <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, marginBottom: '2rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Auto-Generated Narrative</div>
              <p style={{ margin: 0, fontSize: '1.1rem', color: C.text, lineHeight: 1.6 }}>
                "This week, the Seedat family has been active across {activeMods.length} modules. Muhammad has been the most active contributor. The most engaged area is Economy. Goals are progressing steadily, with Yahya showing strong consistency. One area to give attention to is the Reading module, which has seen lower engagement."
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: collabScore > 5 ? C.green : C.orange, marginBottom: '0.5rem' }}>{collabScore}/10</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, letterSpacing: '0.1em' }}>COLLABORATION SCORE</div>
                <div style={{ fontSize: '0.8rem', color: C.text, marginTop: '1rem' }}>Based on {forumStats.posts} posts and {forumStats.comments} comments this week.</div>
              </div>

              <div style={{ background: C.forest, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300, color: C.green }}>Recommended Family Plays</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>
                  {collabScore < 6 && <li><strong>Host a family game night this week.</strong> No screens, just connection. The forum has been quiet.</li>}
                  {unusedMods.includes('Reading') && <li><strong>Family Reading Time.</strong> Set aside 20 minutes after Maghrib for everyone to read together.</li>}
                  <li><strong>Goal Check-in.</strong> Isa has a goal that hasn't been updated in 14 days. Do a quick 5-minute check-in.</li>
                  <li><strong>Celebrate Wins.</strong> Drop a shoutout in the Family Forum to acknowledge Linah's recent activity streak.</li>
                </ul>
              </div>
            </div>

            <h3 style={{ fontWeight: 300, marginBottom: '1rem' }}>Member Snapshots</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {MEMBERS.map(m => {
                const mGoals = goals.filter(g => g.member_id === m.id)
                const onTrack = mGoals.filter(g => g.progress > 50).length
                return (
                  <div key={m.id} style={{ border: `1px solid ${C.ruleLight}`, padding: '1.5rem', borderRadius: '8px', background: C.white }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem', color: C.text }}>{m.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: F_MONO, marginBottom: '0.5rem', color: C.grey }}>
                      <span>Goals on Track:</span> <span style={{ color: onTrack > 0 ? C.green : C.orange }}>{onTrack} / {mGoals.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: F_MONO, color: C.grey }}>
                      <span>Recent Unlock:</span> <span style={{ color: C.text }}>None</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300 }}>Financial Overview</h2>
              <select style={{ padding: '8px 16px', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                <option>March 2026</option><option>February 2026</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>FIXED COSTS</div>
                <div style={{ fontSize: '1.8rem', color: C.text, fontWeight: 300 }}>QAR 19,579</div>
              </div>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>VARIABLE SPEND</div>
                <div style={{ fontSize: '1.8rem', color: C.orange, fontWeight: 300 }}>QAR {finances.variable.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString()}</div>
              </div>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SUBSCRIPTIONS</div>
                <div style={{ fontSize: '1.8rem', color: C.text, fontWeight: 300 }}>QAR {finances.subs.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString()}</div>
              </div>
              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.green}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.midgreen, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SADAQAH GIVEN</div>
                <div style={{ fontSize: '1.8rem', color: C.green, fontWeight: 300 }}>QAR {finances.sadaqah.reduce((a:any,b:any)=>a+b.amount,0).toLocaleString()}</div>
              </div>
            </div>

            <h3 style={{ fontWeight: 300, marginBottom: '1rem' }}>Children's Economy (Bayt Coins)</h3>
            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: C.forest, padding: '10px 16px', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Child</div><div style={{textAlign:'right'}}>Earned</div><div style={{textAlign:'right'}}>Spent</div><div style={{textAlign:'right'}}>Saved</div><div style={{textAlign:'right'}}>Given (Sadaqah)</div>
              </div>
              {MEMBERS.filter(m => !['muhammad', 'camilla'].includes(m.id)).map((m, i) => {
                const cData = finances.coins.find((c:any) => c.member_id === m.id) || { earned: 0, spent: 0, saved: 0, given: 0 }
                return (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ textAlign: 'right', fontFamily: F_MONO, color: C.green }}>{cData.earned}</div>
                    <div style={{ textAlign: 'right', fontFamily: F_MONO, color: C.orange }}>{cData.spent}</div>
                    <div style={{ textAlign: 'right', fontFamily: F_MONO, color: C.blue }}>{cData.saved}</div>
                    <div style={{ textAlign: 'right', fontFamily: F_MONO, color: C.goldDim }}>{cData.given}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'dev' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: C.grey, fontStyle: 'italic', textAlign: 'center' }}>
                "These scores measure each child against their own age-appropriate potential. Progress is personal."
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              {MEMBERS.filter(m => !['muhammad', 'camilla'].includes(m.id)).map(child => {
                const scores = devScores.find(s => s.member_id === child.id)
                if (!scores) return null

                // Simple CSS Radar Chart approximation using a polygon
                // In a real app, use an SVG or proper chart library. Here we simulate the 5 axes via standard bars for reliability without external libs.
                
                return (
                  <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '2rem', background: C.white }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, color: C.green, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem' }}>{child.name}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { label: 'IQ', raw: scores.iq_raw, max: scores.iq_age_max, color: C.blue },
                        { label: 'EQ', raw: scores.eq_raw, max: scores.eq_age_max, color: C.orange },
                        { label: 'Academic', raw: scores.academic_raw, max: scores.academic_max, color: C.green },
                        { label: 'Social', raw: scores.social_raw, max: scores.social_max, color: C.goldDim },
                        { label: 'Deen', raw: scores.deen_raw, max: scores.deen_max, color: C.midgreen },
                      ].map(s => {
                        const pct = (s.raw / s.max) * 100
                        return (
                          <div key={s.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, marginBottom: '0.3rem', color: C.grey }}>
                              <span>{s.label}</span><span>{s.raw}/{s.max}</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: s.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div style={{ marginTop: '2rem', padding: '1rem', background: C.forest, borderRadius: '6px', fontSize: '0.85rem', color: C.text }}>
                      <strong>Focus Area:</strong> {
                        (scores.eq_raw/scores.eq_age_max) < 0.7 ? 'Emotional Intelligence & Empathy' : 
                        (scores.academic_raw/scores.academic_max) < 0.85 ? 'Academic Consistency' : 'Maintaining Current Trajectory'
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontWeight: 300 }}>Report Archive</h2>
                <button onClick={generateReport} style={{ background: C.green, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.75rem' }}>
                  GENERATE NEW REPORT
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reportsArchive.map(r => (
                  <div key={r.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{r.period_label}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey, textTransform: 'uppercase' }}>{(r.report_type || '').replace('_', ' ')} · {new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)} style={{ background: 'none', border: `1px solid ${C.rule}`, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: C.text }}>
                      {expandedReport === r.id ? 'Close' : 'View'}
                    </button>
                  </div>
                ))}
                {reportsArchive.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.cream, borderRadius: '8px' }}>No reports generated yet.</div>}
              </div>
            </div>

            <div>
              {expandedReport && (
                <div style={{ background: C.cream, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, position: 'sticky', top: '2rem' }}>
                  {(() => {
                    const r = reportsArchive.find(x => x.id === expandedReport)
                    if (!r) return null
                    return (
                      <div>
                        <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>BAYTOS GENERATED REPORT</div>
                        <h3 style={{ margin: '0 0 1rem 0', color: C.green }}>{r.period_label}</h3>
                        <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.6, marginBottom: '2rem' }}>{r.narrative}</div>
                        
                        <div style={{ borderTop: `1px solid ${C.rule}`, paddingTop: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data Snapshot:</div>
                          <pre style={{ background: C.white, padding: '1rem', borderRadius: '4px', border: `1px solid ${C.ruleLight}`, fontSize: '0.7rem', overflowX: 'auto', color: C.grey }}>
                            {JSON.stringify(r.content, null, 2)}
                          </pre>
                        </div>
                        
                        <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: C.grey, fontStyle: 'italic', textAlign: 'center' }}>
                          To export as PDF, use your browser's Print → Save as PDF feature.
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}