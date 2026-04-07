'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SidebarLayout from '@/app/components/sidebar-layout'

// ── Tokens ────────────────────────────────────────────────────────────────
const GREEN   = '#1a3d28'
const MIDGREEN= '#245235'
const CREAM   = '#faf8f2'
const OFFWHITE= '#f5f0e6'
const GOLD    = '#c9a84c'
const GOLDDIM = '#9b7d38'
const GREY    = '#6b7c6e'
const BLACK   = '#0d1a0f'
const RULE    = '#d4ceba'
const BORDER  = '#e2ddd0'

const SANS   = 'var(--font-sans), Crimson Pro, Georgia, serif'
const MONO   = 'var(--font-mono), IBM Plex Mono, monospace'
const ARABIC = 'var(--font-arabic), Amiri, serif'

// ── Sub-components ────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ borderTop: `1px solid ${RULE}`, margin: '4rem 0' }} />
}

function PartHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.3em', color: GOLDDIM, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{num}</div>
      <h2 style={{ fontSize: '2.4rem', fontWeight: 700, color: GREEN, lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: '0.4rem', fontFamily: SANS }}>{title}</h2>
      <div style={{ width: 48, height: 3, background: GOLD, borderRadius: 2 }} />
    </div>
  )
}

function NumItem({ n, title, body }: { n: string; title: string; body: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, background: GOLD, color: GREEN, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em',
        flexShrink: 0, marginTop: 3,
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.4rem', fontFamily: SANS }}>{title}</div>
        <div style={{ fontSize: '1rem', color: BLACK, lineHeight: 1.7, fontFamily: SANS }}>{body}</div>
      </div>
    </div>
  )
}

function ValueItem({ num, arabic, english, body }: { num: string; arabic: string; english: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', padding: '1.2rem 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontFamily: MONO, fontSize: '0.5rem', letterSpacing: '0.15em', color: GOLDDIM, paddingTop: 4, minWidth: 24 }}>{num}</div>
      <div>
        <div style={{ fontFamily: MONO, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: GREEN, marginBottom: '0.1rem' }}>{arabic}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREY, marginBottom: '0.4rem', fontFamily: SANS }}>{english}</div>
        <div style={{ fontSize: '1rem', color: BLACK, lineHeight: 1.65, fontFamily: SANS }}>{body}</div>
      </div>
    </div>
  )
}

function PrincipleCard({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div style={{ background: OFFWHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 6px 6px 0', padding: '1rem 1.2rem' }}>
      <div style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: GOLDDIM, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1rem', color: BLACK, lineHeight: 1.65, fontFamily: SANS }}>{body}</div>
    </div>
  )
}

// ── Section anchor nav ────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'vision',     label: 'Vision' },
  { id: 'mission',    label: 'Mission' },
  { id: 'nonneg',     label: 'Non-Negotiables' },
  { id: 'values',     label: 'Values' },
  { id: 'sulh',       label: 'Sulh' },
  { id: 'shura',      label: 'Shura' },
  { id: 'letter',     label: 'Letter' },
  { id: 'signatures', label: 'Signatures' },
]

// ════════════════════════════════════════════════════════════════════════════
export default function ConstitutionClient() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('vision')

  const scrollTo = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <SidebarLayout title="BAYT OS — CONSTITUTION" subtitle="The Seedat Family Manifesto · Version 1.0">

      {/* ── Sticky section nav ── */}
      <div style={{
        display: 'flex', gap: '1.5rem', overflowX: 'auto',
        padding: '0 0 0.8rem', marginBottom: '2rem',
        borderBottom: `1px solid ${RULE}`,
      }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: MONO, fontSize: '0.48rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
              color: activeSection === s.id ? GOLDDIM : GREY,
              borderBottom: activeSection === s.id ? `2px solid ${GOLD}` : '2px solid transparent',
              paddingBottom: '0.4rem', transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Hero block ── */}
      <div style={{
        background: GREEN, color: CREAM, borderRadius: 12, padding: '4rem 3rem',
        textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '3rem',
      }}>
        {/* Geometric background */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <path d="M200 20 L380 110 L380 190 L200 280 L20 190 L20 110 Z" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
          <path d="M200 50 L340 120 L340 180 L200 250 L60 180 L60 120 Z" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1"/>
          <path d="M200 80 L300 130 L300 170 L200 220 L100 170 L100 130 Z" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1"/>
        </svg>

        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: MONO, fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Bayt OS — Version 1.0</div>
          <div style={{ fontFamily: ARABIC, fontSize: '1.8rem', color: GOLD, display: 'block', marginBottom: '1.2rem' }}>بيت سيدات</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.1, letterSpacing: '0.01em', marginBottom: '0.5rem', fontFamily: SANS }}>
            The Seedat Family<br />Manifesto
          </h1>
          <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(245,240,230,0.6)', marginBottom: '1.2rem', fontFamily: SANS }}>Our constitution. Written once. Lived every day.</p>
          <p style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.5)', marginBottom: '1rem' }}>
            Doha, Qatar &nbsp;·&nbsp; 11 March 2026 &nbsp;·&nbsp; 21 Ramadan 1447 AH
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(245,240,230,0.75)', letterSpacing: '0.08em', marginBottom: '0.4rem', fontFamily: SANS }}>
            Muhammad · Camilla · Yahya · Isa · Linah · Dana
          </p>
          <p style={{ fontFamily: MONO, fontSize: '0.55rem', letterSpacing: '0.25em', color: GOLD, marginBottom: '2rem' }}>
            Faith &nbsp;·&nbsp; Growth &nbsp;·&nbsp; Legacy
          </p>
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '1.5rem', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(245,240,230,0.5)', fontFamily: SANS }}>
            "The best of you is the one who is best to his family."
          </div>
        </div>
      </div>

      {/* Max-width content container */}
      <div style={{ maxWidth: 740, margin: '0 auto' }}>

        {/* ── PART ONE — VISION ── */}
        <div id="vision" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part One" title="Our Vision" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.5rem', lineHeight: 1.6, fontFamily: SANS }}>What does the Seedat family look like in 2035?</p>
          <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: BLACK, fontFamily: SANS }}>
            <p style={{ marginBottom: '1.2rem' }}>It is 2035. Yahya is 21. Isa is 20. Linah is 17. Dana is 15.</p>
            <p style={{ marginBottom: '1.2rem' }}>The house is loud in the best way — debates at the dinner table, someone reciting Quran in the next room, a project being planned, an idea being argued over with love. Muhammad and Camilla sit at the head of a family that has outgrown what they imagined when they started.</p>
            <p style={{ marginBottom: '1.2rem' }}>Each child carries something distinct. <strong style={{ color: GREEN }}>Yahya leads</strong> — quietly, steadily, the kind of person others follow without being asked. <strong style={{ color: GREEN }}>Isa builds</strong> — his mind sees systems and solutions where others see problems. <strong style={{ color: GREEN }}>Linah gives</strong> — she has always known how to see people, and by 17 she is already changing rooms when she walks into them. <strong style={{ color: GREEN }}>Dana creates</strong> — she has an eye for beauty and a voice that will not be quieted, and she is only just beginning.</p>
            <p style={{ marginBottom: '1.2rem' }}>They are not perfect. They have struggled, failed, doubted, and returned. But they <em style={{ color: GREEN }}>return</em> — that is what the Seedat family does. They return to Allah, to each other, to the values written in this document on the night it all began.</p>
            <p style={{ marginBottom: '1.2rem' }}>Muhammad and Camilla have not just raised children. They have raised <em style={{ color: GREEN }}>people</em> — people with faith that is their own, not inherited by accident but chosen with conviction. People who know how to work, how to give, how to sit with difficulty without running from it.</p>
            <p style={{ marginBottom: '1.2rem' }}>The family name means something in 2035. Not because of wealth or titles — but because of <strong style={{ color: GREEN }}>character</strong>. The Seedat name is attached to people who do what they say, who give more than they take, who remember Allah in private as much as in public.</p>
            <p>That is what we are building. Not a picture-perfect family. A <em style={{ color: GREEN }}>real</em> one — grounded, growing, and going somewhere.</p>
          </div>
        </div>

        <Divider />

        {/* ── PART TWO — MISSION ── */}
        <div id="mission" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Two" title="Our Mission" />
          <div style={{ background: GREEN, color: CREAM, borderRadius: 8, padding: '2.5rem 2rem', textAlign: 'center' }}>
            <blockquote style={{ fontSize: '1.25rem', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.7, color: CREAM, fontFamily: SANS }}>
              "We exist to worship Allah together, raise each other toward our highest selves, and leave this world more whole than we found it."
            </blockquote>
          </div>
        </div>

        <Divider />

        {/* ── PART THREE — NON-NEGOTIABLES ── */}
        <div id="nonneg" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Three" title="Our Non-Negotiables" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.8rem', lineHeight: 1.6, fontFamily: SANS }}>The five lines we do not cross — regardless of mood, money, or circumstance.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
            <NumItem n="01" title="Salah Is Not Optional" body={<>In this house, the five prayers are not a personal preference. They are the structure around which everything else is arranged. When life gets hard — and it will — salah is what we return to first. Not later. <em style={{ color: GREEN }}>First.</em></>} />
            <NumItem n="02" title="We Do Not Humiliate Each Other" body="Discipline happens. Disagreement happens. But no family member — child or parent — will be shamed, mocked, or spoken to in a way that degrades their dignity. Correction is given with love. Always." />
            <NumItem n="03" title="We Tell the Truth" body="Even when it is uncomfortable. Even when the truth makes us look bad. Honesty in this family is not a virtue — it is a baseline. A Seedat who lies to protect themselves is not protected. They are diminished." />
            <NumItem n="04" title="We Show Up for Each Other" body="When a family member is struggling, we do not leave them to figure it out alone. We ask. We sit with them. We carry what we can carry. This family does not abandon its own." />
            <NumItem n="05" title="Sadaqah Is Non-Negotiable" body={<>A percentage of everything we earn — coin, income, resource — goes out. Not when we feel generous. Automatically. We are not the final destination of what Allah gives us. We are a channel.</>} />
          </div>
        </div>

        <Divider />

        {/* ── PART FOUR — VALUES ── */}
        <div id="values" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Four" title="Our Family Values" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.5rem', lineHeight: 1.6, fontFamily: SANS }}>Five values, ranked — as the Seedat family lives them.</p>
          <div>
            <ValueItem num="01" arabic="TAQWA"  english="God-Consciousness" body="In this family, we act as if Allah is watching — because He is. This is not fear. It is the highest form of awareness." />
            <ValueItem num="02" arabic="SIDQ"   english="Truthfulness"       body="We say what we mean and mean what we say. In this house, your word is your bond — to your siblings, to your parents, and to yourself." />
            <ValueItem num="03" arabic="ILMU"   english="Knowledge & Growth"  body="We are a family that reads, asks, learns, and improves. Ignorance is not excused by comfort. We grow or we stagnate — and we choose growth." />
            <ValueItem num="04" arabic="KHIDMA" english="Service"             body="We are not in this family for ourselves. We serve each other, our community, and anyone Allah places in our path. The best of us is the one who is best to his family — and beyond." />
            <ValueItem num="05" arabic="SABR"   english="Purposeful Patience" body="This family does not quit when things are hard. We breathe, we make du'a, we take the next small step. Sabr is not passivity — it is disciplined endurance with your eyes on Allah." />
          </div>
        </div>

        <Divider />

        {/* ── PART FIVE — SULH ── */}
        <div id="sulh" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Five" title="The Sulh Protocol" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.8rem', lineHeight: 1.6, fontFamily: SANS }}>How the Seedat family resolves conflict. These are not suggestions. They are the agreed process.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
            <NumItem n="01" title="Stop" body="No conflict is resolved in heat. Whoever is most activated takes space first. Ten minutes minimum. No last words on the way out." />
            <NumItem n="02" title="Seek Truth, Not Victory" body={<>Before reopening the conversation, each person asks privately: <em style={{ color: GREEN }}>"Where am I wrong in this?"</em> Not whether the other person is wrong. Where <em style={{ color: GREEN }}>I</em> am wrong. Come back with that answer ready.</>} />
            <NumItem n="03" title="Speak, Then Listen" body="Each person speaks without interruption. The rule: you may not respond until you can accurately repeat what the other person said. If you cannot repeat it, you were not listening — you were waiting to talk." />
            <NumItem n="04" title="Seek Repair, Not Punishment" body={<>The goal of every conflict resolution is <em style={{ color: GREEN }}>relationship repair</em>, not being proven right. Ask: <em style={{ color: GREEN }}>"What do we need to do so we can move forward?"</em></>} />
            <NumItem n="05" title="Close With Forgiveness" body={<>Every resolved conflict ends with the words — said aloud: <em style={{ color: GREEN }}>"I forgive you."</em> And where applicable: <em style={{ color: GREEN }}>"I ask for your forgiveness."</em> These words are not weakness. They are the most powerful words in our household.</>} />
            <NumItem n="06" title="Escalate If Needed" body="If two people cannot resolve it between themselves, Muhammad or Camilla mediates. If the conflict involves a parent, the other parent mediates. No one is above this process." />
          </div>
        </div>

        <Divider />

        {/* ── PART SIX — SHURA ── */}
        <div id="shura" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Six" title="The Shura Principle" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.8rem', lineHeight: 1.6, fontFamily: SANS }}>How decisions are made in this family — drawn from the Quranic principle of Shura (42:38).</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <PrincipleCard title="Every Voice Is Heard" body="From Dana at six to Muhammad at the head of the table — everyone may speak. No idea is too small to raise. No person is too young to have an opinion worth considering." />
            <PrincipleCard title="Every Decision Is Weighed" body={<>Before a decision is made, the question is asked: <em style={{ color: GREEN }}>"Does this align with our values and our non-negotiables?"</em> If it does not — no vote can override it.</>} />
            <PrincipleCard title="Children Lead Where They Are Capable" body="As the children grow, they are given increasing responsibility to lead decisions in their domain. A child who plans the holiday owns the holiday. This is how leaders are made." />
            <PrincipleCard title="Muhammad Decides When the Family Cannot" body="If the Shura cannot reach consensus, Muhammad makes the final call — and explains why. Not because his opinion outweighs others, but because a family needs a captain. The captain is accountable to Allah first." />
            <PrincipleCard title="No Decision Made in Anger Stands" body="Any decision made in emotional heat is suspended until it can be revisited calmly. This applies to parents as much as children." />
          </div>
        </div>

        <Divider />

        {/* ── PART SEVEN — LETTER ── */}
        <div id="letter" style={{ scrollMarginTop: '5rem', marginBottom: '4rem' }}>
          <PartHeader num="Part Seven" title="A Letter to Our Children" />
          <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: GREY, marginBottom: '1.8rem', lineHeight: 1.6, fontFamily: SANS }}>
            From Muhammad and Camilla, to Yahya, Isa, Linah, and Dana.<br />
            To be read at the first Shura. To be opened again when each of you leaves home.
          </p>
          <div style={{ background: OFFWHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: '0 0 8px 8px', padding: '2.5rem 2rem' }}>
            <div style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: GREY, marginBottom: '1.5rem' }}>
              LETTER NO. 1 · WRITTEN MONDAY NIGHT, DOHA · 11 MARCH 2026 · 21 RAMADAN 1447
            </div>
            <div style={{ fontSize: '1.02rem', lineHeight: 1.85, color: BLACK, fontFamily: SANS }}>
              <p style={{ marginBottom: '1.1rem' }}>To Our Children,</p>
              <p style={{ marginBottom: '1.1rem' }}>We wrote this on a Monday night in 2026, in Doha, while you were all still small enough to be surprised by things and old enough to start understanding them.</p>
              <p style={{ marginBottom: '1.1rem' }}>We want you to know why we built this. We built it because we watched the world become louder and more confusing every year, and we made a decision: our home would be different. Not perfect — we are not naive enough to promise you perfect. But <em style={{ color: GREEN }}>different</em>. Intentional. A place where the important things are named out loud so they don't get lost in the noise.</p>
              <p style={{ marginBottom: '1.1rem' }}>We built it because we believe that the most important thing we will ever do in our lives is raise you. Not the companies, not the projects, not the content or the careers. You. The four of you are the legacy. Everything else is secondary.</p>
              <p style={{ marginBottom: '1.4rem' }}>We built it <em style={{ color: GREEN }}>with</em> you — not <em style={{ color: GREEN }}>for</em> you — because we wanted you to know from the beginning that you are not passengers in this family. You are co-founders. Your voice matters here. Your ideas matter here. The things you care about are taken seriously in this house.</p>

              {/* Individual notes */}
              {[
                { name: 'Yahya', note: 'we see how you carry responsibility like it was made for you. Let that be a strength, not a burden. You do not have to hold everything alone.' },
                { name: 'Isa',   note: 'we see the way your mind works, always looking for how things connect, always building something. Build with intention. Build for good.' },
                { name: 'Linah', note: 'we see your heart. We have always seen it. The world needs more people who feel things as deeply as you do. Don\'t let anyone tell you that\'s too much.' },
                { name: 'Dana',  note: 'we see your fire. Hold onto it. The world will try to calm you down. Some of that is wisdom. But the fire itself — the part that makes you you — protect that.' },
              ].map(c => (
                <div key={c.name} style={{ padding: '0.6rem 0 0.6rem 1.2rem', borderLeft: `2px solid ${GOLD}`, margin: '0.4rem 0', fontStyle: 'italic', color: GREY, fontSize: '1rem', fontFamily: SANS }}>
                  <strong style={{ color: GREEN, fontStyle: 'normal' }}>{c.name}</strong> — {c.note}
                </div>
              ))}

              <p style={{ marginTop: '1.2rem', marginBottom: '1.1rem' }}>We will not always get this right. We will make mistakes as parents that we cannot yet foresee. When we do — and when you are old enough to name them — please know: we were doing our best with what we had, and we loved you completely, always.</p>
              <p style={{ marginBottom: '1.1rem' }}><em style={{ color: GREEN }}>The best of us is the one who is best to his family. We are trying to be that. We hope you will be too.</em></p>
              <p style={{ fontWeight: 600, color: GREEN, fontFamily: SANS }}>With all of our love,<br />Muhammad and Camilla</p>
            </div>
          </div>
        </div>

        {/* ── CLOSING AYAH ── */}
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: OFFWHITE, border: `1px solid ${BORDER}`, borderRadius: 8, marginBottom: '3rem' }}>
          <div style={{ fontFamily: ARABIC, fontSize: '1.5rem', color: GREEN, lineHeight: 1.8, marginBottom: '1rem' }}>
            رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا
          </div>
          <p style={{ fontSize: '1rem', fontStyle: 'italic', color: GREY, marginBottom: '0.4rem', fontFamily: SANS }}>"Our Lord, grant us from our spouses and our children comfort to our eyes, and make us a beacon for those who are mindful of You."</p>
          <p style={{ fontFamily: MONO, fontSize: '0.5rem', letterSpacing: '0.15em', color: GOLDDIM }}>— Al-Furqan 25:74</p>
        </div>

        {/* ── SIGNATURES ── */}
        <div id="signatures" style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', marginBottom: '3rem', scrollMarginTop: '5rem' }}>
          {/* Header */}
          <div style={{ background: GREEN, color: CREAM, padding: '1.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem', fontFamily: SANS }}>Signed, Agreed &amp; Committed</h3>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(245,240,230,0.7)', lineHeight: 1.6, fontFamily: SANS }}>We, the Seedat family, have read this Manifesto together. We understand what it asks of us. We commit to living by its values, resolving our conflicts by its protocol, making decisions by its principles, and returning to it when we lose our way.</p>
          </div>

          {/* Commitment */}
          <div style={{ padding: '1.5rem 2rem', textAlign: 'center', borderBottom: `1px solid ${RULE}` }}>
            <blockquote style={{ fontSize: '0.95rem', fontStyle: 'italic', color: GREY, lineHeight: 1.7, fontFamily: SANS }}>
              "We bear witness — before Allah and before each other — that this family exists for His sake, and that we will strive, with all that we have, to honour that intention."
            </blockquote>
            <p style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: GOLDDIM, marginTop: '1rem' }}>
              Date of Founding: 11 March 2026 · Doha, Qatar · 21 Ramadan 1447 AH<br />Next Review: Ramadan 2027
            </p>
          </div>

          {/* Signature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[
              { name: 'Muhammad Seedat', role: 'Father · Head of Household', born: null },
              { name: 'Camilla Seedat',  role: 'Mother · Partner in Leadership', born: null },
              { name: 'Yahya Seedat',    role: 'Eldest Son · Co-Founder', born: 'Born 20 May 2014 · Age 11' },
              { name: 'Isa Seedat',      role: 'Second Son · Co-Founder', born: 'Born 03 Oct 2015 · Age 10' },
              { name: 'Linah Seedat',    role: 'First Daughter · Co-Founder', born: 'Born 29 May 2018 · Age 7' },
              { name: 'Dana Seedat',     role: 'Youngest · Co-Founder', born: 'Born 22 Feb 2020 · Age 6' },
            ].map((sig, i) => (
              <div key={sig.name} style={{ padding: '1.5rem 2rem', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none', borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: GREEN, marginBottom: '0.15rem', fontFamily: SANS }}>{sig.name}</div>
                <div style={{ fontFamily: MONO, fontSize: '0.48rem', letterSpacing: '0.15em', color: GOLDDIM, marginBottom: sig.born ? '0.3rem' : '0.8rem', textTransform: 'uppercase' }}>{sig.role}</div>
                {sig.born && <div style={{ fontFamily: MONO, fontSize: '0.44rem', letterSpacing: '0.1em', color: '#8a9e8e', marginBottom: '0.8rem' }}>{sig.born.toUpperCase()}</div>}
                <div style={{ borderBottom: `1px solid #c8c0a8`, margin: '0.5rem 0 0.3rem', width: '80%' }} />
                <div style={{ fontFamily: MONO, fontSize: '0.42rem', letterSpacing: '0.12em', color: '#8a9e8e' }}>SIGNATURE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DATE</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '2rem', borderTop: `1px solid ${RULE}` }}>
          <div style={{ fontFamily: ARABIC, fontSize: '1rem', color: GOLDDIM, display: 'block', marginBottom: '0.8rem' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <p style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: GREY }}>"Protect yourselves and your families." — Al-Tahrim 66:6</p>
          <p style={{ fontFamily: MONO, fontSize: '0.52rem', letterSpacing: '0.2em', color: GREY, marginTop: '0.4rem' }}>BAYT OS · بيت سيدات · VERSION 1.0 · DOHA, QATAR · 11 MARCH 2026 · 21 RAMADAN 1447</p>
        </div>

      </div>{/* /content */}
    </SidebarLayout>
  )
}
