# Gemini Build Prompt — Batch 6
## Modules: Character & Ethics · Entrepreneurship · Reading & Books
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
- **Akhlāq before achievement** — character is the foundation
- **Sabr** — good character is built slowly, under pressure
- **Ilmu** — reading is a form of worship
- **Sidq** — honesty is the root of all good character
- **Istiqama** — consistency in small things builds great people

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

## SHARED SUPABASE SCHEMA — Batch 6

```sql
-- Good deeds / akhlaq log
CREATE TABLE IF NOT EXISTS public.good_deeds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  deed        TEXT NOT NULL,
  category    TEXT DEFAULT 'general',  -- 'honesty' | 'kindness' | 'patience' | 'helpfulness' | 'courage' | 'gratitude' | 'general'
  witnessed_by TEXT,
  logged_at   TIMESTAMPTZ DEFAULT now()
);

-- Character goals
CREATE TABLE IF NOT EXISTS public.character_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  trait       TEXT,  -- 'honesty' | 'patience' | 'courage' | 'empathy' | 'discipline' | 'gratitude'
  description TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Business ideas / entrepreneurship
CREATE TABLE IF NOT EXISTS public.business_ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'idea',  -- 'idea' | 'exploring' | 'active' | 'paused' | 'done'
  potential_qar NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Mini project milestones (for child entrepreneurship projects)
CREATE TABLE IF NOT EXISTS public.mini_project_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id     UUID REFERENCES public.business_ideas(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  done        BOOLEAN DEFAULT false,
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Family reading list / books
CREATE TABLE IF NOT EXISTS public.books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  author      TEXT,
  category    TEXT,  -- 'islamic' | 'fiction' | 'non-fiction' | 'biography' | 'science' | 'children' | 'other'
  status      TEXT DEFAULT 'to-read',  -- 'to-read' | 'reading' | 'completed'
  pages_total INT,
  pages_read  INT DEFAULT 0,
  started_at  DATE,
  completed_at DATE,
  rating      INT,  -- 1-5
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Reading sessions
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     UUID REFERENCES public.books(id) ON DELETE SET NULL,
  member_id   TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  pages_read  INT DEFAULT 0,
  duration_min INT,
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Character & Ethics
**File:** `app/character/character-client.tsx`
**Export:** `export default function CharacterEthics()`
**Arabic:** الأخلاق
**Concept:** Tracking the family's character development — honesty, patience, kindness, courage, discipline, gratitude. Not a reward system. A mirror. A quiet record of who we are becoming.

### Header
- Arabic title: `الأخلاق` (Akhlāq)
- Quote: *"The best of you are those with the best character." — Prophet Muhammad ﷺ*
- 6 character traits displayed as pillars: Honesty · Patience · Kindness · Courage · Discipline · Gratitude

### Tab 1 — 🌟 Good Deeds Log
- Per-child section: name, recent good deed count (this week)
- "Log a Good Deed" button → modal/inline form:
  - Member selector
  - Deed description (free text)
  - Category (Honesty / Kindness / Patience / Helpfulness / Courage / Gratitude / General)
  - Witnessed by (optional free text — "Baba", "Mama", "sibling")
- Recent deeds feed (all members, most recent first): date, member name, deed, category badge
- Weekly count per member: simple number badge under their name

### Tab 2 — 🎯 Character Goals
- Goal cards per member: trait badge, title, description, active/complete toggle
- Add goal form: member, title, trait (dropdown), description
- Active goals shown first, completed goals at bottom (collapsed)
- Empty state: *"Character is built in private moments. Set your first goal."*

### Tab 3 — 📊 Trait Tracker
- Horizontal bar per character trait (Honesty, Patience, Kindness, Courage, Discipline, Gratitude)
- Bar width = number of good deeds logged in that category across all members this month
- Per-member breakdown: click a trait → shows which members contributed deeds in that category
- "This Month" default view, with a "Last 3 Months" toggle

### Tab 4 — 📝 Family Reflection
- Weekly family akhlaq question (rotate 4 prompts based on week number):
  1. "Who showed patience this week and how?"
  2. "Did anyone tell the truth when it was hard? Share the story."
  3. "How did we help someone outside our family this week?"
  4. "What are we grateful for that we often take for granted?"
- Current week's question displayed prominently
- Free text answer field (localStorage: `bayt-character-reflection-v1` keyed by week number)
- Previous reflections (last 4 weeks) shown below, collapsible

---

## MODULE 2 — Entrepreneurship
**File:** `app/entrepreneurship/entrepreneurship-client.tsx`
**Export:** `export default function Entrepreneurship()`
**Arabic:** ريادة الأعمال
**Concept:** Business ideas, mini-projects, and early entrepreneurship for the children (and Muhammad). The family thinks like builders. Ideas are captured, explored, and where possible — acted on. Even small things count: a lemonade stand is a business.

### Header
- Arabic: `ريادة الأعمال`
- Manifesto line: *"We don't just consume. We build."*
- Stats row: Total ideas logged · Active projects · Completed · Total earnings tracked (QAR)

### Tab 1 — 💡 Ideas Bank
- Cards per idea: title, member badge, status badge (Idea / Exploring / Active / Paused / Done), description, potential QAR (if entered), date
- Status badge colours: Idea=grey, Exploring=blue, Active=gold, Paused=orange, Done=green
- Inline status change (click badge → cycle through statuses)
- Filter by member and by status
- "Add Idea" button → form: member, title, description, status, estimated potential QAR
- Empty state: *"Every empire started with an idea. What's yours?"*

### Tab 2 — 🚀 Active Projects
- Only shows ideas with status 'active'
- Per project: title, member, milestones checklist
- Add milestone per project: title, due date → saves to `mini_project_milestones`
- Check off milestones
- Progress bar: milestones done / total
- Notes field per project (free text in Supabase — add a `notes` field update to `business_ideas`)

### Tab 3 — 💰 Pocket Money Lessons
- Pre-built educational content (hardcoded — no DB needed)
- 6 lesson cards, each with: title, concept, a simple exercise for kids
  1. "What is profit?" — Buy for less, sell for more
  2. "What is a budget?" — You can't spend what you don't have
  3. "What is value?" — People pay for things that solve problems
  4. "What is saving for a goal?" — Delayed gratification
  5. "What is a customer?" — Who are you building for?
  6. "What is reinvesting?" — Putting earnings back in
- Each card: expandable, shows a simple exercise: "Try this: count how many items you could sell at school for 1 riyal each"
- Mark a lesson as "taught" (localStorage: `bayt-lessons-taught-v1`)

### Tab 4 — 📜 Archive
- Completed and paused ideas, most recent first
- Shows: title, member, status, date created, potential QAR
- Option to reactivate (change status back to 'exploring')

---

## MODULE 3 — Reading & Books
**File:** `app/reading/reading-client.tsx`
**Export:** `export default function ReadingBooks()`
**Arabic:** القراءة
**Concept:** The family's collective library. What everyone is reading, has read, and wants to read. Celebrate pages. Build a culture of books. The family that reads together, thinks together.

### Header
- Arabic: `القراءة` (Al-Qira'a)
- Family reading stats this month: total pages across all members, books completed, active readers
- Motivational quote — rotate based on month:
  *"Read in the name of your Lord." — Quran 96:1* (always show this one — it's foundational)

### Tab 1 — 📖 Currently Reading
- Per-member card (show only if they have a book with status 'reading'):
  - Book cover placeholder (coloured background with first letter of title)
  - Title + author
  - Progress bar: pages_read / pages_total
  - "Log pages" button → quick-log form: pages read today, duration (min), notes
  - Saves to `reading_sessions` and updates `books.pages_read`
- Empty state per member: "Nothing reading yet. Start a book!"
- "Mark as Complete" button on each card

### Tab 2 — ➕ Add / Manage Books
- Form: member selector, title, author, category, pages total, status (to-read / reading / completed)
- Book shelf grid: all books, filterable by member and status
- Each book card: title, author, category badge, status badge, rating (1-5 stars), edit/delete
- Status badge click → change status inline
- For completed books: show star rating input (1-5)

### Tab 3 — 🏆 Reading Leaderboard
- This month vs all-time toggle
- Per-member: total pages read, books completed, average session length
- Pages read bar chart per member (horizontal bars, gold colour, cream background)
- "Top Reader This Month" highlight card
- "Most Read Category" across family
- Books completed this year: count per member

### Tab 4 — 📚 Family Library
- All completed books across all family members — the family's shared knowledge base
- Filterable by category and member
- Each entry: title, author, member who read it, rating, date completed, notes
- Category breakdown: Islamic · Fiction · Non-fiction · Biography · Science · Children · Other
- "Family Recommendations" section: books rated 5 stars by any member, displayed as recommendations

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/character/character-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/entrepreneurship/entrepreneurship-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/reading/reading-client.tsx
'use client'
// ... full file
```
