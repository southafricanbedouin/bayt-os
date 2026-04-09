// app/budget/budget-client.tsx
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

const DEFAULT_CATEGORIES = [
  { id: 'groceries', icon: '🛒', label: 'Groceries', budget: 3000 },
  { id: 'dineout', icon: '🍽️', label: 'Dine Out', budget: 1500 },
  { id: 'takeout', icon: '🥡', label: 'Take Out', budget: 800 },
  { id: 'leisure', icon: '🎡', label: 'Leisure', budget: 1000 },
  { id: 'fuel', icon: '⛽', label: 'Fuel', budget: 600 },
  { id: 'barber', icon: '✂️', label: 'Barber', budget: 200 },
  { id: 'other', icon: '📦', label: 'Other', budget: 500 },
  { id: 'adhoc', icon: '⚡', label: 'Adhoc', budget: 500 },
]

const FIXED_COSTS = [
  { name: 'Rent', amount: 13000 },
  { name: 'Vodafone', amount: 399 },
  { name: 'Ooredoo Camilla', amount: 140 },
  { name: 'Ooredoo Muhammad', amount: 140 },
  { name: 'Maid', amount: 3000 },
  { name: 'Hamilton Transport', amount: 1400 },
  { name: 'School Bus', amount: 1500 },
]
const FIXED_TOTAL = FIXED_COSTS.reduce((s, c) => s + c.amount, 0)
const AVG_ELEC = 928 // Hardcoded from expenses-tracker BILLS avg

function genMonths() {
  const months = []
  const now = new Date()
  let y = 2025, m = 1
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    months.push({ key: `${y}-${String(m).padStart(2, '0')}`, label: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${y}`, y, m })
    m++; if (m > 12) { m = 1; y++ }
  }
  return months.reverse()
}
const MONTHS = genMonths()

export default function BudgetPlanner() {
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [selMonth, setSelMonth] = useState(MONTHS[0].key)
  const [budgets, setBudgets] = useState<Record<string, Record<string, number>>>({})
  const [actuals, setActuals] = useState<Record<string, Record<string, number>>>({})
  const [income, setIncome] = useState({ muhammad: '', camilla: '', other: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: bData } = await supabase.from('monthly_budgets').select('*')
      const { data: aData } = await supabase.from('variable_expenses').select('*')
      
      const parsedBudgets: any = {}
      const parsedActuals: any = {}

      if (bData && bData.length > 0) {
        bData.forEach(b => {
          const mKey = `${b.year}-${String(b.month).padStart(2,'0')}`
          if (!parsedBudgets[mKey]) parsedBudgets[mKey] = {}
          parsedBudgets[mKey][b.category] = Number(b.budget_qar)
        })
      } else {
        const lsB = localStorage.getItem('bayt-budgets')
        if (lsB) Object.assign(parsedBudgets, JSON.parse(lsB))
      }

      if (aData && aData.length > 0) {
        aData.forEach(a => {
          const mKey = `${a.year}-${String(a.month).padStart(2,'0')}`
          if (!parsedActuals[mKey]) parsedActuals[mKey] = {}
          parsedActuals[mKey][a.category] = Number(a.amount_qar)
        })
      } else {
        const lsA = localStorage.getItem('bayt-variable-expenses-v1')
        if (lsA) Object.assign(parsedActuals, JSON.parse(lsA))
      }

      const lsInc = localStorage.getItem(`bayt-income-${selMonth}`)
      if (lsInc) setIncome(JSON.parse(lsInc))

      setBudgets(parsedBudgets)
      setActuals(parsedActuals)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetChange = async (catId: string, val: string) => {
    const num = parseFloat(val) || 0
    const newBudgets = { ...budgets, [selMonth]: { ...(budgets[selMonth] || {}), [catId]: num } }
    setBudgets(newBudgets)
    localStorage.setItem('bayt-budgets', JSON.stringify(newBudgets))

    const [year, month] = selMonth.split('-').map(Number)
    try {
      await supabase.from('monthly_budgets').upsert({ year, month, category: catId, budget_qar: num }, { onConflict: 'year,month,category' })
    } catch (e) {}
  }

  const handleIncomeChange = (field: string, val: string) => {
    const newInc = { ...income, [field]: val }
    setIncome(newInc)
    localStorage.setItem(`bayt-income-${selMonth}`, JSON.stringify(newInc))
  }

  const currentBudgets = budgets[selMonth] || {}
  const currentActuals = actuals[selMonth] || {}

  const totalBudget = DEFAULT_CATEGORIES.reduce((s, c) => s + (currentBudgets[c.id] ?? c.budget), 0)
  const totalActual = DEFAULT_CATEGORIES.reduce((s, c) => s + (currentActuals[c.id] || 0), 0)
  const totalIncome = (parseFloat(income.muhammad)||0) + (parseFloat(income.camilla)||0) + (parseFloat(income.other)||0)
  const netPosition = totalIncome - FIXED_TOTAL - AVG_ELEC - totalActual

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading budget data...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · FINANCE</div>
          <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 300 }}>Budget Planner</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>ميزانية البيت</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <select 
            value={selMonth} 
            onChange={(e) => {
              setSelMonth(e.target.value)
              const inc = localStorage.getItem(`bayt-income-${e.target.value}`)
              if(inc) setIncome(JSON.parse(inc))
              else setIncome({muhammad:'', camilla:'', other:''})
            }}
            style={{ padding: '8px 16px', background: C.forest, color: C.text, border: 'none', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
          >
            {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['overview', 'trend', 'fixed', 'pnl'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'overview' ? '📊 Overview' : t === 'trend' ? '📅 Trend' : t === 'fixed' ? '🏠 Fixed' : '📋 P&L'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none' }}>
        
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: C.cream, padding: '1.2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>TOTAL BUDGETED</div>
                <div style={{ fontSize: '1.8rem', color: C.text, margin: '8px 0' }}>QAR {totalBudget.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_SANS }}>Sabr: budget with intention</div>
              </div>
              <div style={{ background: C.cream, padding: '1.2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>ACTUAL SPENT</div>
                <div style={{ fontSize: '1.8rem', color: C.goldDim, margin: '8px 0' }}>QAR {totalActual.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_SANS }}>From variable expenses log</div>
              </div>
              <div style={{ background: totalBudget - totalActual >= 0 ? '#e8f5e9' : '#ffebee', padding: '1.2rem', borderRadius: '8px', border: `1px solid ${totalBudget - totalActual >= 0 ? '#c8e6c9' : '#ffcdd2'}` }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: totalBudget - totalActual >= 0 ? C.midgreen : C.orange, letterSpacing: '0.1em' }}>VARIANCE</div>
                <div style={{ fontSize: '1.8rem', color: totalBudget - totalActual >= 0 ? C.midgreen : C.orange, margin: '8px 0' }}>
                  {totalBudget - totalActual >= 0 ? '+' : ''}{(totalBudget - totalActual).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: totalBudget - totalActual >= 0 ? C.midgreen : C.orange, fontFamily: F_SANS }}>
                  {totalBudget - totalActual >= 0 ? 'Under budget' : 'Over budget'}
                </div>
              </div>
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', background: C.forest, padding: '12px 16px', fontSize: '0.6rem', fontFamily: F_MONO, letterSpacing: '0.1em', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Category</div><div>Budget</div><div>Actual</div><div>Variance</div><div>Progress</div>
              </div>
              {DEFAULT_CATEGORIES.map((c, i) => {
                const bVal = currentBudgets[c.id] ?? c.budget
                const aVal = currentActuals[c.id] || 0
                const diff = bVal - aVal
                const pct = bVal > 0 ? Math.min((aVal / bVal) * 100, 100) : 0
                return (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', padding: '12px 16px', alignItems: 'center', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>{c.icon} {c.label}</div>
                    <div>
                      <input 
                        type="number" value={bVal} 
                        onChange={(e) => handleBudgetChange(c.id, e.target.value)}
                        style={{ width: '80px', padding: '4px 8px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.8rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ fontFamily: F_MONO, color: C.text }}>{aVal.toLocaleString()}</div>
                    <div style={{ fontFamily: F_MONO, color: diff >= 0 ? C.midgreen : C.orange }}>{diff >= 0 ? '+' : ''}{diff.toLocaleString()}</div>
                    <div style={{ height: '8px', background: C.ruleLight, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct > 90 ? C.orange : C.green, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'trend' && (
          <div>
            <h3 style={{ marginTop: 0, fontFamily: F_SANS, fontWeight: 300 }}>Six Month Trend (All Variable Spend)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '20px', padding: '20px 0', borderBottom: `1px solid ${C.rule}` }}>
              {MONTHS.slice(0, 6).reverse().map(m => {
                const mActuals = actuals[m.key] || {}
                const sum = Object.values(mActuals).reduce((a, b) => a + Number(b), 0)
                const max = 10000 // arbitrary max for scale
                const h = Math.min((sum / max) * 100, 100)
                return (
                  <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim }}>{sum.toLocaleString()}</div>
                    <div style={{ width: '40px', height: `${h}%`, background: C.green, borderRadius: '4px 4px 0 0', opacity: m.key === selMonth ? 1 : 0.6 }} />
                    <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey }}>{m.label.split(' ')[0]}</div>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '0.8rem', color: C.grey, marginTop: '20px', textAlign: 'center' }}>"Ilmu: know where every riyal goes."</p>
          </div>
        )}

        {tab === 'fixed' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: C.cream, padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>TOTAL FIXED + AVG ELEC</div>
              <div style={{ fontSize: '2rem', color: C.text, margin: '10px 0' }}>QAR {(FIXED_TOTAL + AVG_ELEC).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FIXED_COSTS.map(f => (
                <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontFamily: F_MONO }}>QAR {f.amount.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: C.forest, border: `1px solid ${C.ruleLight}`, borderRadius: '6px' }}>
                <span>⚡ Kahramaa (Average)</span>
                <span style={{ fontFamily: F_MONO }}>QAR {AVG_ELEC.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'pnl' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: `1px solid ${C.rule}`, paddingBottom: '10px' }}>Income</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: '5px' }}>MUHAMMAD SALARY</label>
                <input type="number" value={income.muhammad} onChange={e => handleIncomeChange('muhammad', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${C.rule}`, fontFamily: F_MONO, outline: 'none' }} placeholder="0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: '5px' }}>CAMILLA INCOME</label>
                <input type="number" value={income.camilla} onChange={e => handleIncomeChange('camilla', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${C.rule}`, fontFamily: F_MONO, outline: 'none' }} placeholder="0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: '5px' }}>OTHER</label>
                <input type="number" value={income.other} onChange={e => handleIncomeChange('other', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${C.rule}`, fontFamily: F_MONO, outline: 'none' }} placeholder="0" />
              </div>
            </div>

            <h3 style={{ borderBottom: `1px solid ${C.rule}`, paddingBottom: '10px' }}>Outgoings</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
              <span style={{ color: C.grey }}>Fixed Costs & Utilities</span>
              <span style={{ fontFamily: F_MONO }}>- {Math.round(FIXED_TOTAL + AVG_ELEC).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
              <span style={{ color: C.grey }}>Variable Actuals</span>
              <span style={{ fontFamily: F_MONO }}>- {Math.round(totalActual).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: netPosition >= 0 ? C.green : C.orange, color: C.white, borderRadius: '8px', marginTop: '20px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Net Position</span>
              <span style={{ fontFamily: F_MONO, fontSize: '1.2rem', fontWeight: 600 }}>QAR {netPosition.toLocaleString()}</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.grey, marginTop: '15px' }}>Sidq: honest accounting, no hiding from numbers.</p>
          </div>
        )}

      </main>
    </div>
  )
}