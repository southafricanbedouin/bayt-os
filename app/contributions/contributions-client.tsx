// app/contributions/contributions-client.tsx
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
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

const MEMBERS = [
  { id: 'muhammad', name: 'Muhammad', color: C.midgreen },
  { id: 'camilla', name: 'Camilla', color: C.green },
  { id: 'yahya', name: 'Yahya', color: C.blue },
  { id: 'isa', name: 'Isa', color: C.goldDim },
  { id: 'linah', name: 'Linah', color: C.orange },
  { id: 'dana', name: 'Dana', color: '#7ab87a' }
]

const MODULES: Record<string, { label: string, color: string, icon: string }> = {
  'family-coin': { label: 'Economy', color: C.goldDim, icon: '🪙' },
  'education': { label: 'School', color: C.blue, icon: '📚' },
  'deen': { label: 'Deen', color: C.green, icon: '🕌' },
  'shopping': { label: 'Household', color: C.orange, icon: '🛒' },
  'health': { label: 'Health', color: '#c0392b', icon: '🏥' },
  'reading': { label: 'Library', color: '#8e44ad', icon: '📖' },
  'character': { label: 'Akhlaq', color: C.midgreen, icon: '🌟' }
}

export default function ContributionsView() {
  const [tab, setTab] = useState('feed')
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchData()
    // In a real app, set up a Supabase realtime subscription here
    const interval = setInterval(fetchData, 60000) // Poll fallback
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('activity_log').select('*').order('logged_at', { ascending: false }).limit(100)
      if (data && data.length > 0) {
        setLogs(data)
      } else {
        // Dummy data for visual presentation if DB empty
        setLogs([
          { id: '1', member_id: 'yahya', action_type: 'task_complete', module: 'education', description: 'Completed Maths Homework', points: 5, logged_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: '2', member_id: 'camilla', action_type: 'shopping_done', module: 'shopping', description: 'Completed Carrefour List', points: 15, logged_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
          { id: '3', member_id: 'isa', action_type: 'reading_logged', module: 'reading', description: 'Read 15 pages of Harry Potter', points: 10, logged_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
          { id: '4', member_id: 'linah', action_type: 'sadaqah_logged', module: 'deen', description: 'Gave 5 coins to Sadaqah', points: 20, logged_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
          { id: '5', member_id: 'muhammad', action_type: 'goal_update', module: 'character', description: 'Updated Sabr goal progress', points: 5, logged_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        ])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // Leaderboard calcs
  const leaderData = MEMBERS.map(m => {
    const mLogs = logs.filter(l => l.member_id === m.id)
    const points = mLogs.reduce((acc, l) => acc + (l.points || 0), 0)
    
    const modCounts: Record<string, number> = {}
    mLogs.forEach(l => { if(l.module) modCounts[l.module] = (modCounts[l.module] || 0) + 1 })
    const topMod = Object.entries(modCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'none'

    return { ...m, points, actions: mLogs.length, topMod }
  }).sort((a,b) => b.points - a.points)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Connecting to BaytOS pulse...</div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${C.ruleLight}` }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.grey, textTransform: 'uppercase', marginBottom: '0.5rem' }}>System Telemetry</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300, color: C.text }}>Family Contributions</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
          <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.green }}>SYSTEM LIVE</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderLeft: `1px solid ${C.ruleLight}`, borderRight: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'feed', label: '📡 Live Feed' },
          { id: 'trends', label: '📊 Usage Trends' },
          { id: 'leaderboard', label: '🏅 Leaderboard' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '1px solid ' + C.ruleLight,
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.cream, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {logs.map((l, i) => {
              const member = MEMBERS.find(m => m.id === l.member_id)
              const mod = MODULES[l.module] || { label: l.module || 'System', color: C.grey, icon: '⚙️' }
              return (
                <div key={l.id || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: C.white, padding: '1rem 1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: member?.color || C.grey, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontFamily: F_MONO }}>
                    {member?.name.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member?.name}</span>
                      <span style={{ color: C.grey, fontSize: '0.9rem' }}>{l.description}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontFamily: F_MONO, fontSize: '0.7rem' }}>
                      <span style={{ color: C.grey }}>{timeAgo(l.logged_at)}</span>
                      <span style={{ background: mod.color + '22', color: mod.color, padding: '0.1rem 0.5rem', borderRadius: '12px' }}>{mod.icon} {mod.label.toUpperCase()}</span>
                    </div>
                  </div>
                  {l.points > 0 && (
                    <div style={{ fontFamily: F_MONO, fontSize: '1.1rem', fontWeight: 600, color: C.goldDim }}>
                      +{l.points}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'trends' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, textAlign: 'center' }}>Activity by Module</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(MODULES).map(([k, v]) => {
                  const count = logs.filter(l => l.module === k).length
                  const max = Math.max(...Object.keys(MODULES).map(mod => logs.filter(l => l.module === mod).length), 1)
                  const pct = (count / max) * 100
                  return (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: F_MONO, marginBottom: '0.3rem', color: C.grey }}>
                        <span>{v.icon} {v.label}</span>
                        <span>{count} actions</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: v.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, textAlign: 'center' }}>System Health</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2.5rem', color: C.green, fontWeight: 300 }}>{logs.length}</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey, letterSpacing: '0.1em' }}>TOTAL ACTIONS (7D)</div>
                </div>
                <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2.5rem', color: C.goldDim, fontWeight: 300 }}>{Object.keys(MODULES).filter(m => logs.some(l => l.module === m)).length}/7</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey, letterSpacing: '0.1em' }}>MODULES ACTIVE</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: C.grey, marginTop: '2rem', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
                A healthy family OS shows distributed activity across all pillars: education, economy, deen, and household management.
              </p>
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaderData.map((m, i) => {
                const topModInfo = MODULES[m.topMod] || { label: 'General', color: C.grey, icon: '⚙️' }
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: C.white, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${i === 0 ? C.gold : C.ruleLight}`, position: 'relative', overflow: 'hidden' }}>
                    {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: C.gold }} />}
                    
                    <div style={{ fontSize: '2rem', fontFamily: F_MONO, color: i === 0 ? C.gold : C.rule, fontWeight: 300, width: '30px', textAlign: 'center' }}>
                      {i + 1}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.2rem', color: C.text, marginBottom: '0.2rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>{m.actions} actions logged</div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: C.green, fontFamily: F_MONO }}>{m.points} <span style={{ fontSize: '0.8rem', color: C.grey, fontWeight: 400 }}>pts</span></div>
                      <div style={{ fontSize: '0.7rem', color: topModInfo.color, marginTop: '4px', fontFamily: F_MONO, background: topModInfo.color + '15', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                        TOP: {topModInfo.icon} {topModInfo.label.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: C.grey, marginTop: '2rem', fontStyle: 'italic' }}>
              This is not a competition. It shows who's showing up. Everyone is measured against their own best.
            </p>
          </div>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(26, 61, 40, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(26, 61, 40, 0); }
          100% { box-shadow: 0 0 0 0 rgba(26, 61, 40, 0); }
        }
      `}} />
    </div>
  )
}