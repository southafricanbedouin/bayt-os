'use client'

import { useState, useMemo } from 'react'
import { MEMBERS } from '../constants'
import { TOTAL_QURAN_AYAS } from '@/lib/quran-utils'

const C = {
  green: '#1a3d28',
  gold: '#c9a84c',
  goldDim: '#9b7d38',
  goldPale: '#f0e4c0',
  cream: '#faf8f2',
  white: '#ffffff',
  grey: '#6b7c6e',
  rule: '#ddd8cc',
  ruleLight: '#e8e3d8',
  text: '#0d1a0f',
  forest: '#f0ebe0',
  orange: '#e07b39',
  lightGreen: '#d4e5d9',
}

const F_SANS = 'var(--font-sans), Georgia, serif'

interface HifzLog {
  id: string
  member_id: string
  surah: number
  ayah_start: number
  ayah_end: number
  status: 'learning' | 'memorized' | 'revision'
  logged_at: string
}

interface QuranCalculatorProps {
  hifzLogs: HifzLog[]
  styles: any
}

export default function QuranCalculator({ hifzLogs, styles }: QuranCalculatorProps) {
  // Calculate member stats
  const getMemberStats = (memberId: string) => {
    const memberLogs = hifzLogs.filter((l) => l.member_id === memberId)
    const memorizedLogs = memberLogs.filter((l) => l.status === 'memorized')

    let totalAyas = 0
    const surahs: Map<number, number> = new Map()

    memorizedLogs.forEach((log) => {
      const ayas = log.ayah_end - log.ayah_start + 1
      totalAyas += ayas
      surahs.set(log.surah, (surahs.get(log.surah) || 0) + ayas)
    })

    const percentage = Math.round((totalAyas / TOTAL_QURAN_AYAS) * 100)

    // Calculate weekly rate (average ayas per week from logs)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const weeklyLogs = memberLogs.filter((l) => new Date(l.logged_at) >= sevenDaysAgo)
    let weeklyAyas = 0
    weeklyLogs.forEach((log) => {
      weeklyAyas += log.ayah_end - log.ayah_start + 1
    })

    const dailyRate = weeklyAyas > 0 ? Math.round((weeklyAyas / 7) * 10) / 10 : 0
    const remaining = Math.max(0, TOTAL_QURAN_AYAS - totalAyas)
    const daysToComplete = dailyRate > 0 ? Math.ceil(remaining / dailyRate) : 0
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + daysToComplete)

    return {
      totalAyas,
      percentage,
      remaining,
      dailyRate,
      daysToComplete,
      estimatedDate,
      surahs: Array.from(surahs.entries()),
      logsCount: memberLogs.length,
    }
  }

  // Calculate pace status
  const getPaceStatus = (dailyRate: number, totalAyas: number) => {
    if (dailyRate === 0) return { status: 'no-pace', label: 'Not started', color: C.grey }
    const targetDailyRate = TOTAL_QURAN_AYAS / 365 // ~17 ayas per day for 1-year Hifz
    if (dailyRate >= targetDailyRate * 0.8) {
      return { status: 'on-track', label: 'On track', color: C.green }
    } else {
      return { status: 'behind', label: 'Behind pace', color: C.orange }
    }
  }

  return (
    <div>
      {/* Member Progress Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {MEMBERS.filter((m: any) => m.age).map((member: any) => {
          const stats = getMemberStats(member.id)
          const pace = getPaceStatus(stats.dailyRate, stats.totalAyas)

          return (
            <div key={member.id} style={styles.card}>
              <h4 style={{ margin: '0 0 20px 0', color: C.green, fontSize: '1rem' }}>
                {member.name}'s Memorization
              </h4>

              {/* Large progress circle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    backgroundColor: C.lightGreen,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `inset 0 0 20px rgba(26, 61, 40, 0.1)`,
                  }}
                >
                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
                  >
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke={C.forest}
                      strokeWidth="4"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      fill="none"
                      stroke={C.gold}
                      strokeWidth="4"
                      strokeDasharray={`${(stats.percentage / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.gold }}>
                      {stats.percentage}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, marginTop: '4px' }}>
                      Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Ayas counter */}
              <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${C.rule}` }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: C.text }}>
                  {stats.totalAyas.toLocaleString()} / {TOTAL_QURAN_AYAS.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: C.grey }}>Ayas Memorized</div>
              </div>

              {/* Pace badge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: `${pace.color}20`,
                    color: pace.color,
                  }}
                >
                  {pace.label}
                </div>
              </div>

              {/* Daily goal and remaining */}
              <div style={{ display: 'grid', gap: '12px', marginBottom: '16px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.grey }}>Daily Goal</span>
                  <span style={{ fontWeight: 'bold', color: C.gold }}>
                    {stats.dailyRate} ayas/day
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.grey }}>Remaining</span>
                  <span style={{ fontWeight: 'bold', color: C.text }}>
                    {stats.remaining.toLocaleString()} ayas
                  </span>
                </div>
              </div>

              {/* Estimated date */}
              {stats.dailyRate > 0 && (
                <div style={{ padding: '12px', backgroundColor: C.forest, borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: C.grey, marginBottom: '4px' }}>
                    Estimated Completion
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: C.green }}>
                    {stats.estimatedDate.toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, marginTop: '4px' }}>
                    (~{stats.daysToComplete} days away)
                  </div>
                </div>
              )}

              {/* Surah distribution */}
              {stats.surahs.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.rule}` }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: C.text, marginBottom: '8px' }}>
                    Surahs Memorized ({stats.surahs.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.grey, lineHeight: '1.6' }}>
                    {stats.surahs.map(([surah], idx) => (
                      <span key={surah}>
                        Surah {surah}
                        {idx < stats.surahs.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* All-time statistics */}
      {hifzLogs.length > 0 && (
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px 0', color: C.green }}>Family Progress Overview</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {MEMBERS.filter((m: any) => m.age).map((member: any) => {
              const stats = getMemberStats(member.id)
              return (
                <div
                  key={member.id}
                  style={{
                    padding: '12px',
                    backgroundColor: C.cream,
                    borderRadius: '6px',
                    borderLeft: `4px solid ${C.gold}`,
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: C.text, marginBottom: '4px' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.gold }}>
                    {stats.percentage}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: C.grey }}>
                    {stats.totalAyas.toLocaleString()} ayas
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Info section */}
      {hifzLogs.length === 0 && (
        <div style={{ padding: '24px', textAlign: 'center', color: C.grey, backgroundColor: C.cream, borderRadius: '8px' }}>
          <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
            No memorization data yet
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            Add memorization records in the "Memorization" section to see progress calculations here
          </div>
        </div>
      )}
    </div>
  )
}
