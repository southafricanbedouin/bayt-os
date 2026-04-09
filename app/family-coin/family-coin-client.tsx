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
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

// ── Interfaces ────────────────────────────────────────────────────────────
interface Child {
  id: string
  name: string
  age: number
}

interface CoinBalance {
  childId: string
  coins: number     // spendable balance
  savings: number   // saved coins
  sadaqah: number   // total given
  cashQar: number   // real QAR cash savings
}

interface CoinTransaction {
  id: string
  childId: string
  type: 'earn' | 'spend' | 'save' | 'give'
  amount: number
  description: string
  date: string      // ISO string
}

interface Chore {
  id: string
  name: string
  coins: number
  icon: string
  assignedTo: string[] // childIds
  active: boolean
}

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULT_CHILDREN: Child[] = [
  { id: 'yahya', name: 'Yahya', age: 10 },
  { id: 'isa',   name: 'Isa',   age: 8 },
  { id: 'linah', name: 'Linah', age: 6 },
  { id: 'dana',  name: 'Dana',  age: 4 },
]

const DEFAULT_CASH: Record<string, number> = {
  yahya: 800,
  isa:   260,
  linah: 250,
  dana:  250,
}

const DEFAULT_CHORES: Chore[] = [
  { id: '1',  icon: '🛏️', name: 'Make bed', coins: 2, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '2',  icon: '🧹', name: 'Tidy room', coins: 3, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '3',  icon: '🍽️', name: 'Clear dinner table', coins: 2, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '4',  icon: '🧺', name: 'Put away laundry', coins: 3, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '5',  icon: '📚', name: 'Complete homework without reminders', coins: 5, assignedTo: ['yahya', 'isa', 'linah'], active: true },
  { id: '6',  icon: '🌿', name: 'Water plants', coins: 2, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '7',  icon: '🐾', name: 'Feed pet', coins: 2, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '8',  icon: '🗑️', name: 'Take out trash', coins: 3, assignedTo: ['yahya', 'isa'], active: true },
  { id: '9',  icon: '🧽', name: 'Help wash dishes', coins: 4, assignedTo: ['yahya', 'isa', 'linah'], active: true },
  { id: '10', icon: '🧹', name: 'Sweep/vacuum a room', coins: 5, assignedTo: ['yahya', 'isa'], active: true },
  { id: '11', icon: '📖', name: 'Read for 20 minutes', coins: 3, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
  { id: '12', icon: '🤲', name: 'Help a sibling without being asked', coins: 5, assignedTo: ['yahya', 'isa', 'linah', 'dana'], active: true },
]

// ── Sub-components ────────────────────────────────────────────────────────

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '0.85rem 1rem' }}>
      <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.2em', color: C.grey, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 300, color: color || C.gold, fontFamily: F_SANS, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontFamily: F_MONO, fontSize: '0.45rem', color: C.grey, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.2em', color: C.goldDim, marginBottom: '0.8rem', textTransform: 'uppercase', ...style }}>
      {children}
    </div>
  )
}

function Button({ label, onClick, variant = 'primary', style }: { label: string; onClick: () => void; variant?: 'primary' | 'outline' | 'danger' | 'gold'; style?: React.CSSProperties }) {
  const bg = variant === 'primary' ? C.green : variant === 'danger' ? C.orange : variant === 'gold' ? C.gold : 'none'
  const border = variant === 'outline' ? `1px solid ${C.rule}` : 'none'
  const color = variant === 'outline' ? C.text : C.white
  
  return (
    <button onClick={onClick} style={{
      padding: '0.45rem 1rem', fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.08em',
      textTransform: 'uppercase', border, borderRadius: 4, background: bg, color, cursor: 'pointer',
      transition: 'opacity 0.15s', fontWeight: 600, ...style
    }}>
      {label}
    </button>
  )
}

function ChildCard({ child, balance, transactions, onAward }: { child: Child; balance: CoinBalance; transactions: CoinTransaction[]; onAward: () => void }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8, padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '1.2rem', color: C.text, fontFamily: F_SANS, fontWeight: 600 }}>{child.name}</div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.45rem', color: C.grey }}>AGE {child.age}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', color: C.green, fontFamily: F_MONO, fontWeight: 700, lineHeight: 1 }}>🪙 {balance.coins}</div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.45rem', color: C.grey, letterSpacing: '0.05em' }}>SPENDABLE</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ background: C.cream, padding: '0.6rem', borderRadius: 6 }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.4rem', color: C.grey }}>SAVINGS</div>
          <div style={{ fontSize: '0.9rem', color: C.blue, fontFamily: F_MONO }}>🪙 {balance.savings}</div>
        </div>
        <div style={{ background: C.cream, padding: '0.6rem', borderRadius: 6 }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.4rem', color: C.grey }}>SADAQAH</div>
          <div style={{ fontSize: '0.9rem', color: C.midgreen, fontFamily: F_MONO }}>🤲 {balance.sadaqah}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(201,168,76,0.07)', border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 6, padding: '0.6rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.4rem', color: C.goldDim, letterSpacing: '0.12em' }}>CASH SAVINGS</div>
          <div style={{ fontSize: '1.05rem', color: C.gold, fontFamily: F_MONO, fontWeight: 700, marginTop: 2 }}>QAR {balance.cashQar.toLocaleString()}</div>
        </div>
        <div style={{ fontSize: '1.3rem' }}>💵</div>
      </div>

      <div>
        <div style={{ fontFamily: F_MONO, fontSize: '0.4rem', color: C.grey, marginBottom: 4 }}>LAST 3 ACTIVITY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {transactions.length === 0 ? (
            <div style={{ fontSize: '0.7rem', color: C.rule, fontStyle: 'italic' }}>No activity yet</div>
          ) : transactions.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_SANS }}>
              <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</span>
              <span style={{ 
                fontFamily: F_MONO, fontWeight: 700, 
                color: tx.type === 'earn' ? C.goldDim : tx.type === 'spend' ? C.orange : tx.type === 'save' ? C.blue : C.green 
              }}>
                {tx.type === 'earn' ? '+' : tx.type === 'spend' ? '-' : tx.type === 'save' ? '→' : '🤲'} {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button label="⊕ Award Coins" onClick={onAward} variant="gold" style={{ marginTop: 'auto', width: '100%' }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function FamilyCoinTracker() {
  const [tab, setTab] = useState<'overview' | 'chores' | 'ledger' | 'settings'>('overview')
  const [isHydrated, setIsHydrated] = useState(false)

  // Data State
  const [children, setChildren] = useState<Child[]>(DEFAULT_CHILDREN)
  const [balances, setBalances] = useState<CoinBalance[]>([])
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [chores, setChores] = useState<Chore[]>(DEFAULT_CHORES)

  // Award Form State
  const [awardingChildId, setAwardingChildId] = useState<string | null>(null)
  const [awardChoreId, setAwardChoreId] = useState<string>('')
  const [awardCustomDesc, setAwardCustomDesc] = useState<string>('')
  const [awardAmount, setAwardAmount] = useState<string>('')

  // Ledger Filter State
  const [ledgerChild, setLedgerChild] = useState<string>('All')
  const [ledgerType, setLedgerType] = useState<string>('All')

  // Settings State
  const [isResetConfirm, setIsResetConfirm] = useState(false)

  // 1. Initial Hydration
  useEffect(() => {
    try {
      const savedBalances = localStorage.getItem('bayt-coin-balances-v1')
      const savedTransactions = localStorage.getItem('bayt-coin-transactions-v1')
      const savedChores = localStorage.getItem('bayt-coin-chores-v1')
      const savedChildren = localStorage.getItem('bayt-coin-children-v1')

      if (savedBalances) {
        // Migrate: add cashQar if missing from saved data
        const parsed: CoinBalance[] = JSON.parse(savedBalances)
        setBalances(parsed.map(b => ({
          ...b,
          cashQar: b.cashQar ?? DEFAULT_CASH[b.childId] ?? 0,
        })))
      } else {
        setBalances(DEFAULT_CHILDREN.map(c => ({ childId: c.id, coins: 0, savings: 0, sadaqah: 0, cashQar: DEFAULT_CASH[c.id] ?? 0 })))
      }

      if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
      if (savedChores) setChores(JSON.parse(savedChores))
      if (savedChildren) setChildren(JSON.parse(savedChildren))
    } catch (e) {
      console.error("Failed to load Family Coin data", e)
    }
    setIsHydrated(true)
  }, [])

  // 2. Persistence
  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem('bayt-coin-balances-v1', JSON.stringify(balances))
    localStorage.setItem('bayt-coin-transactions-v1', JSON.stringify(transactions))
    localStorage.setItem('bayt-coin-chores-v1', JSON.stringify(chores))
    localStorage.setItem('bayt-coin-children-v1', JSON.stringify(children))
  }, [balances, transactions, chores, children, isHydrated])

  // Helpers
  const addTransaction = (childId: string, type: CoinTransaction['type'], amount: number, description: string) => {
    const newTx: CoinTransaction = {
      id: Date.now().toString(),
      childId,
      type,
      amount,
      description,
      date: new Date().toISOString()
    }

    setTransactions(prev => [newTx, ...prev])
    setBalances(prev => prev.map(b => {
      if (b.childId !== childId) return b
      if (type === 'earn') return { ...b, coins: b.coins + amount }
      if (type === 'spend') return { ...b, coins: b.coins - amount }
      if (type === 'save') return { ...b, coins: b.coins - amount, savings: b.savings + amount }
      if (type === 'give') return { ...b, coins: b.coins - amount, sadaqah: b.sadaqah + amount }
      return b
    }))
  }

  const handleAwardSubmit = () => {
    if (!awardingChildId) return
    const amountNum = parseInt(awardAmount) || 0
    let desc = awardCustomDesc
    if (awardChoreId) {
      const chore = chores.find(c => c.id === awardChoreId)
      if (chore) desc = `${chore.icon} ${chore.name}`
    }
    
    if (amountNum > 0 && desc) {
      addTransaction(awardingChildId, 'earn', amountNum, desc)
      setAwardingChildId(null)
      setAwardChoreId('')
      setAwardCustomDesc('')
      setAwardAmount('')
    }
  }

  const resetAllData = () => {
    localStorage.removeItem('bayt-coin-balances-v1')
    localStorage.removeItem('bayt-coin-transactions-v1')
    localStorage.removeItem('bayt-coin-chores-v1')
    localStorage.removeItem('bayt-coin-children-v1')
    window.location.reload()
  }

  const totalFamilyCoins = balances.reduce((acc, curr) => acc + curr.coins, 0)

  if (!isHydrated) return null

  return (
    <div style={{ fontFamily: F_SANS }}>
      {/* HEADER */}
      <div style={{ background: C.green, borderRadius: '8px 8px 0 0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.25em', color: C.goldDim, textTransform: 'uppercase' }}>Bayt OS · Module</div>
          <div style={{ fontSize: '1.1rem', color: C.white, fontWeight: 300, marginTop: 2, fontFamily: F_SANS }}>Family Coin</div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.48rem', color: 'rgba(201,168,76,0.6)', marginTop: 2, letterSpacing: '0.1em' }}>الدينار العائلي</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(201,168,76,0.5)', letterSpacing: '0.1em' }}>TOTAL SPENDABLE WEALTH</div>
          <div style={{ fontFamily: F_MONO, fontSize: '1rem', color: C.gold }}>🪙 {totalFamilyCoins}</div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: C.forest, border: `1px solid ${C.ruleLight}`, borderTop: 'none', display: 'flex', flexWrap: 'wrap' }}>
        {[
          { k: 'overview', l: '🏠 Overview' },
          { k: 'chores', l: '📋 Chores' },
          { k: 'ledger', l: '📊 Ledger' },
          { k: 'settings', l: '⚙️ Settings' }
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} style={{
            padding: '0.6rem 1.1rem', fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t.k ? C.gold : C.grey,
            borderBottom: tab === t.k ? `2px solid ${C.gold}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '1.5rem' }}>
        
        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <SectionHeader>Family Portfolio</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <Stat label="Total Family Coins" value={`🪙 ${totalFamilyCoins}`} sub="Sum of all spendable" />
              <Stat label="Total Saved" value={`🪙 ${balances.reduce((a,c) => a+c.savings, 0)}`} sub="All-time savings" color={C.blue} />
              <Stat label="Total Sadaqah" value={`🤲 ${balances.reduce((a,c) => a+c.sadaqah, 0)}`} sub="Community impact" color={C.midgreen} />
              <Stat label="Kids Enrolled" value={children.length.toString()} sub="Active accounts" color={C.grey} />
            </div>

            <SectionHeader>Kids' Accounts</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {children.map(child => (
                <ChildCard 
                  key={child.id} 
                  child={child} 
                  balance={balances.find(b => b.childId === child.id) || {childId: child.id, coins:0, savings:0, sadaqah:0}}
                  transactions={transactions.filter(t => t.childId === child.id).slice(0, 3)}
                  onAward={() => {
                    setAwardingChildId(child.id)
                    setAwardAmount('')
                    setAwardChoreId('')
                    setAwardCustomDesc('')
                  }}
                />
              ))}
            </div>

            {/* AWARD MODAL (Inline) */}
            {awardingChildId && (
              <div style={{ marginTop: '2rem', background: C.cream, border: `1px solid ${C.goldDim}`, borderRadius: 8, padding: '1.5rem', position: 'relative' }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, marginBottom: '1rem' }}>AWARD COINS TO {children.find(c => c.id === awardingChildId)?.name.toUpperCase()}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', fontFamily: F_MONO, marginBottom: 4 }}>SELECT CHORE</label>
                    <select 
                      value={awardChoreId} 
                      onChange={(e) => {
                        const chore = chores.find(c => c.id === e.target.value)
                        setAwardChoreId(e.target.value)
                        if (chore) {
                          setAwardAmount(chore.coins.toString())
                          setAwardCustomDesc('')
                        }
                      }}
                      style={{ width: '100%', padding: '0.5rem', fontFamily: F_SANS, borderRadius: 4, border: `1px solid ${C.rule}` }}
                    >
                      <option value="">Custom Award...</option>
                      {chores.filter(c => c.active && c.assignedTo.includes(awardingChildId)).map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name} ({c.coins})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', fontFamily: F_MONO, marginBottom: 4 }}>CUSTOM REASON</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Extra help with groceries"
                      value={awardCustomDesc} 
                      onChange={(e) => { setAwardCustomDesc(e.target.value); if (e.target.value) setAwardChoreId(''); }}
                      style={{ width: '100%', padding: '0.5rem', fontFamily: F_SANS, borderRadius: 4, border: `1px solid ${C.rule}` }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6rem', fontFamily: F_MONO, marginBottom: 4 }}>AMOUNT</label>
                    <input 
                      type="number" 
                      value={awardAmount} 
                      onChange={(e) => setAwardAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', fontFamily: F_MONO, borderRadius: 4, border: `1px solid ${C.rule}` }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.2rem' }}>
                  <Button label="Confirm Award" variant="primary" onClick={handleAwardSubmit} />
                  <Button label="Cancel" variant="outline" onClick={() => setAwardingChildId(null)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHORES */}
        {tab === 'chores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <SectionHeader style={{ marginBottom: 0 }}>Chore Marketplace</SectionHeader>
              <Button label="+ Add New Chore" variant="outline" onClick={() => {
                const newChore: Chore = {
                  id: Date.now().toString(),
                  name: 'New Chore',
                  coins: 1,
                  icon: '✨',
                  assignedTo: children.map(c => c.id),
                  active: true
                }
                setChores([...chores, newChore])
              }} />
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 2fr 80px', background: C.forest, padding: '0.6rem 1rem', borderBottom: `1px solid ${C.ruleLight}`, gap: '0.5rem' }}>
                {['','Chore Name','Coins','Assigned To','Active'].map((h, i) => (
                  <div key={i} style={{ fontFamily: F_MONO, fontSize: '0.46rem', letterSpacing: '0.1em', color: C.goldDim, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {chores.map((chore, idx) => (
                <div key={chore.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 2fr 80px', padding: '0.6rem 1rem', background: idx % 2 === 0 ? C.white : C.cream, borderBottom: idx < chores.length - 1 ? `1px solid ${C.ruleLight}` : 'none', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.2rem' }}>{chore.icon}</div>
                  <input 
                    type="text" 
                    value={chore.name} 
                    onChange={(e) => {
                      const updated = [...chores]
                      updated[idx].name = e.target.value
                      setChores(updated)
                    }}
                    style={{ background: 'none', border: 'none', borderBottom: `1px solid transparent`, fontFamily: F_SANS, fontSize: '0.85rem', color: C.text, width: '100%', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: F_MONO, fontSize: '0.7rem' }}>🪙</span>
                    <input 
                      type="number" 
                      value={chore.coins} 
                      onChange={(e) => {
                        const updated = [...chores]
                        updated[idx].coins = parseInt(e.target.value) || 0
                        setChores(updated)
                      }}
                      style={{ background: 'none', border: 'none', fontFamily: F_MONO, fontSize: '0.8rem', color: C.goldDim, width: '40px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {children.map(child => (
                      <button 
                        key={child.id}
                        onClick={() => {
                          const updated = [...chores]
                          const assigned = updated[idx].assignedTo
                          if (assigned.includes(child.id)) updated[idx].assignedTo = assigned.filter(id => id !== child.id)
                          else updated[idx].assignedTo = [...assigned, child.id]
                          setChores(updated)
                        }}
                        style={{
                          fontSize: '0.45rem', fontFamily: F_MONO, padding: '2px 4px', borderRadius: 4, cursor: 'pointer',
                          background: chore.assignedTo.includes(child.id) ? C.goldPale : C.ruleLight,
                          border: 'none', color: chore.assignedTo.includes(child.id) ? C.goldDim : C.grey
                        }}
                      >
                        {child.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <input 
                      type="checkbox" 
                      checked={chore.active} 
                      onChange={(e) => {
                        const updated = [...chores]
                        updated[idx].active = e.target.checked
                        setChores(updated)
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEDGER */}
        {tab === 'ledger' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <SectionHeader style={{ marginBottom: 0 }}>Transaction Ledger</SectionHeader>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <select value={ledgerChild} onChange={e => setLedgerChild(e.target.value)} style={{ padding: '0.4rem', fontFamily: F_MONO, fontSize: '0.5rem', borderRadius: 4, border: `1px solid ${C.rule}` }}>
                  <option value="All">ALL KIDS</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                </select>
                <select value={ledgerType} onChange={e => setLedgerType(e.target.value)} style={{ padding: '0.4rem', fontFamily: F_MONO, fontSize: '0.5rem', borderRadius: 4, border: `1px solid ${C.rule}` }}>
                  <option value="All">ALL TYPES</option>
                  <option value="earn">EARN</option>
                  <option value="spend">SPEND</option>
                  <option value="save">SAVE</option>
                  <option value="give">GIVE</option>
                </select>
              </div>
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 100px 1fr 100px', background: C.forest, padding: '0.6rem 1rem', borderBottom: `1px solid ${C.ruleLight}`, gap: '0.5rem' }}>
                {['Date', 'Child', 'Type', 'Description', 'Amount'].map((h, i) => (
                  <div key={i} style={{ fontFamily: F_MONO, fontSize: '0.46rem', letterSpacing: '0.1em', color: C.goldDim, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {transactions
                .filter(tx => ledgerChild === 'All' || tx.childId === ledgerChild)
                .filter(tx => ledgerType === 'All' || tx.type === ledgerType)
                .map((tx, idx) => (
                <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 100px 1fr 100px', padding: '0.6rem 1rem', background: idx % 2 === 0 ? C.white : C.cream, borderBottom: idx < transactions.length - 1 ? `1px solid ${C.ruleLight}` : 'none', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.55rem', color: C.grey }}>{new Date(tx.date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text }}>{children.find(c => c.id === tx.childId)?.name}</div>
                  <div style={{ 
                    fontFamily: F_MONO, fontSize: '0.45rem', padding: '2px 6px', borderRadius: 4, width: 'fit-content',
                    background: tx.type === 'earn' ? C.goldPale : tx.type === 'spend' ? '#fbe9e7' : tx.type === 'save' ? '#e3f2fd' : '#e8f5e9',
                    color: tx.type === 'earn' ? C.goldDim : tx.type === 'spend' ? C.orange : tx.type === 'save' ? C.blue : C.midgreen
                  }}>
                    {tx.type.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: C.text }}>{tx.description}</div>
                  <div style={{ 
                    fontFamily: F_MONO, fontSize: '0.8rem', fontWeight: 700, textAlign: 'right',
                    color: tx.type === 'earn' ? C.goldDim : tx.type === 'spend' ? C.orange : C.text
                  }}>
                    {tx.type === 'earn' ? '+' : tx.type === 'spend' ? '-' : tx.type === 'save' ? '→' : '🤲'} {tx.amount}
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: C.grey, fontFamily: F_MONO, fontSize: '0.6rem' }}>No transaction history found.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <SectionHeader>Exchange Rate</SectionHeader>
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>💱</div>
                <div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: C.goldDim }}>FIXED RATE</div>
                  <div style={{ fontSize: '1rem', color: C.text, fontWeight: 600 }}>1 Bayt Coin = QAR 1.00</div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader>Child Profiles</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {children.map((child, idx) => (
                  <div key={child.id} style={{ border: `1px solid ${C.rule}`, borderRadius: 8, padding: '1rem', background: C.white }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.45rem', fontFamily: F_MONO, color: C.grey }}>NAME</label>
                        <input 
                          type="text" 
                          value={child.name} 
                          onChange={(e) => {
                            const updated = [...children]
                            updated[idx].name = e.target.value
                            setChildren(updated)
                          }}
                          style={{ width: '100%', padding: '0.4rem', fontFamily: F_SANS, borderRadius: 4, border: `1px solid ${C.ruleLight}` }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.45rem', fontFamily: F_MONO, color: C.grey }}>AGE</label>
                        <input 
                          type="number" 
                          value={child.age} 
                          onChange={(e) => {
                            const updated = [...children]
                            updated[idx].age = parseInt(e.target.value) || 0
                            setChildren(updated)
                          }}
                          style={{ width: '100%', padding: '0.4rem', fontFamily: F_MONO, borderRadius: 4, border: `1px solid ${C.ruleLight}` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.ruleLight}`, paddingTop: '2rem' }}>
              <SectionHeader>Cash Savings (QAR)</SectionHeader>
              <p style={{ fontSize: '0.78rem', color: C.grey, fontFamily: F_SANS, marginBottom: '1rem' }}>
                Real-money savings for each child. Adjust when you deposit or withdraw cash.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {children.map(child => {
                  const bal = balances.find(b => b.childId === child.id)
                  return (
                    <div key={child.id} style={{ border: `1px solid rgba(201,168,76,0.25)`, borderRadius: 8, padding: '0.9rem 1rem', background: 'rgba(201,168,76,0.05)' }}>
                      <label style={{ display: 'block', fontFamily: F_MONO, fontSize: '0.45rem', color: C.goldDim, marginBottom: 6 }}>{child.name.toUpperCase()} — CASH QAR</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: F_MONO, fontSize: '0.85rem', color: C.grey }}>QAR</span>
                        <input
                          type="number"
                          value={bal?.cashQar ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0
                            setBalances(prev => prev.map(b => b.childId === child.id ? { ...b, cashQar: val } : b))
                          }}
                          style={{ flex: 1, padding: '0.4rem 0.6rem', fontFamily: F_MONO, fontSize: '0.9rem', fontWeight: 700, borderRadius: 4, border: `1px solid ${C.ruleLight}`, color: C.gold, background: C.white }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.ruleLight}`, paddingTop: '2rem' }}>
              <SectionHeader style={{ color: C.orange }}>Danger Zone</SectionHeader>
              {!isResetConfirm ? (
                <Button label="Reset All Data" variant="outline" style={{ color: C.orange, borderColor: C.orange }} onClick={() => setIsResetConfirm(true)} />
              ) : (
                <div style={{ background: '#fff5f5', border: `1px solid ${C.orange}`, borderRadius: 8, padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: C.orange, fontWeight: 700, marginBottom: '0.8rem' }}>Are you absolutely sure? All coins and history will be lost.</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button label="Yes, Reset Everything" variant="danger" onClick={resetAllData} />
                    <Button label="Cancel" variant="outline" onClick={() => setIsResetConfirm(false)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5 }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.4rem', color: C.grey, letterSpacing: '0.1em' }}>BAYT OS · FAMILY COIN SYSTEM · v1.0</div>
      </div>
    </div>
  )
}