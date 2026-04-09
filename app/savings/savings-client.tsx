// app/savings/savings-client.tsx
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

export default function SavingsGoals() {
  const supabase = createClient()
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: g } = await supabase.from('savings_goals').select('*')
    const { data: m } = await supabase.from('family_members').select('*')
    setGoals(g || [])
    setMembers(m || [])
    setLoading(false)
  }

  const getMotivation = (role) => {
    if (role.includes('Eldest')) return "Keep leading the way"
    if (role.includes('Second')) return "You're building something"
    if (role.includes('First Daughter')) return "Your giving shines"
    return "Keep creating"
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO }}>Mapping dreams...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ color: C.text, fontSize: '2.2rem', margin: 0 }}>Savings Goals</h1>
        <div style={{ fontFamily: F_ARAB, color: C.gold, fontSize: '1.5rem' }}>الأهداف المالية</div>
        <p style={{ color: C.grey, fontSize: '0.9rem', marginTop: '10px' }}>Saving is intentional, not accidental.</p>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {['all', 'by-child', 'progress'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: `1px solid ${C.rule}`,
              background: tab === t ? C.text : C.white,
              color: tab === t ? C.white : C.text,
              cursor: 'pointer',
              fontFamily: F_MONO,
              fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
          {goals.map(goal => {
            const child = members.find(m => m.id === goal.child_id)
            const pct = Math.min((goal.saved_coins / goal.target_coins) * 100, 100)
            return (
              <div key={goal.id} style={{ background: C.white, padding: '25px', borderRadius: '15px', border: `1px solid ${C.rule}`, position: 'relative', opacity: goal.completed ? 0.7 : 1 }}>
                {goal.completed && <div style={{ position: 'absolute', top: 10, right: 10, color: C.gold, fontSize: '1.5rem' }}>✅</div>}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '2.5rem' }}>{goal.icon || '🎯'}</div>
                  <div>
                    <h3 style={{ margin: 0 }}>{goal.name}</h3>
                    <span style={{ fontSize: '0.7rem', background: (child?.color || C.green) + '22', color: child?.color || C.green, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {child ? child.name : 'FAMILY'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                  <span>🪙 {goal.saved_coins} / {goal.target_coins}</span>
                  <span>{Math.round(pct)}%</span>
                </div>

                <div style={{ height: '10px', background: C.cream, borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: child?.color || C.green, transition: 'width 0.5s' }} />
                </div>

                {goal.deadline && (
                  <div style={{ marginTop: '15px', fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO }}>
                    TARGET DATE: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'progress' && (
        <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: '15px', padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO }}>COMPLETED</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{goals.filter(g => g.completed).length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO }}>TOTAL SAVED</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.gold }}>🪙 {goals.reduce((acc, g) => acc + g.saved_coins, 0)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {members.map(child => {
              const childGoals = goals.filter(g => g.child_id === child.id)
              if (childGoals.length === 0) return null
              return (
                <div key={child.id} style={{ padding: '15px', background: C.cream, borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{child.name}</span>
                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: C.grey }}>"{getMotivation(child.role)}"</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: C.midgreen }}>
                    {childGoals.filter(g => g.completed).length} of {childGoals.length} goals achieved
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px', background: C.cream, borderRadius: '15px', color: C.grey }}>
          "Every big achievement started with a small, consistent action."
        </div>
      )}
    </div>
  )
}