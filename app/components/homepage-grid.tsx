'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FamilyMember {
  id: string
  full_name: string
  display_name: string
  avatar_emoji: string
  colour: string
  role: string
}

interface LifeSystem {
  id: string
  title: string
  category: string
  description: string
  modules: number
  weeks: number
  difficulty: 'Beginner' | 'Intermediate' | 'Master'
  rating: number
  reviews: number
  icon: React.ReactNode
  path?: string
}

const C = {
  green: '#1a3d28',
  midgreen: '#245235',
  forest: '#f0ebe0',
  gold: '#c9a84c',
  goldDim: '#9b7d38',
  goldPale: '#f0e4c0',
  cream: '#faf8f2',
  white: '#ffffff',
  grey: '#6b7c6e',
  rule: '#ddd8cc',
  ruleLight: '#e8e3d8',
  text: '#0d1a0f',
}

const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'

// ── SVG Icon Components ────────────────────────────────────────────────────
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-7 9 7M5 12v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
    <path d="M9 15h6v5H9z" />
  </svg>
)

const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
)

const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <path d="M1 10h22" />
  </svg>
)

const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const IconNetwork = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="12" r="3" />
    <circle cx="12" cy="19" r="3" />
    <line x1="12" y1="8" x2="6" y2="10" />
    <line x1="12" y1="8" x2="18" y2="10" />
    <line x1="6" y1="12" x2="12" y2="16" />
    <line x1="18" y1="12" x2="12" y2="16" />
  </svg>
)

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
)

const IconPlane = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.5v-3.97a6 6 0 00-1.804-4.217l-2.18-2.18A6 6 0 0014.414 2H6a6 6 0 00-6 6v12a6 6 0 006 6h12a6 6 0 006-6v-1.5" />
  </svg>
)

const IconPiggy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="8" r="2" />
    <path d="M18 10h-2c-1 0-2 1-2 3m5-6h-6a4 4 0 00-4 4v6a4 4 0 004 4h10a2 2 0 002-2v-3a2 2 0 00-2-2h-2.5m-8 0v-2" />
  </svg>
)

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
)

// ── Family Member Card ─────────────────────────────────────────────────────
function FamilyMemberCard({ member }: { member: FamilyMember }) {
  const [hov, setHov] = useState(false)

  const colorMap: Record<string, string> = {
    'ms': '#4A90E2',
    'rr': '#E74C8C',
    'y': '#52C77D',
    'isa': '#D4AF37',
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const initials = getInitials(member.full_name)
  const bgColor = colorMap[initials.toLowerCase()] || '#4A90E2'

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.white,
        border: `1px solid ${hov ? C.goldDim : C.rule}`,
        borderRadius: 8,
        padding: '1.5rem 1.3rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.8rem',
          color: C.white,
          fontWeight: 600,
        }}
      >
        {initials}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: C.text, fontFamily: F_SANS, marginBottom: '0.3rem' }}>
        {member.full_name}
      </div>
      <div style={{ fontSize: '0.85rem', color: C.grey, fontFamily: F_SANS, marginBottom: '1rem', textTransform: 'capitalize' }}>
        {member.role}
      </div>
      <button
        style={{
          width: '100%',
          padding: '0.7rem 1rem',
          background: C.green,
          color: C.goldPale,
          border: 'none',
          borderRadius: 4,
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: F_SANS,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.midgreen)}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.green)}
      >
        Follow
      </button>
    </div>
  )
}

// ── Life System Card ───────────────────────────────────────────────────────
function LifeSystemCard({ system }: { system: LifeSystem }) {
  const [hov, setHov] = useState(false)
  const router = useRouter()

  const difficultyColor = {
    'Beginner': '#D4AF37',
    'Intermediate': '#9b7d38',
    'Master': '#6b7c6e',
  }[system.difficulty]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => system.path && router.push(system.path)}
      style={{
        background: C.white,
        border: `1px solid ${hov ? C.goldDim : C.rule}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: system.path ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          background: C.forest,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: C.grey,
        }}
      >
        {system.icon}
      </div>
      <div style={{ padding: '1.2rem 1.3rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: C.text, fontFamily: F_SANS, marginBottom: '0.3rem' }}>
          {system.title}
        </div>
        <div style={{ fontSize: '0.85rem', color: C.grey, fontFamily: F_SANS, marginBottom: '0.8rem' }}>
          {system.category}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, marginBottom: '0.8rem' }}>
          <span>{system.modules} modules</span>
          <span>{system.weeks} weeks</span>
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '0.3rem 0.6rem',
            background: '#faf8f2',
            border: `1px solid ${C.rule}`,
            borderRadius: 3,
            fontSize: '0.75rem',
            color: difficultyColor,
            fontFamily: F_MONO,
            marginBottom: '0.8rem',
          }}
        >
          {system.difficulty}
        </div>
        <div style={{ fontSize: '0.85rem', color: C.gold, fontFamily: F_MONO }}>
          ★ {system.rating} ({system.reviews})
        </div>
      </div>
    </div>
  )
}

// ── Main Homepage Grid Component ───────────────────────────────────────────
export function HomepageGrid({ family, userId }: { family: FamilyMember[], userId: string }) {
  const [searchQuery, setSearchQuery] = useState('')

  const lifeSystems: LifeSystem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      category: 'Family Hub',
      description: 'Central hub for family activities',
      modules: 5,
      weeks: 4,
      difficulty: 'Beginner',
      rating: 4.9,
      reviews: 156,
      icon: <IconHome />,
      path: '/dashboard',
    },
    {
      id: 'reading',
      title: 'Reading',
      category: 'Stories & Knowledge',
      description: 'Books and learning resources',
      modules: 8,
      weeks: 8,
      difficulty: 'Intermediate',
      rating: 4.7,
      reviews: 89,
      icon: <IconBook />,
      path: '/reading',
    },
    {
      id: 'economy',
      title: 'Economy',
      category: 'Money & Finance',
      description: 'Financial management system',
      modules: 6,
      weeks: 6,
      difficulty: 'Master',
      rating: 4.8,
      reviews: 112,
      icon: <IconWallet />,
      path: '/economy',
    },
    {
      id: 'goals',
      title: 'Goals',
      category: 'Dreams & Targets',
      description: 'Goal setting and tracking',
      modules: 7,
      weeks: 7,
      difficulty: 'Beginner',
      rating: 4.6,
      reviews: 98,
      icon: <IconTarget />,
      path: '/family-goals',
    },
    {
      id: 'council',
      title: 'Council',
      category: 'Family Meetings',
      description: 'Monthly family gatherings',
      modules: 4,
      weeks: 4,
      difficulty: 'Intermediate',
      rating: 4.9,
      reviews: 143,
      icon: <IconNetwork />,
      path: '/monthly-council',
    },
    {
      id: 'assessments',
      title: 'Assessments',
      category: 'Progress Tracking',
      description: 'Evaluation and measurement',
      modules: 3,
      weeks: 3,
      difficulty: 'Master',
      rating: 4.7,
      reviews: 76,
      icon: <IconChart />,
      path: '/assessments',
    },
    {
      id: 'shopping',
      title: 'Shopping',
      category: 'Wishlists & Purchases',
      description: 'Shopping coordination',
      modules: 5,
      weeks: 5,
      difficulty: 'Beginner',
      rating: 4.5,
      reviews: 64,
      icon: <IconCart />,
      path: '/shopping',
    },
    {
      id: 'transport',
      title: 'Transport',
      category: 'Travel & Movement',
      description: 'Transportation planning',
      modules: 6,
      weeks: 6,
      difficulty: 'Intermediate',
      rating: 4.8,
      reviews: 97,
      icon: <IconPlane />,
      path: '/transport',
    },
    {
      id: 'savings',
      title: 'Savings',
      category: 'Investments & Goals',
      description: 'Long-term financial planning',
      modules: 7,
      weeks: 7,
      difficulty: 'Master',
      rating: 4.9,
      reviews: 134,
      icon: <IconPiggy />,
      path: '/savings',
    },
    {
      id: 'entrepreneurship',
      title: 'Entrepreneurship',
      category: 'Business & Ideas',
      description: 'Business development',
      modules: 8,
      weeks: 8,
      difficulty: 'Beginner',
      rating: 4.7,
      reviews: 87,
      icon: <IconBriefcase />,
      path: '/entrepreneurship',
    },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: C.text, fontFamily: F_SANS, margin: 0 }}>Overview</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.7rem 1rem',
              border: `1px solid ${C.rule}`,
              borderRadius: 4,
              fontSize: '0.9rem',
              fontFamily: F_SANS,
              width: 200,
            }}
          />
          <button
            style={{
              padding: '0.7rem 1.2rem',
              background: C.white,
              border: `1px solid ${C.rule}`,
              borderRadius: 4,
              fontSize: '0.9rem',
              fontFamily: F_SANS,
              cursor: 'pointer',
            }}
          >
            Filter
          </button>
          <button
            style={{
              padding: '0.7rem 1.5rem',
              background: C.green,
              color: C.goldPale,
              border: 'none',
              borderRadius: 4,
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: F_SANS,
              cursor: 'pointer',
            }}
          >
            Upgrade Pro
          </button>
        </div>
      </div>

      {/* Family Members Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 400, color: C.text, fontFamily: F_SANS, marginBottom: '1.5rem' }}>
          Top Family Members
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {family.map((member) => (
            <FamilyMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Life Systems Section */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 400, color: C.text, fontFamily: F_SANS, marginBottom: '1.5rem' }}>
          Life Systems
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {lifeSystems.map((system) => (
            <LifeSystemCard key={system.id} system={system} />
          ))}
        </div>
      </div>
    </div>
  )
}
