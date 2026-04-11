'use client'

import { useState, useEffect } from 'react'
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
  text:     '#0d1a0f',
  red:      '#c0392b',
  orange:   '#e67e22',
  blue:     '#2471a3',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

// ── Module inventory ───────────────────────────────────────────────────────
const LAYERS = [
  {
    name: 'Core',
    icon: '🏠',
    modules: [
      { name: 'Dashboard',       status: 'live' },
      { name: 'Family Profiles', status: 'live' },
      { name: 'Notifications',   status: 'live' },
      { name: 'Family Forum',    status: 'live' },
    ],
  },
  {
    name: 'Documents',
    icon: '🗂️',
    modules: [
      { name: 'Official Documents Dashboard', status: 'live' },
    ],
  },
  {
    name: 'Rhythm',
    icon: '🕐',
    modules: [
      { name: 'Daily Rhythm',    status: 'live' },
      { name: "Jumu'ah Review",  status: 'live' },
      { name: 'Monthly Council', status: 'live' },
      { name: 'Annual Planning', status: 'live' },
      { name: 'Prayer Times',    status: 'live' },
      { name: 'School Calendar', status: 'live' },
    ],
  },
  {
    name: 'Operations',
    icon: '🏡',
    modules: [
      { name: 'Operations Hub',  status: 'live' },
      { name: 'Shopping',        status: 'live' },
      { name: 'Subscriptions',   status: 'live' },
      { name: 'Meal Planning',   status: 'live' },
      { name: 'Travel',          status: 'live' },
      { name: 'Family Outings',  status: 'live' },
      { name: 'Transport',       status: 'live' },
      { name: 'Medical / Health',status: 'live' },
      { name: 'School',          status: 'live' },
    ],
  },
  {
    name: 'Development',
    icon: '📖',
    modules: [
      { name: 'Deen',             status: 'live' },
      { name: 'Health & Fitness', status: 'live' },
      { name: 'Education',        status: 'live' },
      { name: 'Character',        status: 'live' },
      { name: 'Entrepreneurship', status: 'live' },
      { name: 'Reading & Books',  status: 'live' },
      { name: 'Assessments',      status: 'testing' },
      { name: 'Family Goals',     status: 'live' },
      { name: 'Contributions',    status: 'live' },
    ],
  },
  {
    name: 'Economy',
    icon: '💰',
    modules: [
      { name: 'Family Coin',    status: 'live' },
      { name: 'Sadaqah',        status: 'live' },
      { name: 'Savings Goals',  status: 'live' },
      { name: 'Budget',         status: 'live' },
      { name: 'Assets',         status: 'live' },
      { name: 'Crypto',         status: 'soon' },
    ],
  },
  {
    name: 'Projects',
    icon: '🚀',
    modules: [
      { name: 'Hajj Planning',   status: 'live' },
      { name: 'Summer Trip',     status: 'live' },
      { name: "Yahya's Project", status: 'live' },
      { name: "Isa's Project",   status: 'live' },
      { name: 'Bayt Seedat App', status: 'live' },
      { name: "Dad's Book (SAB)",status: 'live' },
    ],
  },
  {
    name: 'Memory',
    icon: '📸',
    modules: [
      { name: 'Letters to Children', status: 'live' },
      { name: 'Milestones & Stories',status: 'soon' },
      { name: 'Knowledge Archive',   status: 'soon' },
      { name: 'Photo Memories',      status: 'soon' },
      { name: 'Family Tree',         status: 'soon' },
      { name: 'Voice Notes',         status: 'soon' },
    ],
  },
  {
    name: 'System',
    icon: '⚙️',
    modules: [
      { name: 'Reports',         status: 'testing' },
      { name: 'Profile Builder', status: 'live' },
      { name: 'Constitution',    status: 'live' },
    ],
  },
]

const BUILD_MILESTONES = [
  { date: 'Nov 2024', label: 'Project Inception',           detail: 'BaytOS concept defined. Family OS vision scoped.' },
  { date: 'Jan 2025', label: 'Architecture Set',            detail: 'Next.js App Router + Supabase stack chosen. Design tokens created.' },
  { date: 'Feb 2025', label: 'Core Modules Live',           detail: 'Dashboard, Profiles, Auth, Sidebar complete.' },
  { date: 'Mar 2025', label: 'Batch 1–5 Generated',         detail: '20 modules generated via Gemini 2.5 Pro pipeline.' },
  { date: 'Mar 2025', label: 'Economy Layer Live',          detail: 'Family Coin, Sadaqah, Savings, Budget modules deployed.' },
  { date: 'Apr 2025', label: 'Official Documents Live',     detail: '30 real family documents seeded. Expiry alerts active.' },
  { date: 'Apr 2025', label: 'All Layer Hubs Live',         detail: 'Rhythm, Operations, Development, Projects all live.' },
  { date: 'Apr 2025', label: 'Testing Phase Begins',        detail: 'Family invited to use and report bugs. Bug tracker added.' },
]

// ── Status helpers ─────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'live')    return C.gold
  if (s === 'testing') return C.orange
  if (s === 'soon')    return C.grey
  return C.grey
}
function statusLabel(s: string) {
  if (s === 'live')    return 'LIVE'
  if (s === 'testing') return 'TESTING'
  if (s === 'soon')    return 'SOON'
  return s.toUpperCase()
}

// ── Bug Report Form ────────────────────────────────────────────────────────
type BugReport = {
  id: string
  title: string
  description: string
  module_name: string
  severity: string
  reported_by: string
  status: string
  created_at: string
}

function BugReportForm({ onSubmit }: { onSubmit: () => void }) {
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [module, setModule]     = useState('')
  const [severity, setSeverity] = useState('medium')
  const [name, setName]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)

  const moduleOptions = LAYERS.flatMap(l => l.modules.map(m => m.name)).sort()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('bug_reports').insert({
        title: title.trim(),
        description: desc.trim(),
        module_name: module || 'General',
        severity,
        reported_by: name.trim() || 'Anonymous',
        status: 'open',
      })
      setDone(true)
      setTimeout(() => { setDone(false); setTitle(''); setDesc(''); setModule(''); setName(''); onSubmit() }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (done) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: C.gold, fontFamily: F_SANS }}>
      ✓ Bug reported. شكراً — thank you for helping improve BaytOS.
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.8rem',
    background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.rule}`,
    borderRadius: 6, color: C.cream, fontFamily: F_SANS, fontSize: '0.85rem',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.3rem',
    fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: C.goldDim,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>TITLE *</label>
        <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Brief description of the issue" required />
      </div>
      <div>
        <label style={labelStyle}>MODULE</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={module} onChange={e => setModule(e.target.value)}>
          <option value="">Select a module…</option>
          {moduleOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>SEVERITY</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="low">Low — minor cosmetic</option>
            <option value="medium">Medium — functionality broken</option>
            <option value="high">High — page crash / data issue</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>REPORTED BY</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
      </div>
      <div>
        <label style={labelStyle}>DETAILS</label>
        <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Steps to reproduce, what you expected vs what happened…" />
      </div>
      <button type="submit" disabled={saving || !title.trim()}
        style={{
          padding: '0.7rem 1.6rem', background: saving ? C.midgreen : C.gold,
          color: C.green, border: 'none', borderRadius: 6, fontFamily: F_MONO,
          fontSize: '0.75rem', letterSpacing: '0.12em', cursor: saving ? 'default' : 'pointer',
          alignSelf: 'flex-start', fontWeight: 700, transition: 'all 0.2s',
        }}>
        {saving ? 'SUBMITTING…' : 'REPORT BUG'}
      </button>
    </form>
  )
}

// ── Bug list ───────────────────────────────────────────────────────────────
function BugList({ bugs, onClose }: { bugs: BugReport[]; onClose: (id: string) => void }) {
  if (!bugs.length) return (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: C.grey, fontFamily: F_SANS, fontSize: '0.85rem' }}>
      No open bugs. الحمد لله 🎉
    </div>
  )

  const severityColor = (s: string) => s === 'high' ? C.red : s === 'medium' ? C.orange : C.grey

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {bugs.map(bug => (
        <div key={bug.id} style={{
          padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.04)',
          borderRadius: 8, border: `1px solid ${C.rule}`,
          display: 'flex', alignItems: 'flex-start', gap: '1rem',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{
                fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.1em',
                color: severityColor(bug.severity), border: `1px solid ${severityColor(bug.severity)}`,
                borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase',
              }}>{bug.severity}</span>
              <span style={{ fontFamily: F_SANS, fontSize: '0.88rem', color: C.cream, fontWeight: 600 }}>{bug.title}</span>
            </div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.68rem', color: C.grey }}>
              {bug.module_name} · {bug.reported_by} · {new Date(bug.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
            {bug.description && (
              <div style={{ marginTop: '0.4rem', fontFamily: F_SANS, fontSize: '0.8rem', color: 'rgba(232,213,163,0.55)' }}>
                {bug.description}
              </div>
            )}
          </div>
          <button onClick={() => onClose(bug.id)} style={{
            background: 'none', border: `1px solid ${C.rule}`, borderRadius: 5,
            color: C.grey, fontFamily: F_MONO, fontSize: '0.6rem', padding: '3px 8px',
            cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.08em',
          }}>RESOLVE</button>
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function BaytOSProject() {
  const [bugs, setBugs]           = useState<BugReport[]>([])
  const [loadingBugs, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'bugs' | 'timeline'>('overview')
  const [refreshKey, setRefreshKey] = useState(0)

  const allModules    = LAYERS.flatMap(l => l.modules)
  const liveCount     = allModules.filter(m => m.status === 'live').length
  const testingCount  = allModules.filter(m => m.status === 'testing').length
  const soonCount     = allModules.filter(m => m.status === 'soon').length
  const totalCount    = allModules.length
  const completion    = Math.round((liveCount / totalCount) * 100)

  useEffect(() => {
    async function fetchBugs() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('bug_reports')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      setBugs(data || [])
      setLoading(false)
    }
    fetchBugs()
  }, [refreshKey])

  async function handleResolve(id: string) {
    const supabase = createClient()
    await supabase.from('bug_reports').update({ status: 'resolved' }).eq('id', id)
    setRefreshKey(k => k + 1)
  }

  const TABS = [
    { key: 'overview',  label: 'OVERVIEW' },
    { key: 'modules',   label: 'MODULES' },
    { key: 'bugs',      label: `BUGS ${bugs.length > 0 ? `(${bugs.length})` : ''}` },
    { key: 'timeline',  label: 'TIMELINE' },
  ] as const

  return (
    <div style={{ padding: '2rem', maxWidth: 920, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2.4rem' }}>
        <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.14em', color: C.goldDim, marginBottom: '0.4rem' }}>
          PROJECTS · BAYT SEEDAT APP
        </div>
        <h1 style={{ fontFamily: F_SANS, fontSize: '2rem', fontWeight: 700, color: C.cream, margin: 0 }}>
          BaytOS Build Status
        </h1>
        <p style={{ fontFamily: F_SANS, fontSize: '0.9rem', color: C.grey, marginTop: '0.5rem' }}>
          Your family operating system — built in Doha, روoted in deen.
        </p>
      </div>

      {/* ── Stat bar ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Total Modules',   value: totalCount,   color: C.cream },
          { label: 'Live',            value: liveCount,    color: C.gold },
          { label: 'In Testing',      value: testingCount, color: C.orange },
          { label: 'Coming Soon',     value: soonCount,    color: C.grey },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '1.2rem', background: 'rgba(255,255,255,0.05)',
            borderRadius: 10, border: `1px solid ${C.rule}`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: F_MONO, fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.62rem', letterSpacing: '0.1em', color: C.grey, marginTop: '0.3rem' }}>
              {stat.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Completion bar ── */}
      <div style={{ marginBottom: '2rem', padding: '1.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: `1px solid ${C.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.7rem' }}>
          <span style={{ fontFamily: F_MONO, fontSize: '0.68rem', letterSpacing: '0.12em', color: C.goldDim }}>COMPLETION</span>
          <span style={{ fontFamily: F_MONO, fontSize: '1.4rem', fontWeight: 700, color: C.gold }}>{completion}%</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${completion}%`,
            background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold})`,
            borderRadius: 5, transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'LIVE', pct: Math.round((liveCount / totalCount) * 100), color: C.gold },
            { label: 'TESTING', pct: Math.round((testingCount / totalCount) * 100), color: C.orange },
            { label: 'SOON', pct: Math.round((soonCount / totalCount) * 100), color: C.grey },
          ].map(s => (
            <span key={s.label} style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: s.color }}>
              {s.label} {s.pct}%
            </span>
          ))}
        </div>
      </div>

      {/* ── Phase badge ── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.5rem 1rem', background: 'rgba(230,126,34,0.12)',
        border: `1px solid ${C.orange}`, borderRadius: 20, marginBottom: '2rem',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: F_MONO, fontSize: '0.68rem', letterSpacing: '0.12em', color: C.orange }}>
          TESTING PHASE — Family QA Active
        </span>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.rule}`, marginBottom: '1.6rem', gap: '0.2rem' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.1em',
              color: activeTab === tab.key ? C.gold : C.grey,
              borderBottom: activeTab === tab.key ? `2px solid ${C.gold}` : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>{tab.label}</button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {LAYERS.map(layer => {
            const live    = layer.modules.filter(m => m.status === 'live').length
            const total   = layer.modules.length
            const pct     = Math.round((live / total) * 100)
            return (
              <div key={layer.name} style={{
                padding: '1.1rem', background: 'rgba(255,255,255,0.04)',
                borderRadius: 8, border: `1px solid ${C.rule}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: F_SANS, fontSize: '0.88rem', color: C.cream }}>
                    {layer.icon} {layer.name}
                  </span>
                  <span style={{ fontFamily: F_MONO, fontSize: '0.72rem', color: pct === 100 ? C.gold : C.grey }}>
                    {live}/{total}
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? C.gold : C.orange, borderRadius: 2 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modules tab ── */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {LAYERS.map(layer => (
            <div key={layer.name}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.12em', color: C.goldDim, marginBottom: '0.6rem' }}>
                {layer.icon} {layer.name.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {layer.modules.map(m => (
                  <div key={m.name} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.75rem', borderRadius: 20,
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${statusColor(m.status)}33`,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(m.status), display: 'inline-block' }} />
                    <span style={{ fontFamily: F_SANS, fontSize: '0.78rem', color: C.cream }}>{m.name}</span>
                    <span style={{ fontFamily: F_MONO, fontSize: '0.55rem', color: statusColor(m.status), letterSpacing: '0.08em' }}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bugs tab ── */}
      {activeTab === 'bugs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.12em', color: C.goldDim, marginBottom: '1rem' }}>
              REPORT A BUG
            </div>
            <div style={{ padding: '1.4rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px solid ${C.rule}` }}>
              <BugReportForm onSubmit={() => setRefreshKey(k => k + 1)} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', letterSpacing: '0.12em', color: C.goldDim, marginBottom: '1rem' }}>
              OPEN BUGS {bugs.length > 0 && `(${bugs.length})`}
            </div>
            {loadingBugs
              ? <div style={{ color: C.grey, fontFamily: F_SANS, fontSize: '0.85rem' }}>Loading…</div>
              : <BugList bugs={bugs} onClose={handleResolve} />
            }
          </div>
        </div>
      )}

      {/* ── Timeline tab ── */}
      {activeTab === 'timeline' && (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ position: 'absolute', left: '0.7rem', top: 0, bottom: 0, width: 1, background: C.rule }} />
          {BUILD_MILESTONES.map((m, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: '1.6rem' }}>
              <div style={{
                position: 'absolute', left: '-1.62rem', top: '0.15rem',
                width: 10, height: 10, borderRadius: '50%', background: C.gold,
                border: `2px solid ${C.green}`,
              }} />
              <div style={{ fontFamily: F_MONO, fontSize: '0.62rem', letterSpacing: '0.1em', color: C.goldDim, marginBottom: '0.2rem' }}>
                {m.date}
              </div>
              <div style={{ fontFamily: F_SANS, fontSize: '0.88rem', fontWeight: 600, color: C.cream, marginBottom: '0.2rem' }}>
                {m.label}
              </div>
              <div style={{ fontFamily: F_SANS, fontSize: '0.8rem', color: C.grey }}>
                {m.detail}
              </div>
            </div>
          ))}
          <div style={{ position: 'relative', marginBottom: '1.6rem' }}>
            <div style={{
              position: 'absolute', left: '-1.62rem', top: '0.15rem',
              width: 10, height: 10, borderRadius: '50%', background: C.orange,
              border: `2px solid ${C.green}`, animation: 'pulse 2s infinite',
            }} />
            <div style={{ fontFamily: F_MONO, fontSize: '0.62rem', letterSpacing: '0.1em', color: C.orange, marginBottom: '0.2rem' }}>
              NOW
            </div>
            <div style={{ fontFamily: F_SANS, fontSize: '0.88rem', fontWeight: 600, color: C.cream, marginBottom: '0.2rem' }}>
              Family Testing & Refinement
            </div>
            <div style={{ fontFamily: F_SANS, fontSize: '0.8rem', color: C.grey }}>
              Bug reports open. Remaining modules in final polish. v1.0 release approaching.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
