# SeedsAssess.ai — Product Brief & Build Prompt
## AI-Augmented Family Assessment System
### Evidence-based · Age-calibrated · Self-referenced · Built for families

---

## THE VISION

SeedsAssess.ai is a comprehensive, AI-augmented assessment platform designed to measure human development in a way that standard tests never could.

Traditional IQ and EQ tests were designed for clinical settings, administered by professionals, and compared individuals against population averages. They are rigid, culturally biased, and backward-looking.

SeedsAssess measures a person **against their own best** — across time, across multiple intelligences, and across real-world performance signals. It draws on the best of Woodcock-Johnson, CASEL's SEL framework, Gardner's Multiple Intelligences, and the emerging science of AI-augmented assessment.

**The end product:** A living, evolving profile of a person's mind — not a snapshot score, but a growth trajectory.

---

## THE SCIENCE FOUNDATION

### 1. Cognitive Assessment (IQ layer)
**Based on:** Woodcock-Johnson Tests of Cognitive Abilities (WJ-IV)
**Key domains measured:**
- Fluid reasoning (novel problem solving)
- Crystallised intelligence (acquired knowledge)
- Processing speed
- Working memory / short-term memory
- Visual-spatial processing
- Long-term storage and retrieval

**AI augmentation:** Instead of static test items, the AI adapts difficulty in real-time based on response patterns. Items are culturally neutral where possible, or offer culturally-aware variants (Gulf context, South African context).

### 2. Emotional Intelligence (EQ layer)
**Based on:** Mayer-Salovey-Caruso EI model + CASEL SEL framework
**Key domains measured:**
- Self-awareness (identifying own emotions)
- Self-regulation (managing emotional responses)
- Social awareness (reading others' emotions)
- Relationship management (navigating social situations)
- Responsible decision-making

**AI augmentation:** Scenario-based questions with AI-generated branching responses. The AI interprets response patterns, not just answers. "What would you do if..." style questions with emotionally rich scenarios.

### 3. AI Augmented Intelligence Test
**New — no existing equivalent**
**Measures:** ability to effectively collaborate with AI tools
- Prompt construction quality (given a task, how well do they instruct an AI?)
- Critical evaluation (can they spot AI hallucinations?)
- Creative augmentation (can they use AI to enhance, not replace, their thinking?)
- Ethical judgment (do they understand AI's limitations and risks?)

**Why it matters:** This will be the most important skill of the next 20 years. Most children are growing up using AI incorrectly. This test measures AI fluency.

### 4. Social Skills Assessment
**Based on:** Social Skills Improvement System (SSIS) + IQ-adapted social cognition models
**Key domains:**
- Communication (verbal + non-verbal)
- Cooperation (working with others, sharing)
- Assertion (standing up for oneself appropriately)
- Responsibility (following through on commitments)
- Empathy (understanding others' perspectives)
- Engagement (maintaining relationships)
- Self-control (managing impulses in social contexts)

### 5. Special Needs Screening (NOT diagnosis)
**Based on:** Broad screeners used in educational psychology — not clinical diagnosis
**Screens for indicators of:**
- Dyslexia (reading/phonological processing patterns)
- Dyscalculia (numerical processing patterns)
- ADHD indicators (attention + impulse patterns across all tests)
- Autism spectrum indicators (social cognition, pattern recognition patterns)
- Giftedness (exceptional performance patterns across domains)

**Critical caveat:** SeedsAssess provides indicators only. Any positive screen is followed by: "We recommend a formal assessment by a qualified educational psychologist." The platform does not diagnose.

### 6. Deen Intelligence (Islamic context layer)
**Unique to SeedsAssess — not found in any existing system**
**Measures:**
- Quranic knowledge (appropriate to age)
- Islamic ethics / fiqh basics
- Islamic history and Seerah
- Application of Islamic values to real scenarios
- Taqwa indicators (self-reported + scenario-based)

**Why it's here:** Standard assessments ignore spiritual intelligence entirely. For Muslim families, Deen is foundational. This layer honours that.

---

## ASSESSMENT ARCHITECTURE

### Adaptive Testing Engine
- Each test begins at age-appropriate difficulty
- AI adjusts item difficulty based on response accuracy + response time
- Branching: correct answers lead to harder items, incorrect to easier
- Test terminates when confidence interval is reached (not when time runs out)
- Each test: 15-30 minutes maximum for children, 30-45 for adults

### Age Calibration
- Norms are set per age band, not a universal scale
- Age bands: 4-6 · 7-9 · 10-12 · 13-15 · 16-18 · Adult
- A 6-year-old's score of 70/100 and an 11-year-old's score of 70/100 mean very different things — the platform explains this clearly
- All scores displayed as: raw / age-ceiling (e.g., "87/100 for your age")

### Self-Reference Principle
- Every report compares you to your previous assessment, not to others
- Trend arrows (↑ improving, → stable, ↓ declining) are more prominent than absolute scores
- "You are 14 points higher than your last assessment" — not "You score above 73% of your age group"

### The Assessment Report
Each completed assessment generates:
1. **Executive Summary** (one paragraph, plain English, age-appropriate)
2. **Domain scores** (visual radar chart — 6 domains)
3. **Strength areas** (top 2 domains — celebrated)
4. **Growth areas** (bottom 2 domains — framed as opportunity, never weakness)
5. **Trend line** (how scores have changed over time)
6. **Recommendations** (3 specific, actionable things to try in the next 3 months)
7. **For parents** (if the assessed person is a child): separate parent report with more clinical detail and resource links

---

## BUILD PROMPT FOR GEMINI/CLAUDE

Use this prompt to build the SeedsAssess.ai MVP in a separate Cowork session:

```
Build SeedsAssess.ai — an AI-augmented family assessment platform.

The platform is a Next.js app deployed on Vercel, backed by Supabase.

PHASE 1 MVP (build this first):

1. AUTH
   - Google SSO via Supabase
   - Family admin creates an account and adds family member profiles
   - Each profile: name, age, relationship (parent/child)

2. ASSESSMENT ENGINE
   Build 3 tests for Phase 1:
   
   a) COGNITIVE REASONING TEST (IQ layer)
      - 20 questions, adaptive difficulty
      - Question types: pattern recognition (show sequence of shapes/numbers, pick what comes next), logical deduction (if A > B and B > C, then...?), working memory (show sequence, ask to recall reversed)
      - Age-appropriate: different question pools for ages 4-6, 7-9, 10-12, 13+
      - Timer per question (30 seconds for children, 45 for adults)
      - Score: raw correct / total, converted to age-normed score
      
   b) EQ SCENARIOS TEST (EQ layer)
      - 15 scenarios presented as illustrated situations
      - Each scenario: describe a social situation, show 4 possible responses
      - Score each response option 1-4 based on EQ research (not disclosed to user)
      - Domains measured per scenario: self-awareness, empathy, regulation, social skill
      
   c) AI LITERACY TEST (new)
      - 10 questions testing: can you spot an AI hallucination? (show 3 responses to a question, one has a clear factual error — identify it), prompt quality (given a task, which prompt would get the best result?), AI ethics (which use of AI is most appropriate here?)
      - Age-adjusted: simpler scenarios for under-12

3. RESULTS & REPORTS
   - After each test: immediate score display with domain breakdown
   - Historical trend if previous assessments exist
   - Recommendations section (3 items, age-appropriate language)
   - Parent report option (more detailed, email-ready)

4. ADMIN DASHBOARD (for family admin)
   - All family members' latest scores
   - Side-by-side trend view (separate charts per person — not comparative table)
   - Assessment scheduler: set reminders for quarterly re-assessment
   - Export report as PDF (browser print)

TECH STACK:
- Next.js 15+ App Router
- Supabase (auth + database + storage)
- Inline styles only (no Tailwind)
- No external chart libraries (draw with CSS/divs)

Design aesthetic: clean, calm, trustworthy. Not gamified. Not childish. Like a high-quality psychology tool designed for families, not clinics. Use: cream backgrounds, forest green, gold accents.

DATABASE TABLES:
- assessees (id, admin_user_id, name, age, relationship, created_at)
- assessments (id, assessee_id, test_type, started_at, completed_at, raw_score, normed_score, domain_scores JSONB)
- assessment_responses (id, assessment_id, question_id, response, correct, time_taken_ms)
- questions (id, test_type, age_band, difficulty, content JSONB, correct_answer, domain)

Build Phase 1 completely. Return all files with page.tsx for each route.

Routes:
- /          → Landing page (what is SeedsAssess?)
- /login     → Google SSO
- /dashboard → Family admin view
- /assess/[type] → Take an assessment (cognitive | eq | ai-literacy)
- /results/[assessmentId] → View results
- /profile/[assesseeId] → Individual profile with history
```

---

## DOMAIN: seedsassess.ai
- Check: seedsassess.ai, seedsassess.com, seeds-assess.ai
- Alternative: familyassess.ai, baytraise.ai

## BUSINESS MODEL
- Free tier: 1 assessment per family member per quarter
- Premium ($9.99/month): unlimited assessments, historical trends, parent reports, recommendations
- School licence: $299/year per school — bulk family accounts

## FUTURE PHASES
- Phase 2: Dyslexia/dyscalculia screener, ADHD indicators
- Phase 3: Deen Intelligence test
- Phase 4: Longitudinal research programme — families opt-in to anonymised data sharing for educational research
- Phase 5: Certified educational psychologist review layer — high-score flags get human review option
