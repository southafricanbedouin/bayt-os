'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarLayout from '@/app/components/sidebar-layout'
import ExpensesTracker from '@/app/dashboard/expenses-tracker'

const C = {
  green:    '#1a3d28',
  forest:   '#f0ebe0',
  gold:     '#c9a84c',
  goldDim:  '#9b7d38',
  cream:    '#faf8f2',
  white:    '#ffffff',
  grey:     '#6b7c6e',
  rule:     '#ddd8cc',
  ruleLight:'#e8e3d8',
  text:     '#0d1a0f',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

// Economy module cards (placeholder items beyond expenses)
const ECONOMY_MODULES = [
  {
    icon: '🪙', name: 'Family Coin',
    desc: 'Chores → earnings → savings. The kids earn coins for completing tasks, learn to save, spend, and give.',
    status: 'live' as const,
    path: '/family-coin',
  },
  {
    icon: '🤲', name: 'Sadaqah Ledger',
    desc: 'Track the family\'s charitable giving — what was given, to whom, and the intention behind it.',
    status: 'soon' as const,
  },
  {
    icon: '💳', name: 'Budget Planner',
    desc: 'Monthly household budget across all categories: food, transport, activities, clothing, and savings.',
    status: 'soon' as const,
  },
  {
    icon: '📊', name: 'Savings Goals',
    desc: 'Family savings targets — Hajj fund, emergency reserve, holiday fund, and education savings.',
    status: 'soon' as const,
  },
  {
    icon: '🔁', name: 'Subscriptions',
    desc: 'All monthly and annual subscriptions in one place — schools, clubs, streaming, gym, apps.',
    status: 'soon' as const,
  },
  {
    icon: '₿', name: 'Phase 2: Crypto',
    desc: 'Family crypto wallet — educational introduction for the children. Phase 2 of the roadmap.',
    status: 'soon' as const,
  },
]

const statusStyle = {
  live:     { bg: 'rgba(76,175,80,0.1)',    color: '#4CAF50', border: 'rgba(76,175,80,0.25)',    label: 'LIVE →' },
  building: { bg: 'rgba(201,168,76,0.1)',   color: C.gold,    border: 'rgba(201,168,76,0.25)',   label: 'BUILDING' },
  soon:     { bg: 'rgba(107,124,110,0.08)', color: C.grey,    border: C.ruleLight,               label: 'IN DEVELOPMENT' },
}

export default function EconomyClient() {
  const [section, setSection] = useState<'expenses' | 'modules'>('expenses')
  const router = useRouter()

  return (
    <SidebarLayout title="BAYT OS — ECONOMY" subtitle="Operations & financial health">

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.25em', color: C.goldDim, textTransform: 'uppercase', marginBottom: 4 }}>Economy Layer</div>
            <h1 style={{ fontFamily: F_SANS, fontSize: '1.8rem', fontWeight: 300, color: C.text, margin: 0 }}>
              Family Economy
              <span style={{ fontFamily: 'var(--font-arabic), serif', fontSize: '1.3rem', color: C.gold, marginLeft: '0.6rem' }}>الاقتصاد</span>
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: C.grey, fontFamily: F_SANS, maxWidth: 640, margin: 0 }}>
          The financial backbone of Bayt Seedat — household budgets, utility tracking, family coin system, sadaqah, and savings goals.
        </p>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: `1px solid ${C.ruleLight}` }}>
        {([
          { key: 'expenses', label: '🏠 Household Expenses' },
          { key: 'modules',  label: '⚡ All Economy Modules' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            style={{
              padding: '0.65rem 1.4rem', fontFamily: F_MONO, fontSize: '0.55rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              border: 'none', background: 'none', cursor: 'pointer',
              color: section === t.key ? C.gold : C.grey,
              borderBottom: section === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Expenses section */}
      {section === 'expenses' && (
        <div>
          {/* OS structure context */}
          <div style={{ background: C.forest, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '0.9rem 1.2rem', marginBottom: '1.2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.2em', color: C.goldDim, marginBottom: 4 }}>OPERATIONS LAYER</div>
              <div style={{ fontSize: '0.82rem', color: C.text, fontFamily: F_SANS }}>🏠 Rent (Fixed) · ⚡ Electricity · 💧 Water · 🌐 Internet</div>
            </div>
            <div>
              <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.2em', color: C.goldDim, marginBottom: 4 }}>ECONOMY LAYER</div>
              <div style={{ fontSize: '0.82rem', color: C.text, fontFamily: F_SANS }}>🪙 Family Coin · 🤲 Sadaqah · 💳 Budget · 📊 Savings</div>
            </div>
          </div>
          <ExpensesTracker />
        </div>
      )}

      {/* Economy modules section */}
      {section === 'modules' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {/* Expenses — live */}
            <div
              onClick={() => setSection('expenses')}
              style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '1.2rem 1.4rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 70%)`, opacity: 0.5 }} />
              <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>📊</div>
              <div style={{ fontSize: '0.9rem', color: C.text, fontFamily: F_SANS, fontWeight: 600, marginBottom: '0.3rem' }}>Household Budgets & Expenses</div>
              <div style={{ fontSize: '0.78rem', color: C.grey, fontFamily: F_SANS, lineHeight: 1.5, marginBottom: '0.8rem' }}>Rent, electricity (Kahramaa bills + kWh), water, internet — monthly breakdown and trends.</div>
              <div style={{ display: 'inline-block', fontFamily: F_MONO, fontSize: '0.45rem', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', borderRadius: 3, background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.25)' }}>LIVE →</div>
            </div>

            {ECONOMY_MODULES.map(m => {
              const s = statusStyle[m.status]
              const isClickable = m.status === 'live' && 'path' in m
              return (
                <div
                  key={m.name}
                  onClick={() => isClickable && router.push((m as typeof m & { path: string }).path)}
                  style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '1.2rem 1.4rem', position: 'relative', overflow: 'hidden', opacity: m.status === 'soon' ? 0.8 : 1, cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 70%)`, opacity: m.status === 'soon' ? 0.2 : 0.5 }} />
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{m.icon}</div>
                  <div style={{ fontSize: '0.9rem', color: C.text, fontFamily: F_SANS, fontWeight: 600, marginBottom: '0.3rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.78rem', color: C.grey, fontFamily: F_SANS, lineHeight: 1.5, marginBottom: '0.8rem' }}>{m.desc}</div>
                  <div style={{ display: 'inline-block', fontFamily: F_MONO, fontSize: '0.45rem', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', borderRadius: 3, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </SidebarLayout>
  )
}
