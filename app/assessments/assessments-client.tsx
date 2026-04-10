'use client'

const C = { green: '#1a3d28', gold: '#c9a84c', cream: '#faf8f2', text: '#0d1a0f', grey: '#6b7c6e', rule: '#ddd8cc' }
const F_SANS = 'var(--font-sans), Georgia, serif'

export default function AssessmentsHub() {
  return (
    <div style={{ padding: '3rem 2rem', fontFamily: F_SANS, color: C.text }}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🧪</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.green, marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
          ASSESSMENTS
        </h2>
        <p style={{ fontSize: '0.9rem', color: C.grey, marginBottom: '2rem', lineHeight: 1.6 }}>
          Cognitive reasoning, emotional intelligence, AI literacy, and social skills —
          evidence-based assessments for every family member.
        </p>
        <div style={{ background: C.cream, border: `1px solid ${C.rule}`, borderRadius: 8, padding: '1.5rem', fontSize: '0.85rem', color: C.grey }}>
          This module is being built. Check back soon.
        </div>
      </div>
    </div>
  )
}
