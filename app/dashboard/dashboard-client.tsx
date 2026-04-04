'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

const PERIOD_LABELS: Record<string, string> = {
  month: 'This Month',
  year: 'This Year',
  dream: 'Big Dream',
}

const PERIOD_ICONS: Record<string, string> = {
  month: '📅',
  year: '🎯',
  dream: '🌠',
}

export default function DashboardClient({ profile, family, goals, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const accent = profile.colour || '#1A3D28'
  const profiledCount = family.filter(f => f.profile_complete).length

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f2' }}>

      {/* ── Top nav ── */}
      <div style={{
        background: '#1a3d28', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 22, color: '#c9a84c' }}>بيت</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#c9a84c' }}>BAYT OS</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>SEEDAT FAMILY</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
        >Sign Out</button>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Profile hero */}
        <div style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          borderRadius: 20, padding: '24px 20px', color: '#fff',
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'var(--font-arabic)', fontSize: 48, opacity: 0.1 }}>بيت</div>
          <div style={{ fontSize: 40, marginBottom: 6 }}>{profile.avatar_emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            مرحباً، {profile.display_name || profile.full_name}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, marginBottom: 10 }}>
            {profile.role === 'parent' ? 'Parent · Bayt Seedat' : 'Family Member · Bayt Seedat'}
          </div>
          {profile.superpower && (
            <div style={{ fontSize: 13, background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '8px 12px', marginTop: 8 }}>
              ✨ Superpower: {profile.superpower}
            </div>
          )}
          {profile.bio && (
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>{profile.bio}</div>
          )}
        </div>

        {/* Family ring */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          border: '1px solid #e8e3d8', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3d28' }}>👨‍👩‍👧‍👦 The Family</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>
                {profiledCount}/{family.length} profiles complete
              </div>
            </div>
            {family.length > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#1a3d28',
                background: '#f0f9f4', borderRadius: 999, padding: '4px 10px',
              }}>
                {Math.round((profiledCount / family.length) * 100)}%
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {family.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: m.profile_complete ? `${m.colour}15` : '#f5f5f0',
                  border: `1px solid ${m.profile_complete ? m.colour : '#e8e3d8'}`,
                  borderRadius: 999, padding: '6px 12px',
                  opacity: m.profile_complete ? 1 : 0.55,
                }}
              >
                <span style={{ fontSize: 16 }}>{m.avatar_emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: m.profile_complete ? m.colour : '#888' }}>
                  {m.display_name || m.full_name}
                </span>
                {m.profile_complete && <span style={{ fontSize: 10 }}>✓</span>}
              </div>
            ))}
            {family.length === 0 && (
              <div style={{ fontSize: 13, color: '#aaa' }}>
                Other family members haven't joined yet
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '16px 20px',
            border: '1px solid #e8e3d8', marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3d28', marginBottom: 14 }}>🎯 Your Goals</div>
            {goals.map(goal => (
              <div
                key={goal.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 0',
                  borderBottom: '1px solid #f0ede6',
                }}
              >
                <span style={{ fontSize: 18, marginTop: 1 }}>{PERIOD_ICONS[goal.goal_period] || '🎯'}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 0.5, marginBottom: 2 }}>
                    {PERIOD_LABELS[goal.goal_period] || goal.goal_period}
                  </div>
                  <div style={{ fontSize: 14, color: '#1a3d28', lineHeight: 1.4 }}>{goal.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '16px 20px',
            border: '1px solid #e8e3d8', marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3d28', marginBottom: 12 }}>💛 Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.interests.map((i: string) => (
                <span
                  key={i}
                  style={{
                    background: `${accent}15`, color: accent,
                    borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  }}
                >{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '16px 20px',
          border: '1px solid #e8e3d8', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3d28', marginBottom: 14 }}>🌿 Coming Soon</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '🕌', label: 'Salah Tracker' },
              { icon: '🪙', label: 'Coin Ledger' },
              { icon: '📋', label: 'Tasks & Goals' },
              { icon: '💬', label: '1-on-1 Check-ins' },
              { icon: '📅', label: 'Family Calendar' },
              { icon: '📖', label: 'Shura Council' },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  background: '#faf8f2', borderRadius: 10, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: 0.6,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, color: '#c9a84c', marginBottom: 4 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: 1 }}>BAYT OS v0.1 · SEEDAT FAMILY · DOHA</div>
        </div>
      </div>
    </div>
  )
}
