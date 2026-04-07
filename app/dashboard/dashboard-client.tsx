'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ExpensesTracker from './expenses-tracker'
import { Sidebar, SIDEBAR_W } from '@/app/components/sidebar-layout'
import PrayerWidget from './prayer-widget'

interface Profile {
  id: string
  full_name: string
  display_name: string
  avatar_emoji: string
  colour: string
  role: 'parent' | 'child'
  bio?: string
  superpower?: string
  interests?: string[]
  family_roles?: string[]
  profile_complete: boolean
}

interface Goal {
  id: string
  title: string
  goal_period: string
  status: string
}

interface FamilyMember {
  id: string
  full_name: string
  display_name: string
  avatar_emoji: string
  colour: string
  role: string
  profile_complete: boolean
}

interface Props {
  profile: Profile
  family: FamilyMember[]
  goals: Goal[]
  userId: string
}

// ── CSS vars proxy (loaded via Next font variables in layout.tsx) ──────────
const F_SANS  = 'var(--font-sans), Georgia, serif'
const F_MONO  = 'var(--font-mono), monospace'
const F_ARABIC = 'var(--font-arabic), serif'

// ── Token map ──────────────────────────────────────────────────────────────
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
}

// ── Mini calendar ──────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_HEADERS = ['MON','TUE','WED','THU','FRI','SAT','SUN']

function MiniCalendar() {
  const now = new Date()
  const [yr,  setYr]  = useState(now.getFullYear())
  const [mo,  setMo]  = useState(now.getMonth())

  const firstDow = new Date(yr, mo, 1).getDay() // 0=Sun
  // Convert Sunday=0 to Mon-first offset
  const offset = (firstDow + 6) % 7
  const daysInMo = new Date(yr, mo + 1, 0).getDate()
  const isCurrentMo = now.getMonth() === mo && now.getFullYear() === yr

  const prevMo = () => { if (mo === 0) { setYr(y => y-1); setMo(11) } else setMo(m => m-1) }
  const nextMo = () => { if (mo === 11) { setYr(y => y+1); setMo(0) } else setMo(m => m+1) }

  const cells: (number|null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMo; d++) cells.push(d)

  return (
    <div>
      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <button onClick={prevMo} style={{ width:26, height:26, background:C.forest, border:`1px solid ${C.ruleLight}`, borderRadius:4, color:C.grey, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
        <span style={{ fontSize:14, color:C.cream, fontFamily:F_SANS }}>{MONTH_NAMES[mo]} {yr}</span>
        <button onClick={nextMo} style={{ width:26, height:26, background:C.forest, border:`1px solid ${C.ruleLight}`, borderRadius:4, color:C.grey, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
      </div>
      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:2 }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{ fontFamily:F_MONO, fontSize:8, letterSpacing:'0.1em', color:C.grey, textAlign:'center', padding:'4px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          const isToday = Boolean(day && isCurrentMo && day === now.getDate())
          return (
            <div key={i} style={{
              aspectRatio:'1', background: day ? (isToday ? 'rgba(201,168,76,0.08)' : C.forest) : 'transparent',
              borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
              border: isToday ? `1px solid ${C.goldDim}` : '1px solid transparent',
              minHeight:34,
            }}>
              {day && (
                <span style={{ fontFamily:F_MONO, fontSize:10, color: isToday ? C.gold : C.grey, fontWeight: isToday ? 700 : 400 }}>{day}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sidebar nav item ───────────────────────────────────────────────────────
function NavItem({ icon, label, active = false, onClick }: { icon:string; label:string; active?:boolean; onClick?:()=>void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:'0.7rem',
        padding:'0.55rem 1.4rem',
        fontSize:'0.82rem',
        fontFamily: F_SANS,
        color: active ? C.gold : (hov ? C.goldPale : 'rgba(232,213,163,0.6)'),
        cursor:'pointer',
        borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent',
        background: (active || hov) ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition:'all 0.15s',
      }}
    >
      <span style={{ fontSize:'0.9rem', width:16, textAlign:'center' }}>{icon}</span>
      {label}
    </div>
  )
}

// ── Quick action ───────────────────────────────────────────────────────────
function QuickAction({ icon, title, desc, onClick }: { icon:string; title:string; desc:string; onClick?:()=>void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:'0.8rem',
        padding:'0.7rem 0.9rem',
        background: hov ? C.midgreen : C.forest,
        border: `1px solid ${hov ? C.goldDim : C.ruleLight}`,
        borderRadius:6, cursor:'pointer', transition:'all 0.15s', marginBottom:8,
      }}
    >
      <span style={{ fontSize:'1rem', width:24, textAlign:'center' }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'0.8rem', color:C.cream, fontFamily:F_SANS }}>{title}</div>
        <div style={{ fontSize:'0.65rem', color:C.grey, fontFamily:F_SANS }}>{desc}</div>
      </div>
      <span style={{ color: hov ? C.gold : C.grey, fontSize:'0.7rem' }}>›</span>
    </div>
  )
}

// ── Notion page card ───────────────────────────────────────────────────────
function NotionPage({ icon, name, desc, status, url }: { icon:string; name:string; desc:string; status:'live'|'build'|'soon'; url?:string }) {
  const [hov, setHov] = useState(false)
  const statusStyles: Record<string,{bg:string;color:string;border:string;text:string}> = {
    live:  { bg:'rgba(76,175,80,0.15)',    color:'#4CAF50', border:'rgba(76,175,80,0.3)',    text:'LIVE ↗' },
    build: { bg:'rgba(201,168,76,0.15)',   color:C.gold,    border:'rgba(201,168,76,0.3)',   text:'BUILDING' },
    soon:  { bg:'rgba(122,140,126,0.1)',   color:C.grey,    border:C.ruleLight,              text:'SOON' },
  }
  const s = statusStyles[status]
  return (
    <div
      onClick={() => url && window.open(url, '_blank')}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.midgreen : C.forest,
        border: `1px solid ${hov ? C.goldDim : C.ruleLight}`,
        borderRadius:6, padding:'0.9rem 1rem', cursor: url ? 'pointer' : 'default',
        transition:'all 0.15s', display:'flex', flexDirection:'column', gap:'0.35rem',
      }}
    >
      <span style={{ fontSize:'1.2rem' }}>{icon}</span>
      <div style={{ fontSize:'0.8rem', color:C.cream, fontFamily:F_SANS }}>{name}</div>
      <div style={{ fontSize:'0.68rem', color:C.grey, lineHeight:1.4, fontFamily:F_SANS }}>{desc}</div>
      <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', letterSpacing:'0.1em', padding:'0.15rem 0.4rem', borderRadius:3, width:'fit-content', background:s.bg, color:s.color, border:`1px solid ${s.border}`, marginTop:4 }}>{s.text}</div>
    </div>
  )
}

// ── Card wrapper ───────────────────────────────────────────────────────────
function Card({ title, action, onAction, children }: { title:string; action?:string; onAction?:()=>void; children:React.ReactNode }) {
  return (
    <div style={{
      background:C.white, border:`1px solid ${C.rule}`, borderRadius:8,
      padding:'1.3rem 1.5rem', position:'relative', overflow:'hidden',
      boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Gold top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.gold} 0%, transparent 100%)`, opacity:0.5 }} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div style={{ fontFamily:F_MONO, fontSize:'0.6rem', letterSpacing:'0.25em', color:C.goldDim, textTransform:'uppercase' }}>{title}</div>
        {action && (
          <div onClick={onAction} style={{ fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.1em', color:C.grey, cursor:'pointer', padding:'0.2rem 0.5rem', border:`1px solid ${C.rule}`, borderRadius:3 }}>{action}</div>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon }: { label:string; value:string; sub:string; icon:string }) {
  return (
    <div style={{
      background:C.cream, border:`1px solid ${C.rule}`, borderRadius:8,
      padding:'1.1rem 1.3rem', position:'relative', overflow:'hidden',
    }}>
      <div style={{ fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.2em', color:C.grey, textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontSize:'2.2rem', fontWeight:300, color:C.gold, lineHeight:1.1, margin:'0.3rem 0 0.2rem', fontFamily:F_SANS }}>{value}</div>
      <div style={{ fontSize:'0.75rem', color:C.grey, fontFamily:F_SANS }}>{sub}</div>
      <div style={{ position:'absolute', top:'1rem', right:'1rem', fontSize:'1.5rem', opacity:0.15 }}>{icon}</div>
    </div>
  )
}

// ── Member avatar in the family tree ──────────────────────────────────────
const TREE_COLORS: Record<number, string> = {
  0: 'linear-gradient(135deg,#1a3d28,#245235)',
  1: 'linear-gradient(135deg,#2d1a3d,#3d2452)',
  2: 'linear-gradient(135deg,#1a2d3d,#245250)',
  3: 'linear-gradient(135deg,#3d2d1a,#524224)',
  4: 'linear-gradient(135deg,#3d1a2d,#523d3d)',
  5: 'linear-gradient(135deg,#1a3d1a,#245224)',
}

function TreeMember({ emoji, name, sublabel, dotColor, bgIndex }: { emoji:string; name:string; sublabel:string; dotColor:string; bgIndex:number }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem', cursor:'pointer', transform: hov ? 'translateY(-2px)' : 'none', transition:'transform 0.15s' }}
    >
      <div style={{
        width:56, height:56, borderRadius:'50%',
        background: TREE_COLORS[bgIndex] || TREE_COLORS[2],
        border: `2px solid ${hov ? C.gold : C.ruleLight}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'1.4rem', position:'relative', transition:'border-color 0.15s',
      }}>
        {emoji}
        <div style={{ position:'absolute', bottom:2, right:2, width:10, height:10, borderRadius:'50%', background:dotColor, border:`1px solid ${C.cream}` }} />
      </div>
      <div style={{ fontSize:'0.78rem', color:C.cream, textAlign:'center', fontFamily:F_SANS }}>{name}</div>
      <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.1em', color:C.grey }}>{sublabel}</div>
    </div>
  )
}

// ── Roadmap phase block ────────────────────────────────────────────────────
function PhaseBlock({ num, name, days, who, progress, current }: { num:string; name:string; days:string; who:string; progress:number; current?:boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:1, background: current ? 'rgba(201,168,76,0.06)' : C.forest,
        border: `1px solid ${current ? C.gold : (hov ? C.goldDim : C.ruleLight)}`,
        borderRadius:6, padding:'0.7rem 0.8rem', cursor:'pointer', transition:'all 0.15s',
      }}
    >
      <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', letterSpacing:'0.2em', color: current ? C.gold : C.goldDim }}>{num}</div>
      <div style={{ fontSize:'0.78rem', color:C.cream, fontWeight:600, margin:'0.15rem 0 0.1rem', fontFamily:F_SANS }}>{name}</div>
      <div style={{ fontSize:'0.65rem', color:C.grey, fontFamily:F_SANS }}>{days}</div>
      <div style={{ fontFamily:F_MONO, fontSize:'0.45rem', letterSpacing:'0.08em', color:C.grey, marginTop:'0.3rem' }}>{who}</div>
      <div style={{ height:2, background:C.ruleLight, borderRadius:1, marginTop:'0.5rem', overflow:'hidden' }}>
        <div style={{ height:'100%', background:C.gold, borderRadius:1, width:`${progress}%` }} />
      </div>
    </div>
  )
}

// ── OS Architecture Map ────────────────────────────────────────────────────
const OS_LAYERS = [
  { icon:'📜', label:'Constitution', sub:'Manifesto · Values · Vision · Sulh',          path:'/constitution', status:'building' as const },
  { icon:'🕐', label:'Rhythm',       sub:'Daily · Jumu\'ah · Monthly · Annual',         path:'/rhythm',       status:'building' as const },
  { icon:'👨‍👩‍👧‍👦', label:'People',       sub:'Parent Profiles · Child Dashboards',        path:'/people',       status:'live'     as const },
  { icon:'🏡', label:'Operations',   sub:'Household · Utilities · Meals · Travel',       path:'/operations',   status:'building' as const },
  { icon:'📖', label:'Development',  sub:'Deen · Health · Education · Character',        path:'/development',  status:'building' as const },
  { icon:'💰', label:'Economy',      sub:'Expenses · Family Coin · Sadaqah · Savings',  path:'/economy',      status:'live'     as const },
  { icon:'🚀', label:'Projects',     sub:'Family · Child-Led · Parent Models',           path:'/projects',     status:'building' as const },
  { icon:'📸', label:'Memory',       sub:'Milestones · Letters · Archive',               path:'/memory',       status:'building' as const },
]

function OSArchitectureMap() {
  const router = useRouter()
  const statusStyle = {
    live:     { bg:'rgba(76,175,80,0.1)',   color:'#4CAF50', border:'rgba(76,175,80,0.25)',  label:'LIVE'     },
    building: { bg:'rgba(201,168,76,0.1)',  color:C.gold,    border:'rgba(201,168,76,0.25)', label:'BUILDING' },
    soon:     { bg:'rgba(107,124,110,0.08)',color:C.grey,    border:C.ruleLight,             label:'SOON'     },
  }
  return (
    <div style={{ background:C.white, border:`1px solid ${C.rule}`, borderRadius:8, padding:'1.3rem 1.5rem', position:'relative', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.gold} 0%, transparent 100%)`, opacity:0.5 }} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div style={{ fontFamily:F_MONO, fontSize:'0.6rem', letterSpacing:'0.25em', color:C.goldDim, textTransform:'uppercase' }}>🗺️ Family OS — Architecture</div>
        <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', color:C.grey }}>8 layers · 40+ modules</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.8rem' }}>
        {OS_LAYERS.map(layer => {
          const s = statusStyle[layer.status]
          return (
            <div
              key={layer.label}
              onClick={() => router.push(layer.path)}
              style={{
                background:C.cream, border:`1px solid ${C.ruleLight}`, borderRadius:8,
                padding:'0.9rem 1rem', cursor:'pointer', transition:'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.gold; (e.currentTarget as HTMLDivElement).style.background = `${C.gold}08` }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.ruleLight; (e.currentTarget as HTMLDivElement).style.background = C.cream }}
            >
              <div style={{ fontSize:'1.3rem', marginBottom:'0.4rem' }}>{layer.icon}</div>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:C.text, fontFamily:F_SANS, marginBottom:'0.2rem' }}>{layer.label}</div>
              <div style={{ fontSize:'0.68rem', color:C.grey, fontFamily:F_SANS, lineHeight:1.4, marginBottom:'0.6rem' }}>{layer.sub}</div>
              <div style={{ display:'inline-block', fontFamily:F_MONO, fontSize:'0.42rem', letterSpacing:'0.1em', padding:'0.18rem 0.45rem', borderRadius:3, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{s.label} →</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//   MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function DashboardClient({ profile, family, goals, userId }: Props) {
  const router = useRouter()
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const d = new Date()
    setDateStr(d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase())
  }, [])

  const profiledCount = family.filter(f => f.profile_complete).length
  const firstName = (profile.display_name || profile.full_name || '').split(' ')[0]
  const parents  = family.filter(f => f.role === 'parent')
  const children = family.filter(f => f.role === 'child')

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.cream, overflowX:'hidden' }}>

      {/* ══ SHARED SIDEBAR ══════════════════════════════════════════════ */}
      <Sidebar />

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      <main style={{ marginLeft:SIDEBAR_W, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', position:'relative' }}>

        {/* Topbar */}
        <div style={{
          background:C.white, borderBottom:`1px solid ${C.rule}`,
          padding:'0.7rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, zIndex:50,
        }}>
          <div style={{ fontFamily:F_MONO, fontSize:'0.65rem', letterSpacing:'0.2em', color:C.goldDim }}>BAYT OS — HOME</div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ fontFamily:F_MONO, fontSize:'0.55rem', letterSpacing:'0.1em', color:C.grey }}>{dateStr}</div>
            <div
              onClick={() => window.open('https://www.notion.so/0e0bea2f459f479a877fec4e116abb07','_blank')}
              style={{
                display:'flex', alignItems:'center', gap:'0.4rem',
                background:C.cream, border:`1px solid ${C.rule}`,
                borderRadius:4, padding:'0.3rem 0.7rem', cursor:'pointer',
              }}
            >
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#4CAF50', animation:'pulse 2s infinite' }} />
              <span style={{ fontFamily:F_MONO, fontSize:'0.52rem', letterSpacing:'0.1em', color:C.grey }}>NOTION · BAYT SEEDAT OS ↗</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'2rem 2rem 3rem' }}>

          {/* Prayer times widget */}
          <PrayerWidget />

          {/* Page header */}
          <div style={{ marginBottom:'2rem' }}>
            <h1 style={{ fontFamily:F_SANS, fontSize:'2rem', fontWeight:300, color:C.text, letterSpacing:'0.02em' }}>
              Ahlan wa sahlan, <span style={{ color:C.gold, fontStyle:'italic' }}>{firstName}.</span>
            </h1>
            <p style={{ fontSize:'0.9rem', color:C.grey, marginTop:'0.3rem', fontFamily:F_SANS }}>
              {profile.profile_complete
                ? `Bismillah — your family OS is live. ${profiledCount}/${family.length} profiles complete.`
                : 'Bismillah — complete your family profiles to get started.'}
            </p>
          </div>

          {/* Hadith strip */}
          <div style={{
            background:C.forest, border:`1px solid ${C.ruleLight}`, borderTop:`1px solid ${C.goldDim}`,
            borderRadius:8, padding:'1.1rem 1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'1.2rem',
          }}>
            <div>
              <div style={{ fontFamily:F_ARABIC, fontSize:'1.1rem', color:C.gold, lineHeight:1.6, textAlign:'right' }}>
                كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْؤُولٌ عَنْ رَعِيَّتِهِ
              </div>
            </div>
            <div style={{ width:1, height:40, background:C.ruleLight }} />
            <div>
              <div style={{ fontSize:'0.82rem', fontStyle:'italic', color:C.grey, fontFamily:F_SANS }}>
                "Each of you is a shepherd, and each of you is responsible for their flock."
              </div>
              <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', letterSpacing:'0.1em', color:C.goldDim, marginTop:'0.25rem' }}>
                — Sahih al-Bukhari 893 · Daily reminder
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.2rem' }}>
            <StatCard label="Phase" value="01" sub="Foundation · Days 1–7" icon="🗓️" />
            <StatCard label="Family Members" value={String(family.length || 6)} sub={`${parents.length} parents · ${children.length} children`} icon="👨‍👩‍👧‍👦" />
            <StatCard label="Profiles Complete" value={String(profiledCount)} sub={`of ${family.length} members`} icon="✅" />
            <StatCard label="Goals Set" value={String(goals.length)} sub={goals.length === 1 ? 'goal logged' : 'goals logged'} icon="🎯" />
          </div>

          {/* Family Tree + Calendar */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', marginBottom:'1.2rem' }}>

            {/* Family Tree */}
            <Card title="⬡ Family Tree" action="Edit Profile →" onAction={() => router.push('/profile-builder')}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, paddingTop:'0.5rem' }}>

                {/* Parents */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                  {parents.length > 0 && (
                    <>
                      <TreeMember
                        emoji={parents[0]?.avatar_emoji || '👨'}
                        name={parents[0]?.display_name || parents[0]?.full_name || 'Dad'}
                        sublabel="DAD · FOUNDER"
                        dotColor={C.gold}
                        bgIndex={0}
                      />
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, paddingTop:4 }}>
                        <div style={{ width:2, height:10, background:C.goldDim, opacity:0.4 }} />
                        <div style={{ width:24, height:1.5, background:C.goldDim, opacity:0.4 }} />
                        <div style={{ color:C.gold, fontSize:'0.65rem', opacity:0.7, lineHeight:1 }}>♡</div>
                        <div style={{ width:24, height:1.5, background:C.goldDim, opacity:0.4 }} />
                        <div style={{ width:2, height:10, background:C.goldDim, opacity:0.4 }} />
                      </div>
                      {parents[1] && (
                        <TreeMember
                          emoji={parents[1].avatar_emoji}
                          name={parents[1].display_name || parents[1].full_name}
                          sublabel="MUM · CO-FOUNDER"
                          dotColor="#b084cc"
                          bgIndex={1}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Vertical connector */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:2, height:20, background:`linear-gradient(to bottom, ${C.goldDim}, ${C.ruleLight})`, opacity:0.4 }} />
                  <div style={{ width:Math.min(children.length * 60, 260), height:1.5, background:C.ruleLight, opacity:0.5 }} />
                </div>

                {/* Children */}
                {children.length > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', width: Math.min(children.length * 60, 260) }}>
                    {children.map((child, idx) => (
                      <div key={child.id} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:2, height:18, background:C.ruleLight, opacity:0.4 }} />
                        <TreeMember
                          emoji={child.avatar_emoji}
                          name={child.display_name || child.full_name}
                          sublabel={`CO-BUILDER`}
                          dotColor="#4a9eca"
                          bgIndex={idx + 2}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div style={{ display:'flex', gap:'1rem', marginTop:'1.2rem', paddingTop:'1rem', borderTop:`1px solid ${C.rule}`, width:'100%', justifyContent:'center' }}>
                  {[{color:C.gold,label:'FOUNDER'},{color:'#b084cc',label:'CO-FOUNDER'},{color:'#4a9eca',label:'CO-BUILDER'}].map(l => (
                    <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:l.color }} />
                      <span style={{ fontFamily:F_MONO, fontSize:'0.48rem', color:C.grey, letterSpacing:'0.1em' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Calendar */}
            <Card title="📅 Family Calendar" action="Open Google Cal ↗" onAction={() => window.open('https://calendar.google.com/calendar/embed?src=family17416474355723583328%40group.calendar.google.com&ctz=Asia%2FQatar','_blank')}>
              <MiniCalendar />

              {/* Upcoming events label */}
              <div style={{ marginTop:'1rem', paddingTop:'0.8rem', borderTop:`1px solid ${C.rule}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                  <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.2em', color:C.goldDim }}>UPCOMING · FAMILY SEEDAT</div>
                  <a href="https://calendar.google.com/calendar/embed?src=family17416474355723583328%40group.calendar.google.com&ctz=Asia%2FQatar" target="_blank" rel="noreferrer" style={{ fontFamily:F_MONO, fontSize:'0.48rem', letterSpacing:'0.1em', color:C.grey, textDecoration:'none', border:`1px solid ${C.ruleLight}`, padding:'0.15rem 0.4rem', borderRadius:3 }}>Open ↗</a>
                </div>

                {/* Google Calendar embed */}
                <div style={{ borderRadius:6, overflow:'hidden', border:`1px solid ${C.ruleLight}`, marginTop:'0.5rem' }}>
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=family17416474355723583328%40group.calendar.google.com&ctz=Asia%2FQatar&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0&mode=AGENDA"
                    height="200"
                    style={{ display:'block', width:'100%', border:'none', filter:'invert(0.85) hue-rotate(160deg) saturate(0.6) brightness(0.9)' }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* 40-Day Roadmap */}
          <Card title="🗺️ 40-Day Roadmap — Phase Overview" action="View Full →">
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <PhaseBlock num="PHASE 01" name="Foundation"   days="Days 1–7"   who="FULL FAMILY"        progress={15} current />
              <PhaseBlock num="PHASE 02" name="Architecture" days="Days 8–14"  who="MUHAMMAD + YAHYA"   progress={0} />
              <PhaseBlock num="PHASE 03" name="Rhythm"       days="Days 15–21" who="FULL FAMILY"        progress={0} />
              <PhaseBlock num="PHASE 04" name="Child Builds" days="Days 22–28" who="EACH CHILD LEADS"   progress={0} />
              <PhaseBlock num="PHASE 05" name="The App"      days="Days 29–35" who="MUHAMMAD + BOYS"    progress={0} />
              <PhaseBlock num="PHASE 06" name="Launch"       days="Days 36–40" who="FULL FAMILY"        progress={0} />
            </div>
          </Card>

          {/* Notion Workspace + Quick Actions */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem', marginTop:'1.2rem' }}>

            {/* Notion */}
            <Card title="📁 Notion Workspace" action="Open Bayt Seedat OS ↗" onAction={() => window.open('https://www.notion.so/0e0bea2f459f479a877fec4e116abb07','_blank')}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem' }}>
                <NotionPage icon="🏠" name="Bayt Seedat OS"   desc="Your family OS command center"        status="live"  url="https://www.notion.so/0e0bea2f459f479a877fec4e116abb07" />
                <NotionPage icon="👨‍👩‍👧‍👦" name="Family Seedat DB" desc="Family database — members & records"  status="live"  url="https://www.notion.so/2ea249c08bfd81678251e463c7a2ea2a" />
                <NotionPage icon="🌱" name="Seed@Family Home" desc="Legacy family page"                    status="live"  url="https://www.notion.so/cce78c120f9343f18e0ad3df1de3a2d4" />
                <NotionPage icon="📜" name="Manifesto"        desc="Family constitution — Yahya writes it" status="build" />
                <NotionPage icon="👶" name="Child Profiles"   desc="Yahya · Isa · Linah · Dana"           status="build" />
                <NotionPage icon="🕌" name="Deen Tracker"     desc="Salah, Quran & habits — full family"  status="soon"  />
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="⚡ Quick Actions">
              <QuickAction icon="✏️" title="Complete Your Profile"     desc="Fill in your superpower, goals & schedule" onClick={() => router.push('/profile-builder')} />
              <QuickAction icon="📋" title="Run Play 01 — Manifesto"   desc="Start Session 01 · Open tonight after Isha" />
              <QuickAction icon="🧠" title="Parent Assessment"         desc="Private · 4 children · After they sleep" />
              <QuickAction icon="👦" title="Child Profile Builder"     desc="Yahya & Isa · Academic + Character" />
              <QuickAction icon="🕌" title="Set Up Deen Tracker"       desc="Salah log · Quran · Weekly review" />
            </Card>
          </div>

          {/* My Goals (if any) */}
          {goals.length > 0 && (
            <div style={{ marginTop:'1.2rem' }}>
              <Card title="🎯 Your Goals">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.8rem' }}>
                  {goals.map(goal => (
                    <div key={goal.id} style={{ background:C.forest, border:`1px solid ${C.ruleLight}`, borderRadius:6, padding:'0.9rem 1rem' }}>
                      <div style={{ fontFamily:F_MONO, fontSize:'0.5rem', letterSpacing:'0.15em', color:C.goldDim, marginBottom:6, textTransform:'uppercase' }}>
                        {goal.goal_period === 'month' ? '📅 This Month' : goal.goal_period === 'year' ? '🎯 This Year' : '🌠 Big Dream'}
                      </div>
                      <div style={{ fontSize:'0.85rem', color:C.cream, fontFamily:F_SANS, lineHeight:1.4 }}>{goal.title}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Family member cards */}
          {family.length > 0 && (
            <div style={{ marginTop:'1.2rem' }}>
              <Card title="👨‍👩‍👧‍👦 The Family">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'0.8rem' }}>
                  {family.map(m => (
                    <div
                      key={m.id}
                      onClick={() => router.push('/profile-builder')}
                      style={{
                        background: m.profile_complete ? `${m.colour}18` : C.forest,
                        border: `1px solid ${m.profile_complete ? m.colour : C.ruleLight}`,
                        borderRadius:6, padding:'0.9rem', display:'flex', flexDirection:'column', alignItems:'center',
                        textAlign:'center', cursor:'pointer', transition:'all 0.15s',
                        opacity: m.profile_complete ? 1 : 0.6,
                      }}
                    >
                      <div style={{ width:44, height:44, borderRadius:'50%', background: m.profile_complete ? `${m.colour}30` : C.ruleLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', marginBottom:'0.5rem', border:`1.5px solid ${C.ruleLight}` }}>
                        {m.avatar_emoji}
                      </div>
                      <div style={{ fontSize:'0.82rem', color:C.text, fontFamily:F_SANS }}>{m.display_name || m.full_name}</div>
                      <div style={{ fontFamily:F_MONO, fontSize:'0.48rem', letterSpacing:'0.1em', color:C.grey, marginTop:'0.15rem' }}>
                        {m.role === 'parent' ? 'FOUNDER' : 'CO-BUILDER'}
                      </div>
                      {m.profile_complete && (
                        <div style={{ marginTop:6, fontFamily:F_MONO, fontSize:'0.42rem', color:m.colour, letterSpacing:'0.1em' }}>✓ PROFILED</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── Family OS Architecture Map ───────────────────────── */}
          <div style={{ marginTop:'1.2rem' }}>
            <OSArchitectureMap />
          </div>

        </div>
      </main>

      {/* pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          nav { display: none !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
