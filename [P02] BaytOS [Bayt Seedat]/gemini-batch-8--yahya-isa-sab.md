# Gemini Build Prompt — Batch 8
## Modules: Yahya's Project · Isa's Project · Dad's Book (SAB)
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **three separate `.tsx` files**. Return in **three separate labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household (@southafricanbedouin on LinkedIn)
Camilla Seedat    — Mother · Partner in Leadership
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
```

### Manifesto Values (use in UX copy, empty states, tooltips)
- **We build, we don't just consume**
- **Sabr** — great work takes time and consistency
- **Ilmu** — document everything, knowledge compounds
- **Sidq** — honest work, honest effort
- **Legacy** — what we build outlives the moment

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

---

## SHARED SUPABASE SCHEMA — Batch 8

```sql
-- Child project tracker (one record per child project)
CREATE TABLE IF NOT EXISTS public.child_projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,   -- 'business' | 'creative' | 'tech' | 'sport' | 'community' | 'other'
  status      TEXT DEFAULT 'active',  -- 'idea' | 'active' | 'paused' | 'completed'
  started_at  DATE DEFAULT CURRENT_DATE,
  completed_at DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Milestones for child projects
CREATE TABLE IF NOT EXISTS public.child_project_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES public.child_projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  done        BOOLEAN DEFAULT false,
  due_date    DATE,
  completed_at DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Journal entries for child projects
CREATE TABLE IF NOT EXISTS public.child_project_journal (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES public.child_projects(id) ON DELETE CASCADE,
  entry       TEXT NOT NULL,
  mood        TEXT,  -- 'excited' | 'focused' | 'stuck' | 'proud' | 'learning'
  logged_at   TIMESTAMPTZ DEFAULT now()
);

-- SAB (The South African Bedouin) book chapters
CREATE TABLE IF NOT EXISTS public.sab_chapters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_num INT NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  status      TEXT DEFAULT 'outline',  -- 'outline' | 'drafting' | 'review' | 'complete'
  word_count  INT DEFAULT 0,
  target_words INT DEFAULT 2000,
  theme       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- SAB writing sessions
CREATE TABLE IF NOT EXISTS public.sab_writing_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id  UUID REFERENCES public.sab_chapters(id) ON DELETE SET NULL,
  words_written INT DEFAULT 0,
  duration_min  INT,
  notes         TEXT,
  logged_at     TIMESTAMPTZ DEFAULT now()
);

-- SAB content extractions (posts, ideas pulled from chapters)
CREATE TABLE IF NOT EXISTS public.sab_content_ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id  UUID REFERENCES public.sab_chapters(id) ON DELETE SET NULL,
  platform    TEXT,   -- 'linkedin' | 'newsletter' | 'instagram' | 'podcast' | 'other'
  idea        TEXT NOT NULL,
  status      TEXT DEFAULT 'idea',  -- 'idea' | 'drafted' | 'published'
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Yahya's Project
**File:** `app/yahya-project/yahya-project-client.tsx`
**Export:** `export default function YahyaProject()`
**Arabic:** مشروع يحيى
**Concept:** Yahya's personal project space. Age 11. He builds, manages, and presents his own initiative — whatever it is. This is his. The module helps him think like a project manager: set the goal, break it down, track progress, reflect. Muhammad coaches, Yahya leads.

### Tone
- Warm, encouraging, not childish — Yahya is 11 and sharp
- Use words like "project", "milestone", "goal" — not "task" or "homework"
- Empty states should feel like an invitation, not a gap

### Header
- Name: "Yahya's Project Hub"
- Arabic: `مشروع يحيى`
- Subtitle: "Yahya · Age 11 · Doha College"
- A short motivational quote that rotates monthly (hardcode 12 — one per month, pick based on current month):
  - Jan: "The journey of a thousand miles begins with a single step."
  - Feb: "Work hard in silence. Let your results make the noise."
  - Mar: "Every expert was once a beginner."
  - Apr: "You don't have to be great to start, but you have to start to be great."
  - May: "Success is the sum of small efforts repeated day in, day out."
  - Jun: "The secret of getting ahead is getting started."
  - Jul: "Dream big. Start small. Act now."
  - Aug: "Do something today that your future self will thank you for."
  - Sep: "Progress, not perfection."
  - Oct: "The only way to do great work is to love what you do."
  - Nov: "It does not matter how slowly you go, as long as you don't stop."
  - Dec: "Reflect. Reset. Rise."

### Tab 1 — 🚀 My Project
- Current active project: title, category badge, description, status, started date
- Progress bar: milestones done / total
- Milestone checklist: each milestone with checkbox, title, optional due date, completion date
- "Add Milestone" inline form: title, description, due date
- "Add Journal Entry" button → log entry form: free text + mood selector (Excited / Focused / Stuck / Proud / Learning)
- Recent journal entries (last 3): date, mood emoji, entry text
- If no active project: empty state with "Start your first project" + "Add Project" button

### Tab 2 — 💡 Project Ideas
- All projects (all statuses) for Yahya's member_id = 'yahya'
- Cards: title, category, status badge, description, started date
- Filter by status
- "Add Project" button → form: title, description, category, status
- Make a project "active" (only one active at a time — warn if switching)

### Tab 3 — 📓 Journal
- All journal entries across all projects, newest first
- Mood filter (show all moods or filter by one)
- Entry cards: date, project name, mood emoji + label, entry text
- Empty state: "Start writing. Even one sentence a day builds a record of growth."

### Tab 4 — 🏆 Achievements
- Completed milestones from all projects (checkbox ticked)
- Completed projects (status = 'completed')
- Stats: projects started, milestones completed, journal entries written
- "Baba's Note" section: a static inspirational note from Muhammad (hardcoded text — Muhammad can edit later):
  *"Yahya — you are building something real every time you sit down and do the work. I'm watching. I'm proud. Keep going. — Baba"*

---

## MODULE 2 — Isa's Project
**File:** `app/isa-project/isa-project-client.tsx`
**Export:** `export default function IsaProject()`
**Arabic:** مشروع عيسى
**Concept:** Isa's personal project space. Age 10. Same philosophy as Yahya's module — he builds, manages, and presents his own initiative. Slightly more playful in tone — Isa has a different energy — but equally serious about his goals. Muhammad coaches, Isa leads.

### Tone
- Warm, fun but focused — Isa is 10, energetic, creative
- Keep the language accessible but not babyish
- Empty states should feel exciting, like an adventure is about to start

### Structure
Identical in structure to Yahya's Project (same 4 tabs, same Supabase tables with member_id = 'isa') with these differences:

1. **Header:**
   - Name: "Isa's Project Hub"
   - Arabic: `مشروع عيسى`
   - Subtitle: "Isa · Age 10 · Doha College"
   - Different monthly quote set (same months, different quotes — more energetic):
     - Jan: "Be the hardest worker in the room."
     - Feb: "Champions are made in the moments they don't want to try."
     - Mar: "Show up. Every day. That's it."
     - Apr: "Big goals. Small steps. Every day."
     - May: "Be the reason someone believes anything is possible."
     - Jun: "Winners never quit and quitters never win."
     - Jul: "Your only competition is who you were yesterday."
     - Aug: "The best time to plant a tree was 20 years ago. The second best time is now."
     - Sep: "Work until you no longer have to introduce yourself."
     - Oct: "Fall seven times. Stand up eight."
     - Nov: "Talent is given. Greatness is earned."
     - Dec: "New year. New chapter. Same hustle."

2. **"Baba's Note"** (Tab 4):
   *"Isa — you have something special. The way you throw yourself into things, the way you make everyone laugh, the way you don't give up. Use it. Channel it. I believe in you completely. — Baba"*

3. All member_id references use `'isa'`

Everything else (tabs, Supabase calls, milestones, journal, achievements) is identical in structure to Yahya's module.

---

## MODULE 3 — Dad's Book: The South African Bedouin
**File:** `app/sab/sab-client.tsx`
**Export:** `export default function SouthAfricanBedouin()`
**Arabic:** كتاب البيت
**Concept:** Muhammad Seedat's autobiography — *The South African Bedouin*. This module is his writing command centre. Chapter tracker, writing session logger, content idea extractor, and progress monitor. The book is also a content machine — every chapter generates LinkedIn posts, newsletter sections, and more.

### About the Book
- Title: **The South African Bedouin**
- Author: Muhammad Seedat
- Concept: The story of a South African Muslim man who built a life in the Gulf — family, faith, business, identity
- Chapter 1: "The War Machine" (already written — status: complete)
- Writing platform: Notes app / external — this module tracks progress, not the writing itself
- Target: 30–40 chapters, ~2,000 words each

### Header
- Book title: **THE SOUTH AFRICAN BEDOUIN**
- Subtitle: "Muhammad Seedat · In Progress"
- Arabic: `الحياة قصة`  — "Life is a story"
- Stats row: Chapters complete · Total words written · Writing sessions logged · Content ideas extracted

### Tab 1 — 📖 Chapters
- Chapter list: chapter number, title, subtitle, theme, status badge, word count vs target, last updated
- Status badge colours: Outline=grey, Drafting=blue, Review=gold, Complete=green
- Click a chapter → expand inline: full details, notes, content ideas linked to this chapter
- "Add Chapter" button → form: chapter num, title, subtitle, theme, target words, notes, status
- Pre-seed Chapter 1:
  - chapter_num: 1
  - title: "The War Machine"
  - subtitle: "Where it begins"
  - status: 'complete'
  - word_count: 2000 (approximate)
  - theme: "Origin · Identity · What I was built from"
- Filter by status
- Progress bar across all chapters: words written / total target (assumes 35 chapters × 2000 = 70,000 words)

### Tab 2 — ✍️ Writing Sessions
- Log a session: chapter selector (dropdown of all chapters), words written, duration (minutes), notes/reflection
- Submit → saves to `sab_writing_sessions`
- Writing log table: date, chapter, words, duration, notes
- Stats cards:
  - Total words written (sum of all sessions)
  - Average session length (words)
  - Average duration (minutes)
  - Sessions this month
- Writing streak: consecutive days with at least one session (from localStorage)
- Motivational line: *"Istiqama. Show up for the book every day, even for 10 minutes."*

### Tab 3 — 💡 Content Ideas
- Extract content value from the book
- Log a content idea: chapter selector, platform (LinkedIn / Newsletter / Instagram / Podcast / Other), idea text
- Cards per idea: chapter name, platform badge, idea text, status badge (Idea / Drafted / Published)
- Click status → cycle through (Idea → Drafted → Published)
- Filter by platform and status
- Stats: total ideas, by platform breakdown, published count
- Section header: *"Every chapter is 5 pieces of content. The book and the brand feed each other."*

### Tab 4 — 📊 Dashboard
- Overview of the entire book project:
  - Completion % (words written / 70,000 target)
  - Circular or linear progress indicator — make it visual
  - Chapter status breakdown: how many in each status
  - Writing velocity: words per week (last 4 weeks bar chart — calculated from `sab_writing_sessions`)
  - Estimated completion date: based on average words/week vs remaining words
- "Writing Targets" section:
  - Weekly word target: 2,000 (editable, localStorage: `bayt-sab-weekly-target-v1`)
  - This week's words vs target
  - Monthly word count for last 3 months
- Inspiration section (hardcoded, static):
  - *"You are writing your children's history."*
  - *"The book you don't write can't be read."*
  - *"Every chapter is an act of Sidq — honest testimony to a life lived."*

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/yahya-project/yahya-project-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/isa-project/isa-project-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/sab/sab-client.tsx
'use client'
// ... full file
```
