'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const C = {
  green:    '#1a3d28',
  midgreen: '#245235',
  forest:   '#f0ebe0',
  gold:     '#c9a84c',
  goldDim:  '#9b7d38',
  goldPale: '#f0e4c0',
  cream:    '#faf8f2',
  white:    '#ffffff',
  grey:     '#6b7c6e',
  rule:     '#ddd8cc',
  ruleLight:'#e8e3d8',
  text:     '#0d1a0f',
}
const F_SANS   = 'var(--font-sans), Georgia, serif'
const F_MONO   = 'var(--font-mono), monospace'
const F_ARABIC = 'var(--font-arabic), serif'
export const SIDEBAR_W = 220

// ── Types ─────────────────────────────────────────────────────────────────
// path is optional — if missing, item is "coming soon" (shown dimmed, not clickable)
type SubItem = { icon: string; label: string; path?: string; external?: boolean }
type NavItem = { icon: string; label: string; path: string; external?: boolean; children?: SubItem[] }
type NavGroup = { section: string; items: NavItem[] }

// ── Nav definition ────────────────────────────────────────────────────────
const NAV: NavGroup[] = [
  {
    section: 'Core',
    items: [
      { icon: '🏠', label: 'Home',          path: '/dashboard' },
      { icon: '👨‍👩‍👧‍👦', label: 'Family',         path: '/people' },
      { icon: '📅', label: 'Calendar',      path: 'https://calendar.google.com/calendar/r', external: true },
    ],
  },
  {
    section: 'Layers',
    items: [
      { icon: '📜', label: 'Constitution',  path: '/constitution' },
      {
        icon: '🗂️', label: 'Documents', path: '/documents',
        children: [
          { icon: '🛂', label: 'Passports',           path: '/documents' },
          { icon: '🪪', label: 'IDs & QIDs',          path: '/documents' },
          { icon: '✈️', label: 'Visas',               path: '/documents' },
          { icon: '🚗', label: 'Driving Licences',    path: '/documents' },
          { icon: '📜', label: 'Birth Certificates',  path: '/documents' },
          { icon: '📁', label: 'Drive Folders',       path: '/documents' },
        ],
      },
      {
        icon: '🕐', label: 'Rhythm', path: '/rhythm',
        children: [
          { icon: '☀️', label: 'Daily Rhythm',     path: '/daily-rhythm' },
          { icon: '🕌', label: "Jumu'ah Review",   path: '/jummah' },
          { icon: '🗣️', label: 'Monthly Council',  path: '/monthly-council' },
          { icon: '📅', label: 'Annual Planning',  path: '/annual-planning' },
          { icon: '🕐', label: 'Prayer Times',     path: '/prayer-times' },
          { icon: '🏫', label: 'School Calendar',  path: '/school-calendar' },
        ],
      },
      {
        icon: '🏡', label: 'Operations', path: '/operations',
        children: [
          { icon: '⚡', label: 'Utilities',       path: '/operations' },
          { icon: '🛒', label: 'Shopping',        path: '/shopping' },
          { icon: '🔁', label: 'Subscriptions',   path: '/subscriptions' },
          { icon: '🍽️', label: 'Meal Planning',   path: '/meals' },
          { icon: '✈️', label: 'Travel',           path: '/travel' },
          { icon: '🎡', label: 'Family Outings',   path: '/outings' },
          { icon: '🚗', label: 'Transport',    path: '/transport' },
          { icon: '💊', label: 'Medical',      path: '/health' },
          { icon: '🏫', label: 'School',       path: '/school' },
        ],
      },
      {
        icon: '📖', label: 'Development', path: '/development',
        children: [
          { icon: '🕌', label: 'Deen',             path: '/deen' },
          { icon: '💪', label: 'Health & Fitness',  path: '/fitness' },
          { icon: '📚', label: 'Education',         path: '/education' },
          { icon: '🌿', label: 'Character',         path: '/character' },
          { icon: '💡', label: 'Entrepreneurship',  path: '/entrepreneurship' },
          { icon: '📝', label: 'Reading & Books',   path: '/reading' },
          { icon: '🧪', label: 'Assessments',       path: '/assessments' },
        ],
      },
      {
        icon: '💰', label: 'Economy', path: '/economy',
        children: [
          { icon: '🪙', label: 'Family Coin',   path: '/family-coin' },
          { icon: '🤲', label: 'Sadaqah',       path: '/sadaqa' },
          { icon: '📊', label: 'Savings Goals', path: '/savings' },
          { icon: '💳', label: 'Budget',         path: '/budget' },
          { icon: '🔁', label: 'Subscriptions', path: '/subscriptions' },
          { icon: '🏦', label: 'Assets',         path: '/assets' },
          { icon: '₿',  label: 'Crypto' },
        ],
      },
      {
        icon: '🚀', label: 'Projects', path: '/projects',
        children: [
          { icon: '🕋', label: 'Hajj Planning',      path: '/hajj' },
          { icon: '🌍', label: 'Summer Trip',        path: '/summer-trip' },
          { icon: '👦', label: "Yahya's Project",    path: '/yahya-project' },
          { icon: '🏃', label: "Isa's Project",      path: '/isa-project' },
          { icon: '🏡', label: 'Bayt Seedat App',    path: '/dashboard' },
          { icon: '📖', label: "Dad's Book",         path: '/sab' },
        ],
      },
      {
        icon: '📸', label: 'Memory', path: '/memory',
        children: [
          { icon: '✉️', label: 'Letters to Children', path: '/memory' },
          { icon: '🏆', label: 'Milestones & Stories' },
          { icon: '📚', label: 'Knowledge Archive' },
          { icon: '📷', label: 'Photo Memories' },
          { icon: '🌳', label: 'Family Tree' },
          { icon: '🎙️', label: 'Voice Notes' },
        ],
      },
      { icon: '📊', label: 'Reports',     path: '/reports' },
    ],
  },
  {
    section: 'System',
    items: [
      { icon: '📁', label: 'Notion',        path: 'https://www.notion.so/0e0bea2f459f479a877fec4e116abb07', external: true },
      { icon: '✏️', label: 'Edit Profile',  path: '/profile-builder' },
    ],
  },
]

// ── Plain nav row ──────────────────────────────────────────────────────────
function NavRow({
  icon, label, path, active, external, indent = false, soon = false, onClick,
}: {
  icon: string; label: string; path?: string; active: boolean
  external?: boolean; indent?: boolean; soon?: boolean; onClick?: () => void
}) {
  const [hov, setHov] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (soon) return
    if (onClick) { onClick(); return }
    if (!path) return
    if (external) { window.open(path, '_blank'); return }
    router.push(path)
  }

  const dimColor = indent
    ? soon ? 'rgba(232,213,163,0.22)' : 'rgba(232,213,163,0.45)'
    : 'rgba(232,213,163,0.6)'

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => !soon && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: indent ? '0.38rem 1.4rem 0.38rem 2.5rem' : '0.52rem 1.4rem',
        fontSize: indent ? '0.74rem' : '0.82rem',
        fontFamily: F_SANS,
        color: active ? C.gold : hov ? C.goldPale : dimColor,
        cursor: soon ? 'default' : 'pointer',
        borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent',
        background: (active || hov) ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'all 0.15s',
        opacity: soon ? 0.55 : 1,
      }}
    >
      <span style={{ fontSize: indent ? '0.75rem' : '0.88rem', width: 14, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {soon && (
        <span style={{ fontFamily: F_MONO, fontSize: '0.38rem', letterSpacing: '0.1em', color: 'rgba(201,168,76,0.35)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 3, padding: '1px 4px' }}>
          SOON
        </span>
      )}
      {external && !indent && <span style={{ fontSize: 9, opacity: 0.4 }}>↗</span>}
    </div>
  )
}

// ── Expandable parent row ──────────────────────────────────────────────────
function ExpandableNavRow({ item, pathname }: { item: NavItem & { children: SubItem[] }; pathname: string }) {
  const router = useRouter()
  const liveChildPaths = item.children.filter(c => c.path).map(c => c.path as string)
  const anyChildActive = liveChildPaths.some(p => pathname.startsWith(p))
  const selfActive = !anyChildActive && (pathname === item.path || pathname.startsWith(item.path + '/'))

  const [open, setOpen] = useState(anyChildActive)
  const [hov, setHov] = useState(false)

  return (
    <div>
      {/* Parent row */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '0.52rem 1.1rem 0.52rem 1.4rem',
          background: (selfActive || hov) ? 'rgba(255,255,255,0.07)' : 'transparent',
          borderLeft: selfActive ? `2px solid ${C.gold}` : '2px solid transparent',
          transition: 'all 0.15s',
        }}
      >
        <div
          onClick={() => router.push(item.path)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem', flex: 1,
            fontSize: '0.82rem', fontFamily: F_SANS, cursor: 'pointer',
            color: selfActive ? C.gold : hov ? C.goldPale : 'rgba(232,213,163,0.6)',
          }}
        >
          <span style={{ fontSize: '0.88rem', width: 16, textAlign: 'center' }}>{item.icon}</span>
          {item.label}
        </div>

        {/* +/- toggle */}
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            width: 17, height: 17, borderRadius: 3, flexShrink: 0,
            border: `1px solid rgba(201,168,76,${open ? '0.4' : '0.18'})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: open ? C.gold : 'rgba(201,168,76,0.4)',
            fontSize: '0.7rem', fontFamily: F_MONO, fontWeight: 700,
            background: open ? 'rgba(201,168,76,0.1)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {open ? '−' : '+'}
        </div>
      </div>

      {/* Sub-items */}
      {open && (
        <div>
          {item.children.map((child, i) => (
            <NavRow
              key={child.path ?? child.label}
              icon={child.icon}
              label={child.label}
              path={child.path}
              external={child.external}
              active={!!child.path && pathname.startsWith(child.path)}
              indent
              soon={!child.path}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────
export function Sidebar({ displayName }: { displayName?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      width: SIDEBAR_W, minHeight: '100vh',
      background: C.green, borderRight: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.6rem 1.4rem 1.2rem', borderBottom: `1px solid ${C.rule}` }}>
        <span style={{ fontFamily: F_ARABIC, fontSize: '1.6rem', color: C.gold, lineHeight: 1, display: 'block' }}>بيت</span>
        <span style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.7)', marginTop: '0.3rem', display: 'block' }}>BAYT OS · v0.1</span>
        <span style={{ fontFamily: F_MONO, fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(232,213,163,0.4)', marginTop: '0.2rem', display: 'block' }}>Seedat Family · Doha</span>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '0.5rem' }}>
        {NAV.map(group => (
          <div key={group.section} style={{ padding: '0.8rem 0' }}>
            <div style={{ fontFamily: F_MONO, fontSize: '0.48rem', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.45)', padding: '0.3rem 1.4rem 0.25rem', textTransform: 'uppercase' }}>
              {group.section}
            </div>
            {group.items.map(item =>
              item.children ? (
                <ExpandableNavRow
                  key={item.path}
                  item={item as NavItem & { children: SubItem[] }}
                  pathname={pathname}
                />
              ) : (
                <NavRow
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  external={item.external}
                  active={!item.external && (
                    item.path === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.path)
                  )}
                />
              )
            )}
          </div>
        ))}

        {/* Sign out */}
        <div style={{ padding: '0 0 0.8rem' }}>
          <NavRow
            icon="🚪"
            label={signingOut ? 'Signing out…' : 'Sign Out'}
            active={false}
            onClick={handleSignOut}
          />
        </div>
      </div>

      {/* Phase badge */}
      <div style={{ margin: '0 1.1rem 1.2rem', background: C.forest, border: `1px solid ${C.ruleLight}`, borderRadius: 6, padding: '0.75rem 0.9rem' }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', letterSpacing: '0.18em', color: C.goldDim }}>CURRENT PHASE</div>
        <div style={{ fontSize: '0.82rem', color: C.gold, fontWeight: 600, margin: '0.2rem 0 0.35rem', fontFamily: F_SANS }}>Phase 1 — Foundation</div>
        <div style={{ height: 3, background: C.ruleLight, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: C.gold, borderRadius: 2, width: '15%' }} />
        </div>
        <div style={{ fontFamily: F_MONO, fontSize: '0.47rem', color: C.grey, marginTop: '0.25rem' }}>Day 1 of 7 · Full Family</div>
      </div>
    </nav>
  )
}

// ── Full page layout wrapper ───────────────────────────────────────────────
export default function SidebarLayout({
  children, title, subtitle, displayName,
}: {
  children: React.ReactNode; title: string; subtitle?: string; displayName?: string
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream }}>
      <Sidebar displayName={displayName} />

      <main style={{ marginLeft: SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{
          background: C.white, borderBottom: `1px solid ${C.rule}`,
          padding: '0.7rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.2em', color: C.goldDim }}>{title}</div>
            {subtitle && <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_SANS, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <div
            onClick={() => window.open('https://www.notion.so/0e0bea2f459f479a877fec4e116abb07', '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: C.cream, border: `1px solid ${C.rule}`, borderRadius: 4, padding: '0.3rem 0.7rem', cursor: 'pointer' }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: F_MONO, fontSize: '0.52rem', letterSpacing: '0.1em', color: C.grey }}>NOTION · BAYT SEEDAT OS ↗</span>
          </div>
        </div>

        <div style={{ padding: '2rem 2rem 3rem', flex: 1 }}>{children}</div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 768px) {
          nav { display: none !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
