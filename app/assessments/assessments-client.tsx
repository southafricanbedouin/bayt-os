// app/assessments/assessments-client.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Design Tokens ─────────────────────────────────────────────────────────
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
  orange:    '#e07b39',
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

// ── Family & Helpers ──────────────────────────────────────────────────────
const FAMILY = [
  { id: 'muhammad', name: 'Muhammad', role: 'parent', age: null, emoji: '👨' },
  { id: 'camilla',  name: 'Camilla',  role: 'parent', age: null, emoji: '👩' },
  { id: 'yahya',    name: 'Yahya',    role: 'child',  age: 11,   emoji: '🧒' },
  { id: 'isa',      name: 'Isa',      role: 'child',  age: 10,   emoji: '🧒' },
  { id: 'linah',    name: 'Linah',    role: 'child',  age: 7,    emoji: '👧' },
  { id: 'dana',     name: 'Dana',     role: 'child',  age: 6,    emoji: '👧' },
]

function ageBand(age: number | null): '4-6' | '7-9' | '10-12' | 'adult' {
  if (!age) return 'adult'
  if (age <= 6) return '4-6'
  if (age <= 9) return '7-9'
  return '10-12'
}

function normalise(raw: number, total: number): number {
  return Math.round((raw / total) * 100) / 10
}

const DOMAIN_MAP: Record<string, string | null> = {
  cognitive: 'iq_raw',
  eq:        'eq_raw',
  social:    'social_raw',
  ai:        null,
}

// ── Question Banks ────────────────────────────────────────────────────────
interface Question {
  id: string
  domain: string
  ageband: '4-6' | '7-9' | '10-12' | 'adult'
  prompt: string
  type: 'mcq' | 'scale' | 'scenario'
  options: string[]
  correct?: number
  scores?: number[]
}

const COGNITIVE_BANK: Question[] = [
  // 4-6
  { id: 'cog-4-1', domain: 'Pattern Recognition', ageband: '4-6', prompt: 'What comes next? 🔴 🔵 🔴 🔵 ___', type: 'mcq', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
  { id: 'cog-4-2', domain: 'Working Memory', ageband: '4-6', prompt: 'I will say 3 things. Remember them. [Cat, Ball, Tree] → Which one did I NOT say?', type: 'mcq', options: ['Cat', 'Ball', 'Tree', 'Hat'], correct: 3 },
  { id: 'cog-4-3', domain: 'Logical Deduction', ageband: '4-6', prompt: 'Yahya is taller than Isa. Isa is taller than Dana. Who is the tallest?', type: 'mcq', options: ['Yahya', 'Isa', 'Dana', 'They are the same'], correct: 0 },
  { id: 'cog-4-4', domain: 'Visual Spatial', ageband: '4-6', prompt: 'If you put two squares side by side, what shape do they make?', type: 'mcq', options: ['Circle', 'Triangle', 'Rectangle', 'Star'], correct: 2 },
  { id: 'cog-4-5', domain: 'Fluid Reasoning', ageband: '4-6', prompt: 'All birds have wings. Penguins are birds. Do penguins have wings?', type: 'mcq', options: ['Yes', 'No', 'Maybe', 'I don\'t know'], correct: 0 },
  // 7-9
  { id: 'cog-7-1', domain: 'Pattern Recognition', ageband: '7-9', prompt: 'Complete the sequence: 2, 4, 8, 16, ___', type: 'mcq', options: ['24', '32', '18', '20'], correct: 1 },
  { id: 'cog-7-2', domain: 'Working Memory', ageband: '7-9', prompt: 'Read these numbers: 3, 7, 1, 9. What is the sequence backwards?', type: 'mcq', options: ['9, 1, 7, 3', '3, 7, 1, 9', '1, 7, 3, 9', '9, 7, 1, 3'], correct: 0 },
  { id: 'cog-7-3', domain: 'Logical Deduction', ageband: '7-9', prompt: 'If all Glurps are Blips, and Fizo is a Glurp, is Fizo a Blip?', type: 'mcq', options: ['Yes', 'No', 'Cannot tell', 'Only sometimes'], correct: 0 },
  { id: 'cog-7-4', domain: 'Crystallised Knowledge', ageband: '7-9', prompt: 'What is the capital of Qatar?', type: 'mcq', options: ['Dubai', 'Doha', 'Riyadh', 'Muscat'], correct: 1 },
  { id: 'cog-7-5', domain: 'Processing Speed', ageband: '7-9', prompt: 'How many 3s are in this list: 3, 7, 3, 2, 5, 3, 8, 3?', type: 'mcq', options: ['2', '3', '4', '5'], correct: 2 },
  // 10-12 & adult
  { id: 'cog-10-1', domain: 'Fluid Reasoning', ageband: '10-12', prompt: 'If FRIEND is coded as GSJFOE, how is HOUSE coded?', type: 'mcq', options: ['IPVTF', 'ITPVF', 'IPTVF', 'HOVSE'], correct: 0 },
  { id: 'cog-10-2', domain: 'Working Memory', ageband: '10-12', prompt: 'What is 7 × 8 − 14 ÷ 2?', type: 'mcq', options: ['49', '50', '42', '35'], correct: 0 },
  { id: 'cog-10-3', domain: 'Analogical Reasoning', ageband: '10-12', prompt: 'Book is to Reading as Fork is to ___', type: 'mcq', options: ['Kitchen', 'Eating', 'Spoon', 'Table'], correct: 1 },
  { id: 'cog-10-4', domain: 'Logical Deduction', ageband: '10-12', prompt: 'Some managers are engineers. All engineers are graduates. Therefore:', type: 'mcq', options: ['All managers are graduates', 'Some managers are graduates', 'No managers are graduates', 'All graduates are managers'], correct: 1 },
  { id: 'cog-10-5', domain: 'Pattern Recognition', ageband: '10-12', prompt: 'Complete: 1, 1, 2, 3, 5, 8, ___', type: 'mcq', options: ['12', '13', '14', '11'], correct: 1 },
  { id: 'cog-a-1', domain: 'Fluid Reasoning', ageband: 'adult', prompt: 'If FRIEND is coded as GSJFOE, how is HOUSE coded?', type: 'mcq', options: ['IPVTF', 'ITPVF', 'IPTVF', 'HOVSE'], correct: 0 },
  { id: 'cog-a-2', domain: 'Working Memory', ageband: 'adult', prompt: 'What is 7 × 8 − 14 ÷ 2?', type: 'mcq', options: ['49', '50', '42', '35'], correct: 0 },
  { id: 'cog-a-3', domain: 'Analogical Reasoning', ageband: 'adult', prompt: 'Book is to Reading as Fork is to ___', type: 'mcq', options: ['Kitchen', 'Eating', 'Spoon', 'Table'], correct: 1 },
  { id: 'cog-a-4', domain: 'Logical Deduction', ageband: 'adult', prompt: 'Some managers are engineers. All engineers are graduates. Therefore:', type: 'mcq', options: ['All managers are graduates', 'Some managers are graduates', 'No managers are graduates', 'All graduates are managers'], correct: 1 },
  { id: 'cog-a-5', domain: 'Pattern Recognition', ageband: 'adult', prompt: 'Complete: 1, 1, 2, 3, 5, 8, ___', type: 'mcq', options: ['12', '13', '14', '11'], correct: 1 },
]

// Duplicate the small banks to ensure 15 questions per test run
const expandBank = (bank: Question[], targetCount: number) => {
  let expanded: Question[] = []
  while (expanded.length < targetCount) {
    expanded = [...expanded, ...bank]
  }
  return expanded.slice(0, targetCount)
}

const EQ_BANK: Question[] = [
  { id: 'eq-1', domain: 'Self-Awareness', ageband: '10-12', prompt: 'Your friend gets a prize at school, but you didn\'t. You feel a tight feeling in your chest. What is this feeling most likely?', type: 'scenario', options: ['I\'m angry at the teacher', 'I feel jealous and that\'s okay to notice', 'I\'m bored', 'I don\'t care'], scores: [1, 4, 1, 1] },
  { id: 'eq-2', domain: 'Self-Regulation', ageband: '10-12', prompt: 'You\'re in the middle of a game and your younger sibling accidentally knocks over your tower. You feel like shouting. What do you do?', type: 'scenario', options: ['Shout at them right away', 'Walk away and calm down before speaking', 'Tell a parent immediately', 'Ignore it and sulk'], scores: [1, 4, 2, 2] },
  { id: 'eq-3', domain: 'Empathy', ageband: '10-12', prompt: 'Your friend is very quiet at school today. Usually they are loud and funny. What do you do?', type: 'scenario', options: ['Ignore it — it\'s not my problem', 'Ask quietly if they\'re okay', 'Make jokes to cheer them up', 'Tell the teacher something is wrong'], scores: [1, 4, 2, 2] },
  { id: 'eq-4', domain: 'Social Awareness', ageband: '10-12', prompt: 'You notice that two friends are upset with each other. They both come to complain to you separately. What do you do?', type: 'scenario', options: ['Take one person\'s side', 'Listen to both but don\'t take sides', 'Ignore both', 'Tell the whole class'], scores: [1, 4, 2, 1] },
  { id: 'eq-5', domain: 'Responsible Decision-Making', ageband: '10-12', prompt: 'Your older brother tells you not to tell Mama something that happened. You think Mama should know. What do you do?', type: 'scenario', options: ['Keep the secret — loyalty comes first', 'Tell Mama because it\'s important', 'Ask your brother why it\'s secret first', 'Tell a different adult'], scores: [2, 3, 4, 2] },
]

const AI_BANK: Question[] = [
  // 4-9
  { id: 'ai-1', domain: 'Hallucination Detection', ageband: '7-9', prompt: 'An AI told you that the moon is made of cheese. This is:', type: 'mcq', options: ['True', 'False', 'Maybe', 'I need to check'], correct: 1 },
  { id: 'ai-2', domain: 'Prompt Quality', ageband: '7-9', prompt: 'You want AI to write a story about a cat. Which question is better?', type: 'mcq', options: ['Write a story', 'Write a short funny story about a cat named Mimi who lives in Doha', 'Cat story', 'Tell me about cats'], correct: 1 },
  { id: 'ai-3', domain: 'Ethical Judgment', ageband: '7-9', prompt: 'Is it okay to use AI to write your whole homework and pretend you did it yourself?', type: 'mcq', options: ['Yes, nobody will know', 'No, that\'s dishonest', 'Only if it\'s hard', 'Yes, AI is smarter'], correct: 1 },
  // 10-12 & Adult
  { id: 'ai-4', domain: 'Hallucination Detection', ageband: '10-12', prompt: 'An AI confidently tells you that the Battle of Hastings was in 1067. You know it was 1066. What should you do?', type: 'mcq', options: ['Trust the AI — it\'s usually right', 'Correct the AI and note the error', 'Close the tab', 'Ask another AI'], correct: 1 },
  { id: 'ai-5', domain: 'Prompt Quality', ageband: '10-12', prompt: 'You need to summarise a research paper for a school presentation. Which prompt is most effective?', type: 'mcq', options: ['Summarise this', 'Summarise this paper in 5 bullet points for a Year 6 audience, focusing on the main findings', 'What is this about', 'Make this shorter'], correct: 1 },
  { id: 'ai-6', domain: 'Critical Evaluation', ageband: '10-12', prompt: 'An AI gives you a list of 10 sources for your essay. What is the smartest next step?', type: 'mcq', options: ['Copy them directly into your bibliography', 'Check that each source is real and says what the AI claims', 'Ask the AI if the sources are real', 'Delete 5 of them randomly'], correct: 1 },
  { id: 'ai-7', domain: 'Ethical Judgment', ageband: '10-12', prompt: 'A company uses AI to decide who gets a bank loan. The AI was trained mostly on data from wealthy areas. What is the likely problem?', type: 'mcq', options: ['The AI will be too slow', 'The AI may unfairly reject people from poorer areas', 'There is no problem — AI is fair', 'The AI will cost too much'], correct: 1 },
  { id: 'ai-8', domain: 'Creative Augmentation', ageband: '10-12', prompt: 'You are writing a poem. You use AI to suggest rhymes and then choose the ones that feel right and edit them. This is:', type: 'mcq', options: ['Cheating', 'A smart way to use AI as a thinking partner', 'Lazy', 'Against the rules'], correct: 1 },
]

const SOCIAL_BANK: Question[] = [
  { id: 'soc-1', domain: 'Communication', ageband: '10-12', prompt: 'You need to explain to your teacher why you were late, but you\'re feeling nervous. What do you do?', type: 'scenario', options: ['Say nothing and hope they forget', 'Make up an excuse', 'Look them in the eye and explain clearly and honestly', 'Ask a friend to explain for you'], scores: [1, 1, 4, 2] },
  { id: 'soc-2', domain: 'Cooperation', ageband: '10-12', prompt: 'Your group project partner keeps doing things differently from what you agreed. You feel frustrated. You:', type: 'scenario', options: ['Take over the whole project', 'Talk to them calmly and find a middle ground', 'Complain to the teacher', 'Give up on the project'], scores: [2, 4, 1, 1] },
  { id: 'soc-3', domain: 'Assertion', ageband: '10-12', prompt: 'Someone at school takes your seat and won\'t move. You:', type: 'scenario', options: ['Say nothing and find another seat', 'Calmly tell them that\'s your seat', 'Push them out', 'Tell a teacher right away'], scores: [1, 4, 1, 2] },
  { id: 'soc-4', domain: 'Responsibility', ageband: '10-12', prompt: 'You promised to do the dishes but you forgot. Your mum noticed. You:', type: 'scenario', options: ['Blame your sibling', 'Apologise and do them straight away', 'Pretend you forgot', 'Ask for more time'], scores: [1, 4, 1, 2] },
  { id: 'soc-5', domain: 'Self-Control', ageband: '10-12', prompt: 'A classmate says something mean about you in front of others. You feel the urge to say something mean back. You:', type: 'scenario', options: ['Say something mean immediately', 'Take a breath and respond calmly or say nothing', 'Walk away without saying anything', 'Cry'], scores: [1, 4, 3, 2] },
]

// ── Main Component ────────────────────────────────────────────────────────
export default function AssessmentsHub() {
  const supabase = createClient()
  
  const [tab, setTab] = useState<'overview' | 'take' | 'history' | 'insights'>('overview')
  const [loading, setLoading] = useState(true)
  const [activeMember, setActiveMember] = useState(FAMILY[0])
  const [currentUser, setCurrentUser] = useState(FAMILY[0]) // Mock auth context
  
  const [sessions, setSessions] = useState<any[]>([])
  const [devScores, setDevScores] = useState<any[]>([])

  // Test Runner State
  const [testState, setTestState] = useState<'select' | 'intro' | 'testing' | 'complete'>('select')
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currQIdx, setCurrQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [testStartedAt, setTestStartedAt] = useState<Date | null>(null)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    // In real app, get from auth context
    const lsUser = localStorage.getItem('bayt-active-member')
    if (lsUser) {
      const u = FAMILY.find(f => f.id === lsUser)
      if (u) setCurrentUser(u)
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, dRes] = await Promise.all([
        supabase.from('assessment_sessions').select('*').order('completed_at', { ascending: false }),
        supabase.from('development_scores').select('*').order('score_date', { ascending: false })
      ])
      
      setSessions(sRes.data || JSON.parse(localStorage.getItem('bayt-assessment-sessions-v1') || '[]'))
      setDevScores(dRes.data || JSON.parse(localStorage.getItem('bayt-dev-scores-v1') || '[]'))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Timer effect
  useEffect(() => {
    if (testState === 'testing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (testState === 'testing' && timeLeft === 0) {
      handleAnswer(-1) // timeout = skip
    }
  }, [testState, timeLeft])

  const startTestSetup = (type: string) => {
    setSelectedTest(type)
    setTestState('intro')
  }

  const beginTesting = () => {
    const band = ageBand(activeMember.age)
    let bank: Question[] = []
    let targetCount = 15

    if (selectedTest === 'cognitive') {
      const filtered = COGNITIVE_BANK.filter(q => q.ageband === band || q.ageband === 'adult')
      bank = expandBank(filtered, 15)
    } else if (selectedTest === 'eq') {
      const filtered = EQ_BANK // simplify for demo: use base eq bank for all, adjust text in real app
      bank = expandBank(filtered, 15)
    } else if (selectedTest === 'ai') {
      const filtered = AI_BANK.filter(q => ['4-6','7-9'].includes(band) ? ['7-9'].includes(q.ageband) : ['10-12','adult'].includes(q.ageband))
      bank = expandBank(filtered, 10)
      targetCount = 10
    } else if (selectedTest === 'social') {
      const filtered = SOCIAL_BANK
      bank = expandBank(filtered, 15)
    }

    // Shuffle
    bank = bank.sort(() => Math.random() - 0.5)
    
    setQuestions(bank)
    setCurrQIdx(0)
    setAnswers({})
    setTestStartedAt(new Date())
    setTestState('testing')
    setTimeLeft(band === '4-6' || band === '7-9' ? 30 : 45)
  }

  const handleAnswer = (optionIdx: number) => {
    setFade(false)
    setTimeout(() => {
      const q = questions[currQIdx]
      setAnswers(prev => ({ ...prev, [q.id]: optionIdx }))
      
      if (currQIdx < questions.length - 1) {
        setCurrQIdx(currQIdx + 1)
        setTimeLeft(ageBand(activeMember.age) === '4-6' || ageBand(activeMember.age) === '7-9' ? 30 : 45)
        setFade(true)
      } else {
        setTestState('complete')
        setFade(true)
      }
    }, 400)
  }

  const calculateResults = () => {
    if (!selectedTest) return null
    let rawScore = 0
    let totalQuestions = questions.length
    let domainScores: Record<string, number[]> = {} // domain -> [scores]

    questions.forEach((q) => {
      const ans = answers[q.id]
      if (!domainScores[q.domain]) domainScores[q.domain] = []

      if (q.type === 'mcq') {
        if (ans === q.correct) {
          rawScore += 1
          domainScores[q.domain].push(1)
        } else {
          domainScores[q.domain].push(0)
        }
      } else if (q.type === 'scenario') {
        const score = q.scores ? q.scores[ans] || 0 : 0
        rawScore += score
        domainScores[q.domain].push(score)
      }
    })

    // Average domain scores
    const avgDomains: Record<string, number> = {}
    for (const [dom, scArr] of Object.entries(domainScores)) {
      if (scArr.length > 0) {
        avgDomains[dom] = scArr.reduce((a,b)=>a+b,0) / scArr.length
      }
    }

    let normed = 0
    if (selectedTest === 'cognitive' || selectedTest === 'ai') {
      normed = normalise(rawScore, totalQuestions)
    } else {
      // Scenario scoring (max 4 per q)
      normed = normalise(rawScore, totalQuestions * 4)
    }

    return { rawScore, totalQuestions, normedScore: normed, avgDomains }
  }

  const saveResults = async () => {
    const res = calculateResults()
    if (!res || !selectedTest) return

    const session = {
      id: crypto.randomUUID(),
      member_id: activeMember.id,
      test_type: selectedTest,
      age_band: ageBand(activeMember.age),
      started_at: testStartedAt?.toISOString(),
      completed_at: new Date().toISOString(),
      raw_score: res.rawScore,
      total_questions: res.totalQuestions,
      normed_score: res.normedScore,
      domain_scores: res.avgDomains,
      saved_to_dev: true
    }

    const updatedSessions = [session, ...sessions]
    setSessions(updatedSessions)
    localStorage.setItem('bayt-assessment-sessions-v1', JSON.stringify(updatedSessions))

    // Update dev scores
    const scoreCol = DOMAIN_MAP[selectedTest]
    if (scoreCol) {
      let currentDev = devScores.find(s => s.member_id === activeMember.id) || { id: crypto.randomUUID(), member_id: activeMember.id, score_date: new Date().toISOString().split('T')[0] }
      // Mock mapping: normed 0-10 -> age appropriate raw
      let rawToSave = Math.round(res.normedScore * 10) 
      if (scoreCol === 'iq_raw') rawToSave = Math.round((res.normedScore / 10) * (activeMember.age ? 110 : 150)) // simplistic mapping

      currentDev = { ...currentDev, [scoreCol]: rawToSave, score_date: new Date().toISOString().split('T')[0] }
      
      const updatedDev = [currentDev, ...devScores.filter(s => s.id !== currentDev.id)]
      setDevScores(updatedDev)
      localStorage.setItem('bayt-dev-scores-v1', JSON.stringify(updatedDev))
      
      try { 
        await supabase.from('development_scores').upsert(currentDev)
        await supabase.from('assessment_sessions').insert(session)
      } catch(e) {}
    } else {
      try { await supabase.from('assessment_sessions').insert(session) } catch(e) {}
    }

    alert('Assessment saved to development profile.')
    setTab('overview')
    setTestState('select')
  }

  const getLatestDevScore = (memberId: string) => {
    return devScores.find(s => s.member_id === memberId) || null
  }

  const isParent = currentUser.role === 'parent'

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading assessments...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Know yourselves. Grow together.</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Family Assessments Hub</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale, marginTop: '0.5rem' }}>اعرف نفسك، انمُ معاً</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontFamily: F_MONO, color: C.goldPale, opacity: 0.8 }}>{currentUser.emoji} {currentUser.name}</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'overview', label: '🏠 Overview' },
          { id: 'take', label: '✏️ Take Assessment' },
          { id: 'history', label: '📊 History' },
          { id: 'insights', label: '🧠 Insights', hidden: !isParent }
        ].filter(t => !t.hidden).map(t => (
          <button 
            key={t.id} onClick={() => { setTab(t.id as any); if(t.id==='take') setTestState('select'); }}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {FAMILY.map(m => {
                const latestSession = sessions.find(s => s.member_id === m.id)
                const scores = getLatestDevScore(m.id)
                return (
                  <div key={m.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>{m.age ? `${m.age} yrs` : 'Adult'}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '1.5rem', fontFamily: F_MONO }}>
                      Last assessment: {latestSession ? new Date(latestSession.completed_at).toLocaleDateString() : <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No assessment yet</span>}
                    </div>

                    {scores && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[{v: scores.iq_raw, m: 150, c: C.blue}, {v: scores.eq_raw, m: 150, c: C.orange}, {v: scores.social_raw, m: 100, c: C.goldDim}].map((s,i) => (
                          <div key={i} style={{ flex: 1, height: '4px', background: C.ruleLight, borderRadius: '2px', overflow: 'hidden' }} title="Domain Score">
                            <div style={{ width: `${Math.min(((s.v||0)/s.m)*100, 100)}%`, height: '100%', background: s.c }} />
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={() => { setActiveMember(m); setTab('take'); setTestState('select'); }} style={{ ...primaryBtn, marginTop: 'auto', width: '100%', background: C.white, color: C.green, border: `1px solid ${C.green}` }}>
                      START ASSESSMENT
                    </button>
                  </div>
                )
              })}
            </div>

            <div style={{ background: C.forest, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300, color: C.text }}>Available Assessments</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { i: '🧠', n: 'Cognitive Reasoning', d: 'Fluid thinking, memory, pattern recognition' },
                  { i: '💛', n: 'Emotional Intelligence', d: 'Self-awareness, empathy, regulation' },
                  { i: '🤖', n: 'AI Literacy', d: 'Working with AI tools wisely and critically' },
                  { i: '🌿', n: 'Social Skills', d: 'Communication, cooperation, responsibility' }
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{a.i}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{a.n}</div>
                      <div style={{ fontSize: '0.8rem', color: C.grey, marginTop: '2px' }}>{a.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'take' && (
          <div>
            {testState === 'select' && (
              <div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', borderBottom: `1px solid ${C.ruleLight}` }}>
                  {FAMILY.map(m => (
                    <button key={m.id} onClick={() => setActiveMember(m)} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${activeMember.id === m.id ? C.green : C.ruleLight}`, background: activeMember.id === m.id ? C.green : C.white, color: activeMember.id === m.id ? C.white : C.text, cursor: 'pointer', fontFamily: F_MONO, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.emoji} {m.name}
                    </button>
                  ))}
                </div>

                <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: 300 }}>Select Assessment for {activeMember.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {[
                    { id: 'cognitive', i: '🧠', n: 'Cognitive Reasoning', q: '15 questions', t: '20 min' },
                    { id: 'eq', i: '💛', n: 'Emotional Intelligence', q: '15 scenarios', t: '15 min' },
                    { id: 'ai', i: '🤖', n: 'AI Literacy', q: '10 questions', t: '10 min' },
                    { id: 'social', i: '🌿', n: 'Social Skills', q: '15 situations', t: '15 min' }
                  ].map(a => (
                    <div key={a.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => startTestSetup(a.id)} onMouseEnter={e => {e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'}} onMouseLeave={e => {e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'}}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{a.i}</div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: C.text }}>{a.n}</h3>
                      <div style={{ fontSize: '0.8rem', fontFamily: F_MONO, color: C.grey }}>{a.q} · ~{a.t}</div>
                      <div style={{ marginTop: '1rem', color: C.green, fontSize: '0.85rem', fontWeight: 600 }}>BEGIN ASSESSMENT →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testState === 'intro' && (
              <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', background: C.cream, padding: '3rem', borderRadius: '12px', border: `1px solid ${C.goldDim}` }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {selectedTest === 'cognitive' ? '🧠' : selectedTest === 'eq' ? '💛' : selectedTest === 'ai' ? '🤖' : '🌿'}
                </div>
                <h2 style={{ margin: '0 0 1rem 0', color: C.green, fontSize: '2rem', fontWeight: 300 }}>
                  {selectedTest === 'cognitive' ? 'Cognitive Reasoning' : selectedTest === 'eq' ? 'Emotional Intelligence' : selectedTest === 'ai' ? 'AI Literacy' : 'Social Skills'}
                </h2>
                
                <ul style={{ textAlign: 'left', margin: '0 auto 2rem auto', maxWidth: '400px', lineHeight: 1.6, color: C.text, fontSize: '1.1rem' }}>
                  <li>Answer honestly based on what you think or feel.</li>
                  <li>There is a timer, but don't rush.</li>
                  <li>Find a quiet place to focus.</li>
                </ul>

                <p style={{ fontStyle: 'italic', color: C.goldDim, marginBottom: '2rem', fontSize: '1.1rem' }}>
                  "This is not a test to pass or fail. It is a mirror."
                </p>

                <button onClick={beginTesting} style={{ ...primaryBtn, fontSize: '1rem', padding: '1rem 3rem' }}>
                  I'M READY → START
                </button>
              </div>
            )}

            {testState === 'testing' && questions.length > 0 && (
              <div style={{ maxWidth: '700px', margin: '0 auto', opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>
                  <span>Question {currQIdx + 1} of {questions.length}</span>
                  <span style={{ color: timeLeft <= 10 ? C.orange : C.grey }}>{timeLeft}s</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: C.ruleLight, borderRadius: '2px', overflow: 'hidden', marginBottom: '2rem' }}>
                  <div style={{ width: `${((currQIdx) / questions.length) * 100}%`, height: '100%', background: C.green, transition: 'width 0.3s' }} />
                </div>

                <div style={{ background: C.white, borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${C.ruleLight}`, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: C.forest, color: C.green, padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.7rem', fontFamily: F_MONO, textTransform: 'uppercase' }}>
                    {questions[currQIdx].domain}
                  </div>
                  
                  <h2 style={{ margin: '1rem 0 2.5rem 0', fontWeight: 400, fontSize: ageBand(activeMember.age) === '4-6' || ageBand(activeMember.age) === '7-9' ? '1.4rem' : '1.2rem', lineHeight: 1.5 }}>
                    {questions[currQIdx].prompt}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {questions[currQIdx].options.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleAnswer(i)}
                        style={{ 
                          padding: '1rem 1.5rem', textAlign: 'left', background: answers[questions[currQIdx].id] === i ? C.forest : C.white, 
                          border: `1px solid ${answers[questions[currQIdx].id] === i ? C.green : C.rule}`, borderRadius: '8px', 
                          fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                          color: answers[questions[currQIdx].id] === i ? C.green : C.text
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {testState === 'complete' && (
              <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: C.green, fontSize: '2.5rem', fontWeight: 300 }}>Assessment Complete</h2>
                <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldDim, marginBottom: '2rem' }}>شكراً — جزاك الله خيراً</div>

                <div style={{ background: C.cream, padding: '2rem', borderRadius: '12px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem', textAlign: 'left' }}>
                  {(() => {
                    const res = calculateResults()
                    if (!res) return null
                    
                    let narrative = ''
                    if (selectedTest === 'cognitive' || selectedTest === 'ai') {
                      if (res.normedScore >= 8) narrative = "Strong analytical thinking. Pattern recognition and logical reasoning are clear strengths."
                      else if (res.normedScore >= 6) narrative = "Solid foundational reasoning. Working memory and pattern recognition are areas to develop further."
                      else narrative = "This is the baseline — every great mind starts somewhere. Focus on puzzles and reading."
                    } else {
                      narrative = "Your emotional and social awareness shows a balanced understanding of interactions. Continued reflection will deepen these skills."
                    }

                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: `1px solid ${C.rule}`, paddingBottom: '1rem' }}>
                          <div>
                            <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, textTransform: 'uppercase' }}>Overall Metric</div>
                            <div style={{ fontSize: '2rem', fontWeight: 300, color: C.text }}>{res.normedScore} <span style={{ fontSize: '1rem', color: C.grey }}>/ 10</span></div>
                          </div>
                          <div style={{ textAlign: 'right', maxWidth: '300px', fontSize: '0.9rem', color: C.green, fontStyle: 'italic', lineHeight: 1.5 }}>
                            "{narrative}"
                          </div>
                        </div>

                        <h4 style={{ margin: '0 0 1rem 0', color: C.grey, fontFamily: F_MONO, fontSize: '0.8rem', textTransform: 'uppercase' }}>Domain Breakdown</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {Object.entries(res.avgDomains).map(([dom, score]) => {
                            // Scale pct based on test type max
                            const pct = (selectedTest === 'cognitive' || selectedTest === 'ai') ? (score * 100) : (score / 4) * 100
                            return (
                              <div key={dom} style={{ background: C.white, padding: '1rem', borderRadius: '6px', border: `1px solid ${C.ruleLight}` }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: C.text }}>{dom}</div>
                                <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: C.blue }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setTestState('select')} style={{ background: C.white, border: `1px solid ${C.rule}`, padding: '1rem 2rem', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.85rem', cursor: 'pointer', color: C.text }}>TRY ANOTHER TEST</button>
                  <button onClick={saveResults} style={{ ...primaryBtn, padding: '1rem 2rem', fontSize: '0.85rem' }}>SAVE TO DEVELOPMENT PROFILE</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', borderBottom: `1px solid ${C.ruleLight}` }}>
              {FAMILY.map(m => (
                <button key={m.id} onClick={() => setActiveMember(m)} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${activeMember.id === m.id ? C.green : C.ruleLight}`, background: activeMember.id === m.id ? C.green : C.white, color: activeMember.id === m.id ? C.white : C.text, cursor: 'pointer', fontFamily: F_MONO, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.filter(s => s.member_id === activeMember.id).map(s => (
                <div key={s.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text, textTransform: 'capitalize' }}>{s.test_type} Assessment</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{new Date(s.completed_at).toLocaleDateString()} · Age Band: {s.age_band}</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 300, color: C.green }}>{s.normed_score}<span style={{fontSize:'1rem',color:C.grey}}>/10</span></div>
                  </div>
                  
                  {s.domain_scores && (
                    <div style={{ background: C.cream, padding: '1rem', borderRadius: '6px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                      {Object.entries(s.domain_scores).map(([dom, score]: [string, any]) => {
                        const pct = (s.test_type === 'cognitive' || s.test_type === 'ai') ? (score * 100) : (score / 4) * 100
                        return (
                          <div key={dom}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: F_MONO, marginBottom: '4px', color: C.grey }}>
                              <span>{dom}</span><span>{Math.round(pct)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: C.ruleLight, borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: C.blue }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              {sessions.filter(s => s.member_id === activeMember.id).length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, background: C.cream, borderRadius: '8px', border: `1px dashed ${C.rule}` }}>
                  No assessments completed yet. Take your first assessment in the Take Assessment tab.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'insights' && isParent && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.goldDim}`, marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Parental Insights</div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: C.text, lineHeight: 1.5 }}>
                A holistic view of the family's development. Growth is non-linear; use these insights to guide conversations, not to judge.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              {FAMILY.filter(m => m.role === 'child').map(child => {
                const scores = getLatestDevScore(child.id)
                if (!scores) return null
                
                const stats = [
                  { k: 'Cognitive', v: (scores.iq_raw/scores.iq_age_max) },
                  { k: 'Emotional', v: (scores.eq_raw/scores.eq_age_max) },
                  { k: 'Academic', v: (scores.academic_raw/scores.academic_max) },
                  { k: 'Social', v: (scores.social_raw/scores.social_max) },
                  { k: 'Deen', v: (scores.deen_raw/scores.deen_max) }
                ]
                
                const sorted = [...stats].sort((a,b) => b.v - a.v)
                const strongest = sorted[0]
                const weakest = sorted[sorted.length-1]

                return (
                  <div key={child.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{child.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>{child.name}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      {stats.map(s => (
                        <div key={s.k}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, marginBottom: '2px', color: C.grey }}>
                            <span>{s.k}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(s.v * 100, 100)}%`, height: '100%', background: C.green }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: C.forest, padding: '1rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: C.goldDim }}>Strength:</strong> {strongest.k} is thriving.</div>
                      <div><strong style={{ color: C.orange }}>Room to grow:</strong> Support needed in {weakest.k}.</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '2rem', background: C.white }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300 }}>Recommendations</h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: C.text, lineHeight: 1.6 }}>
                <li><strong>Consider evening conversations about feelings.</strong> Linah's EQ scores indicate a great opportunity to name emotions out loud at dinner.</li>
                <li><strong>Explore AI tools together.</strong> Ask Yahya and Isa to explain what they know about AI to the family this weekend.</li>
                <li><strong>Group activities help.</strong> Dana's social skills are developing; consider a team sport or collaborative art project.</li>
              </ul>
              <div style={{ marginTop: '2rem', padding: '1rem', background: C.cream, borderRadius: '6px', fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, textAlign: 'center' }}>
                Recommended: one full assessment per family member per quarter.
              </div>
            </div>
          </div>
        )}

        {tab === 'insights' && !isParent && (
          <div style={{ textAlign: 'center', padding: '4rem', background: C.cream, borderRadius: '8px', border: `1px solid ${C.rule}` }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ color: C.green, fontWeight: 300 }}>Access Restricted</h2>
            <p style={{ color: C.grey }}>Parental insights are restricted to Head of Household and Partner.</p>
          </div>
        )}

      </main>
    </div>
  )
}

const primaryBtn = {
  background: C.green,
  color: C.white,
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontFamily: F_MONO,
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.05em'
}