# Gemini Build Prompt — Batch 12
## Module: Family Assessments Hub
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **one `.tsx` file** and note the required Supabase schema additions at the end. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat — Father (admin) · Camilla Seedat — Mother (admin)
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
```

### Design Tokens (copy exactly)
```ts
const C = {
  green: '#1a3d28', midgreen: '#245235', forest: '#f0ebe0',
  gold: '#c9a84c', goldDim: '#9b7d38', goldPale: '#f0e4c0',
  cream: '#faf8f2', white: '#ffffff', grey: '#6b7c6e',
  rule: '#ddd8cc', ruleLight: '#e8e3d8', text: '#0d1a0f',
  orange: '#e07b39', blue: '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'
```

### Supabase Client
```ts
import { createClient } from '@/lib/supabase/client'
```
Project ref: `dytlseyncisxsznhybkj`

### Architecture Rules
- `'use client'` at top · Inline styles only · No Tailwind · No external libraries
- Supabase for persistence · No SidebarLayout wrapper (page.tsx handles that)
- All family members defined locally:
```ts
const FAMILY = [
  { id: 'muhammad', name: 'Muhammad', role: 'parent', age: null, emoji: '👨' },
  { id: 'camilla',  name: 'Camilla',  role: 'parent', age: null, emoji: '👩' },
  { id: 'yahya',    name: 'Yahya',    role: 'child',  age: 11,   emoji: '🧒' },
  { id: 'isa',      name: 'Isa',      role: 'child',  age: 10,   emoji: '🧒' },
  { id: 'linah',    name: 'Linah',    role: 'child',  age: 7,    emoji: '👧' },
  { id: 'dana',     name: 'Dana',     role: 'child',  age: 6,    emoji: '👧' },
]
```

### Age Band Helper
```ts
function ageBand(age: number | null): '4-6' | '7-9' | '10-12' | 'adult' {
  if (!age) return 'adult'
  if (age <= 6) return '4-6'
  if (age <= 9) return '7-9'
  return '10-12'
}
```

---

## MODULE — Family Assessments Hub

**File:** `app/assessments/assessments-client.tsx`
**Export:** `export default function AssessmentsHub()`
**Arabic:** التقييمات
**Concept:** An in-app assessment centre where each family member can take evidence-based tests measuring cognitive ability, emotional intelligence, AI literacy, and social skills. Tests are age-calibrated, run fully in-browser, and feed scores back into the `development_scores` table used by the Development module. Framed positively — not a test to pass or fail, but a mirror to grow with.

---

## TAB STRUCTURE

### Tab 1 — 🏠 Overview (default)
- Introductory heading: "Know yourselves. Grow together."
- Sub-heading (Arabic): "اعرف نفسك، انمُ معاً"
- A card for each family member showing:
  - Name + emoji + age
  - Last assessment date (from `assessment_sessions` — `completed_at`)
  - Domain scores mini-bar (5 domains, pulled from `development_scores` latest record)
  - "Start Assessment" button → switches to Tab 2 with that member pre-selected
  - If no assessment exists: show "No assessment yet" in muted text, still show Start button
- At bottom: a soft info block explaining the 4 test types (no numbers, just names + one-line descriptions):
  - 🧠 Cognitive Reasoning — fluid thinking, memory, pattern recognition
  - 💛 Emotional Intelligence — self-awareness, empathy, regulation
  - 🤖 AI Literacy — working with AI tools wisely and critically
  - 🌿 Social Skills — communication, cooperation, responsibility

---

### Tab 2 — ✏️ Take Assessment
This tab contains a full in-browser assessment runner. It is a STATE MACHINE with these states:

```
'select' → 'intro' → 'testing' → 'complete'
```

#### State: 'select'
- Member selector: horizontal pill row (all 6 family members)
- Test selector: 4 cards in a 2×2 grid:
  - 🧠 Cognitive Reasoning Test (15–20 questions · 20 min)
  - 💛 Emotional Intelligence Test (15 scenarios · 15 min)
  - 🤖 AI Literacy Test (10 questions · 10 min)
  - 🌿 Social Skills Assessment (15 situations · 15 min)
- "Begin Assessment" button → moves to 'intro' state

#### State: 'intro'
- Test name + icon (large, centred)
- 3-bullet description of what this test measures
- "This is not a test to pass or fail. It is a mirror." — shown in italic gold text
- Estimated time + number of questions
- "I'm ready → Start" button → moves to 'testing' state
- Timer starts (stored in state as `startedAt: Date`)

#### State: 'testing'
The actual question runner. Structure:

```ts
interface Question {
  id: string
  domain: string           // which sub-domain this measures
  ageband: '4-6' | '7-9' | '10-12' | 'adult'
  prompt: string           // the question text
  type: 'mcq' | 'scale' | 'scenario'
  options: string[]        // 4 options for mcq/scenario; labels for scale ('Never'→'Always')
  correct?: number         // index of correct answer (mcq only)
  scores?: number[]        // EQ/Social: score 1-4 per option (hidden from user)
}
```

UI:
- Progress bar at top: "Question 4 of 15" + thin green fill bar
- Per-question timer: 45 seconds for adults/10-12, 30 seconds for 4-9. Gentle countdown. If time runs out, auto-advance (mark as skipped).
- Question card (white, rounded, shadow):
  - Domain badge (top-right corner, small coloured pill): e.g. "Working Memory" / "Self-Awareness"
  - Prompt text (large, readable, age-appropriate font size — 18px for adults, 20px for children)
  - Options: full-width tap/click buttons. On selection: highlight chosen option, brief 400ms pause, then advance automatically.
  - For `scale` type: show 5 horizontal buttons labelled Never / Rarely / Sometimes / Often / Always
- No "back" button — assessments are one-directional
- Question bank (hardcoded in component — 3 pools per test, one per age band):

**COGNITIVE REASONING — hardcode 20 questions per age band (select 15 at runtime)**

Age band `4-6` examples (use simple language, short sentences):
- Domain: Pattern Recognition — "What comes next? 🔴 🔵 🔴 🔵 ___" · Options: [🔴, 🔵, 🟢, 🟡] · correct: 0
- Domain: Working Memory — "I will say 3 things. Remember them. [Cat, Ball, Tree] → Which one did I NOT say? Cat / Ball / Tree / Hat" · correct: 3 (Hat)
- Domain: Logical Deduction — "Yahya is taller than Isa. Isa is taller than Dana. Who is the tallest? Yahya / Isa / Dana / They are the same" · correct: 0
- Domain: Visual Spatial — "If you fold this paper in half, which shape do you get? [describe shape] · 4 shape options"
- Domain: Fluid Reasoning — "All birds have wings. Penguins are birds. Do penguins have wings? Yes / No / Maybe / I don't know" · correct: 0

Age band `7-9` examples (more abstract, more options):
- Domain: Pattern Recognition — "Complete the sequence: 2, 4, 8, 16, ___" · Options: [24, 32, 18, 20] · correct: 1
- Domain: Working Memory — "Read these numbers, then write them backwards: 3, 7, 1, 9 → What is the reversed sequence?" · Options: [9, 1, 7, 3 / 3, 7, 1, 9 / 1, 7, 3, 9 / 9, 7, 1, 3] · correct: 0
- Domain: Logical Deduction — "If all Glurps are Blips, and Fizo is a Glurp, is Fizo a Blip?" · Options: [Yes / No / Cannot tell / Only sometimes] · correct: 0
- Domain: Crystallised Knowledge — "What is the capital of France?" · Options: [London / Paris / Berlin / Madrid] · correct: 1
- Domain: Processing Speed — "How many 3s are in this list: 3, 7, 3, 2, 5, 3, 8, 3?" · Options: [2 / 3 / 4 / 5] · correct: 2

Age band `10-12` / adult examples (abstract reasoning, inference):
- Domain: Fluid Reasoning — "If FRIEND is coded as GSJFOE, how is HOUSE coded?" · Options: [IPVTF / ITPVF / IPTVF / HOVSE] · correct: 0
- Domain: Working Memory — "What is 7 × 8 − 14 ÷ 2?" · Options: [49 / 50 / 42 / 35] · correct: 0
- Domain: Analogical Reasoning — "Book is to Reading as Fork is to ___" · Options: [Kitchen / Eating / Spoon / Table] · correct: 1
- Domain: Logical Deduction — "Some managers are engineers. All engineers are graduates. Therefore: A) All managers are graduates B) Some managers are graduates C) No managers are graduates D) All graduates are managers" · correct: 1
- Domain: Pattern Recognition — "Complete: 1, 1, 2, 3, 5, 8, ___" · Options: [12 / 13 / 14 / 11] · correct: 1

Build a full bank of 20 questions per age band. Domains to cover across 20 questions: Fluid Reasoning (4), Pattern Recognition (4), Working Memory (4), Logical Deduction (4), Crystallised Knowledge (2), Processing Speed (2). At runtime, randomly shuffle and pick 15.

---

**EMOTIONAL INTELLIGENCE — 15 scenario questions, same for all ages (adjust language)**

Domain scoring: each scenario targets 1-2 EQ domains. Options scored 1-4 (4 = most emotionally intelligent response). Scores not shown to user — they just pick the option that feels right.

Domains: Self-Awareness (SA), Self-Regulation (SR), Empathy (EM), Social Awareness (SOC), Responsible Decision-Making (RD)

Example scenarios (build 15 total):

1. Domain: Self-Awareness — "Your friend gets a prize at school, but you didn't. You feel a tight feeling in your chest. What is this feeling most likely?"
   - Options: [I'm angry at the teacher / I feel jealous and that's okay to notice / I'm bored / I don't care] · scores: [1, 4, 1, 1]

2. Domain: Self-Regulation — "You're in the middle of a game and your younger sibling accidentally knocks over your tower. You feel like shouting. What do you do?"
   - Options: [Shout at them right away / Walk away and calm down before speaking / Tell a parent immediately / Ignore it and sulk] · scores: [1, 4, 2, 2]

3. Domain: Empathy — "Your friend is very quiet at school today. Usually they are loud and funny. What do you do?"
   - Options: [Ignore it — it's not my problem / Ask quietly if they're okay / Make jokes to cheer them up / Tell the teacher something is wrong] · scores: [1, 4, 2, 2]

4. Domain: Social Awareness — "You notice that two friends are upset with each other. They both come to complain to you separately. What do you do?"
   - Options: [Take one person's side / Listen to both but don't take sides / Ignore both / Tell the whole class] · scores: [1, 4, 2, 1]

5. Domain: Responsible Decision-Making — "Your older brother tells you not to tell Mama something that happened. You think Mama should know. What do you do?"
   - Options: [Keep the secret — loyalty comes first / Tell Mama because it's important / Ask your brother why it's secret first / Tell a different adult] · scores: [2, 3, 4, 2]

Build 15 full scenarios across all 5 EQ domains (3 questions per domain). Age band affects only the language complexity (same scenarios, simpler words for 4-6).

---

**AI LITERACY — 10 questions, age-banded**

Domains: Hallucination Detection (HD), Prompt Quality (PQ), Ethical Judgment (EJ), Critical Evaluation (CE), Creative Augmentation (CA)

Age band `4-6` / `7-9` (simple):
1. Domain: Hallucination Detection — "An AI told you that the moon is made of cheese. This is: True / False / Maybe / I need to check" · correct: 1 (False — it's a silly hallucination)
2. Domain: Prompt Quality — "You want AI to write a story about a cat. Which question is better? A) 'Write a story' B) 'Write a short funny story about a cat named Mimi who lives in Doha'" · correct: 1
3. Domain: Ethical Judgment — "Is it okay to use AI to write your whole homework and pretend you did it yourself?" · Options: [Yes, nobody will know / No, that's dishonest / Only if it's hard / Yes, AI is smarter] · correct: 1

Age band `10-12` / adult (sophisticated):
1. Domain: Hallucination Detection — "An AI confidently tells you that the Battle of Hastings was in 1067. You know it was 1066. What should you do?" · Options: [Trust the AI — it's usually right / Correct the AI and note the error / Close the tab / Ask another AI] · correct: 1
2. Domain: Prompt Quality — "You need to summarise a long research paper for a school presentation. Which prompt is most effective? A) 'Summarise this' B) 'Summarise this paper in 5 bullet points for a Year 6 audience, focusing on the main findings and why they matter'" · correct: 1
3. Domain: Critical Evaluation — "An AI gives you a list of 10 sources for your essay. What is the smartest next step?" · Options: [Copy them directly into your bibliography / Check that each source is real and says what the AI claims / Ask the AI if the sources are real / Delete 5 of them randomly] · correct: 1
4. Domain: Ethical Judgment — "A company uses AI to decide who gets a bank loan. The AI was trained mostly on data from wealthy areas. What is the likely problem?" · Options: [The AI will be too slow / The AI may unfairly reject people from poorer areas / There is no problem — AI is fair / The AI will cost too much] · correct: 1
5. Domain: Creative Augmentation — "You are writing a poem. You use AI to suggest rhymes and then choose the ones that feel right and edit them. This is:" · Options: [Cheating / A smart way to use AI as a thinking partner / Lazy / Against the rules] · correct: 1

Build 10 total questions per age band, covering all 5 AI literacy domains (2 per domain).

---

**SOCIAL SKILLS — 15 situational questions, same framework as EQ but measuring different constructs**

Domains (from SSIS framework): Communication (COM), Cooperation (COOP), Assertion (ASS), Responsibility (RES), Empathy (EMP), Engagement (ENG), Self-Control (SC)

Example scenarios:
1. Domain: Communication — "You need to explain to your teacher why you were late, but you're feeling nervous. What do you do?" · Options: [Say nothing and hope they forget / Make up an excuse / Look them in the eye and explain clearly and honestly / Ask a friend to explain for you] · scores: [1, 1, 4, 2]
2. Domain: Cooperation — "Your group project partner keeps doing things differently from what you agreed. You feel frustrated. You:" · Options: [Take over the whole project / Talk to them calmly and find a middle ground / Complain to the teacher / Give up on the project] · scores: [2, 4, 1, 1]
3. Domain: Assertion — "Someone at school takes your seat and won't move. You:" · Options: [Say nothing and find another seat / Calmly tell them that's your seat / Push them out / Tell a teacher right away] · scores: [1, 4, 1, 2]
4. Domain: Responsibility — "You promised to do the dishes but you forgot. Your mum noticed. You:" · Options: [Blame your sibling / Apologise and do them straight away / Pretend you forgot / Ask for more time] · scores: [1, 4, 1, 2]
5. Domain: Self-Control — "A classmate says something mean about you in front of others. You feel the urge to say something mean back. You:" · Options: [Say something mean immediately / Take a breath and respond calmly or say nothing / Walk away without saying anything / Cry] · scores: [1, 4, 3, 2]

Build 15 full scenarios, covering all 7 SSIS domains (2-3 per domain). Age-appropriate language for younger children.

---

#### State: 'complete'
- Celebratory (but calm) heading: "Assessment Complete" / "شكراً — جزاك الله خيراً"
- Show breakdown by domain:
  - For Cognitive: raw score X/15, converted to a percentage, then mapped to a development score (/10 scale)
  - For EQ / Social: average score per domain (each option scored 1-4), displayed as domain bars
  - For AI Literacy: percentage correct, per-domain breakdown
- "What this means" — 2-3 sentence narrative generated from template strings based on score ranges:
  - Cognitive ≥ 80%: "Strong analytical thinking. Pattern recognition and logical reasoning are clear strengths."
  - Cognitive 60-79%: "Solid foundational reasoning. Working memory and pattern recognition are areas to develop further."
  - Cognitive < 60%: "This is the baseline — every great mind starts somewhere. Focus on puzzles and reading."
  - (Similar templates for EQ and Social domains)
- "Save to development scores?" button → writes to `assessment_sessions` (complete) + updates `development_scores` for this member
- "Retake" and "Try another test" buttons

---

### Tab 3 — 📊 History
- Member selector (pill row)
- List of past `assessment_sessions` for selected member — date, test type, normed score, duration
- Click to expand: shows domain breakdown stored in `domain_scores` JSONB
- Trend view: if 2+ sessions of the same type exist, show a simple horizontal bar-pair (before / after) per domain
- "Growth since last assessment" highlighted in gold if any domain improved by ≥5 points
- If no history: "No assessments completed yet. Take your first assessment in the Take Assessment tab."

---

### Tab 4 — 🧠 Insights (parents only — show "Access restricted" card for children)
- Family-wide radar overview: 6 mini radar charts (one per family member, CSS/div drawn — no canvas)
  - 4 axes: Cognitive · Emotional · AI Literacy · Social
  - Values from latest `development_scores` record
- Strongest domain per child (gold highlight)
- Domain needing most growth per child (gentle framing: "Most room to grow")
- "Assessment due" flags: if any member's last assessment was > 90 days ago, show a gentle orange flag
- Recommendations panel:
  - If a child scores low EQ: "Consider evening conversations about feelings. Name emotions out loud at dinner."
  - If AI Literacy low: "Explore AI tools together. Ask Yahya/Isa to explain what they know about AI."
  - If Social Skills low: "Group activities help. Consider team sport, scouts, or collaborative projects."
  - If Cognitive high + bored: "Challenge them with harder material — chess, coding puzzles, robotics."
  - Always show at least 2 recommendations even if all scores are high.
- Assessment schedule suggestion: "Recommended: one full assessment per family member per quarter."

---

## SCORING & CONVERSION

### Score normalisation function:
```ts
function normalise(raw: number, total: number): number {
  // returns 0-10 scale rounded to 1dp
  return Math.round((raw / total) * 100) / 10
}
```

### Domain → development_scores column mapping:
```ts
const DOMAIN_MAP = {
  cognitive: 'iq_score',     // cognitive test overall → iq_score
  eq:        'eq_score',     // EQ test overall → eq_score
  social:    'social_score', // social skills → social_score
  ai:        null,           // stored in domain_scores JSONB only (no direct column yet)
}
```

On save, update `development_scores` for the member:
- Read existing latest record
- Set the relevant score column
- Also store full `domain_scores` JSONB with per-domain breakdown
- If no record exists for this member, INSERT a new one

---

## SUPABASE SCHEMA ADDITIONS

Run these migrations after building the file:

```sql
-- Assessment sessions (one per test attempt)
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  test_type       TEXT NOT NULL,        -- 'cognitive' | 'eq' | 'ai_literacy' | 'social'
  age_band        TEXT,                 -- '4-6' | '7-9' | '10-12' | 'adult'
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  raw_score       INTEGER,              -- questions correct (cognitive/ai)
  total_questions INTEGER,
  normed_score    NUMERIC(4,1),         -- 0-10 scale
  domain_scores   JSONB,               -- per-domain breakdown
  saved_to_dev    BOOLEAN DEFAULT false -- whether this updated development_scores
);

-- Individual question responses (optional — for detailed analytics)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  selected_option INTEGER,
  correct         BOOLEAN,
  time_taken_ms   INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_assessment_sessions" ON public.assessment_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_assessment_responses" ON public.assessment_responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## OUTPUT FORMAT

```tsx
// app/assessments/assessments-client.tsx
'use client'
// ... full file
```

Return the complete, self-contained file. The question banks must be fully built out (not stubbed). Every question must have all fields populated. This is the brain of the assessment system — it must be complete and usable.

---

## UX NOTES

- Never show a "score" as a raw number without context. Always pair with: "for your age group" or "in this domain."
- The tone is warm, curious, and encouraging throughout. No red Xs. Wrong answers simply advance the question.
- Font sizes: children under 10 get 20px question text; others 17px.
- Between questions: 400ms fade transition (opacity: 0 → 1). No jarring cuts.
- Auto-save session to Supabase on first question answered (started_at set). Complete on last question.
- If Supabase is unavailable: save to localStorage key `bayt-assessments-v1` and flag "Saved locally — will sync when connected."
- Parent role check: `currentMember?.role === 'parent'` — use same pattern as other modules.
- The `currentMember` is passed in via props or read from localStorage key `bayt-active-member`.
