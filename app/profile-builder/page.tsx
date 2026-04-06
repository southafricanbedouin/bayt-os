'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Family Members ─────────────────────────────────────────────
const MEMBERS = [
  { id: 'dad',   name: 'Muhammad', role: 'parent', label: 'Dad · Founder',       color: '#c9a84c', light: '#fdf8ec', emoji: '🌙' },
  { id: 'mum',   name: 'Camilla',  role: 'parent', label: 'Mum · Co-Founder',    color: '#7c5cbf', light: '#f5f0fd', emoji: '🌸' },
  { id: 'yahya', name: 'Yahya',    role: 'child',  label: 'Son · Explorer',      color: '#3b82f6', light: '#eff6ff', emoji: '⚽', age: 11 },
  { id: 'isa',   name: 'Isa',      role: 'child',  label: 'Son · Adventurer',    color: '#f59e0b', light: '#fffbeb', emoji: '🏃', age: 10 },
  { id: 'linah', name: 'Linah',    role: 'child',  label: 'Daughter · Creative', color: '#ec4899', light: '#fdf2f8', emoji: '🎨', age: 7 },
  { id: 'dana',  name: 'Dana',     role: 'child',  label: 'Daughter · Dreamer',  color: '#10b981', light: '#ecfdf5', emoji: '⭐', age: 6 },
]

const INTEREST_GROUPS: Record<string, string[]> = {
  '⚽ Sports':   ['Football','Tennis','Athletics','Padel','Swimming','Basketball','Cricket','Cycling'],
  '🎨 Creative': ['Drawing','Painting','Music','Writing','Photography','Cooking','Crafts','Lego'],
  '📚 Learning': ['Maths','Science','Arabic','Quran','History','Coding','Reading','Geography'],
  '💛 Life':     ['Family time','Friends','Gaming','Movies','Travel','Nature','Helping others','Animals'],
}

const FAMILY_ROLES = [
  'I make people laugh 😄','I keep things organised 📋','I help the little ones 🤝',
  'I bring calm energy 🌿','I ask great questions 🙋','I protect the family 🛡️',
  'I cook and nurture 🍲','I inspire with ideas 💡','I lead with wisdom 📖','I spread joy everywhere ✨',
]

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const STEPS = ['','About Me','Interests','Goals','My Week','My Role in Bayt']

type Member = typeof MEMBERS[0]
type Schedule = Record<string, string[]>
interface Profile {
  bio: string
  superpower: string
  love: string
  interests: string[]
  goals: { month: string; year: string; dream: string }
  schedule: Schedule
  familyRoles: string[]
}

function freshProfile(): Profile {
  return {
    bio: '', superpower: '', love: '',
    interests: [],
    goals: { month: '', year: '', dream: '' },
    schedule: {},
    familyRoles: [],
  }
}

// ── Field component defined OUTSIDE to prevent remount on every render ─────
function Field({ label, value, placeholder, onChange, multi = false, accent }: {
  label: string; value: string; placeholder: string
  onChange: (v: string) => void; multi?: boolean; accent: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      {multi ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', border: '2px solid #e8e3d8', borderRadius: 10, fontSize: 14, color: '#1a3d28', background: '#faf8f2', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e => e.target.style.borderColor = '#e8e3d8'}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', border: '2px solid #e8e3d8', borderRadius: 10, fontSize: 14, color: '#1a3d28', background: '#faf8f2', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e => e.target.style.borderColor = '#e8e3d8'}
        />
      )}
    </div>
  )
}

export default function ProfileBuilderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [member, setMember] = useState<Member | null>(null)
  const [profile, setProfile] = useState<Profile>(freshProfile())
  const [schedDay, setSchedDay] = useState('Mon')
  const [newAct, setNewAct] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUserId(user.id)
    })
  }, [])

  const accent = member?.color || '#1A3D28'
  const light = member?.light || '#f0f9f4'

  function updateProfile(patch: Partial<Profile>) {
    setProfile(p => ({ ...p, ...patch }))
  }

  function toggleInterest(item: string) {
    setProfile(p => ({
      ...p,
      interests: p.interests.includes(item)
        ? p.interests.filter(i => i !== item)
        : [...p.interests, item],
    }))
  }

  function addCustomInterest() {
    if (!customInterest.trim()) return
    setProfile(p => ({ ...p, interests: [...p.interests, customInterest.trim()] }))
    setCustomInterest('')
  }

  function toggleRole(role: string) {
    setProfile(p => ({
      ...p,
      familyRoles: p.familyRoles.includes(role)
        ? p.familyRoles.filter(r => r !== role)
        : [...p.familyRoles, role],
    }))
  }

  function addActivity() {
    if (!newAct.trim()) return
    setProfile(p => ({
      ...p,
      schedule: {
        ...p.schedule,
        [schedDay]: [...(p.schedule[schedDay] || []), newAct.trim()],
      },
    }))
    setNewAct('')
  }

  function removeActivity(day: string, act: string) {
    setProfile(p => ({
      ...p,
      schedule: {
        ...p.schedule,
        [day]: (p.schedule[day] || []).filter(a => a !== act),
      },
    }))
  }

  async function handleSave() {
    if (!userId || !member) return
    setSaving(true)
    try {
      // Upsert profile
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: member.name,
        display_name: member.name,
        role: member.role,
        avatar_emoji: member.emoji,
        colour: member.color,
        bio: profile.bio,
        superpower: profile.superpower,
        love: profile.love,
        interests: profile.interests,
        weekly_schedule: profile.schedule,
        family_roles: profile.familyRoles,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      if (profileErr) throw profileErr

      // Save goals
      if (profile.goals.month) {
        await supabase.from('goals').insert({
          owner_id: userId,
          title: profile.goals.month,
          goal_period: 'month',
          scope: 'personal',
        })
      }
      if (profile.goals.year) {
        await supabase.from('goals').insert({
          owner_id: userId,
          title: profile.goals.year,
          goal_period: 'year',
          scope: 'personal',
        })
      }
      if (profile.goals.dream) {
        await supabase.from('goals').insert({
          owner_id: userId,
          title: profile.goals.dream,
          goal_period: 'dream',
          scope: 'personal',
        })
      }

      setDone(true)
    } catch (err) {
      console.error('Save error:', err)
      alert('Something went wrong saving your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Done screen ─────────────────────────────────────────────
  if (done && member) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{member.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3d28', marginBottom: 4 }}>
              {member.name}'s Profile is ready!
            </div>
            <div style={{ fontSize: 14, color: '#6b7c6e' }}>بِسْمِ اللَّهِ — welcome to Bayt Seedat</div>
          </div>

          {/* Profile summary card */}
          <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <div style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)`, padding: '24px 20px', color: '#fff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 40, opacity: 0.15 }}>بيت</div>
              <div style={{ fontSize: 40, marginBottom: 6 }}>{member.emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{member.name}</div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, opacity: 0.8, marginBottom: 8 }}>{member.label.toUpperCase()}</div>
              {profile.bio && <div style={{ fontSize: 13, opacity: 0.85, fontStyle: 'italic', lineHeight: 1.5 }}>{profile.bio}</div>}
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {profile.superpower && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 2 }}>SUPERPOWER</div>
                  <div style={{ fontSize: 13, color: '#1a3d28' }}>{profile.superpower}</div>
                </div>
              )}
              {profile.interests.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 6 }}>INTERESTS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {profile.interests.slice(0, 6).map(i => (
                      <span key={i} style={{ background: light, color: member.color, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{i}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.familyRoles.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 4 }}>ROLE IN THE BAYT</div>
                  {profile.familyRoles.map(r => (
                    <div key={r} style={{ fontSize: 13, color: '#1a3d28', marginBottom: 2 }}>{r}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            style={{ width: '100%', background: '#1a3d28', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Enter Bayt OS →
          </button>
        </div>
      </div>
    )
  }

  // ── Member Select ───────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f2', padding: '28px 16px 40px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏡</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a3d28', marginBottom: 6 }}>Bayt Seedat</h1>
            <p style={{ color: '#6b7c6e', fontSize: 15 }}>Family Profile Builder · Who are you?</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {MEMBERS.map(m => (
              <button
                key={m.id}
                onClick={() => { setMember(m); setProfile(freshProfile()); setStep(1) }}
                style={{
                  background: '#fff', border: '2px solid #e8e3d8', borderRadius: 16,
                  padding: '20px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = m.color; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${m.color}33`; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e3d8'; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{m.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3d28' }}>{m.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: m.color, marginTop: 2 }}>{m.label}</div>
                {m.age && <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Age {m.age}</div>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff', border: '1px solid #e8e3d8', borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#6b7c6e', margin: 0 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — This profile is private to our family
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!member) return null

  // ── Step layout helper ──────────────────────────────────────
  const isLastStep = step === 5
  const canGoNext =
    step === 1 ? true :
    step === 2 ? true :
    step === 3 ? true :
    step === 4 ? true :
    step === 5 ? profile.familyRoles.length > 0 : false

  function StepHeader() {
    return (
      <div>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => { setStep(0); setMember(null) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px', color: '#555' }}
          >←</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{member.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3d28' }}>{member.name}'s Profile</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>{STEPS[step]}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>{step}/5</div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              height: 8,
              borderRadius: 999,
              width: i === step - 1 ? 24 : 8,
              background: i < step - 1 ? accent : i === step - 1 ? accent : '#ddd',
              opacity: i < step - 1 ? 0.4 : 1,
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>
    )
  }

  function NavRow({ onNext }: { onNext: () => void }) {
    return (
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, background: '#f5f0e6', color: '#1a3d28', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >← Back</button>
        )}
        <button
          onClick={canGoNext ? onNext : undefined}
          disabled={!canGoNext || saving}
          style={{
            flex: 2, background: canGoNext ? accent : '#ddd', color: canGoNext ? '#fff' : '#999',
            border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700,
            cursor: canGoNext ? 'pointer' : 'default', transition: 'background 0.2s',
          }}
        >
          {saving ? 'Saving…' : isLastStep ? `See ${member.name}'s Profile →` : 'Continue →'}
        </button>
      </div>
    )
  }

  // Field is defined outside this component (above) to prevent remount on each render

  const cardStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid #e8e3d8', borderRadius: 20,
    padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f2', padding: '28px 16px 40px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <StepHeader />

        {/* ── Step 1: About Me ── */}
        {step === 1 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, color: '#1a3d28', marginBottom: 6 }}>Tell us about yourself {member.emoji}</h2>
            <p style={{ color: '#6b7c6e', fontSize: 13, marginBottom: 20 }}>A few words about who you are.</p>
            <Field label="MY BIO" value={profile.bio} placeholder={member.age ? `I'm ${member.name}, I'm ${member.age} and I love…` : `I'm ${member.name} and I…`} onChange={v => updateProfile({ bio: v })} multi accent={accent} />
            <Field label="MY SUPERPOWER IS…" value={profile.superpower} placeholder="e.g. Making people smile, solving hard problems…" onChange={v => updateProfile({ superpower: v })} accent={accent} />
            <Field label="I LOVE…" value={profile.love} placeholder="e.g. Football on Saturday, reading after Isha…" onChange={v => updateProfile({ love: v })} accent={accent} />
            <NavRow onNext={() => setStep(2)} />
          </div>
        )}

        {/* ── Step 2: Interests ── */}
        {step === 2 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, color: '#1a3d28', marginBottom: 6 }}>What are you into? 🌟</h2>
            <p style={{ color: '#6b7c6e', fontSize: 13, marginBottom: 20 }}>Tap everything that interests you. Add your own!</p>

            {Object.entries(INTEREST_GROUPS).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>{group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {items.map(item => {
                    const active = profile.interests.includes(item)
                    return (
                      <button
                        key={item}
                        onClick={() => toggleInterest(item)}
                        style={{
                          background: active ? accent : '#f5f5f0',
                          color: active ? '#fff' : '#444',
                          border: `2px solid ${active ? accent : '#e0ddd6'}`,
                          borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >{item}</button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Custom interest */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>➕ ADD YOUR OWN</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={customInterest}
                  placeholder="Type something…"
                  onChange={e => setCustomInterest(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomInterest()}
                  style={{ flex: 1, padding: '10px 14px', border: '2px solid #e8e3d8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#faf8f2', color: '#1a3d28', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = '#e8e3d8'}
                />
                <button
                  onClick={addCustomInterest}
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 }}
                >Add</button>
              </div>
            </div>

            {profile.interests.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: light, color: accent, fontSize: 12, fontWeight: 600 }}>
                {profile.interests.length} interest{profile.interests.length > 1 ? 's' : ''} selected ✓
              </div>
            )}
            <NavRow onNext={() => setStep(3)} />
          </div>
        )}

        {/* ── Step 3: Goals ── */}
        {step === 3 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, color: '#1a3d28', marginBottom: 6 }}>What are you working towards? 🎯</h2>
            <p style={{ color: '#6b7c6e', fontSize: 13, marginBottom: 20 }}>Your goals help us support you.</p>
            <Field label="📅 THIS MONTH I WANT TO…" value={profile.goals.month} placeholder="e.g. Read 2 books, improve my free kick…" onChange={v => updateProfile({ goals: { ...profile.goals, month: v } })} accent={accent} />
            <Field label="🎯 THIS YEAR I WANT TO…" value={profile.goals.year} placeholder="e.g. Memorise Surah Mulk, make the school team…" onChange={v => updateProfile({ goals: { ...profile.goals, year: v } })} accent={accent} />
            <Field label="🌠 MY BIG DREAM IS…" value={profile.goals.dream} placeholder="e.g. Become a doctor, build something amazing…" onChange={v => updateProfile({ goals: { ...profile.goals, dream: v } })} multi accent={accent} />
            <NavRow onNext={() => setStep(4)} />
          </div>
        )}

        {/* ── Step 4: My Week ── */}
        {step === 4 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, color: '#1a3d28', marginBottom: 6 }}>What's your week like? 📅</h2>
            <p style={{ color: '#6b7c6e', fontSize: 13, marginBottom: 16 }}>Add your regular activities so the family knows your schedule.</p>

            {/* Day tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {DAYS.map(d => {
                const acts = profile.schedule[d] || []
                return (
                  <button
                    key={d}
                    onClick={() => setSchedDay(d)}
                    style={{
                      background: schedDay === d ? accent : '#f5f0e6',
                      color: schedDay === d ? '#fff' : '#555',
                      border: 'none', borderRadius: 8, padding: '6px 12px',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {d}
                    {acts.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: accent, color: '#fff', border: '2px solid #fff',
                        borderRadius: 999, width: 14, height: 14,
                        fontSize: 9, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{acts.length}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Day activities */}
            <div style={{ background: light, borderRadius: 12, padding: 14, marginBottom: 12, minHeight: 58 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 8 }}>{schedDay}</div>
              {(profile.schedule[schedDay] || []).length === 0 ? (
                <div style={{ color: '#bbb', fontSize: 13 }}>Nothing added yet</div>
              ) : (
                <div>
                  {(profile.schedule[schedDay] || []).map(act => (
                    <button
                      key={act}
                      onClick={() => removeActivity(schedDay, act)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 999,
                        padding: '4px 10px', fontSize: 12, color: '#333', cursor: 'pointer', margin: 3,
                      }}
                    >
                      {act} <span style={{ color: '#ccc' }}>×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add activity */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newAct}
                placeholder={`Add activity for ${schedDay}…`}
                onChange={e => setNewAct(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addActivity()}
                style={{ flex: 1, padding: '10px 14px', border: '2px solid #e8e3d8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#faf8f2', color: '#1a3d28', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = '#e8e3d8'}
              />
              <button
                onClick={addActivity}
                style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >Add</button>
            </div>

            <NavRow onNext={() => setStep(5)} />
          </div>
        )}

        {/* ── Step 5: My Role in Bayt ── */}
        {step === 5 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, color: '#1a3d28', marginBottom: 6 }}>What's your role in the Bayt? 🏡</h2>
            <p style={{ color: '#6b7c6e', fontSize: 13, marginBottom: 20 }}>Choose the ones that feel true. Pick as many as you like.</p>

            {FAMILY_ROLES.map(role => {
              const active = profile.familyRoles.includes(role)
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  style={{
                    width: '100%',
                    background: active ? light : '#faf8f2',
                    border: `2px solid ${active ? accent : '#e8e3d8'}`,
                    borderRadius: 12, padding: '12px 16px', textAlign: 'left',
                    fontSize: 14, color: active ? accent : '#555',
                    fontWeight: active ? 700 : 400, cursor: 'pointer',
                    transition: 'all 0.15s', marginBottom: 8, fontFamily: 'inherit',
                  }}
                >{role}</button>
              )
            })}

            {profile.familyRoles.length > 0 && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: light, color: accent, fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {profile.familyRoles.length} role{profile.familyRoles.length > 1 ? 's' : ''} selected ✓
              </div>
            )}

            <NavRow onNext={handleSave} />
          </div>
        )}
      </div>
    </div>
  )
}
