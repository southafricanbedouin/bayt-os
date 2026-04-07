'use client'

import { useState, useEffect } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────
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
  red:       '#c0392b',
}
const F_SANS  = 'var(--font-sans), Georgia, serif'
const F_MONO  = 'var(--font-mono), monospace'

// ── Fixed costs default data ──────────────────────────────────────────────
interface FixedCost {
  id: string
  icon: string
  name: string
  detail: string
  amount: number
  category: string
}

const DEFAULT_FIXED_COSTS: FixedCost[] = [
  { id:'rent',            icon:'🏠', name:'Rent',                    detail:'B26 Al Reem Gardens, Al Wajba',  amount:13000, category:'Housing'   },
  { id:'vodafone',        icon:'🌐', name:'Vodafone Giga Home 2GBPS', detail:'Acct: 1203644795162',            amount:399,   category:'Utilities' },
  { id:'ooredoo-camilla', icon:'📱', name:'Ooredoo — Camilla',        detail:'Mobile',                        amount:140,   category:'Utilities' },
  { id:'ooredoo-muhammad',icon:'📱', name:'Ooredoo — Muhammad',       detail:'Mobile',                        amount:140,   category:'Utilities' },
  { id:'maid',            icon:'🧹', name:'Maid Service',             detail:'Monthly',                       amount:3000,  category:'Household' },
  { id:'hamilton',        icon:'🚌', name:'Hamilton Transport',       detail:'Monthly',                       amount:1400,  category:'Transport' },
  { id:'school-bus',      icon:'🏫', name:'School Bus',               detail:'Monthly',                       amount:1500,  category:'Transport' },
]

// ── Variable expense categories ───────────────────────────────────────────
const VAR_CATS = [
  { id:'groceries', icon:'🛒', label:'Groceries',  sub:'Talabat · The Grocer · Carrefour · Spar · FFC' },
  { id:'dineout',   icon:'🍽️', label:'Dine Out',   sub:'' },
  { id:'takeout',   icon:'🥡', label:'Take Out',   sub:'' },
  { id:'leisure',   icon:'🎡', label:'Leisure',    sub:'' },
  { id:'fuel',      icon:'⛽', label:'Fuel',       sub:'' },
  { id:'barber',    icon:'✂️', label:'Barber',     sub:'' },
  { id:'other',     icon:'📦', label:'Other',      sub:'' },
  { id:'adhoc',     icon:'⚡', label:'Adhoc',      sub:'' },
]

type VarMonth = Record<string, number>
type VarData  = Record<string, VarMonth>

// Generate months Jan 2025 → current month
function genMonths() {
  const months = []
  const now = new Date()
  let y = 2025, m = 1
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    const key   = `${y}-${String(m).padStart(2,'0')}`
    const label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${y}`
    months.push({ key, label, y, m })
    m++; if (m > 12) { m = 1; y++ }
  }
  return months.reverse()
}
const MONTHS = genMonths()

// ── Actual Kahramaa QAR Bill amounts ─────────────────────────────────────
const BILLS: { y:number; m:number; label:string; shortLabel:string; bill:number }[] = [
  { y:2024, m:8,  label:'Aug 2024', shortLabel:'Aug', bill:1610 },
  { y:2024, m:9,  label:'Sep 2024', shortLabel:'Sep', bill:1486 },
  { y:2024, m:10, label:'Oct 2024', shortLabel:'Oct', bill:1369 },
  { y:2024, m:11, label:'Nov 2024', shortLabel:'Nov', bill:1127 },
  { y:2024, m:12, label:'Dec 2024', shortLabel:'Dec', bill:517  },
  { y:2025, m:1,  label:'Jan 2025', shortLabel:'Jan', bill:321  },
  { y:2025, m:2,  label:'Feb 2025', shortLabel:'Feb', bill:617  },
  { y:2025, m:3,  label:'Mar 2025', shortLabel:'Mar', bill:666  },
  { y:2025, m:4,  label:'Apr 2025', shortLabel:'Apr', bill:981  },
  { y:2025, m:5,  label:'May 2025', shortLabel:'May', bill:1154 },
  { y:2025, m:6,  label:'Jun 2025', shortLabel:'Jun', bill:1190 },
  { y:2025, m:7,  label:'Jul 2025', shortLabel:'Jul', bill:1154 },
  { y:2025, m:8,  label:'Aug 2025', shortLabel:'Aug', bill:1496 },
  { y:2025, m:9,  label:'Sep 2025', shortLabel:'Sep', bill:1500 },
  { y:2025, m:10, label:'Oct 2025', shortLabel:'Oct', bill:1158 },
  { y:2025, m:11, label:'Nov 2025', shortLabel:'Nov', bill:757  },
  { y:2025, m:12, label:'Dec 2025', shortLabel:'Dec', bill:1376 },
  { y:2026, m:1,  label:'Jan 2026', shortLabel:'Jan', bill:493  },
  { y:2026, m:2,  label:'Feb 2026', shortLabel:'Feb', bill:425  },
  { y:2026, m:3,  label:'Mar 2026', shortLabel:'Mar', bill:494  },
]

// ── kWh cumulative meter readings ─────────────────────────────────────────
const KWH_READINGS = [
  { label:'Oct 23', cumul:282030 },{ label:'Nov 23', cumul:287270 },{ label:'Dec 23', cumul:290602 },
  { label:'Jan 24', cumul:293651 },{ label:'Feb 24', cumul:296631 },{ label:'Mar 24', cumul:300017 },
  { label:'Apr 24', cumul:304835 },{ label:'May 24', cumul:310203 },{ label:'Jun 24', cumul:318007 },
  { label:'Jul 24', cumul:324792 },{ label:'Aug 24', cumul:331091 },{ label:'Sep 24', cumul:340532 },
  { label:'Oct 24', cumul:347531 },{ label:'Nov 24', cumul:353475 },{ label:'Dec 24', cumul:356504 },
  { label:'Jan 25', cumul:358643 },{ label:'Feb 25', cumul:361812 },{ label:'Mar 25', cumul:365070 },
  { label:'Apr 25', cumul:370535 },{ label:'May 25', cumul:377114 },{ label:'Jun 25', cumul:383880 },
  { label:'Jul 25', cumul:390635 },{ label:'Aug 25', cumul:399373 },{ label:'Sep 25', cumul:407822 },
  { label:'Oct 25', cumul:413906 },{ label:'Nov 25', cumul:418657 },{ label:'Dec 25', cumul:421853 },
  { label:'Jan 26', cumul:423593 },{ label:'Feb 26', cumul:425856 },{ label:'Mar 26', cumul:429073 },
]
const KWH_MONTHLY = KWH_READINGS.slice(1).map((r, i) => ({
  label: r.label,
  kwh: r.cumul - KWH_READINGS[i].cumul,
  cumul: r.cumul,
}))

// ── Helpers ───────────────────────────────────────────────────────────────
const byYear    = (yr:number) => BILLS.filter(r => r.y === yr)
const yearTotal = (yr:number) => byYear(yr).reduce((s,r) => s + r.bill, 0)
const yearAvg   = (yr:number) => { const rows = byYear(yr); return rows.length ? Math.round(yearTotal(yr)/rows.length) : 0 }
const qar       = (n:number)  => `QAR ${n.toLocaleString()}`
const fmt       = (n:number)  => n.toLocaleString()

const LATEST    = BILLS[BILLS.length - 1]
const ALL_BILLS = BILLS.map(r => r.bill)
const CHART_MAX = Math.max(...ALL_BILLS)

function season(m:number): { label:string; color:string } {
  if (m >= 6 && m <= 9) return { label:'☀️ Peak',     color:C.orange }
  if ((m >= 4 && m <= 5) || m === 10 || m === 11) return { label:'🌤 Shoulder', color:C.gold }
  return { label:'❄️ Winter',  color:C.blue }
}

// ── Bar chart ─────────────────────────────────────────────────────────────
function BarChart({ rows, max }: { rows: typeof BILLS; max:number }) {
  const [hovered, setHovered] = useState<number|null>(null)
  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:140, marginBottom:6 }}>
        {rows.map((r,i) => {
          const pct = max > 0 ? (r.bill / max) * 100 : 0
          const isHov = hovered === i
          const s = season(r.m)
          return (
            <div
              key={r.label}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', cursor:'pointer', position:'relative' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div style={{ position:'absolute', bottom:'100%', marginBottom:6, background:C.text, color:C.white, fontFamily:F_MONO, fontSize:9, padding:'4px 8px', borderRadius:4, whiteSpace:'nowrap', zIndex:20 }}>
                  {r.label}: {qar(r.bill)}
                </div>
              )}
              <div style={{ width:'100%', height:`${Math.max(pct, 2)}%`, background: isHov ? C.gold : s.color, borderRadius:'3px 3px 0 0', transition:'background 0.15s', opacity: isHov ? 1 : 0.78 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:5 }}>
        {rows.map(r => (
          <div key={r.label} style={{ flex:1, fontFamily:F_MONO, fontSize:7, color:C.grey, textAlign:'center' }}>{r.shortLabel}</div>
        ))}
      </div>
    </div>
  )
}

// ── kWh bar chart ─────────────────────────────────────────────────────────
function KwhChart({ rows }: { rows: typeof KWH_MONTHLY }) {
  const [hovered, setHovered] = useState<number|null>(null)
  const max = Math.max(...rows.map(r => r.kwh))
  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:120, marginBottom:6 }}>
        {rows.map((r,i) => {
          const pct = max > 0 ? (r.kwh / max) * 100 : 0
          const isHov = hovered === i
          const monthStr = r.label.split(' ')[0]
          const mIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(monthStr) + 1
          const s = season(mIdx)
          return (
            <div
              key={r.label}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', cursor:'pointer', position:'relative' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div style={{ position:'absolute', bottom:'100%', marginBottom:6, background:C.text, color:C.white, fontFamily:F_MONO, fontSize:9, padding:'4px 8px', borderRadius:4, whiteSpace:'nowrap', zIndex:20 }}>
                  {r.label}: {fmt(r.kwh)} kWh
                </div>
              )}
              <div style={{ width:'100%', height:`${Math.max(pct, 2)}%`, background: isHov ? C.gold : s.color, borderRadius:'3px 3px 0 0', transition:'background 0.15s', opacity: isHov ? 1 : 0.75 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {rows.map((r,i) => (
          <div key={r.label} style={{ flex:1, fontFamily:F_MONO, fontSize:6, color:C.grey, textAlign:'center' }}>
            {i % 3 === 0 ? r.label.split(' ')[0] : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────
function Stat({ label, value, sub, color }: { label:string; value:string; sub?:string; color?:string }) {
  return (
    <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.85rem 1rem' }}>
      <div style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.2em', color:C.grey, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:'1.35rem', fontWeight:300, color:color||C.gold, fontFamily:F_SANS, lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily:F_MONO, fontSize:'0.45rem', color:C.grey, marginTop:4 }}>{sub}</div>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════════════
type Tab = 'overview' | 'fixed' | 'variable' | 'bills' | 'consumption'
type YrKey = 2024 | 2025 | 2026

export default function ExpensesTracker() {
  const [tab, setTab]               = useState<Tab>('overview')
  const [activeYear, setYear]       = useState<YrKey>(2026)

  // Fixed costs — load from localStorage
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(DEFAULT_FIXED_COSTS)
  const [editMode, setEditMode]     = useState(false)
  const [editValues, setEditValues] = useState<Record<string, { amount:string; detail:string }>>({})

  // Variable expenses — load from localStorage
  const [varData, setVarData]       = useState<VarData>({})
  const [selMonth, setSelMonth]     = useState(MONTHS[0].key)
  const [varInputs, setVarInputs]   = useState<Record<string, string>>({})
  const [varSaved, setVarSaved]     = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const fc = localStorage.getItem('bayt-fixed-costs-v1')
      if (fc) setFixedCosts(JSON.parse(fc))
      const vd = localStorage.getItem('bayt-variable-expenses-v1')
      if (vd) setVarData(JSON.parse(vd))
    } catch {}
  }, [])

  // When month changes, load that month's variable data into inputs
  useEffect(() => {
    const monthData = varData[selMonth] || {}
    const inputs: Record<string, string> = {}
    VAR_CATS.forEach(c => { inputs[c.id] = monthData[c.id] ? String(monthData[c.id]) : '' })
    setVarInputs(inputs)
    setVarSaved(false)
  }, [selMonth, varData])

  // Enter edit mode — snapshot current values
  const startEdit = () => {
    const snap: Record<string, { amount:string; detail:string }> = {}
    fixedCosts.forEach(fc => { snap[fc.id] = { amount: String(fc.amount), detail: fc.detail } })
    setEditValues(snap)
    setEditMode(true)
  }

  // Save fixed costs edits
  const saveEdit = () => {
    const updated = fixedCosts.map(fc => ({
      ...fc,
      amount: parseFloat(editValues[fc.id]?.amount || String(fc.amount)) || fc.amount,
      detail: editValues[fc.id]?.detail ?? fc.detail,
    }))
    setFixedCosts(updated)
    localStorage.setItem('bayt-fixed-costs-v1', JSON.stringify(updated))
    setEditMode(false)
  }

  // Save variable month
  const saveVar = () => {
    const monthData: VarMonth = {}
    VAR_CATS.forEach(c => { monthData[c.id] = parseFloat(varInputs[c.id] || '0') || 0 })
    const updated = { ...varData, [selMonth]: monthData }
    setVarData(updated)
    localStorage.setItem('bayt-variable-expenses-v1', JSON.stringify(updated))
    setVarSaved(true)
  }

  // Computed totals
  const fixedTotal   = fixedCosts.reduce((s, f) => s + f.amount, 0)
  const latestElec   = LATEST.bill
  const latestTotal  = fixedTotal + latestElec

  const varMonth     = varData[selMonth] || {}
  const varMonthTotal = VAR_CATS.reduce((s, c) => s + (varMonth[c.id] || 0), 0)

  // YoY electricity
  const shared2024months = [8,9,10,11,12]
  const same2024 = BILLS.filter(r => r.y===2024 && shared2024months.includes(r.m)).reduce((s,r)=>s+r.bill,0)
  const same2025 = BILLS.filter(r => r.y===2025 && shared2024months.includes(r.m)).reduce((s,r)=>s+r.bill,0)
  const yoyDiff  = same2025 - same2024
  const yoyPct   = same2024 > 0 ? ((yoyDiff / same2024) * 100).toFixed(1) : '0'

  const peak2025 = byYear(2025).reduce((p,c) => c.bill > p.bill ? c : p)
  const low2025  = byYear(2025).reduce((p,c) => c.bill < p.bill ? c : p)
  const ytd2026  = yearTotal(2026)
  const ytdMonths2026 = byYear(2026).length

  const yearRows = byYear(activeYear)

  const TABS: { key:Tab; label:string }[] = [
    { key:'overview',    label:'🏠 Overview'            },
    { key:'fixed',       label:'📌 Fixed Costs'         },
    { key:'variable',    label:'🧾 Variable Expenses'   },
    { key:'bills',       label:'⚡ Electricity Bills'   },
    { key:'consumption', label:'📊 kWh Consumption'     },
  ]

  return (
    <div style={{ fontFamily:F_SANS }}>

      {/* Section header */}
      <div style={{ background:C.green, borderRadius:'8px 8px 0 0', padding:'1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:F_MONO, fontSize:'0.6rem', letterSpacing:'0.25em', color:C.goldDim, textTransform:'uppercase' }}>Bayt OS · Finance</div>
          <div style={{ fontSize:'1.1rem', color:C.white, fontWeight:300, marginTop:2, fontFamily:F_SANS }}>Budgets &amp; Expenses</div>
          <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', color:'rgba(201,168,76,0.6)', marginTop:2, letterSpacing:'0.1em' }}>B26 Al Reem Gardens, Al Wajba</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', color:'rgba(201,168,76,0.5)', letterSpacing:'0.1em' }}>TOTAL MONTHLY (FIXED + ELEC)</div>
          <div style={{ fontFamily:F_MONO, fontSize:'0.75rem', color:C.gold }}>{qar(latestTotal)}</div>
          <div style={{ fontFamily:F_MONO, fontSize:'0.45rem', color:'rgba(201,168,76,0.4)', marginTop:2 }}>LATEST ELEC · {LATEST.label} · {qar(latestElec)}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background:C.forest, border:`1px solid ${C.ruleLight}`, borderTop:'none', display:'flex', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'0.6rem 1.1rem', fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.1em',
            textTransform:'uppercase', border:'none', background:'none', cursor:'pointer',
            color: tab === t.key ? C.gold : C.grey,
            borderBottom: tab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
            transition:'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div style={{ background:C.white, border:`1px solid ${C.ruleLight}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'1.5rem' }}>

          <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim, marginBottom:'0.8rem' }}>THIS MONTH SNAPSHOT — {LATEST.label.toUpperCase()}</div>

          {/* Top stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem', marginBottom:'1.2rem' }}>
            <Stat label="Total Fixed Costs" value={qar(fixedTotal)} sub="7 fixed line items" color={C.grey} />
            <Stat label="Electricity (Kahramaa)" value={qar(latestElec)} sub={`${LATEST.label} · subsidised tariff`} color={latestElec > 1200 ? C.orange : C.gold} />
            <Stat label="Total Monthly Spend" value={qar(latestTotal)} sub="Fixed + Electricity" color={C.green} />
            <Stat label="Elec. % of Total" value={`${((latestElec/latestTotal)*100).toFixed(0)}%`} sub="variable electricity share" color={C.goldDim} />
          </div>

          {/* Fixed cost breakdown */}
          <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'1rem 1.2rem', marginBottom:'1.2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
              <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim }}>FIXED COSTS BREAKDOWN</div>
              <button onClick={() => setTab('fixed')} style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.gold, background:'none', border:`1px solid ${C.gold}`, borderRadius:3, padding:'0.2rem 0.6rem', cursor:'pointer', letterSpacing:'0.08em' }}>EDIT →</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {fixedCosts.map(fc => {
                const pct = latestTotal > 0 ? (fc.amount / latestTotal) * 100 : 0
                return (
                  <div key={fc.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:'0.82rem', color:C.text, fontFamily:F_SANS }}>{fc.icon} {fc.name}</span>
                      <span style={{ fontFamily:F_MONO, fontSize:'0.72rem', color:C.grey }}>{qar(fc.amount)}</span>
                    </div>
                    <div style={{ height:8, background:C.ruleLight, borderRadius:4, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct.toFixed(1)}%`, background:C.green, borderRadius:4, opacity:0.5 }} />
                    </div>
                  </div>
                )
              })}
              {/* Electricity */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:'0.82rem', color:C.text, fontFamily:F_SANS }}>⚡ Electricity (Kahramaa) <span style={{ fontFamily:F_MONO, fontSize:'0.42rem', color:C.grey }}>variable</span></span>
                  <span style={{ fontFamily:F_MONO, fontSize:'0.72rem', color: latestElec > 1200 ? C.orange : C.gold }}>{qar(latestElec)}</span>
                </div>
                <div style={{ height:8, background:C.ruleLight, borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${((latestElec/latestTotal)*100).toFixed(1)}%`, background: latestElec > 1200 ? C.orange : C.gold, borderRadius:4, opacity:0.7 }} />
                </div>
              </div>
              <div style={{ marginTop:'0.5rem', paddingTop:'0.8rem', borderTop:`1px solid ${C.ruleLight}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:F_MONO, fontSize:'0.5rem', color:C.grey, letterSpacing:'0.1em' }}>TOTAL MONTHLY</span>
                <span style={{ fontSize:'1.15rem', color:C.green, fontWeight:600, fontFamily:F_SANS }}>{qar(latestTotal)}</span>
              </div>
            </div>
          </div>

          {/* Annual electricity summaries */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem', marginBottom:'1.2rem' }}>
            <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.9rem 1rem' }}>
              <div style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.15em', color:C.goldDim }}>2024 ELECTRICITY (AUG–DEC)</div>
              <div style={{ fontSize:'1.2rem', color:C.gold, fontWeight:300, margin:'0.3rem 0', fontFamily:F_SANS }}>{qar(yearTotal(2024))}</div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey }}>5 months · avg {qar(yearAvg(2024))}/mo</div>
            </div>
            <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.9rem 1rem' }}>
              <div style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.15em', color:C.goldDim }}>2025 ELECTRICITY (FULL YEAR)</div>
              <div style={{ fontSize:'1.2rem', color:C.gold, fontWeight:300, margin:'0.3rem 0', fontFamily:F_SANS }}>{qar(yearTotal(2025))}</div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey }}>12 months · avg {qar(yearAvg(2025))}/mo</div>
            </div>
            <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.9rem 1rem' }}>
              <div style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.15em', color:C.goldDim }}>2026 YTD (JAN–MAR)</div>
              <div style={{ fontSize:'1.2rem', color:C.blue, fontWeight:300, margin:'0.3rem 0', fontFamily:F_SANS }}>{qar(ytd2026)}</div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey }}>{ytdMonths2026} months · avg {qar(Math.round(ytd2026/ytdMonths2026))}/mo</div>
            </div>
          </div>

          {/* 2025 highlights */}
          <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'1rem 1.2rem' }}>
            <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim, marginBottom:'0.8rem' }}>2025 ELECTRICITY HIGHLIGHTS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.7rem' }}>
              <div>
                <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey, marginBottom:3 }}>PEAK MONTH</div>
                <div style={{ fontSize:'0.85rem', color:C.orange, fontFamily:F_SANS, fontWeight:600 }}>{peak2025.shortLabel} — {qar(peak2025.bill)}</div>
              </div>
              <div>
                <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey, marginBottom:3 }}>LOWEST MONTH</div>
                <div style={{ fontSize:'0.85rem', color:C.blue, fontFamily:F_SANS, fontWeight:600 }}>{low2025.shortLabel} — {qar(low2025.bill)}</div>
              </div>
              <div>
                <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey, marginBottom:3 }}>AUG–DEC: '24 vs '25</div>
                <div style={{ fontSize:'0.85rem', color: yoyDiff > 0 ? C.orange : C.blue, fontFamily:F_SANS, fontWeight:600 }}>
                  {yoyDiff > 0 ? '↑' : '↓'} {qar(Math.abs(yoyDiff))} ({yoyPct}%)
                </div>
              </div>
              <div>
                <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey, marginBottom:3 }}>ANNUAL FIXED (EXCL. ELEC)</div>
                <div style={{ fontSize:'0.85rem', color:C.grey, fontFamily:F_SANS, fontWeight:600 }}>{qar(fixedTotal * 12)} / yr</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── FIXED COSTS ───────────────────────────────────────────────── */}
      {tab === 'fixed' && (
        <div style={{ background:C.white, border:`1px solid ${C.ruleLight}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'1.5rem' }}>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
            <div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim }}>FIXED MONTHLY COSTS</div>
              <div style={{ fontSize:'0.82rem', color:C.grey, fontFamily:F_SANS, marginTop:4 }}>These costs recur every month. Click Edit to adjust amounts or details.</div>
            </div>
            {!editMode ? (
              <button onClick={startEdit} style={{ fontFamily:F_MONO, fontSize:'0.52rem', color:C.white, background:C.green, border:'none', borderRadius:4, padding:'0.45rem 1rem', cursor:'pointer', letterSpacing:'0.08em' }}>
                ✏️ EDIT
              </button>
            ) : (
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setEditMode(false)} style={{ fontFamily:F_MONO, fontSize:'0.52rem', color:C.grey, background:'none', border:`1px solid ${C.ruleLight}`, borderRadius:4, padding:'0.4rem 0.9rem', cursor:'pointer' }}>CANCEL</button>
                <button onClick={saveEdit} style={{ fontFamily:F_MONO, fontSize:'0.52rem', color:C.white, background:C.gold, border:'none', borderRadius:4, padding:'0.4rem 0.9rem', cursor:'pointer' }}>SAVE</button>
              </div>
            )}
          </div>

          {/* Fixed costs table */}
          <div style={{ border:`1px solid ${C.ruleLight}`, borderRadius:8, overflow:'hidden', marginBottom:'1.2rem' }}>
            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'2rem 2fr 3fr 1fr', background:C.forest, padding:'0.55rem 1rem', borderBottom:`1px solid ${C.ruleLight}`, gap:'0.5rem' }}>
              {['','Name & Detail','','Amount (QAR)'].map((h,i) => (
                <div key={i} style={{ fontFamily:F_MONO, fontSize:'0.46rem', letterSpacing:'0.1em', color:C.goldDim, textTransform:'uppercase' }}>{h}</div>
              ))}
            </div>

            {fixedCosts.map((fc, i) => (
              <div key={fc.id} style={{ display:'grid', gridTemplateColumns:'2rem 2fr 3fr 1fr', padding:'0.8rem 1rem', background: i%2===0 ? C.white : C.cream, borderBottom: i<fixedCosts.length-1 ? `1px solid ${C.ruleLight}` : 'none', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ fontSize:'1.2rem' }}>{fc.icon}</div>
                <div>
                  <div style={{ fontSize:'0.85rem', color:C.text, fontFamily:F_SANS, fontWeight:600 }}>{fc.name}</div>
                  <div style={{ fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey, marginTop:2, letterSpacing:'0.05em' }}>{fc.category.toUpperCase()}</div>
                </div>
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editValues[fc.id]?.detail ?? fc.detail}
                      onChange={e => setEditValues(prev => ({ ...prev, [fc.id]: { ...prev[fc.id], detail: e.target.value } }))}
                      style={{ width:'100%', fontFamily:F_MONO, fontSize:'0.65rem', color:C.text, background:C.white, border:`1px solid ${C.gold}`, borderRadius:4, padding:'0.3rem 0.5rem', outline:'none' }}
                    />
                  ) : (
                    <div style={{ fontSize:'0.78rem', color:C.grey, fontFamily:F_SANS }}>{fc.detail}</div>
                  )}
                </div>
                <div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editValues[fc.id]?.amount ?? fc.amount}
                      onChange={e => setEditValues(prev => ({ ...prev, [fc.id]: { ...prev[fc.id], amount: e.target.value } }))}
                      style={{ width:'100%', fontFamily:F_MONO, fontSize:'0.75rem', color:C.gold, background:C.white, border:`1px solid ${C.gold}`, borderRadius:4, padding:'0.3rem 0.5rem', outline:'none', textAlign:'right' }}
                    />
                  ) : (
                    <div style={{ fontFamily:F_MONO, fontSize:'0.75rem', color:C.gold, textAlign:'right' }}>{qar(fc.amount)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Total row */}
            <div style={{ display:'grid', gridTemplateColumns:'2rem 2fr 3fr 1fr', padding:'0.8rem 1rem', background:C.forest, gap:'0.5rem', borderTop:`2px solid ${C.ruleLight}` }}>
              <div />
              <div style={{ fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.12em', color:C.text, fontWeight:700 }}>TOTAL FIXED / MONTH</div>
              <div />
              <div style={{ fontFamily:F_MONO, fontSize:'0.85rem', color:C.green, fontWeight:700, textAlign:'right' }}>{qar(fixedTotal)}</div>
            </div>
          </div>

          {/* Electricity note */}
          <div style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.9rem 1.1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.46rem', color:C.goldDim, letterSpacing:'0.1em', marginBottom:3 }}>PLUS VARIABLE — ELECTRICITY (KAHRAMAA)</div>
              <div style={{ fontSize:'0.82rem', color:C.grey, fontFamily:F_SANS }}>Latest: {LATEST.label} · see Electricity tab for full history</div>
            </div>
            <div style={{ fontFamily:F_MONO, fontSize:'0.85rem', color: latestElec > 1200 ? C.orange : C.gold }}>{qar(latestElec)}</div>
          </div>

          {/* By category summary */}
          <div style={{ marginTop:'1.2rem' }}>
            <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim, marginBottom:'0.8rem' }}>BY CATEGORY</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.7rem' }}>
              {(['Housing','Utilities','Household','Transport'] as const).map(cat => {
                const items = fixedCosts.filter(fc => fc.category === cat)
                const total = items.reduce((s,fc) => s + fc.amount, 0)
                return (
                  <div key={cat} style={{ background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.8rem 1rem' }}>
                    <div style={{ fontFamily:F_MONO, fontSize:'0.45rem', color:C.grey, letterSpacing:'0.1em', marginBottom:4 }}>{cat.toUpperCase()}</div>
                    <div style={{ fontSize:'1.1rem', color:C.gold, fontFamily:F_SANS, fontWeight:300 }}>{qar(total)}</div>
                    <div style={{ fontFamily:F_MONO, fontSize:'0.42rem', color:C.grey, marginTop:3 }}>{items.map(fc=>fc.name).join(' · ')}</div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── VARIABLE EXPENSES ─────────────────────────────────────────── */}
      {tab === 'variable' && (
        <div style={{ background:C.white, border:`1px solid ${C.ruleLight}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'1.5rem' }}>

          {/* Month selector */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.2rem', flexWrap:'wrap' }}>
            <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.15em', color:C.goldDim }}>SELECT MONTH</div>
            <select
              value={selMonth}
              onChange={e => setSelMonth(e.target.value)}
              style={{ fontFamily:F_MONO, fontSize:'0.62rem', color:C.text, background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:4, padding:'0.35rem 0.8rem', cursor:'pointer', outline:'none' }}
            >
              {MONTHS.map(mo => (
                <option key={mo.key} value={mo.key}>
                  {mo.label}{varData[mo.key] ? ' ✓' : ''}
                </option>
              ))}
            </select>
            {varData[selMonth] && (
              <div style={{ fontFamily:F_MONO, fontSize:'0.45rem', color:'#4CAF50', border:'1px solid rgba(76,175,80,0.3)', borderRadius:3, padding:'0.2rem 0.5rem', background:'rgba(76,175,80,0.08)' }}>
                DATA LOADED
              </div>
            )}
          </div>

          {/* Category inputs */}
          <div style={{ border:`1px solid ${C.ruleLight}`, borderRadius:8, overflow:'hidden', marginBottom:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2.5rem 1fr 2fr 1fr', background:C.forest, padding:'0.55rem 1rem', borderBottom:`1px solid ${C.ruleLight}`, gap:'0.5rem' }}>
              {['','Category','','Amount (QAR)'].map((h,i) => (
                <div key={i} style={{ fontFamily:F_MONO, fontSize:'0.46rem', letterSpacing:'0.1em', color:C.goldDim, textTransform:'uppercase' }}>{h}</div>
              ))}
            </div>

            {VAR_CATS.map((cat, i) => (
              <div key={cat.id} style={{ display:'grid', gridTemplateColumns:'2.5rem 1fr 2fr 1fr', padding:'0.75rem 1rem', background: i%2===0 ? C.white : C.cream, borderBottom: i<VAR_CATS.length-1 ? `1px solid ${C.ruleLight}` : 'none', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ fontSize:'1.15rem' }}>{cat.icon}</div>
                <div>
                  <div style={{ fontSize:'0.85rem', color:C.text, fontFamily:F_SANS, fontWeight:600 }}>{cat.label}</div>
                </div>
                <div style={{ fontSize:'0.72rem', color:C.grey, fontFamily:F_SANS, fontStyle:'italic' }}>{cat.sub}</div>
                <div>
                  <input
                    type="number"
                    placeholder="0"
                    value={varInputs[cat.id] || ''}
                    onChange={e => setVarInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    style={{
                      width:'100%', fontFamily:F_MONO, fontSize:'0.75rem', color:C.text,
                      background:C.white, border:`1px solid ${C.ruleLight}`,
                      borderRadius:4, padding:'0.3rem 0.5rem', outline:'none', textAlign:'right',
                      transition:'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = C.ruleLight}
                  />
                </div>
              </div>
            ))}

            {/* Variable total */}
            <div style={{ display:'grid', gridTemplateColumns:'2.5rem 1fr 2fr 1fr', padding:'0.8rem 1rem', background:C.forest, gap:'0.5rem', borderTop:`2px solid ${C.ruleLight}` }}>
              <div />
              <div style={{ fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.12em', color:C.text, fontWeight:700 }}>
                VARIABLE TOTAL — {MONTHS.find(m=>m.key===selMonth)?.label.toUpperCase()}
              </div>
              <div />
              <div style={{ fontFamily:F_MONO, fontSize:'0.85rem', color:C.green, fontWeight:700, textAlign:'right' }}>
                {qar(VAR_CATS.reduce((s,c) => s + (parseFloat(varInputs[c.id]||'0')||0), 0))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
            <button
              onClick={saveVar}
              style={{ fontFamily:F_MONO, fontSize:'0.55rem', color:C.white, background:C.green, border:'none', borderRadius:4, padding:'0.5rem 1.4rem', cursor:'pointer', letterSpacing:'0.1em' }}
            >
              SAVE {MONTHS.find(m=>m.key===selMonth)?.label.toUpperCase()}
            </button>
            {varSaved && (
              <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', color:'#4CAF50' }}>✓ Saved</div>
            )}
          </div>

          {/* Monthly summary — all months with data */}
          {Object.keys(varData).length > 0 && (
            <div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim, marginBottom:'0.8rem' }}>ALL MONTHS WITH DATA</div>
              <div style={{ border:`1px solid ${C.ruleLight}`, borderRadius:8, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr repeat(8,1fr) 1fr', background:C.forest, padding:'0.5rem 0.8rem', borderBottom:`1px solid ${C.ruleLight}`, gap:4 }}>
                  <div style={{ fontFamily:F_MONO, fontSize:'0.42rem', color:C.goldDim, textTransform:'uppercase' }}>Month</div>
                  {VAR_CATS.map(c => (
                    <div key={c.id} style={{ fontFamily:F_MONO, fontSize:'0.38rem', color:C.goldDim, textTransform:'uppercase', textAlign:'right' }}>{c.label}</div>
                  ))}
                  <div style={{ fontFamily:F_MONO, fontSize:'0.42rem', color:C.goldDim, textTransform:'uppercase', textAlign:'right' }}>Total</div>
                </div>
                {MONTHS.filter(mo => varData[mo.key]).map((mo, i) => {
                  const md = varData[mo.key]
                  const total = VAR_CATS.reduce((s,c) => s + (md[c.id]||0), 0)
                  return (
                    <div key={mo.key} style={{ display:'grid', gridTemplateColumns:'1fr repeat(8,1fr) 1fr', padding:'0.5rem 0.8rem', background: i%2===0 ? C.white : C.cream, borderBottom:`1px solid ${C.ruleLight}`, gap:4, alignItems:'center' }}>
                      <div style={{ fontFamily:F_MONO, fontSize:'0.55rem', color:C.text }}>{mo.label}</div>
                      {VAR_CATS.map(c => (
                        <div key={c.id} style={{ fontFamily:F_MONO, fontSize:'0.52rem', color: (md[c.id]||0) > 0 ? C.text : C.ruleLight, textAlign:'right' }}>
                          {(md[c.id]||0) > 0 ? (md[c.id]||0).toLocaleString() : '—'}
                        </div>
                      ))}
                      <div style={{ fontFamily:F_MONO, fontSize:'0.6rem', color:C.gold, fontWeight:700, textAlign:'right' }}>{total.toLocaleString()}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {Object.keys(varData).length === 0 && (
            <div style={{ textAlign:'center', padding:'2rem', color:C.grey, fontFamily:F_MONO, fontSize:'0.6rem', background:C.cream, borderRadius:8, border:`1px solid ${C.ruleLight}` }}>
              No variable expense data yet. Select a month above and start logging.
            </div>
          )}

        </div>
      )}

      {/* ── ELECTRICITY BILLS ─────────────────────────────────────────── */}
      {tab === 'bills' && (
        <div style={{ background:C.white, border:`1px solid ${C.ruleLight}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'1.5rem' }}>

          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'1.2rem' }}>
            {([2024,2025,2026] as YrKey[]).map(yr => (
              <button key={yr} onClick={() => setYear(yr)} style={{
                padding:'0.35rem 0.9rem', fontFamily:F_MONO, fontSize:'0.55rem', letterSpacing:'0.1em',
                border:`1px solid ${activeYear===yr ? C.gold : C.ruleLight}`,
                background: activeYear===yr ? `${C.gold}18` : 'none',
                color: activeYear===yr ? C.gold : C.grey,
                borderRadius:4, cursor:'pointer', transition:'all 0.15s',
              }}>{yr}{yr===2024 ? ' (partial)' : yr===2026 ? ' (YTD)' : ''}</button>
            ))}
            <div style={{ marginLeft:'auto', display:'flex', gap:'1rem', alignItems:'center', fontFamily:F_MONO, fontSize:'0.44rem', color:C.grey }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:C.orange, opacity:0.78 }}/> Peak (Jun–Sep)</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:C.gold, opacity:0.78 }}/> Shoulder</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:C.blue, opacity:0.78 }}/> Winter</span>
            </div>
          </div>

          {yearRows.length > 0 ? (
            <div style={{ marginBottom:'1.2rem' }}>
              <BarChart rows={yearRows} max={CHART_MAX} />
            </div>
          ) : (
            <div style={{ padding:'2rem', textAlign:'center', color:C.grey, fontFamily:F_MONO, fontSize:'0.6rem' }}>No bill data for {activeYear}</div>
          )}

          {yearRows.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.7rem', marginBottom:'1.2rem' }}>
              <Stat label={`Total ${activeYear}`} value={qar(yearTotal(activeYear))} />
              <Stat label="Avg / Month" value={qar(yearAvg(activeYear))} />
              {(() => {
                const pk = yearRows.reduce((p,c) => c.bill>p.bill?c:p)
                const lw = yearRows.reduce((p,c) => c.bill<p.bill?c:p)
                return <>
                  <Stat label="Peak Month" value={`${pk.shortLabel} · ${qar(pk.bill)}`} color={C.orange} />
                  <Stat label="Lowest Month" value={`${lw.shortLabel} · ${qar(lw.bill)}`} color={C.blue} />
                </>
              })()}
            </div>
          )}

          {yearRows.length > 0 && (
            <div style={{ border:`1px solid ${C.ruleLight}`, borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 1fr', background:C.forest, padding:'0.55rem 1rem', borderBottom:`1px solid ${C.ruleLight}` }}>
                {['Month','Bill (QAR)','vs Prev Month','Season'].map(h => (
                  <div key={h} style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.1em', color:C.goldDim, textTransform:'uppercase' }}>{h}</div>
                ))}
              </div>
              {yearRows.map((r,i) => {
                const prev = yearRows[i-1] ?? (activeYear === 2025 ? BILLS.find(b => b.y===2024 && b.m===12) : null)
                const delta = prev ? r.bill - prev.bill : null
                const s = season(r.m)
                return (
                  <div key={r.label} style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 1fr', padding:'0.55rem 1rem', background: i%2===0 ? C.white : C.cream, borderBottom: i<yearRows.length-1 ? `1px solid ${C.ruleLight}` : 'none' }}>
                    <div style={{ fontSize:'0.8rem', color:C.text, fontFamily:F_SANS }}>{r.label}</div>
                    <div style={{ fontFamily:F_MONO, fontSize:'0.75rem', color: r.bill > 1300 ? C.orange : r.bill < 500 ? C.blue : C.text, fontWeight:600 }}>{qar(r.bill)}</div>
                    <div style={{ fontFamily:F_MONO, fontSize:'0.7rem', color: delta===null ? C.grey : delta>0 ? C.orange : C.blue }}>
                      {delta===null ? '—' : `${delta>0?'+':''}${fmt(delta)}`}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:s.color, fontFamily:F_SANS }}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {activeYear === 2025 && (
            <div style={{ marginTop:'1rem', background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8, padding:'0.9rem 1.1rem' }}>
              <div style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.15em', color:C.goldDim, marginBottom:6 }}>AUG–DEC COMPARISON · 2024 vs 2025</div>
              <div style={{ fontSize:'0.82rem', color:C.text, fontFamily:F_SANS }}>
                Aug–Dec 2024: <strong>{qar(same2024)}</strong> &nbsp;→&nbsp; Aug–Dec 2025: <strong>{qar(same2025)}</strong>
                &nbsp;·&nbsp;
                <span style={{ color: yoyDiff <= 0 ? C.blue : C.orange, fontWeight:600 }}>
                  {yoyDiff <= 0 ? `↓ ${qar(Math.abs(yoyDiff))} less` : `↑ ${qar(yoyDiff)} more`}
                </span>
                <span style={{ fontFamily:F_MONO, fontSize:'0.6rem', color:C.grey }}> ({yoyPct}% YoY)</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── kWh CONSUMPTION ──────────────────────────────────────────── */}
      {tab === 'consumption' && (
        <div style={{ background:C.white, border:`1px solid ${C.ruleLight}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'1.5rem' }}>

          <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim, marginBottom:'0.3rem' }}>CUMULATIVE METER READINGS (kWh) — ALL TIME</div>
          <div style={{ fontSize:'0.82rem', color:C.grey, fontFamily:F_SANS, marginBottom:'1rem' }}>
            These are your actual Kahramaa meter readings. Monthly delta shows how many kWh your household consumed. Qatar&apos;s subsidised tariff means the QAR cost stays low despite high consumption.
          </div>

          <div style={{ marginBottom:'1.2rem' }}>
            <KwhChart rows={KWH_MONTHLY} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.7rem', marginBottom:'1.2rem' }}>
            <Stat label="Current Meter" value={fmt(KWH_READINGS[KWH_READINGS.length-1].cumul)} sub="kWh cumulative total" color={C.text} />
            <Stat label="2025 Consumption" value={fmt(KWH_MONTHLY.filter(r=>r.label.endsWith('25')).reduce((s,r)=>s+r.kwh,0))} sub="kWh total for the year" />
            <Stat label="2025 Peak Month" value="Sep 25 · 8,449" sub="kWh — heaviest AC month" color={C.orange} />
            <Stat label="2025 Lowest Month" value="Jan 25 · 2,139" sub="kWh — minimal AC load" color={C.blue} />
          </div>

          <div style={{ border:`1px solid ${C.ruleLight}`, borderRadius:8, overflow:'hidden', maxHeight:400, overflowY:'auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr 1fr', background:C.forest, padding:'0.55rem 1rem', borderBottom:`1px solid ${C.ruleLight}`, position:'sticky', top:0, zIndex:5 }}>
              {['Month','Consumption (kWh)','Cumul. Meter','Season'].map(h => (
                <div key={h} style={{ fontFamily:F_MONO, fontSize:'0.47rem', letterSpacing:'0.1em', color:C.goldDim, textTransform:'uppercase' }}>{h}</div>
              ))}
            </div>
            {[...KWH_MONTHLY].reverse().map((r,i) => {
              const monthStr = r.label.split(' ')[0]
              const mIdx = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(monthStr)+1
              const s = season(mIdx)
              return (
                <div key={r.label} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr 1fr', padding:'0.5rem 1rem', background: i%2===0 ? C.white : C.cream, borderBottom:`1px solid ${C.ruleLight}` }}>
                  <div style={{ fontSize:'0.8rem', color:C.text, fontFamily:F_SANS }}>{r.label}</div>
                  <div style={{ fontFamily:F_MONO, fontSize:'0.75rem', color: r.kwh > 7000 ? C.orange : r.kwh < 3000 ? C.blue : C.text }}>{fmt(r.kwh)}</div>
                  <div style={{ fontFamily:F_MONO, fontSize:'0.7rem', color:C.grey }}>{fmt(r.cumul)}</div>
                  <div style={{ fontSize:'0.72rem', color:s.color, fontFamily:F_SANS }}>{s.label}</div>
                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}
