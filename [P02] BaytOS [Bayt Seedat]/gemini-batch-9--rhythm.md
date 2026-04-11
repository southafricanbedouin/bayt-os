# Gemini Build Prompt — Batch 9
## Modules: Daily Rhythm · Jumu'ah Review · Monthly Council · Annual Planning · Prayer Times · School Calendar
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **six separate `.tsx` files**. Return in **six separate labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
Schools: Yahya + Isa → Doha College (DC) · Linah + Dana → QFS
```

### Manifesto Values
- **Nizam** — structure creates freedom; the family runs on intentional rhythm
- **Salah-anchored** — every daily rhythm begins and ends with prayer
- **Shura** — family decisions made together, children have a voice
- **Tawakkul** — we plan with care, then trust Allah with the outcome
- **Istiqama** — consistency over intensity; small daily acts build great character

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
- Family member IDs: `'yahya' | 'isa' | 'linah' | 'dana'`

---

## SHARED SUPABASE SCHEMA — Batch 9

```sql
-- Daily rhythm schedule (reusable template)
CREATE TABLE IF NOT EXISTS public.daily_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type    TEXT NOT NULL DEFAULT 'weekday', -- 'weekday' | 'weekend' | 'school-holiday'
  time_slot   TEXT NOT NULL,   -- e.g. '05:30'
  label       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  category    TEXT,  -- 'salah' | 'school' | 'family' | 'work' | 'rest' | 'activity'
  applies_to  TEXT DEFAULT 'family', -- 'family' | 'adults' | 'children'
  active      BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Jumu'ah / weekly family check-in records
CREATE TABLE IF NOT EXISTS public.jummah_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_date   DATE NOT NULL,
  week_number   INT,
  wins          TEXT,
  struggles     TEXT,
  gratitude     TEXT,
  intentions    TEXT,
  quran_ayah    TEXT,
  family_mood   TEXT, -- 'excellent' | 'good' | 'okay' | 'tough'
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Monthly council / shura records
CREATE TABLE IF NOT EXISTS public.monthly_councils (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_date    DATE NOT NULL,
  month           INT,
  year            INT,
  agenda_items    JSONB,  -- array of agenda items discussed
  decisions       TEXT,
  goals_reviewed  BOOLEAN DEFAULT false,
  budget_reviewed BOOLEAN DEFAULT false,
  next_actions    TEXT,
  attendees       TEXT[], -- who was present
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Annual goals / intentions
CREATE TABLE IF NOT EXISTS public.annual_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INT NOT NULL,
  member_id   TEXT, -- NULL = family goal
  area        TEXT, -- 'deen' | 'family' | 'health' | 'education' | 'financial' | 'personal'
  title       TEXT NOT NULL,
  description TEXT,
  target      TEXT,
  progress    INT DEFAULT 0, -- 0-100 %
  quarter_reviews JSONB, -- {q1: text, q2: text, q3: text, q4: text}
  status      TEXT DEFAULT 'active', -- 'active' | 'achieved' | 'paused' | 'dropped'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Prayer times cache (Doha, Qatar)
CREATE TABLE IF NOT EXISTS public.prayer_time_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- School calendar events
CREATE TABLE IF NOT EXISTS public.school_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school      TEXT NOT NULL, -- 'DC' | 'QFS' | 'both'
  event_type  TEXT, -- 'holiday' | 'exam' | 'parent-evening' | 'trip' | 'sports' | 'other'
  title       TEXT NOT NULL,
  event_date  DATE NOT NULL,
  end_date    DATE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Daily Rhythm
**File:** `app/daily-rhythm/daily-rhythm-client.tsx`
**Export:** `export default function DailyRhythm()`
**Arabic:** النظام اليومي
**Concept:** The family's daily architecture. Salah-anchored. Fajr → school → work → Asr family time → Isha → sleep. This module shows the family schedule, lets Muhammad and Camilla design the ideal day, and gives everyone clarity on what the rhythm looks like. Structure creates freedom.

### Header
- Arabic: `النظام اليومي` — Daily Rhythm
- Quote: *"Structure creates freedom. The family that plans its day owns its day."*
- Current time display (live, updates every minute)
- Today's date + day of week
- "Active schedule" badge: Weekday / Weekend / School Holiday

### Tab 1 — ☀️ Today's Schedule
- Timeline view of the day from Fajr (~05:30) to Isha (~21:00)
- Each time block: time, icon, label, category colour stripe on left
- Category colours: Salah=gold, School=blue, Family=green, Work=midgreen, Rest=grey, Activity=orange
- Current time indicator: gold line across the timeline showing "now"
- Schedule adapts based on active schedule type (weekday/weekend/holiday)
- Default weekday schedule (hardcoded, editable):
  - 05:30 🕌 Fajr Salah — Family
  - 06:00 🍳 Breakfast together — Family
  - 07:15 🚌 School run — School
  - 07:30 💼 Work begins — Work (Muhammad/Camilla)
  - 13:00 🕌 Dhuhr Salah — Family
  - 15:00 🕌 Asr — Family
  - 15:30 🏠 Children home from school — Family
  - 15:45 📚 Homework & reading time — School
  - 16:30 🏃 Activity / outdoor time — Activity
  - 18:30 🍽️ Family dinner — Family
  - 19:15 🕌 Maghrib Salah — Family
  - 20:00 👨‍👩‍👧‍👦 Family time — Family
  - 21:00 🕌 Isha Salah — Family
  - 21:30 📖 Children bedtime — Rest
  - 22:30 💤 Parents wind down — Rest
- Default weekend schedule (slightly later, more family activities)
- Default school holiday schedule

### Tab 2 — ✏️ Edit Schedule
- Three sub-tabs: Weekday | Weekend | School Holiday
- Editable list of schedule items: time picker, icon (emoji input), label, category, applies_to, active toggle
- Drag-to-reorder (or up/down arrows for simplicity)
- Add new time block button
- Delete a block (confirm)
- Save → upserts to `daily_schedules` table
- Reset to defaults button

### Tab 3 — 📊 Rhythm Review
- Weekly adherence: for the past 7 days, how many schedule blocks were completed
- Salah tracker (link to deen module data or simple standalone checkboxes for this week)
- "Rhythm score" this week: % of key blocks completed (define key blocks = the 5 salah times + meals + bedtime)
- Family wins this week (free text, localStorage per week)
- One thing to improve next week (free text, localStorage per week)

---

## MODULE 2 — Jumu'ah Review
**File:** `app/jummah/jummah-client.tsx`
**Export:** `export default function JummahReview()`
**Arabic:** مراجعة الجمعة
**Concept:** The weekly family check-in. Every Friday after Jumu'ah salah, the family gathers. Wins, struggles, gratitude, and intentions for the week ahead. A ritual, not a meeting. Short, honest, meaningful.

### Header
- Arabic: `مراجعة الجمعة`
- Subtitle: "Every Friday. After Jumu'ah. Together."
- Today's date — if it's Friday, highlight it
- Count: "Week X of 2026" — show current week number

### Tab 1 — 📝 This Week's Review
- Pre-filled date (today or last Friday)
- Structured form — each section with an evocative label:
  1. **Wins** — "What went well this week?" (free text)
  2. **Struggles** — "What was hard? Be honest." (free text)
  3. **Gratitude** — "What are we grateful for?" (free text)
  4. **Intentions** — "What do we commit to next week?" (free text)
  5. **Quran/Deen moment** — "What ayah, hadith, or deen insight will we carry this week?" (free text)
  6. **Family mood** — 4-option selector: Excellent 🌟 / Good ✅ / Okay 🟡 / Tough 🔴
- Save → inserts to `jummah_reviews`
- If a review already exists for this Friday: show it, allow editing

### Tab 2 — 📚 Review Archive
- All past reviews, newest first
- Each entry: date, week number, mood emoji, collapsible to show full review
- Simple, quiet design — this is a family archive
- Filter by mood or year

### Tab 3 — 📖 Jumu'ah Inspiration
- Hardcoded rotating content (based on week number % 6):
  1. Surah Al-Kahf reminder + brief tafseer note on one key ayah
  2. A hadith about Friday and its virtues
  3. Reflection prompt: "What did the khutbah teach us today?"
  4. Dua for Friday: Sayyid Al-Istighfar (show in Arabic + transliteration + translation)
  5. Story from the Seerah relevant to the week
  6. A question to ask the children: "What is the best deed you did this week?"
- Each piece formatted beautifully with Arabic text where relevant

---

## MODULE 3 — Monthly Council
**File:** `app/monthly-council/monthly-council-client.tsx`
**Export:** `export default function MonthlyCouncil()`
**Arabic:** مجلس الشهر
**Concept:** The family's monthly Shura session. Muhammad chairs. Everyone has a voice. Goals reviewed, budget discussed, decisions made together. Children's ideas taken seriously. This is the family board meeting — run with intention.

### Header
- Arabic: `مجلس الشهر` — Monthly Council
- Quote: *"Shura — consultation — is not just Sunnah. It is how great families govern."*
- This month: current month + year
- Next council date: last Sunday of the month (calculate and display)

### Tab 1 — 📋 Run a Council
- Council date (pre-filled to today or last Sunday)
- Attendees checklist: Muhammad ✓ · Camilla ✓ · Yahya · Isa · Linah · Dana (toggle who attended)
- Agenda builder: pre-populated standard agenda + ability to add items:
  **Standard Agenda (always present):**
  1. Opening dua
  2. Last month's wins — what went well?
  3. Last month's struggles — what was hard?
  4. Goals review — are we on track?
  5. Budget review — how did we spend this month?
  6. Children's segment — what do the children want to raise?
  7. Next month's focus — one family intention
  8. Closing dua + family declaration
- Notes field per agenda item
- Decisions/actions field: what was decided?
- Save → inserts to `monthly_councils`

### Tab 2 — 📚 Council Archive
- All past council records, newest first
- Each entry: date, attendees count, collapsible to show full notes and decisions
- "Decisions made" highlighted in gold

### Tab 3 — 🎯 Goals Review
- Pulls from `annual_goals` table (current year, all members)
- For each goal: title, member, area, progress bar, status
- Update progress inline: slider (0–100%) + status change
- Add quarterly review note (Q1/Q2/Q3/Q4 based on current quarter)
- Family goals (member_id = null) shown first, then individual

---

## MODULE 4 — Annual Planning
**File:** `app/annual-planning/annual-planning-client.tsx`
**Export:** `export default function AnnualPlanning()`
**Arabic:** التخطيط السنوي
**Concept:** The family's annual intention-setting. At the start of each year (or school year), Muhammad and Camilla set the family direction. Goals by area. A theme for the year. Each family member contributes. This is reviewed quarterly.

### Tab 1 — 🌟 Year at a Glance
- Current year: 2026
- Family theme for the year (editable text — e.g., "The Year of Roots")
- Goals summary by area (counts: active, achieved, paused):
  Areas: Deen · Family · Health · Education · Financial · Personal
- Overall goal completion percentage
- Quarterly timeline: Q1 Jan-Mar · Q2 Apr-Jun · Q3 Jul-Sep · Q4 Oct-Dec
  - Mark which quarter we're in, show % of year elapsed
- "Family Declaration" for the year (editable, saved to localStorage `bayt-year-declaration-v1`)

### Tab 2 — 🎯 Goals by Area
- 6 area sections (Deen / Family / Health / Education / Financial / Personal)
- Expandable per area
- Goals within each area: member badge (or FAMILY), title, target, progress bar, status badge, quarterly review notes
- Add goal form: year, area, member or family, title, description, target, status
- Edit/delete inline
- Filter: All members | Muhammad | Camilla | Family | Each child

### Tab 3 — 📅 Year Calendar
- 12-month grid view (visual calendar)
- Key dates plotted on the calendar:
  - Islamic dates: Ramadan start, Eid Al-Fitr, Eid Al-Adha, Muharram (approximate)
  - School terms: DC and QFS term dates (hardcoded 2025-2026 calendar)
  - Family events (from `school_events` table, event_type = 'family')
- Legend: Islamic dates (gold) · School dates (blue) · Family (green)

### Tab 4 — 📊 Quarterly Review
- Current quarter view (auto-detects from today's date)
- For each active annual goal: progress update field, quarter review notes
- Overall family assessment: what did we achieve this quarter?
- What do we carry into next quarter?
- Save quarterly review → updates `annual_goals.quarter_reviews` JSONB

---

## MODULE 5 — Prayer Times
**File:** `app/prayer-times/prayer-times-client.tsx`
**Export:** `export default function PrayerTimes()`
**Arabic:** مواقيت الصلاة
**Concept:** Live Doha prayer times. The spiritual heartbeat of Bayt Seedat. Clean, beautiful, functional. Today's times, next prayer countdown, and a simple month view. The family always knows where they are in the day relative to salah.

### Key Facts
- Location: Doha, Qatar
- Method: Umm Al-Qura (standard Qatar/Gulf method)
- Prayer times change daily based on sun position
- Qatar Ministry of Awqaf publishes official times — use hardcoded monthly averages as fallback, and ideally fetch from: `https://api.aladhan.com/v1/timingsByCity?city=Doha&country=Qatar&method=4`
- Display 5 prayers: Fajr · Dhuhr · Asr · Maghrib · Isha (+ optionally Sunrise)

### Main View (no tabs needed — single focused page)
- Large display of today's date (Gregorian + Hijri approximate)
- 5 prayer cards in a clean grid/row:
  - Prayer name (English + Arabic)
  - Time (24h and 12h)
  - Icon: 🌙 Fajr · ☀️ Dhuhr · 🌤️ Asr · 🌅 Maghrib · 🌃 Isha
  - Highlight the NEXT prayer in gold
  - Show "Prayed ✓" checkbox per prayer (localStorage: `bayt-salah-today-v1` + date key)
- Countdown to next prayer: "Dhuhr in 1h 23m" — live countdown (updates each second)
- Adhan reminder note: "Allah-u-Akbar · الله أكبر" displayed quietly
- Month view: simple list of the month's prayer times (use API or hardcode current month averages)
- Data source: fetch from AlAdhan API on mount, fallback to hardcoded Doha averages if fetch fails
  - Doha approximate averages: Fajr 04:50, Sunrise 06:10, Dhuhr 11:45, Asr 15:10, Maghrib 17:50, Isha 19:15 (winter) — adjust for current month
- Ramadan Iftar/Suhoor mode: detect if we're in Ramadan (approx dates) and show Iftar time = Maghrib time prominently

---

## MODULE 6 — School Calendar
**File:** `app/school-calendar/school-calendar-client.tsx`
**Export:** `export default function SchoolCalendar()`
**Arabic:** التقويم المدرسي
**Concept:** Doha College (DC) and QFS combined school calendar. Term dates, exam schedules, parent evenings, school trips, and sport days. The family always knows what's coming at school. Never miss an important date.

### Schools
- **Doha College (DC)**: Yahya (Year 7) + Isa (Year 6) — British curriculum
- **QFS**: Linah + Dana — IB/Qatari framework

### Tab 1 — 📅 Calendar View
- Month view calendar with event dots
- Events sourced from `school_events` table
- Legend: DC=blue, QFS=green, Both=gold
- Click a date → show events for that day (popup or inline)
- Navigate month: prev / next arrows
- Today highlighted

### Tab 2 — 📋 Upcoming Events
- List of upcoming events (from today onward), grouped by month
- Each event: date, school badge (DC/QFS/Both), event_type badge, title, description
- Filter by school
- "Add Event" button → form: school, event_type, title, date, end_date, description

### Tab 3 — 🗓️ Term Dates
- Pre-seeded 2025-2026 DC and QFS term dates (hardcode these):
  
  **Doha College 2025-2026:**
  - Autumn Term: 28 Aug 2025 – 18 Dec 2025
  - Spring Term: 7 Jan 2026 – 26 Mar 2026
  - Summer Term: 14 Apr 2026 – 18 Jun 2026
  
  **QFS 2025-2026 (approximate):**
  - Term 1: Sep 2025 – Dec 2025
  - Term 2: Jan 2026 – Mar 2026
  - Term 3: Apr 2026 – Jun 2026
  
- Show as visual blocks on a year timeline
- Highlight current term in gold
- School holidays shown as gaps between terms
- Qatar national holidays (hardcoded): National Day 18 Dec, Eid Al-Fitr (approx), Eid Al-Adha (approx)

### Tab 4 — 👩‍👧 Per-Child View
- Child selector: Yahya | Isa | Linah | Dana
- Shows only their school's events
- Their year/grade
- Any personal school notes per child (localStorage: `bayt-school-notes-{childId}-v1`)
- Quick links: DC website / QFS website (external links)

---

## OUTPUT FORMAT

### File 1 of 6
```tsx
// app/daily-rhythm/daily-rhythm-client.tsx
'use client'
// ... full file
```

### File 2 of 6
```tsx
// app/jummah/jummah-client.tsx
'use client'
// ... full file
```

### File 3 of 6
```tsx
// app/monthly-council/monthly-council-client.tsx
'use client'
// ... full file
```

### File 4 of 6
```tsx
// app/annual-planning/annual-planning-client.tsx
'use client'
// ... full file
```

### File 5 of 6
```tsx
// app/prayer-times/prayer-times-client.tsx
'use client'
// ... full file
```

### File 6 of 6
```tsx
// app/school-calendar/school-calendar-client.tsx
'use client'
// ... full file
```
