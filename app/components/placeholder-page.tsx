'use client'

import { useRouter } from 'next/navigation'

const C = {
  green:    '#1a3d28',
  forest:   '#f0ebe0',
  gold:     '#c9a84c',
  goldDim:  '#9b7d38',
  cream:    '#faf8f2',
  white:    '#ffffff',
  grey:     '#6b7c6e',
  ruleLight:'#e8e3d8',
  text:     '#0d1a0f',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

interface Module {
  icon: string
  name: string
  desc: string
  status: 'live' | 'building' | 'soon'
}

export default function PlaceholderPage({
  icon,
  layer,
  title,
  description,
  modules,
  arabic,
}: {
  icon: string
  layer: string
  title: string
  description: string
  modules: Module[]
  arabic?: string
}) {
  const router = useRouter()

  const statusStyle = {
    live:     { bg: 'rgba(76,175,80,0.1)',    color: '#4CAF50', border: 'rgba(76,175,80,0.25)',    label: 'LIVE' },
    building: { bg: 'rgba(201,168,76,0.1)',   color: C.gold,    border: 'rgba(201,168,76,0.25)',   label: 'BUILDING' },
    soon:     { bg: 'rgba(107,124,110,0.08)', color: C.grey,    border: C.ruleLight,               label: 'IN DEVELOPMENT' },
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>{icon}</span>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.25em', color: C.goldDim, textTransform: 'uppercase', marginBottom: 4 }}>{layer}</div>
            <h1 style={{ fontFamily: F_SANS, fontSize: '1.8rem', fontWeight: 300, color: C.text, margin: 0 }}>
              {title}
              {arabic && <span style={{ fontFamily: 'var(--font-arabic), serif', fontSize: '1.4rem', color: C.gold, marginLeft: '0.6rem', fontStyle: 'normal' }}>{arabic}</span>}
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: C.grey, fontFamily: F_SANS, maxWidth: 600, margin: 0 }}>{description}</p>
      </div>

      {/* Status banner */}
      <div style={{
        background: C.forest, border: `1px solid ${C.ruleLight}`, borderLeft: `3px solid ${C.gold}`,
        borderRadius: 8, padding: '1rem 1.4rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <span style={{ fontSize: '1.2rem' }}>🛠️</span>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.55rem', letterSpacing: '0.15em', color: C.goldDim, marginBottom: 3 }}>PAGE STATUS</div>
          <div style={{ fontSize: '0.85rem', color: C.text, fontFamily: F_SANS }}>
            This section is being built. The modules below will be activated as Bayt OS develops.
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {modules.map(m => {
          const s = statusStyle[m.status]
          return (
            <div
              key={m.name}
              style={{
                background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: 8,
                padding: '1.2rem 1.4rem', position: 'relative', overflow: 'hidden',
                opacity: m.status === 'soon' ? 0.8 : 1,
                cursor: m.status === 'live' ? 'pointer' : 'default',
              }}
            >
              {/* Gold top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 70%)`, opacity: m.status === 'soon' ? 0.2 : 0.5 }} />
              <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{m.icon}</div>
              <div style={{ fontSize: '0.9rem', color: C.text, fontFamily: F_SANS, fontWeight: 600, marginBottom: '0.3rem' }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', color: C.grey, fontFamily: F_SANS, lineHeight: 1.5, marginBottom: '0.8rem' }}>{m.desc}</div>
              <div style={{
                display: 'inline-block', fontFamily: F_MONO, fontSize: '0.45rem', letterSpacing: '0.12em',
                padding: '0.2rem 0.5rem', borderRadius: 3,
                background: s.bg, color: s.color, border: `1px solid ${s.border}`,
              }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Back to home */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ background: 'none', border: `1px solid ${C.ruleLight}`, color: C.grey, borderRadius: 6, padding: '0.5rem 1.2rem', fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.1em', cursor: 'pointer' }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}
