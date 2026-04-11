// app/assessments/assessments-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
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

// ── COGNITIVE BANK ────────────────────────────────────────────────────────
const COGNITIVE_BANK: Question[] = [
  // 4-6
  { id: 'cog-4-1', domain: 'Pattern Recognition', ageband: '4-6', prompt: 'What comes next? 🔴 🔵 🔴 🔵 ___', type: 'mcq', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
  { id: 'cog-4-2', domain: 'Working Memory', ageband: '4-6', prompt: 'I will say 3 things. Remember them. [Cat, Ball, Tree] → Which one did I NOT say?', type: 'mcq', options: ['Cat', 'Ball', 'Tree', 'Hat'], correct: 3 },
  { id: 'cog-4-3', domain: 'Logical Deduction', ageband: '4-6', prompt: 'Yahya is taller than Isa. Isa is taller than Dana. Who is the tallest?', type: 'mcq', options: ['Yahya', 'Isa', 'Dana', 'They are the same'], correct: 0 },
  { id: 'cog-4-4', domain: 'Visual Spatial', ageband: '4-6', prompt: 'If you put two squares side by side, what shape do they make?', type: 'mcq', options: ['Circle', 'Triangle', 'Rectangle', 'Star'], correct: 2 },
  { id: 'cog-4-5', domain: 'Fluid Reasoning', ageband: '4-6', prompt: 'All birds have wings. Penguins are birds. Do penguins have wings?', type: 'mcq', options: ['Yes', 'No', 'Maybe', 'I do not know'], correct: 0 },
  { id: 'cog-4-6', domain: 'Number Sense', ageband: '4-6', prompt: 'Which group has more? ⭐⭐⭐⭐ or ⭐⭐⭐', type: 'mcq', options: ['The first group', 'The second group', 'They are the same', 'I cannot tell'], correct: 0 },
  { id: 'cog-4-7', domain: 'Sequencing', ageband: '4-6', prompt: 'What do you do FIRST in the morning? Brush teeth, eat breakfast, or wake up?', type: 'mcq', options: ['Brush teeth', 'Eat breakfast', 'Wake up', 'Get dressed'], correct: 2 },
  { id: 'cog-4-8', domain: 'Categorisation', ageband: '4-6', prompt: 'Which one does not belong? Apple, Banana, Carrot, Mango', type: 'mcq', options: ['Apple', 'Banana', 'Carrot', 'Mango'], correct: 2 },
  // 7-9
  { id: 'cog-7-1', domain: 'Pattern Recognition', ageband: '7-9', prompt: 'Complete the sequence: 2, 4, 8, 16, ___', type: 'mcq', options: ['24', '32', '18', '20'], correct: 1 },
  { id: 'cog-7-2', domain: 'Working Memory', ageband: '7-9', prompt: 'Read these numbers: 3, 7, 1, 9. What is the sequence backwards?', type: 'mcq', options: ['9, 1, 7, 3', '3, 7, 1, 9', '1, 7, 3, 9', '9, 7, 1, 3'], correct: 0 },
  { id: 'cog-7-3', domain: 'Logical Deduction', ageband: '7-9', prompt: 'If all Glurps are Blips, and Fizo is a Glurp, is Fizo a Blip?', type: 'mcq', options: ['Yes', 'No', 'Cannot tell', 'Only sometimes'], correct: 0 },
  { id: 'cog-7-4', domain: 'Crystallised Knowledge', ageband: '7-9', prompt: 'What is the capital of Qatar?', type: 'mcq', options: ['Dubai', 'Doha', 'Riyadh', 'Muscat'], correct: 1 },
  { id: 'cog-7-5', domain: 'Processing Speed', ageband: '7-9', prompt: 'How many 3s are in this list: 3, 7, 3, 2, 5, 3, 8, 3?', type: 'mcq', options: ['2', '3', '4', '5'], correct: 2 },
  { id: 'cog-7-6', domain: 'Analogical Reasoning', ageband: '7-9', prompt: 'Day is to Night as Hot is to ___', type: 'mcq', options: ['Warm', 'Cold', 'Fire', 'Sun'], correct: 1 },
  { id: 'cog-7-7', domain: 'Spatial Reasoning', ageband: '7-9', prompt: 'A square has 4 sides. A triangle has 3. How many sides do 2 triangles and 1 square have together?', type: 'mcq', options: ['9', '10', '11', '12'], correct: 1 },
  { id: 'cog-7-8', domain: 'Fluid Reasoning', ageband: '7-9', prompt: 'Complete the series: 5, 10, 20, 40, ___', type: 'mcq', options: ['60', '70', '80', '45'], correct: 2 },
  { id: 'cog-7-9', domain: 'Logical Deduction', ageband: '7-9', prompt: 'Sara is older than Nour. Nour is older than Reem. Who is the youngest?', type: 'mcq', options: ['Sara', 'Nour', 'Reem', 'They are the same age'], correct: 2 },
  { id: 'cog-7-10', domain: 'Working Memory', ageband: '7-9', prompt: 'If A=1 and B=2, what is A + B + B?', type: 'mcq', options: ['3', '4', '5', '6'], correct: 2 },
  // 10-12
  { id: 'cog-10-1', domain: 'Fluid Reasoning', ageband: '10-12', prompt: 'If FRIEND is coded as GSJFOE, how is HOUSE coded?', type: 'mcq', options: ['IPVTF', 'ITPVF', 'IPTVF', 'HOVSE'], correct: 0 },
  { id: 'cog-10-2', domain: 'Working Memory', ageband: '10-12', prompt: 'What is 7 × 8 − 14 ÷ 2?', type: 'mcq', options: ['49', '50', '42', '35'], correct: 0 },
  { id: 'cog-10-3', domain: 'Analogical Reasoning', ageband: '10-12', prompt: 'Book is to Reading as Fork is to ___', type: 'mcq', options: ['Kitchen', 'Eating', 'Spoon', 'Table'], correct: 1 },
  { id: 'cog-10-4', domain: 'Logical Deduction', ageband: '10-12', prompt: 'Some managers are engineers. All engineers are graduates. Therefore:', type: 'mcq', options: ['All managers are graduates', 'Some managers are graduates', 'No managers are graduates', 'All graduates are managers'], correct: 1 },
  { id: 'cog-10-5', domain: 'Pattern Recognition', ageband: '10-12', prompt: 'Complete: 1, 1, 2, 3, 5, 8, ___', type: 'mcq', options: ['12', '13', '14', '11'], correct: 1 },
  { id: 'cog-10-6', domain: 'Spatial Reasoning', ageband: '10-12', prompt: 'A cube has 6 faces. How many faces do 4 cubes have?', type: 'mcq', options: ['18', '20', '24', '28'], correct: 2 },
  { id: 'cog-10-7', domain: 'Processing Speed', ageband: '10-12', prompt: 'How many prime numbers are between 10 and 20?', type: 'mcq', options: ['2', '3', '4', '5'], correct: 2 },
  { id: 'cog-10-8', domain: 'Crystallised Knowledge', ageband: '10-12', prompt: 'What does DNA stand for?', type: 'mcq', options: ['Deoxyribonucleic Acid', 'Dynamic Natural Array', 'Digital Neuron Activation', 'Dual Nitrogen Alloy'], correct: 0 },
  { id: 'cog-10-9', domain: 'Fluid Reasoning', ageband: '10-12', prompt: 'If 5 workers build a wall in 10 days, how many days for 10 workers?', type: 'mcq', options: ['20', '10', '5', '15'], correct: 2 },
  { id: 'cog-10-10', domain: 'Working Memory', ageband: '10-12', prompt: 'Reverse this word: FAMILY', type: 'mcq', options: ['YLIMAF', 'FYMALI', 'YLAMIF', 'YLMAFI'], correct: 0 },
  // adult
  { id: 'cog-a-1', domain: 'Fluid Reasoning', ageband: 'adult', prompt: 'If FRIEND is coded as GSJFOE, how is HOUSE coded?', type: 'mcq', options: ['IPVTF', 'ITPVF', 'IPTVF', 'HOVSE'], correct: 0 },
  { id: 'cog-a-2', domain: 'Working Memory', ageband: 'adult', prompt: 'What is 7 × 8 − 14 ÷ 2?', type: 'mcq', options: ['49', '50', '42', '35'], correct: 0 },
  { id: 'cog-a-3', domain: 'Analogical Reasoning', ageband: 'adult', prompt: 'Book is to Reading as Fork is to ___', type: 'mcq', options: ['Kitchen', 'Eating', 'Spoon', 'Table'], correct: 1 },
  { id: 'cog-a-4', domain: 'Logical Deduction', ageband: 'adult', prompt: 'Some managers are engineers. All engineers are graduates. Therefore:', type: 'mcq', options: ['All managers are graduates', 'Some managers are graduates', 'No managers are graduates', 'All graduates are managers'], correct: 1 },
  { id: 'cog-a-5', domain: 'Pattern Recognition', ageband: 'adult', prompt: 'Complete: 1, 1, 2, 3, 5, 8, ___', type: 'mcq', options: ['12', '13', '14', '11'], correct: 1 },
  { id: 'cog-a-6', domain: 'Lateral Thinking', ageband: 'adult', prompt: 'A man walks into a restaurant and orders albatross soup. He takes one sip, goes home and kills himself. Why might this be? (This is a logic puzzle — choose the most internally consistent answer.)', type: 'mcq', options: ['He hated the taste', 'He realised he had eaten something else labelled as albatross before', 'He was poisoned', 'He was allergic'], correct: 1 },
  { id: 'cog-a-7', domain: 'Crystallised Knowledge', ageband: 'adult', prompt: 'Which logical fallacy involves dismissing a claim because of who made it, rather than the argument itself?', type: 'mcq', options: ['Straw Man', 'Ad Hominem', 'False Dilemma', 'Slippery Slope'], correct: 1 },
  { id: 'cog-a-8', domain: 'Working Memory', ageband: 'adult', prompt: 'Starting from 100, subtract 7 each time. What is the 5th number?', type: 'mcq', options: ['63', '65', '60', '58'], correct: 1 },
  { id: 'cog-a-9', domain: 'Fluid Reasoning', ageband: 'adult', prompt: 'If all A are B, and no B are C, then:', type: 'mcq', options: ['Some A are C', 'No A are C', 'All C are A', 'Some B are A'], correct: 1 },
  { id: 'cog-a-10', domain: 'Systems Thinking', ageband: 'adult', prompt: 'You fix a problem quickly and it reappears within a week. This is most likely because:', type: 'mcq', options: ['The fix was wrong', 'You treated the symptom not the root cause', 'The problem is unsolvable', 'Someone else caused it again'], correct: 1 },
]

// ── EQ BANK ───────────────────────────────────────────────────────────────
const EQ_BANK: Question[] = [
  // 4-6
  { id: 'eq-4-1', domain: 'Self-Awareness', ageband: '4-6', prompt: 'You did not get the toy you wanted. You feel like crying. What is this feeling called?', type: 'scenario', options: ['Happy', 'Sad', 'Tired', 'Surprised'], scores: [1, 4, 1, 1] },
  { id: 'eq-4-2', domain: 'Empathy', ageband: '4-6', prompt: 'Your friend fell and is crying. What do you do?', type: 'scenario', options: ['Laugh', 'Walk away', 'Ask if they are okay', 'Keep playing'], scores: [1, 1, 4, 1] },
  { id: 'eq-4-3', domain: 'Self-Regulation', ageband: '4-6', prompt: 'You are waiting for your turn and it is taking a long time. What should you do?', type: 'scenario', options: ['Push to the front', 'Shout', 'Wait patiently or find something to do', 'Give up'], scores: [1, 1, 4, 2] },
  { id: 'eq-4-4', domain: 'Social Awareness', ageband: '4-6', prompt: 'Baba looks tired and sad. What do you do?', type: 'scenario', options: ['Ask him for something', 'Give him a hug and ask if he is okay', 'Ignore him', 'Make noise to cheer him up'], scores: [1, 4, 1, 1] },
  { id: 'eq-4-5', domain: 'Responsible Decision-Making', ageband: '4-6', prompt: 'You broke something by accident. What do you do?', type: 'scenario', options: ['Hide it', 'Blame someone else', 'Tell the truth and say sorry', 'Pretend it was already broken'], scores: [1, 1, 4, 1] },
  { id: 'eq-4-6', domain: 'Self-Awareness', ageband: '4-6', prompt: 'Your face feels hot and you want to shout. What feeling is this?', type: 'scenario', options: ['Joy', 'Fear', 'Anger', 'Calm'], scores: [1, 1, 4, 1] },
  { id: 'eq-4-7', domain: 'Empathy', ageband: '4-6', prompt: 'A new child at school has no one to play with. What do you do?', type: 'scenario', options: ['Nothing, they will find someone', 'Invite them to play', 'Tell them to go away', 'Watch from far away'], scores: [1, 4, 1, 1] },
  { id: 'eq-4-8', domain: 'Self-Regulation', ageband: '4-6', prompt: 'You are very excited at a library. What is the right thing to do?', type: 'scenario', options: ['Run and shout', 'Whisper and walk quietly', 'Jump on the chairs', 'Sing loudly'], scores: [1, 4, 1, 1] },
  // 7-9
  { id: 'eq-7-1', domain: 'Self-Awareness', ageband: '7-9', prompt: 'You feel butterflies in your stomach before a school presentation. This feeling is most likely:', type: 'scenario', options: ['Anger', 'Excitement mixed with nervousness', 'Hunger', 'Sadness'], scores: [1, 4, 1, 1] },
  { id: 'eq-7-2', domain: 'Self-Regulation', ageband: '7-9', prompt: 'Someone says something unkind to you. You feel like pushing them. What do you do?', type: 'scenario', options: ['Push them anyway', 'Take a deep breath and walk away', 'Cry immediately', 'Tell everyone what they said'], scores: [1, 4, 2, 2] },
  { id: 'eq-7-3', domain: 'Empathy', ageband: '7-9', prompt: 'Your friend did not get invited to a party you were invited to. You:', type: 'scenario', options: ['Brag about how fun it will be', 'Quietly check in on how they feel', 'Pretend you are not going', 'Ask why they were not invited'], scores: [1, 4, 2, 1] },
  { id: 'eq-7-4', domain: 'Social Awareness', ageband: '7-9', prompt: 'You notice a classmate is being left out at lunch. You:', type: 'scenario', options: ['Ignore it, not your problem', 'Invite them to sit with your group', 'Tell the teacher', 'Wait to see if anyone else helps'], scores: [1, 4, 2, 1] },
  { id: 'eq-7-5', domain: 'Responsible Decision-Making', ageband: '7-9', prompt: 'Your older sibling tells you to lie to Mama. You:', type: 'scenario', options: ['Lie because they asked', 'Refuse and tell the truth', 'Say nothing at all', 'Ask why first'], scores: [1, 4, 2, 3] },
  { id: 'eq-7-6', domain: 'Self-Awareness', ageband: '7-9', prompt: 'You worked really hard on a drawing and someone laughed at it. You feel ashamed. Shame means:', type: 'scenario', options: ['I think I am bad at everything forever', 'I feel embarrassed but it does not define my worth', 'Everyone hates me', 'I should stop drawing'], scores: [1, 4, 1, 1] },
  { id: 'eq-7-7', domain: 'Empathy', ageband: '7-9', prompt: 'Your friend is quieter than usual. You know their pet died. You:', type: 'scenario', options: ['Do not bring it up in case it upsets them more', 'Tell them to cheer up', 'Gently tell them you are sorry and you are there if they want to talk', 'Give them your toy'], scores: [2, 1, 4, 2] },
  { id: 'eq-7-8', domain: 'Self-Regulation', ageband: '7-9', prompt: 'You lost a game you really wanted to win. You feel like throwing the board. You:', type: 'scenario', options: ['Throw it anyway', 'Say well done to the winner even if it is hard', 'Sulk silently', 'Blame the rules'], scores: [1, 4, 2, 1] },
  { id: 'eq-7-9', domain: 'Social Awareness', ageband: '7-9', prompt: 'A joke is being told about someone different. Everyone is laughing. You:', type: 'scenario', options: ['Laugh along so you fit in', 'Stay quiet but feel uncomfortable', 'Tell them the joke is unkind', 'Walk away'], scores: [1, 2, 4, 3] },
  { id: 'eq-7-10', domain: 'Responsible Decision-Making', ageband: '7-9', prompt: 'You found money on the floor at school. You:', type: 'scenario', options: ['Keep it', 'Hand it in to the teacher', 'Leave it there', 'Share it with friends'], scores: [1, 4, 2, 1] },
  // 10-12
  { id: 'eq-10-1', domain: 'Self-Awareness', ageband: '10-12', prompt: 'Your friend gets a prize at school, but you did not. You feel a tight feeling in your chest. What is this feeling most likely?', type: 'scenario', options: ['Angry at the teacher', 'Jealous and that is okay to notice', 'Bored', 'Indifferent'], scores: [1, 4, 1, 1] },
  { id: 'eq-10-2', domain: 'Self-Regulation', ageband: '10-12', prompt: 'You are in the middle of a game and your younger sibling accidentally knocks over your tower. You feel like shouting. What do you do?', type: 'scenario', options: ['Shout at them right away', 'Walk away and calm down before speaking', 'Tell a parent immediately', 'Ignore it and sulk'], scores: [1, 4, 2, 2] },
  { id: 'eq-10-3', domain: 'Empathy', ageband: '10-12', prompt: 'Your friend is very quiet at school today. Usually they are loud and funny. What do you do?', type: 'scenario', options: ['Ignore it, not my problem', 'Ask quietly if they are okay', 'Make jokes to cheer them up', 'Tell the teacher something is wrong'], scores: [1, 4, 2, 2] },
  { id: 'eq-10-4', domain: 'Social Awareness', ageband: '10-12', prompt: 'You notice that two friends are upset with each other. They both come to complain to you separately. What do you do?', type: 'scenario', options: ['Take one side', 'Listen to both but do not take sides', 'Ignore both', 'Tell the whole class'], scores: [1, 4, 2, 1] },
  { id: 'eq-10-5', domain: 'Responsible Decision-Making', ageband: '10-12', prompt: 'Your older brother tells you not to tell Mama something that happened. You think Mama should know. What do you do?', type: 'scenario', options: ['Keep the secret — loyalty comes first', 'Tell Mama because it is important', 'Ask your brother why it is a secret first', 'Tell a different adult'], scores: [2, 3, 4, 2] },
  { id: 'eq-10-6', domain: 'Self-Awareness', ageband: '10-12', prompt: 'You made a mistake on a test you studied hard for. Your first instinct is to blame the teacher. This likely means:', type: 'scenario', options: ['The teacher is wrong', 'You are protecting yourself from feeling disappointed — it is called self-defence', 'You are right to be angry', 'You should not have studied'], scores: [1, 4, 2, 1] },
  { id: 'eq-10-7', domain: 'Empathy', ageband: '10-12', prompt: 'Someone from a different country joins your class and speaks differently. Some classmates laugh. You:', type: 'scenario', options: ['Laugh too so you are not the odd one out', 'Stay quiet and do nothing', 'Introduce yourself to the new student warmly', 'Tell the teacher'], scores: [1, 2, 4, 3] },
  { id: 'eq-10-8', domain: 'Self-Regulation', ageband: '10-12', prompt: 'You are angry at a sibling but Baba is watching. The mature response is:', type: 'scenario', options: ['Explode because you cannot help it', 'Pretend nothing happened', 'Ask to talk about it privately later when you are calm', 'Cry to get attention'], scores: [1, 2, 4, 1] },
  { id: 'eq-10-9', domain: 'Social Awareness', ageband: '10-12', prompt: 'A friend group starts leaving someone out deliberately. You notice. You:', type: 'scenario', options: ['Join in so you stay in the group', 'Do nothing but feel bad', 'Talk privately to the person being excluded to show you see them', 'Call out the group publicly'], scores: [1, 2, 4, 3] },
  { id: 'eq-10-10', domain: 'Responsible Decision-Making', ageband: '10-12', prompt: 'You know something that could hurt someone to hear, but keeping it secret also hurts them. You:', type: 'scenario', options: ['Say nothing — protect yourself', 'Tell them kindly and at the right moment', 'Tell someone else to do it', 'Hint at it and let them figure it out'], scores: [2, 4, 2, 1] },
  // adult — calibrated for parenting, marriage, leadership
  { id: 'eq-a-1', domain: 'Self-Awareness', ageband: 'adult', prompt: 'You have just raised your voice at one of your children over something minor and immediately feel regret. What does this most likely signal?', type: 'scenario', options: ['You are tired and carrying stress that has nothing to do with them', 'The child was genuinely being difficult', 'You need to set firmer limits', 'This is normal parenting, do not overthink it'], scores: [4, 1, 2, 1] },
  { id: 'eq-a-2', domain: 'Self-Regulation', ageband: 'adult', prompt: 'Your spouse says something that feels like a criticism in front of others. You feel a surge of defensiveness. The most emotionally intelligent response is:', type: 'scenario', options: ['Defend yourself calmly in the moment', 'Deflect with humour', 'Stay quiet and bring it up privately later with curiosity rather than accusation', 'Tell them how that felt right away'], scores: [2, 2, 4, 2] },
  { id: 'eq-a-3', domain: 'Empathy', ageband: 'adult', prompt: 'Your child comes home silent and goes straight to their room. You have had a hard day. The most present parenting response is:', type: 'scenario', options: ['Give them space — they will come out when ready', 'Knock gently, say you noticed they seem quiet, and you are there if they want to talk', 'Ask them directly what is wrong', 'Tell them about your hard day to show adults struggle too'], scores: [2, 4, 2, 1] },
  { id: 'eq-a-4', domain: 'Social Awareness', ageband: 'adult', prompt: 'A colleague is visibly struggling but performing professionally. You are their peer, not their manager. You:', type: 'scenario', options: ['Say nothing — it is not your place', 'Report it to their manager so they get help', 'Find a private moment to check in briefly and genuinely', 'Mention it at a team meeting as a general concern'], scores: [2, 1, 4, 1] },
  { id: 'eq-a-5', domain: 'Responsible Decision-Making', ageband: 'adult', prompt: 'You discover you have been consistently wrong about something you have been teaching your children. The most mature response is:', type: 'scenario', options: ['Continue as before to maintain consistency', 'Quietly change your approach without acknowledging it', 'Acknowledge it openly to them — modelling intellectual honesty matters', 'Wait until they are older'], scores: [1, 2, 4, 1] },
  { id: 'eq-a-6', domain: 'Self-Awareness', ageband: 'adult', prompt: 'You feel a strong emotional reaction when a friend achieves something you have been working toward for years. Naming this honestly matters because:', type: 'scenario', options: ['It stops you from acting on it unconsciously', 'You can then share your feelings with them', 'Feeling it means you are a bad friend', 'It will pass on its own without reflection'], scores: [4, 2, 1, 1] },
  { id: 'eq-a-7', domain: 'Self-Regulation', ageband: 'adult', prompt: 'You are in a high-stakes meeting and someone dismisses your idea in front of senior leadership. You feel sharp humiliation. In the moment, the best internal strategy is:', type: 'scenario', options: ['Immediately counter their point to hold your ground', 'Let it go — pick your battles', 'Breathe, stay composed, then respond with evidence not emotion', 'Ask them directly why they dismissed it'], scores: [2, 2, 4, 2] },
  { id: 'eq-a-8', domain: 'Empathy', ageband: 'adult', prompt: 'Your spouse is venting about a hard day. You can see a clear solution to their problem. The most connective response is:', type: 'scenario', options: ['Give them the solution immediately', 'Ask if they want to be heard or need ideas before jumping in', 'Wait until they finish then offer your perspective', 'Share a similar thing that happened to you'], scores: [1, 4, 2, 1] },
  { id: 'eq-a-9', domain: 'Self-Regulation', ageband: 'adult', prompt: 'You are fasting and a work situation becomes intensely frustrating. What is the most effective internal strategy?', type: 'scenario', options: ['Remind yourself the fast demands both hunger and patience, they are linked', 'Defer all difficult conversations until after Iftar', 'Ask others to be more considerate today', 'Accept reduced output on fasting days'], scores: [4, 2, 2, 1] },
  { id: 'eq-a-10', domain: 'Social Awareness', ageband: 'adult', prompt: 'You are leading a family meeting where two children are in conflict. One child is louder. You:', type: 'scenario', options: ['Let the loudest one speak their case first', 'Actively create space for the quieter child without making it obvious', 'Stay neutral and let them resolve it', 'Send them both away to cool down'], scores: [1, 4, 2, 2] },
  { id: 'eq-a-11', domain: 'Self-Awareness', ageband: 'adult', prompt: 'You notice a pattern: you consistently feel drained after conversations with one particular person. This most likely means:', type: 'scenario', options: ['That person is toxic and you should avoid them', 'There is a relational dynamic worth examining, possibly on both sides', 'You are introverted', 'You should speak less in those conversations'], scores: [2, 4, 1, 1] },
  { id: 'eq-a-12', domain: 'Responsible Decision-Making', ageband: 'adult', prompt: 'Your teenager is making a decision you strongly disagree with but is not dangerous. You:', type: 'scenario', options: ['Veto it immediately, you know better', 'Say nothing — their autonomy matters', 'Share your concern once, clearly and without pressure, then let them decide', 'Get your spouse to deliver the concern instead'], scores: [2, 2, 4, 1] },
  { id: 'eq-a-13', domain: 'Empathy', ageband: 'adult', prompt: 'A family member is grieving in a way that looks like anger at everyone, including you. You recognise this as:', type: 'scenario', options: ['Disrespect that needs to be addressed', 'A normal expression of grief that calls for patience not confrontation', 'A sign they need professional help', 'Their personality coming through'], scores: [1, 4, 2, 1] },
  { id: 'eq-a-14', domain: 'Self-Regulation', ageband: 'adult', prompt: 'You have three back-to-back stressors in one day and by evening you feel completely flooded. The most emotionally skilled response is:', type: 'scenario', options: ['Push through — you have responsibilities', 'Withdraw and process alone before re-engaging', 'Tell your family it has been a bad day and you need 20 minutes', 'Sleep it off'], scores: [2, 3, 4, 1] },
  { id: 'eq-a-15', domain: 'Social Awareness', ageband: 'adult', prompt: 'You walk into a room and sense the atmosphere has shifted before anyone says anything. This ability is called:', type: 'scenario', options: ['Intuition and should be ignored until confirmed', 'Social attunement — a valuable form of emotional intelligence worth noticing', 'Overthinking', 'Anxiety'], scores: [2, 4, 1, 1] },
  { id: 'eq-a-16', domain: 'Responsible Decision-Making', ageband: 'adult', prompt: 'You realise you have handled a conflict with a child poorly and harshly. The most restorative next step is:', type: 'scenario', options: ['Move on — children forget quickly', 'Return to them, acknowledge what happened, and repair it directly', 'Be extra kind for the next few days without addressing it', 'Wait for them to bring it up'], scores: [1, 4, 2, 1] },
  { id: 'eq-a-17', domain: 'Self-Awareness', ageband: 'adult', prompt: 'You feel irritated when someone else gets credit for an idea that was partly yours. Understanding this feeling allows you to:', type: 'scenario', options: ['Claim the idea publicly', 'Process the feeling before it leaks into your behaviour', 'Decide they are not trustworthy', 'Realise you care too much about recognition'], scores: [1, 4, 2, 1] },
  { id: 'eq-a-18', domain: 'Empathy', ageband: 'adult', prompt: 'Your child tells you something they did wrong expecting punishment. They look terrified. The highest-EQ response is:', type: 'scenario', options: ['Punish to set a clear expectation', 'Thank them for telling you, discuss the behaviour, then decide on consequences separately', 'Pretend it is not a big deal so they feel safe', 'Tell them you are disappointed'], scores: [2, 4, 1, 2] },
  { id: 'eq-a-19', domain: 'Self-Regulation', ageband: 'adult', prompt: 'You are deeply convinced of something and new evidence challenges it. The most emotionally intelligent response is:', type: 'scenario', options: ['Dismiss the evidence — your conviction is based on experience', 'Feel threatened but make yourself genuinely consider it', 'Immediately change your position to appear open-minded', 'Ask someone else to evaluate it for you'], scores: [1, 4, 2, 1] },
  { id: 'eq-a-20', domain: 'Responsible Decision-Making', ageband: 'adult', prompt: 'A major family decision needs to be made. Your instinct is clear but your spouse disagrees. What is the most mature path?', type: 'scenario', options: ['Use your role to decide', 'Genuinely seek to understand their position before defending your own — your instinct may be missing something', 'Defer entirely to keep the peace', 'Get a third party to break the deadlock'], scores: [1, 4, 2, 2] },
]

// ── AI BANK ───────────────────────────────────────────────────────────────
const AI_BANK: Question[] = [
  // 4-6
  { id: 'ai-4-1', domain: 'AI Basics', ageband: '4-6', prompt: 'A robot helps you sort your toys. Is the robot thinking like a person?', type: 'mcq', options: ['Yes, it has feelings', 'No, it follows instructions', 'Maybe sometimes', 'Only if it is tired'], correct: 1 },
  { id: 'ai-4-2', domain: 'AI Basics', ageband: '4-6', prompt: 'Siri and Alexa are AI assistants. What do they do?', type: 'mcq', options: ['They get angry if you are rude', 'They answer questions using computers', 'They go to sleep at night', 'They eat data for breakfast'], correct: 1 },
  // 7-9
  { id: 'ai-7-1', domain: 'Hallucination Detection', ageband: '7-9', prompt: 'An AI told you that the moon is made of cheese. This is:', type: 'mcq', options: ['True', 'False', 'Maybe', 'I need to check'], correct: 1 },
  { id: 'ai-7-2', domain: 'Prompt Quality', ageband: '7-9', prompt: 'You want AI to write a story about a cat. Which question is better?', type: 'mcq', options: ['Write a story', 'Write a short funny story about a cat named Mimi who lives in Doha', 'Cat story', 'Tell me about cats'], correct: 1 },
  { id: 'ai-7-3', domain: 'Ethical Judgment', ageband: '7-9', prompt: 'Is it okay to use AI to write your whole homework and pretend you did it yourself?', type: 'mcq', options: ['Yes, nobody will know', 'No, that is dishonest', 'Only if it is hard', 'Yes, AI is smarter'], correct: 1 },
  { id: 'ai-7-4', domain: 'AI Basics', ageband: '7-9', prompt: 'AI learns from lots of examples. This is called:', type: 'mcq', options: ['Programming tricks', 'Machine learning', 'Internet magic', 'Computer guessing'], correct: 1 },
  { id: 'ai-7-5', domain: 'Critical Evaluation', ageband: '7-9', prompt: 'An AI gives you an answer. What should you do before trusting it?', type: 'mcq', options: ['Always trust AI, it never lies', 'Ask a second AI', 'Check it against another source you trust', 'Print it out'], correct: 2 },
  // 10-12
  { id: 'ai-10-1', domain: 'Hallucination Detection', ageband: '10-12', prompt: 'An AI confidently tells you that the Battle of Hastings was in 1067. You know it was 1066. What should you do?', type: 'mcq', options: ['Trust the AI — it is usually right', 'Correct the AI and note the error', 'Close the tab', 'Ask another AI'], correct: 1 },
  { id: 'ai-10-2', domain: 'Prompt Quality', ageband: '10-12', prompt: 'You need to summarise a research paper for a school presentation. Which prompt is most effective?', type: 'mcq', options: ['Summarise this', 'Summarise this paper in 5 bullet points for a Year 6 audience, focusing on the main findings', 'What is this about', 'Make this shorter'], correct: 1 },
  { id: 'ai-10-3', domain: 'Critical Evaluation', ageband: '10-12', prompt: 'An AI gives you a list of 10 sources for your essay. What is the smartest next step?', type: 'mcq', options: ['Copy them directly into your bibliography', 'Check that each source is real and says what the AI claims', 'Ask the AI if the sources are real', 'Delete 5 of them randomly'], correct: 1 },
  { id: 'ai-10-4', domain: 'Ethical Judgment', ageband: '10-12', prompt: 'A company uses AI to decide who gets a bank loan. The AI was trained mostly on data from wealthy areas. What is the likely problem?', type: 'mcq', options: ['The AI will be too slow', 'The AI may unfairly reject people from poorer areas', 'There is no problem — AI is fair', 'The AI will cost too much'], correct: 1 },
  { id: 'ai-10-5', domain: 'Creative Augmentation', ageband: '10-12', prompt: 'You are writing a poem. You use AI to suggest rhymes and then choose the ones that feel right and edit them. This is:', type: 'mcq', options: ['Cheating', 'A smart way to use AI as a thinking partner', 'Lazy', 'Against the rules'], correct: 1 },
  { id: 'ai-10-6', domain: 'Ethical Judgment', ageband: '10-12', prompt: 'AI-generated images can look completely real. This is a problem because:', type: 'mcq', options: ['They use too much storage', 'People might believe false things are real', 'They are copyrighted', 'They are too colourful'], correct: 1 },
  { id: 'ai-10-7', domain: 'Prompt Quality', ageband: '10-12', prompt: 'You want AI to help you prepare for a debate. The best prompt is:', type: 'mcq', options: ['Help me debate', 'Give me the 3 strongest arguments for and against banning single-use plastic, with one real-world example each', 'What is debate?', 'Write me a speech'], correct: 1 },
  { id: 'ai-10-8', domain: 'Critical Evaluation', ageband: '10-12', prompt: 'An AI chatbot says it searched the internet for your question. This means:', type: 'mcq', options: ['Its answer is definitely correct', 'Its answer might still contain errors — you should verify', 'It is more reliable than a book', 'It has read every webpage'], correct: 1 },
  // adult
  { id: 'ai-a-1', domain: 'Ethical Judgment', ageband: 'adult', prompt: 'Your company wants to use AI to screen CVs. The main ethical risk you should flag first is:', type: 'mcq', options: ['Cost of the software', 'Potential bias if training data reflects historical hiring discrimination', 'Speed of the screening', 'Resistance from the HR team'], correct: 1 },
  { id: 'ai-a-2', domain: 'Critical Evaluation', ageband: 'adult', prompt: 'An AI summarises a 40-page report for you. Before acting on the summary, you should:', type: 'mcq', options: ['Act on it immediately — summaries save time', 'Spot-check key claims against the original, especially numbers and conclusions', 'Ask the AI if it missed anything', 'Have a colleague read the AI summary'], correct: 1 },
  { id: 'ai-a-3', domain: 'Prompt Quality', ageband: 'adult', prompt: 'You want AI to help you think through a difficult family decision. The most effective framing is:', type: 'mcq', options: ['What should I do about my family?', 'I am facing [specific situation]. Help me map out the considerations on each side without telling me what to decide', 'Give me advice', 'Tell me the pros and cons'], correct: 1 },
  { id: 'ai-a-4', domain: 'Hallucination Detection', ageband: 'adult', prompt: 'An AI cites a Harvard study that supports your business case. You search for it and cannot find it. Most likely:', type: 'mcq', options: ['The study exists but is hard to find', 'The AI hallucinated a plausible-sounding citation', 'Harvard removed it', 'You searched incorrectly'], correct: 1 },
  { id: 'ai-a-5', domain: 'AI and Society', ageband: 'adult', prompt: 'AI tools are becoming widely accessible. The most important thing parents can model for their children about AI is:', type: 'mcq', options: ['How to use every AI tool available', 'Critical questioning — when to trust it, when to verify it, and when to do the thinking yourself', 'The technical details of how LLMs work', 'How to stay ahead of their classmates'], correct: 1 },
  { id: 'ai-a-6', domain: 'AI and Society', ageband: 'adult', prompt: 'Generative AI can now produce personalised content at scale. The primary social concern this raises is:', type: 'mcq', options: ['Intellectual property of artists', 'Erosion of shared reality — people consuming incompatible versions of truth', 'Energy consumption', 'Speed of information delivery'], correct: 1 },
  { id: 'ai-a-7', domain: 'Ethical Judgment', ageband: 'adult', prompt: 'You use AI to draft a report and submit it with your name on it. This is:', type: 'mcq', options: ['Fine — tools are tools', 'Acceptable only if you reviewed and edited the content meaningfully', 'Always dishonest', 'Acceptable only with a disclaimer'], correct: 1 },
  { id: 'ai-a-8', domain: 'Critical Evaluation', ageband: 'adult', prompt: 'When an AI confidently says "I do not know", this is generally:', type: 'mcq', options: ['A failure of the model', 'A sign of better calibration than false confidence', 'A reason to switch to a different AI', 'An error in the prompt'], correct: 1 },
]

// ── SOCIAL BANK ───────────────────────────────────────────────────────────
const SOCIAL_BANK: Question[] = [
  // 4-6
  { id: 'soc-4-1', domain: 'Sharing', ageband: '4-6', prompt: 'There is one biscuit left and two children want it. What do you do?', type: 'scenario', options: ['Take it quickly', 'Split it in half', 'Hide it for later', 'Give it to the other child'], scores: [1, 4, 1, 3] },
  { id: 'soc-4-2', domain: 'Communication', ageband: '4-6', prompt: 'You want your friend to stop taking your crayons. What do you say?', type: 'scenario', options: ['Nothing, just take them back', 'Please do not take my crayons without asking', 'Shout at them', 'Tell the teacher'], scores: [2, 4, 1, 2] },
  { id: 'soc-4-3', domain: 'Taking Turns', ageband: '4-6', prompt: 'It is your friend\'s turn on the swing but you want a turn. You:', type: 'scenario', options: ['Push them off', 'Wait for your turn patiently', 'Ask them to hurry up', 'Go to a different toy and come back'], scores: [1, 4, 2, 3] },
  { id: 'soc-4-4', domain: 'Kindness', ageband: '4-6', prompt: 'A child is crying at the park and you do not know them. You:', type: 'scenario', options: ['Walk past quickly', 'Tell a grown-up nearby', 'Ask what is wrong', 'Stare at them'], scores: [1, 3, 4, 1] },
  { id: 'soc-4-5', domain: 'Honesty', ageband: '4-6', prompt: 'You accidentally broke a toy that belongs to a friend. You:', type: 'scenario', options: ['Hide it', 'Tell your friend and say sorry', 'Blame someone else', 'Pretend nothing happened'], scores: [1, 4, 1, 1] },
  // 7-9
  { id: 'soc-7-1', domain: 'Communication', ageband: '7-9', prompt: 'You need to explain to your teacher why you were late, but you are feeling nervous. What do you do?', type: 'scenario', options: ['Say nothing and hope they forget', 'Make up an excuse', 'Look them in the eye and explain honestly', 'Ask a friend to explain for you'], scores: [1, 1, 4, 2] },
  { id: 'soc-7-2', domain: 'Cooperation', ageband: '7-9', prompt: 'Your group project partner keeps doing things differently from what you agreed. You feel frustrated. You:', type: 'scenario', options: ['Take over the whole project', 'Talk to them calmly and find a middle ground', 'Complain to the teacher', 'Give up on the project'], scores: [2, 4, 1, 1] },
  { id: 'soc-7-3', domain: 'Assertion', ageband: '7-9', prompt: 'Someone at school takes your seat and will not move. You:', type: 'scenario', options: ['Say nothing and find another seat', 'Calmly tell them that is your seat', 'Push them out', 'Tell a teacher right away'], scores: [1, 4, 1, 2] },
  { id: 'soc-7-4', domain: 'Responsibility', ageband: '7-9', prompt: 'You promised to do the dishes but you forgot. Your mum noticed. You:', type: 'scenario', options: ['Blame your sibling', 'Apologise and do them straight away', 'Pretend you forgot', 'Ask for more time'], scores: [1, 4, 1, 2] },
  { id: 'soc-7-5', domain: 'Self-Control', ageband: '7-9', prompt: 'A classmate says something mean about you in front of others. You feel the urge to say something mean back. You:', type: 'scenario', options: ['Say something mean immediately', 'Take a breath and respond calmly or say nothing', 'Walk away without saying anything', 'Cry'], scores: [1, 4, 3, 2] },
  { id: 'soc-7-6', domain: 'Conflict Resolution', ageband: '7-9', prompt: 'Two of your friends had a fight and are not talking to each other. They both want you to take sides. You:', type: 'scenario', options: ['Pick the one you like more', 'Refuse to take sides and encourage them to talk it out', 'Stay away from both of them', 'Tell everyone at school'], scores: [1, 4, 2, 1] },
  { id: 'soc-7-7', domain: 'Inclusion', ageband: '7-9', prompt: 'A new student joins your school who does not speak much of your language. Your class is doing group work. You:', type: 'scenario', options: ['Put them in a different group so they do not slow you down', 'Include them in your group and find ways to communicate', 'Let the teacher handle it', 'Ask someone else to sit with them'], scores: [1, 4, 2, 1] },
  { id: 'soc-7-8', domain: 'Listening', ageband: '7-9', prompt: 'Your friend is telling you a long story. You have something exciting to say. You:', type: 'scenario', options: ['Interrupt immediately', 'Wait for a natural pause then share your news', 'Stop listening and think about your news', 'Tell them to hurry up'], scores: [1, 4, 2, 1] },
  // 10-12
  { id: 'soc-10-1', domain: 'Communication', ageband: '10-12', prompt: 'You disagree with a teacher about a mark on your work. You:', type: 'scenario', options: ['Complain to your parents first', 'Politely ask the teacher if you can go through the marking together', 'Accept it silently', 'Tell your classmates the teacher is unfair'], scores: [2, 4, 2, 1] },
  { id: 'soc-10-2', domain: 'Cooperation', ageband: '10-12', prompt: 'Your group has a deadline. One member is not pulling their weight. You:', type: 'scenario', options: ['Do their work for them and say nothing', 'Tell the teacher on them', 'Have a team conversation about what is needed without singling them out harshly', 'Leave their section incomplete'], scores: [2, 2, 4, 1] },
  { id: 'soc-10-3', domain: 'Conflict Resolution', ageband: '10-12', prompt: 'You sent a message that was misread as mean, even though you did not intend it that way. You:', type: 'scenario', options: ['Insist you did not mean it and move on', 'Apologise for the impact even though the intent was different', 'Block them temporarily', 'Explain what you actually meant via another person'], scores: [2, 4, 1, 1] },
  { id: 'soc-10-4', domain: 'Leadership', ageband: '10-12', prompt: 'You are put in charge of a group and two people want to do things differently. You:', type: 'scenario', options: ['Pick your favourite idea', 'Have them both present their approach and choose based on the merits', 'Let them argue it out', 'Do it your own way'], scores: [2, 4, 1, 2] },
  { id: 'soc-10-5', domain: 'Self-Control', ageband: '10-12', prompt: 'You find out a piece of gossip about someone you do not like. It would spread quickly if you shared it. You:', type: 'scenario', options: ['Share it — they deserve it', 'Keep it to yourself', 'Share it only with your best friend', 'Tell the person directly'], scores: [1, 4, 2, 3] },
  { id: 'soc-10-6', domain: 'Responsibility', ageband: '10-12', prompt: 'You agreed to meet a friend at a certain time and you are going to be late. You:', type: 'scenario', options: ['Hope they wait', 'Message them in advance to let them know', 'Get there as fast as possible without saying anything', 'Reschedule when you get there'], scores: [1, 4, 2, 1] },
  { id: 'soc-10-7', domain: 'Inclusion', ageband: '10-12', prompt: 'Your friend group has an inside joke that a new person would not understand. When the new person is around, you:', type: 'scenario', options: ['Use the joke anyway and laugh', 'Explain the joke or avoid it so they do not feel excluded', 'Whisper it to each other', 'Wait until the new person leaves'], scores: [1, 4, 1, 2] },
  // adult
  { id: 'soc-a-1', domain: 'Leadership', ageband: 'adult', prompt: 'A team member performs poorly on a task you assigned them. The most effective response is:', type: 'scenario', options: ['Reassign the task to someone stronger', 'Give feedback focused on what specifically needs to change and why', 'Note it for their next review', 'Ask them privately what happened before drawing conclusions'], scores: [2, 3, 1, 4] },
  { id: 'soc-a-2', domain: 'Conflict Resolution', ageband: 'adult', prompt: 'You and your spouse reach an impasse on a household decision neither of you will move on. The most constructive next step is:', type: 'scenario', options: ['Let time resolve it', 'Find the smallest point of agreement and build from there', 'Bring in a mutual friend to mediate', 'Accept one of your positions to end the stalemate'], scores: [1, 4, 2, 2] },
  { id: 'soc-a-3', domain: 'Communication', ageband: 'adult', prompt: 'You need to deliver feedback to someone that will be hard for them to hear. The most effective structure is:', type: 'scenario', options: ['Lead with praise then sneak in the criticism', 'Be direct about the issue first, explain the impact, then offer a path forward', 'Send it in writing so they can process it alone', 'Ask them how they think they are doing first'], scores: [2, 4, 2, 2] },
  { id: 'soc-a-4', domain: 'Self-Control', ageband: 'adult', prompt: 'A family argument becomes heated and voices rise. You are the most composed person in the room. You:', type: 'scenario', options: ['Match the energy to be heard', 'Physically lower your own voice and slow down — this often regulates the room', 'Exit the room to signal the conversation is over', 'Introduce a rational counter-argument immediately'], scores: [1, 4, 2, 2] },
  { id: 'soc-a-5', domain: 'Responsibility', ageband: 'adult', prompt: 'A decision you led led to a poor outcome for the team. The most mature response is:', type: 'scenario', options: ['Identify what external factors contributed', 'Own your part clearly, analyse what you would do differently, and share what you learned', 'Avoid the topic until something else takes attention', 'Brief people selectively to manage the narrative'], scores: [2, 4, 1, 1] },
  { id: 'soc-a-6', domain: 'Inclusion', ageband: 'adult', prompt: 'You chair a meeting where one participant dominates the conversation. You:', type: 'scenario', options: ['Let them continue — they add value', 'Actively invite contributions from quieter participants by name', 'Tell the dominant person to let others speak', 'Break into smaller groups'], scores: [2, 4, 2, 3] },
  { id: 'soc-a-7', domain: 'Listening', ageband: 'adult', prompt: 'Someone is sharing a problem with you and you immediately see the solution. The highest-value thing you can do is:', type: 'scenario', options: ['Give them the solution immediately — it respects their time', 'Listen fully until they finish, then ask if they want thoughts or just to be heard', 'Nod while planning your response', 'Share a similar experience first to show you understand'], scores: [2, 4, 1, 2] },
  { id: 'soc-a-8', domain: 'Leadership', ageband: 'adult', prompt: 'Your child is refusing to cooperate and escalating. You are about to match their energy. You:', type: 'scenario', options: ['Raise your voice to establish authority', 'Pause, name what you see, and lower your own energy deliberately', 'Walk away and come back later', 'Tell them consequences if they continue'], scores: [1, 4, 2, 2] },
]

// ── Question Bank Selector ────────────────────────────────────────────────
const getQuestionBank = (type: string, band: string): Question[] => {
  const allBanks: Record<string, Question[]> = {
    cognitive: COGNITIVE_BANK,
    eq: EQ_BANK,
    ai: AI_BANK,
    social: SOCIAL_BANK,
  }
  return (allBanks[type] || []).filter(q => q.ageband === band)
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AssessmentsHub() {
  const supabase = createClient()

  const [tab, setTab] = useState<'overview' | 'take' | 'history' | 'insights'>('overview')
  const [loading, setLoading] = useState(true)
  const [activeMember, setActiveMember] = useState(FAMILY[0])
  const [currentUser] = useState(FAMILY[0])

  const [sessions, setSessions] = useState<any[]>([])
  const [devScores, setDevScores] = useState<any[]>([])

  const [testState, setTestState] = useState<'select' | 'intro' | 'testing' | 'complete'>('select')
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currQIdx, setCurrQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [testStartedAt, setTestStartedAt] = useState<Date | null>(null)
  const [fade, setFade] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, dRes] = await Promise.all([
        supabase.from('assessment_sessions').select('*').order('completed_at', { ascending: false }),
        supabase.from('development_scores').select('*').order('score_date', { ascending: false }),
      ])
      const localSessions = JSON.parse(localStorage.getItem('bayt-assessment-sessions-v2') || '[]')
      setSessions(sRes.data?.length ? sRes.data : localSessions)
      setDevScores(dRes.data || JSON.parse(localStorage.getItem('bayt-dev-scores-v1') || '[]'))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    if (testState === 'testing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (testState === 'testing' && timeLeft === 0) {
      handleAnswer(-1)
    }
  }, [testState, timeLeft])

  const startTestSetup = (type: string) => { setSelectedTest(type); setTestState('intro') }

  const beginTesting = () => {
    const band = ageBand(activeMember.age)
    const targetCount = selectedTest === 'ai' ? 10 : 15
    let pool = getQuestionBank(selectedTest!, band)
    if (pool.length < 5 && band === '4-6') pool = [...pool, ...getQuestionBank(selectedTest!, '7-9')]
    else if (pool.length < 5 && band === '7-9') pool = [...pool, ...getQuestionBank(selectedTest!, '10-12')]
    const selected = shuffle(pool).slice(0, targetCount)
    setQuestions(selected)
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
    const totalQuestions = questions.length
    const domainScores: Record<string, number[]> = {}
    questions.forEach(q => {
      const ans = answers[q.id]
      if (!domainScores[q.domain]) domainScores[q.domain] = []
      if (q.type === 'mcq') {
        const pts = ans === q.correct ? 1 : 0
        rawScore += pts
        domainScores[q.domain].push(pts)
      } else if (q.type === 'scenario') {
        const pts = q.scores ? (q.scores[ans] || 0) : 0
        rawScore += pts
        domainScores[q.domain].push(pts)
      }
    })
    const avgDomains: Record<string, number> = {}
    for (const [dom, scArr] of Object.entries(domainScores)) {
      if (scArr.length > 0) avgDomains[dom] = Math.round((scArr.reduce((a, b) => a + b, 0) / scArr.length) * 10) / 10
    }
    const normedScore = selectedTest === 'cognitive' || selectedTest === 'ai'
      ? normalise(rawScore, totalQuestions)
      : normalise(rawScore, totalQuestions * 4)
    return { rawScore, totalQuestions, normedScore, avgDomains }
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
    }
    // Append-only — always prepend, never replace
    const existing = JSON.parse(localStorage.getItem('bayt-assessment-sessions-v2') || '[]')
    const updated = [session, ...existing]
    localStorage.setItem('bayt-assessment-sessions-v2', JSON.stringify(updated))
    setSessions(updated)

    const scoreCol = DOMAIN_MAP[selectedTest]
    if (scoreCol) {
      const newScore = { id: crypto.randomUUID(), member_id: activeMember.id, [scoreCol]: Math.round(res.normedScore * 10), score_date: new Date().toISOString().split('T')[0] }
      const updatedDev = [newScore, ...devScores]
      setDevScores(updatedDev)
      localStorage.setItem('bayt-dev-scores-v1', JSON.stringify(updatedDev))
      try { await supabase.from('development_scores').insert(newScore) } catch (e) {}
    }
    // Always INSERT — never upsert, never delete
    try { await supabase.from('assessment_sessions').insert(session) } catch (e) {}
    setTab('history')
    setTestState('select')
  }

  const getLatestDevScore = (memberId: string) => devScores.find(s => s.member_id === memberId) || null
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
        {[{ id: 'overview', label: '🏠 Overview' }, { id: 'take', label: '✏️ Take Assessment' }, { id: 'history', label: '📊 History' }, { id: 'insights', label: '🧠 Insights', hidden: !isParent }].filter(t => !t.hidden).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as any); if (t.id === 'take') setTestState('select') }}
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent', fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase' }}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                    Last assessment: {latestSession ? formatDateTime(latestSession.completed_at) : <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No assessment yet</span>}
                  </div>
                  {scores && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {[{ v: scores.iq_raw, m: 150, c: C.blue }, { v: scores.eq_raw, m: 100, c: C.orange }, { v: scores.social_raw, m: 100, c: C.goldDim }].map((s, i) => (
                        <div key={i} style={{ flex: 1, height: '4px', background: C.ruleLight, borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(((s.v || 0) / s.m) * 100, 100)}%`, height: '100%', background: s.c }} />
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setActiveMember(m); setTab('take'); setTestState('select') }}
                    style={{ marginTop: 'auto', padding: '0.6rem 1rem', background: C.green, color: C.white, border: 'none', borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    Start Assessment →
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'take' && (
          <div>
            {testState === 'select' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Assessing</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {FAMILY.map(m => (
                      <button key={m.id} onClick={() => setActiveMember(m)}
                        style={{ padding: '0.5rem 1rem', background: activeMember.id === m.id ? C.green : C.forest, color: activeMember.id === m.id ? C.white : C.text, border: `1px solid ${activeMember.id === m.id ? C.green : C.rule}`, borderRadius: '6px', fontFamily: F_MONO, fontSize: '0.75rem', cursor: 'pointer' }}>
                        {m.emoji} {m.name}
                      </button>
                    ))}
                  </div>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem', color: C.text }}>
                  Choose an assessment for <strong>{activeMember.emoji} {activeMember.name}</strong>{' '}
                  <span style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>({ageBand(activeMember.age)} band)</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {[
                    { id: 'cognitive', label: 'Cognitive Intelligence', icon: '🧠', desc: 'Reasoning, pattern recognition, memory', color: C.blue },
                    { id: 'eq', label: 'Emotional Intelligence', icon: '💛', desc: 'Self-awareness, empathy, regulation', color: C.orange },
                    { id: 'social', label: 'Social Intelligence', icon: '🤝', desc: 'Communication, cooperation, leadership', color: C.goldDim },
                    { id: 'ai', label: 'AI Literacy', icon: '🤖', desc: 'Critical evaluation, ethics, prompt quality', color: C.green },
                  ].map(test => (
                    <div key={test.id} onClick={() => startTestSetup(test.id)}
                      style={{ border: `2px solid ${C.ruleLight}`, borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', background: C.cream }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = test.color; (e.currentTarget as HTMLDivElement).style.background = C.white }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.ruleLight; (e.currentTarget as HTMLDivElement).style.background = C.cream }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{test.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: C.text }}>{test.label}</div>
                      <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO }}>{test.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testState === 'intro' && (
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {selectedTest === 'cognitive' && '🧠'}{selectedTest === 'eq' && '💛'}{selectedTest === 'social' && '🤝'}{selectedTest === 'ai' && '🤖'}
                </div>
                <h2 style={{ fontWeight: 300, fontSize: '1.8rem', marginBottom: '1rem' }}>
                  {selectedTest === 'cognitive' && 'Cognitive Intelligence'}
                  {selectedTest === 'eq' && 'Emotional Intelligence'}
                  {selectedTest === 'social' && 'Social Intelligence'}
                  {selectedTest === 'ai' && 'AI Literacy'}
                </h2>
                <p style={{ color: C.grey, fontFamily: F_MONO, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Questions are calibrated for <strong style={{ color: C.text }}>{activeMember.name} ({ageBand(activeMember.age)} band)</strong>.
                  Answer honestly and instinctively. There are {selectedTest === 'ai' ? '10' : '15'} questions with a timer per question.
                  <br /><br />All results are permanently saved — you can track growth over time.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setTestState('select')} style={{ padding: '0.75rem 2rem', background: 'none', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_MONO, cursor: 'pointer', color: C.grey }}>← Back</button>
                  <button onClick={beginTesting} style={{ padding: '0.75rem 2rem', background: C.green, color: C.white, border: 'none', borderRadius: '6px', fontFamily: F_MONO, cursor: 'pointer', fontSize: '0.9rem' }}>Begin →</button>
                </div>
              </div>
            )}

            {testState === 'testing' && questions.length > 0 && (
              <div style={{ maxWidth: '700px', margin: '0 auto', opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>Question {currQIdx + 1} of {questions.length}</div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.9rem', color: timeLeft <= 10 ? C.orange : C.green, fontWeight: 600 }}>{timeLeft}s</div>
                </div>
                <div style={{ height: '3px', background: C.ruleLight, borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
                  <div style={{ width: `${((currQIdx + 1) / questions.length) * 100}%`, height: '100%', background: C.green, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ background: C.cream, borderRadius: '10px', padding: '2rem', marginBottom: '1.5rem', border: `1px solid ${C.ruleLight}` }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{questions[currQIdx].domain}</div>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: C.text, margin: 0 }}>{questions[currQIdx].prompt}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {questions[currQIdx].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(idx)}
                      style={{ padding: '1rem 1.5rem', background: C.white, border: `1px solid ${C.rule}`, borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontFamily: F_SANS, fontSize: '0.95rem', color: C.text, transition: 'all 0.15s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.forest; (e.currentTarget as HTMLButtonElement).style.borderColor = C.green }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.white; (e.currentTarget as HTMLButtonElement).style.borderColor = C.rule }}>
                      <span style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.goldDim, marginRight: '0.75rem' }}>{String.fromCharCode(65 + idx)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {testState === 'complete' && (() => {
              const res = calculateResults()
              if (!res) return null
              return (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                    <h2 style={{ fontWeight: 300, fontSize: '1.8rem', marginBottom: '0.5rem' }}>Assessment Complete</h2>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey }}>{activeMember.emoji} {activeMember.name} · {selectedTest?.toUpperCase()}</div>
                  </div>
                  <div style={{ background: C.green, color: C.white, borderRadius: '10px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Score</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 300, lineHeight: 1 }}>{res.normedScore}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.goldPale, marginTop: '0.3rem' }}>/ 10 · {res.rawScore} raw points from {res.totalQuestions} questions</div>
                  </div>
                  <div style={{ background: C.cream, borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginBottom: '1rem', textTransform: 'uppercase' }}>Domain Breakdown</div>
                    {Object.entries(res.avgDomains).map(([dom, score]) => (
                      <div key={dom} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                          <span>{dom}</span><span style={{ fontFamily: F_MONO, color: C.goldDim }}>{score.toFixed(1)}</span>
                        </div>
                        <div style={{ height: '3px', background: C.ruleLight, borderRadius: '2px' }}>
                          <div style={{ width: `${Math.min((score / 4) * 100, 100)}%`, height: '100%', background: C.green, borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveResults} style={{ width: '100%', padding: '1rem', background: C.gold, color: C.green, border: 'none', borderRadius: '8px', fontFamily: F_MONO, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
                    Save to Development Profile →
                  </button>
                </div>
              )
            })()}
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 400, fontSize: '1.4rem' }}>Assessment History</h2>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginTop: '0.25rem' }}>
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded · All sessions are permanent and cannot be deleted
                </div>
              </div>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: C.grey, fontFamily: F_MONO, fontSize: '0.85rem' }}>No assessments recorded yet. Take your first assessment to begin tracking growth.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map((s: any) => {
                  const member = FAMILY.find(f => f.id === s.member_id)
                  const typeColors: Record<string, string> = { cognitive: C.blue, eq: C.orange, social: C.goldDim, ai: C.green }
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: C.cream, borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                      <span style={{ fontSize: '1.3rem' }}>{member?.emoji || '👤'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>
                          {member?.name || s.member_id}
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontFamily: F_MONO, background: typeColors[s.test_type] || C.grey, color: C.white, padding: '0.1rem 0.4rem', borderRadius: '3px', textTransform: 'uppercase' }}>{s.test_type}</span>
                        </div>
                        <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey }}>
                          {s.completed_at ? formatDateTime(s.completed_at) : '—'}
                          {s.age_band && <span style={{ marginLeft: '0.75rem', opacity: 0.6 }}>{s.age_band} band</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 300, color: C.green, lineHeight: 1 }}>{s.normed_score?.toFixed(1) || '—'}</div>
                        <div style={{ fontFamily: F_MONO, fontSize: '0.65rem', color: C.grey }}>/ 10</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && isParent && (
          <div>
            <h2 style={{ fontWeight: 400, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Family Intelligence Insights</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {FAMILY.map(m => {
                const memberSessions = sessions.filter((s: any) => s.member_id === m.id)
                const byType: Record<string, any[]> = {}
                memberSessions.forEach((s: any) => { if (!byType[s.test_type]) byType[s.test_type] = []; byType[s.test_type].push(s) })
                return (
                  <div key={m.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '10px', padding: '1.5rem', background: C.cream }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginLeft: 'auto' }}>{memberSessions.length} session{memberSessions.length !== 1 ? 's' : ''}</span>
                    </div>
                    {Object.keys(byType).length === 0 ? (
                      <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey, fontStyle: 'italic' }}>No assessments yet</div>
                    ) : Object.entries(byType).map(([type, typeSessions]) => {
                      const scores = typeSessions.map((s: any) => s.normed_score || 0)
                      const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
                      const latest = typeSessions[0]?.normed_score || 0
                      return (
                        <div key={type} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{type}</span>
                            <span style={{ fontFamily: F_MONO, color: C.goldDim }}>latest {latest.toFixed(1)} · avg {avg.toFixed(1)} ({typeSessions.length}×)</span>
                          </div>
                          <div style={{ height: '3px', background: C.ruleLight, borderRadius: '2px' }}>
                            <div style={{ width: `${(latest / 10) * 100}%`, height: '100%', background: C.green, borderRadius: '2px' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
