'use client'
import { useState } from 'react'
import SidebarLayout from '@/app/components/sidebar-layout'

const C = {
  green:    '#1a3d28',
  gold:     '#c9a84c',
  goldDim:  '#9b7d38',
  cream:    '#faf8f2',
  offwhite: '#f5f0e6',
  white:    '#ffffff',
  grey:     '#6b7c6e',
  rule:     '#ddd8cc',
  border:   '#e2ddd0',
  text:     '#0d1a0f',
}
const F_SANS  = 'var(--font-sans), Crimson Pro, Georgia, serif'
const F_MONO  = 'var(--font-mono), IBM Plex Mono, monospace'
const F_ARABIC = 'var(--font-arabic), Amiri, serif'

const MODULES = [
  { icon: '🏆', name: 'Milestones & Stories',  desc: 'First words, school firsts, adventures, and family moments logged and timestamped for posterity.',    status: 'building' as const },
  { icon: '📚', name: 'Knowledge Archive',      desc: 'Lessons learned, family wisdom, Islamic reminders, and insights worth preserving across generations.',  status: 'soon' as const },
  { icon: '📸', name: 'Photo Memories',         desc: 'Curated family photos by year and milestone — not a gallery, a story.',                               status: 'soon' as const },
  { icon: '🌳', name: 'Family Tree',            desc: 'The Seedat lineage — names, connections, origin stories, and the family\'s roots.',                   status: 'soon' as const },
  { icon: '🎙️', name: 'Voice Notes',           desc: 'Audio recordings — bedtime stories, Quran recitations, and messages from parents to children.',       status: 'soon' as const },
]

const statusStyle = {
  live:     { bg: 'rgba(76,175,80,0.1)',    color: '#4CAF50', border: 'rgba(76,175,80,0.25)',    label: 'LIVE' },
  building: { bg: 'rgba(201,168,76,0.1)',   color: C.gold,    border: 'rgba(201,168,76,0.25)',   label: 'BUILDING' },
  soon:     { bg: 'rgba(107,124,110,0.08)', color: C.grey,    border: C.rule,                    label: 'IN DEVELOPMENT' },
}

export default function MemoryClient() {
  const [tab, setTab] = useState<'letters' | 'modules'>('letters')

  return (
    <SidebarLayout title="BAYT OS — MEMORY" subtitle="The family archive">

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>📸</span>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.25em', color: C.goldDim, textTransform: 'uppercase', marginBottom: 4 }}>Memory Layer</div>
            <h1 style={{ fontFamily: F_SANS, fontSize: '1.8rem', fontWeight: 300, color: C.text, margin: 0 }}>
              Family Memory
              <span style={{ fontFamily: F_ARABIC, fontSize: '1.3rem', color: C.gold, marginLeft: '0.6rem' }}>الذاكرة</span>
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: C.grey, fontFamily: F_SANS, maxWidth: 640, margin: 0 }}>
          The Seedat family archive — milestones, stories, letters, and knowledge. A living record that will outlast us and give our children roots and legacy.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: `1px solid ${C.rule}` }}>
        {([
          { key: 'letters', label: '✉️ Letters to Children' },
          { key: 'modules', label: '📦 All Memory Modules' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.65rem 1.4rem', fontFamily: F_MONO, fontSize: '0.55rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.key ? C.gold : C.grey,
              borderBottom: tab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LETTERS TAB ── */}
      {tab === 'letters' && (
        <div>
          {/* Section intro */}
          <div style={{ marginBottom: '1.8rem' }}>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.2em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Letters Archive</div>
            <p style={{ fontSize: '0.9rem', color: C.grey, fontFamily: F_SANS, maxWidth: 600, margin: 0, lineHeight: 1.6 }}>
              Muhammad and Camilla's letters to Yahya, Isa, Linah, and Dana — written at milestones, to be read when the time is right.
            </p>
          </div>

          {/* Letter 1 */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: '1.5rem' }}>
            {/* Letter header bar */}
            <div style={{ background: C.green, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.22em', color: C.gold, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Letter No. 1 · Written Monday Night, Doha
                </div>
                <div style={{ fontFamily: F_SANS, fontSize: '1.1rem', color: '#fff', fontWeight: 300 }}>
                  A Letter to Our Children
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>DATE</div>
                <div style={{ fontFamily: F_SANS, fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>11 March 2026</div>
                <div style={{ fontFamily: F_ARABIC, fontSize: '0.85rem', color: C.gold }}>٢١ رمضان ١٤٤٧</div>
              </div>
            </div>

            {/* Letter meta */}
            <div style={{ background: C.offwhite, padding: '0.7rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.18em', color: C.grey, textTransform: 'uppercase' }}>From</span>
                <span style={{ fontFamily: F_SANS, fontSize: '0.85rem', color: C.text, marginLeft: '0.5rem' }}>Muhammad & Camilla</span>
              </div>
              <div>
                <span style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.18em', color: C.grey, textTransform: 'uppercase' }}>To</span>
                <span style={{ fontFamily: F_SANS, fontSize: '0.85rem', color: C.text, marginLeft: '0.5rem' }}>Yahya · Isa · Linah · Dana</span>
              </div>
              <div>
                <span style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.18em', color: C.grey, textTransform: 'uppercase' }}>Read at</span>
                <span style={{ fontFamily: F_SANS, fontSize: '0.85rem', color: C.text, marginLeft: '0.5rem' }}>First Shura · On leaving home</span>
              </div>
            </div>

            {/* Letter body */}
            <div style={{ padding: '2rem 1.5rem', borderTop: `3px solid ${C.gold}` }}>
              <div style={{ maxWidth: 680, fontSize: '1.02rem', lineHeight: 1.85, color: C.text, fontFamily: F_SANS }}>

                <p style={{ marginBottom: '1.1rem' }}>To Our Children,</p>

                <p style={{ marginBottom: '1.1rem' }}>
                  We wrote this on a Monday night in 2026, in Doha, while you were all still small enough to be surprised by things and old enough to start understanding them.
                </p>

                <p style={{ marginBottom: '1.1rem' }}>
                  We want you to know why we built this. We built it because we watched the world become louder and more confusing every year, and we made a decision: our home would be different. Not perfect — we are not naive enough to promise you perfect. But <em style={{ color: C.green }}>different</em>. Intentional. A place where the important things are named out loud so they don't get lost in the noise.
                </p>

                <p style={{ marginBottom: '1.1rem' }}>
                  We built it because we believe that the most important thing we will ever do in our lives is raise you. Not the companies, not the projects, not the content or the careers. You. The four of you are the legacy. Everything else is secondary.
                </p>

                {/* Individual notes */}
                <div style={{ margin: '1.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {[
                    { name: 'Yahya', note: 'we see how you carry responsibility like it was made for you. Let that be a strength, not a burden. You do not have to hold everything alone.' },
                    { name: 'Isa',   note: 'we see the way your mind works, always looking for how things connect, always building something. Build with intention. Build for good.' },
                    { name: 'Linah', note: 'we see your heart. We have always seen it. The world needs more people who feel things as deeply as you do. Don\'t let anyone tell you that\'s too much.' },
                    { name: 'Dana',  note: 'we see your fire. Hold onto it. The world will try to calm you down. Some of that is wisdom. But the fire itself — the part that makes you you — protect that.' },
                  ].map(({ name, note }) => (
                    <div key={name} style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 28, height: 28, background: C.gold, color: C.green,
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: F_MONO, fontSize: '0.5rem', fontWeight: 700, flexShrink: 0, marginTop: 3,
                      }}>
                        {name[0]}
                      </div>
                      <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.75, color: C.text, fontFamily: F_SANS }}>
                        <strong style={{ color: C.green }}>{name}</strong> — {note}
                      </p>
                    </div>
                  ))}
                </div>

                <p style={{ marginBottom: '1.1rem' }}>
                  We will not always get this right. We will make mistakes as parents that we cannot yet foresee. When we do — and when you are old enough to name them — please know: we were doing our best with what we had, and we loved you completely, always.
                </p>

                <p style={{ marginBottom: '1.5rem' }}>
                  <em style={{ color: C.green }}>The best of us is the one who is best to his family. We are trying to be that. We hope you will be too.</em>
                </p>

                <p style={{ fontWeight: 600, color: C.green, fontFamily: F_SANS, margin: 0 }}>
                  With all of our love,<br />
                  Muhammad and Camilla
                </p>
              </div>
            </div>
          </div>

          {/* Future letters placeholder */}
          <div style={{ border: `1px dashed ${C.rule}`, borderRadius: 8, padding: '1.5rem', textAlign: 'center', background: C.cream }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>✉️</div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.2em', color: C.grey, marginBottom: '0.4rem' }}>MORE LETTERS</div>
            <p style={{ fontSize: '0.85rem', color: C.grey, fontFamily: F_SANS, margin: 0 }}>
              Future letters will appear here — milestones, birthdays, rites of passage.
            </p>
          </div>
        </div>
      )}

      {/* ── MODULES TAB ── */}
      {tab === 'modules' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>

            {/* Letters — live */}
            <div
              onClick={() => setTab('letters')}
              style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8, padding: '1.2rem 1.4rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 70%)`, opacity: 0.5 }} />
              <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>✉️</div>
              <div style={{ fontSize: '0.9rem', color: C.text, fontFamily: F_SANS, fontWeight: 600, marginBottom: '0.3rem' }}>Letters to Children</div>
              <div style={{ fontSize: '0.78rem', color: C.grey, fontFamily: F_SANS, lineHeight: 1.5, marginBottom: '0.8rem' }}>Muhammad and Camilla's letters to each child — to be read at milestones, on leaving home, when needed.</div>
              <div style={{ display: 'inline-block', fontFamily: F_MONO, fontSize: '0.45rem', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', borderRadius: 3, background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.25)' }}>LIVE → 1 LETTER</div>
            </div>

            {MODULES.map(m => {
              const s = statusStyle[m.status]
              return (
                <div key={m.name} style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: 8, padding: '1.2rem 1.4rem', position: 'relative', overflow: 'hidden', opacity: m.status === 'soon' ? 0.8 : 1 }}>
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
