# Gemini Build Prompt — Batch 5
## Modules: Deen · Health & Fitness · Education & Skills
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **three separate `.tsx` files**. Return in **three separate labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
```

### Manifesto Values (use in UX copy, empty states, tooltips)
- **Deen first** — every module is rooted in taqwa, not performance
- **Sabr** — growth is slow, consistent, and intentional
- **Ilmu** — seeking knowledge is fard, not optional
- **Sidq** — honest tracking, honest reflection
- **Khidma** — we build ourselves to serve others

### Design Tokens (copy exactly)
```ts
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
```

### Supabase Client
```ts
import { createClient } from '@/lib/supabase/client'
```
Project ref: `dytlseyncisxsznhybkj`

### Architecture Rules
- `'use client'` at top
- All styles inline, no Tailwind
- Supabase for persistence, localStorage as fallback (key prefix `bayt-*-v1`)
- Loading skeletons while fetching
- No `SidebarLayout` wrapper
- No external UI libraries
- Family member IDs: `'yahya' | 'isa' | 'linah' | 'dana'` (matches `family_members` table)

---

## SHARED SUPABASE SCHEMA — Batch 5

```sql
-- Daily salah log (5 prayers per day per person)
CREATE TABLE IF NOT EXISTS public.salah_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  fajr        BOOLEAN DEFAULT false,
  dhuhr       BOOLEAN DEFAULT false,
  asr         BOOLEAN DEFAULT false,
  maghrib     BOOLEAN DEFAULT false,
  isha        BOOLEAN DEFAULT false,
  notes       TEXT,
  UNIQUE(member_id, log_date)
);

-- Quran progress (hifz + reading)
CREATE TABLE IF NOT EXISTS public.quran_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'hifz' | 'tilawa'
  surah_from  INT,
  ayah_from   INT,
  surah_to    INT,
  ayah_to     INT,
  pages_read  INT DEFAULT 0,
  juz_complete INT DEFAULT 0,
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT now()
);

-- Islamic knowledge notes / goals
CREATE TABLE IF NOT EXISTS public.ilm_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT DEFAULT 'general',  -- 'aqeedah' | 'fiqh' | 'seerah' | 'hadith' | 'general'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Health / fitness goals
CREATE TABLE IF NOT EXISTS public.health_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT,  -- 'fitness' | 'nutrition' | 'sport' | 'wellness'
  target      TEXT,
  deadline    DATE,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Workout / activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  activity    TEXT NOT NULL,
  duration_min INT,
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT now()
);

-- Academic goals / tracking
CREATE TABLE IF NOT EXISTS public.academic_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  target_grade TEXT,
  current_grade TEXT,
  school_year TEXT DEFAULT '2025-2026',
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Skill progress (Arabic, coding, language etc.)
CREATE TABLE IF NOT EXISTS public.skill_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  skill       TEXT NOT NULL,
  level       TEXT DEFAULT 'beginner',  -- 'beginner' | 'developing' | 'intermediate' | 'advanced'
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Deen
**File:** `app/deen/deen-client.tsx`
**Export:** `export default function DeenTracker()`
**Arabic:** الدين
**Concept:** The family's spiritual spine. Salah tracking, Quran progress (tilawa + hifz), knowledge goals, and weekly Islamic check-in. Not performative — honest and quiet. A record of effort, not perfection.

### Header
- Arabic: `الدين أولاً` — "Deen First"
- Hadith quote: *"The most beloved deeds to Allah are those done consistently, even if small."*
- Today's date in both Gregorian and Hijri (calculate manually or approximate — just show month/year Hijri)

### Tab 1 — 🕌 Salah Today
- 5 prayer grid for each family member (rows: Yahya, Isa, Linah, Dana, Muhammad, Camilla)
- Columns: Fajr · Dhuhr · Asr · Maghrib · Isha
- Each cell: green checkmark toggle (tapped = prayed, empty = not yet)
- Saves to `salah_logs` for today's date
- Day streak counter per person (consecutive days all 5 prayers — from localStorage as fallback)
- Weekly summary row at bottom: % completion this week per person

### Tab 2 — 📖 Quran Progress
- Per-child card: current juz, pages read this week, hifz status (what surahs memorised)
- Weekly pages target (editable — default: 5 pages/week per older child, 2 for younger)
- Progress bar: pages this week vs target
- Log entry form: member selector, type (tilawa/hifz), surah/ayah range, pages count, notes
- Table of recent logs (last 10 entries) — member, date, type, notes

### Tab 3 — 🌟 Ilm & Goals
- Personal Islamic learning goals per family member
- Add a goal: member, title, category (aqeedah/fiqh/seerah/hadith/general), description
- Goal cards: title, category badge, date added
- Weekly family Islamic learning prompt (rotate 4 prompts — hardcoded):
  1. "This week: learn one new hadith as a family"
  2. "This week: read one story from the Seerah together"
  3. "This week: memorise one new dua"
  4. "This week: discuss one name of Allah each evening"
- Show current week's prompt based on `weekNumber % 4`

### Tab 4 — 📅 Weekly Check-in
- Simple weekly reflection for the whole family
- 4 yes/no questions (stored in localStorage per week):
  1. Did we pray Fajr together at least once?
  2. Did we read Quran daily?
  3. Did we make sadaqah this week?
  4. Did we do dhikr after at least one salah?
- Score: 0–4, show a warm message based on score
- Space for a family note / reflection (free text, localStorage)

---

## MODULE 2 — Health & Fitness
**File:** `app/fitness/fitness-client.tsx`
**Export:** `export default function HealthFitness()`
**Arabic:** الصحة والنشاط
**Concept:** The family's physical development. Sports, exercise, fitness goals. The boys are active (tennis, athletics, football). Camilla and Muhammad have their own goals. Honest tracking — no pressure, just progress.

### Known Sports/Activities
- Yahya: tennis, athletics, football
- Isa: tennis, athletics, football
- Linah: gymnastics, swimming (placeholder)
- Dana: general play / activity
- Muhammad: gym / running
- Camilla: pilates / yoga (placeholder)

### Tab 1 — 🏃 Overview
- Per-member activity card: name, recent activity, streak (days active this week), goal badge
- Activity streak: how many days this week they logged activity
- Quick-log button on each card → opens log form for that member
- Family activity leaderboard (who's been most active this week by session count)

### Tab 2 — 📝 Log Activity
- Form: member selector, activity name (free text + quick-pick chips: Tennis, Football, Athletics, Gym, Run, Swim, Walk, Cycle, Other), duration (minutes), notes
- Quick picks chips at top — tap to fill activity name
- Submit → saves to `activity_logs`
- Recent logs table: date, member, activity, duration, notes

### Tab 3 — 🎯 Goals
- Goal cards per member: title, category, target, deadline, active/complete toggle
- "Add Goal" form: member, title, category, target description, deadline
- Categories: Fitness · Sport · Nutrition · Wellness
- Mark complete → shows ✅ and moves to bottom
- Empty state: "No goals yet. Set one — even small ones count."

### Tab 4 — 📊 Stats
- This month: total sessions logged per member
- Total active minutes this month per member
- Favourite activity per member (most logged)
- Simple bar chart: sessions per day this month (across all members, stacked or grouped)
- Export: not needed — just display

---

## MODULE 3 — Education & Skills
**File:** `app/education/education-client.tsx`
**Export:** `export default function EducationSkills()`
**Arabic:** العلم والمهارات
**Concept:** Academic progress and skill development. School performance (Doha College for older boys, QFS), Arabic language, coding, reading. The family invests in minds. Track goals, celebrate progress.

### Schools
- Yahya: Doha College (DC)
- Isa: Doha College (DC)
- Linah: QFS (Qatar Foundation School)
- Dana: QFS (Qatar Foundation School)

### Tab 1 — 🏫 Academic
- Child selector (Yahya / Isa / Linah / Dana)
- Subject cards for selected child:
  - Yahya/Isa subjects: English, Maths, Science, Arabic, Computing, PE, Art
  - Linah/Dana subjects: Literacy, Numeracy, Arabic, Creative Arts, PE
- Each subject card: current grade/level (editable), target, notes field
- Save → upsert to `academic_goals`
- School year header: "2025–2026"
- Notes area per child: "Teacher notes / parent observations"

### Tab 2 — 🌍 Skills
- Skill cards per child (use `skill_progress` table)
- Pre-seeded skills:
  - Yahya: Arabic (reading/writing), Python coding, Chess
  - Isa: Arabic (reading/writing), Scratch coding, Drawing
  - Linah: Arabic alphabet, Creative writing
  - Dana: Letters & numbers, Colouring & art
- Level selector per skill: Beginner → Developing → Intermediate → Advanced
- Add custom skill: member + skill name + level
- Visual level indicator (coloured bar or step indicator)

### Tab 3 — 📚 Reading Log
- Log a reading session: member, book title, pages read, date
- Current book per member (most recent log)
- Reading stats this month: sessions, pages per member
- "Books completed" counter per member (track manually with a checkbox on book entries)
- Top reader this month badge

### Tab 4 — 🗓️ Homework & Reminders
- Simple task list per child for school assignments
- Add task: child, subject, description, due date
- Check off when done
- Overdue tasks shown in orange
- Completed tasks collapse at bottom
- Stored in localStorage (key: `bayt-homework-v1`)

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/deen/deen-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/fitness/fitness-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/education/education-client.tsx
'use client'
// ... full file
```
