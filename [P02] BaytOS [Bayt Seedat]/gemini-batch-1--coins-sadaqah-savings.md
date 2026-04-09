# Gemini Build Prompt — Batch 1
## Modules: Family Coin · Sadaqah Ledger · Savings Goals
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Then build **three separate `.tsx` files** — one per module. Return them in **three separate code blocks**, clearly labelled. No explanation, no preamble. Just the code.

---

## SHARED CONTEXT (applies to all three modules)

### Family Structure
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya Seedat      — Eldest Son, born 20 May 2014, Age 11  → "leads"
Isa Seedat        — Second Son, born 03 Oct 2015, Age 10  → "builds"
Linah Seedat      — First Daughter, born 29 May 2018, Age 7 → "gives"
Dana Seedat       — Youngest, born 22 Feb 2020, Age 6     → "creates"
```

### Manifesto — Core Values (weave into UX copy where appropriate)
- **Taqwa** — act as if Allah is watching
- **Sidq** — truthfulness; your word is your bond
- **Ilmu** — knowledge & growth
- **Khidma** — service to others
- **Sabr** — purposeful patience
- **Mission**: "We exist to worship Allah together, raise each other toward our highest selves, and leave this world more whole than we found it."
- **Non-negotiable**: Sadaqah is automatic — a percentage of all earnings goes out. Always.

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

### Supabase Client Import (use exactly)
```ts
import { createClient } from '@/lib/supabase/client'
```

### Existing Supabase Tables (BaytOS project: dytlseyncisxsznhybkj)
- `public.profiles` — family member profiles (already has data for 3 users)
- `public.goals` — goals (7 rows)
- `public.tasks` — tasks
- `public.coins` — coins (exists, may already have schema)

### Architecture Rules
- `'use client'` at top
- All styles inline (no Tailwind, no CSS modules)
- `useState` + `useEffect` for all state
- Supabase for persistence; fallback to `localStorage` if Supabase unavailable
- No external UI libraries
- No `SidebarLayout` wrapper (added by parent page)
- Show loading skeleton while fetching
- Handle empty states gracefully
- Sub-components defined above the main `export default`

---

## SHARED SUPABASE SCHEMA — Batch 1

Run this SQL to create all tables needed for this batch:

```sql
-- Family members (children only — these are the coin earners)
CREATE TABLE IF NOT EXISTS public.family_members (
  id          TEXT PRIMARY KEY,  -- 'yahya' | 'isa' | 'linah' | 'dana'
  name        TEXT NOT NULL,
  role        TEXT,
  born        DATE,
  age         INT,
  color       TEXT,              -- per-child accent color
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO public.family_members (id, name, role, born, age, color) VALUES
  ('yahya', 'Yahya', 'Eldest Son',     '2014-05-20', 11, '#4a9eca'),
  ('isa',   'Isa',   'Second Son',     '2015-10-03', 10, '#c9a84c'),
  ('linah', 'Linah', 'First Daughter', '2018-05-29',  7, '#e07b39'),
  ('dana',  'Dana',  'Youngest',       '2020-02-22',  6, '#7ab87a')
ON CONFLICT (id) DO NOTHING;

-- Coin transactions
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    TEXT REFERENCES public.family_members(id),
  type        TEXT CHECK (type IN ('earn','spend','save','give')),
  amount      INT NOT NULL,
  description TEXT,
  chore_id    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Chores
CREATE TABLE IF NOT EXISTS public.chores (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  icon         TEXT,
  coins        INT NOT NULL DEFAULT 2,
  assigned_to  TEXT[],          -- array of child_ids
  active       BOOLEAN DEFAULT true,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Sadaqah records
CREATE TABLE IF NOT EXISTS public.sadaqah_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     TEXT REFERENCES public.family_members(id),
  amount_coins INT,
  amount_qar   NUMERIC(10,2),
  recipient    TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Savings goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     TEXT REFERENCES public.family_members(id),
  name         TEXT NOT NULL,
  icon         TEXT,
  target_coins INT NOT NULL,
  saved_coins  INT DEFAULT 0,
  deadline     DATE,
  completed    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Family Coin Tracker
**File:** `app/family-coin/family-coin-client.tsx`
**Arabic:** الدينار العائلي
**Concept:** Kids earn Bayt Coins for chores. They save, spend (parent-approved), and give (Sadaqah). A Sadaqah % is automatic on every earning — non-negotiable, per the manifesto.

### Tabs

**Tab 1 — 🏠 Overview**
- 4 child cards in a 2×2 grid (or row on wide screens): Yahya, Isa, Linah, Dana
- Each card: child name + role label, large coin balance (🪙 n), savings sub-balance, sadaqah total given, last 3 transactions mini-list
- Each card has a "＋ Award" button → inline award form:
  - Chore dropdown (loads from `chores` table) OR free-text description
  - Coin amount (pre-filled from chore)
  - On confirm: deduct 10% auto-sadaqah, add to sadaqah balance, add to coin balance
  - Save to `coin_transactions` (type: 'earn') and sadaqah auto-deduction (type: 'give')
- Top stat bar: total family coins (all children combined), total sadaqah given all-time, most active child this month

**Tab 2 — 📋 Chores**
- Table of all chores: icon, name, coin value, assigned children (checkboxes), active toggle
- Editable inline (pencil icon per row)
- "Add Chore" button → new editable row
- Save all to Supabase `chores` table
- Default chores pre-loaded if table empty:
  | Icon | Name | Coins |
  |------|------|-------|
  | 🛏️ | Make bed | 2 |
  | 🧹 | Tidy room | 3 |
  | 🍽️ | Clear dinner table | 2 |
  | 📚 | Homework without reminders | 5 |
  | 🧺 | Put away laundry | 3 |
  | 🗑️ | Take out trash | 3 |
  | 🧽 | Help wash dishes | 4 |
  | 📖 | Read 20 mins | 3 |
  | 🤲 | Help a sibling unprompted | 5 |

**Tab 3 — 📊 Ledger**
- All transactions, most recent first
- Filter by child (All | Yahya | Isa | Linah | Dana)
- Filter by type (All | Earn | Spend | Save | Give)
- Row: date, child (color-coded chip), type badge, description, amount (🪙 +n or -n)
- Empty state: "No transactions yet. Award some coins."

**Tab 4 — ⚙️ Settings**
- Sadaqah auto-deduction rate (default 10%) — editable, stored in localStorage
- Coin to QAR exchange label (e.g. "🪙 1 = QAR 1") — display only
- Reset all data (confirmation step)

### Visual Notes
- Each child has a distinct accent color (see `family_members` seed data)
- Coin display: always `🪙 {n}` format
- Sadaqah total always shown with 🤲 prefix
- Auto-sadaqah deduction shown as a note in the award flow: "10% goes to Sadaqah automatically"

---

## MODULE 2 — Sadaqah Ledger
**File:** `app/sadaqah/sadaqah-client.tsx`
**Arabic:** صدقة
**Concept:** The family's charitable giving record — coins converted to QAR, where it went, the intention behind it. "We are not the final destination of what Allah gives us. We are a channel."

### Tabs

**Tab 1 — 🤲 Overview**
- Total sadaqah given this year (QAR)
- Total sadaqah given all-time (QAR)
- Per-child sadaqah totals (mini cards)
- Family sadaqah by month — bar chart (Jan–current)
- "Log Sadaqah" button → modal/inline form

**Tab 2 — 📋 Log Sadaqah**
- Form fields:
  - Who gave (select: Muhammad | Camilla | Yahya | Isa | Linah | Dana | Family)
  - Amount in coins (if child) OR QAR (if adult)
  - Recipient / cause (text)
  - Intention / note (text, optional)
  - Date (defaults to today)
- Saves to `sadaqah_records`
- After save: shows confirmation with the note "Allah sees what you gave."

**Tab 3 — 📜 Full Ledger**
- All sadaqah records, most recent first
- Filterable by who gave
- Row: date, giver (color chip), recipient, note, amount
- Running total at top

**Tab 4 — 🎯 Sadaqah Goals**
- Family Sadaqah target for the year (editable, stored in `savings_goals` with type 'sadaqah')
- Progress bar: YTD vs target
- Milestones: 25%, 50%, 75%, 100%

### Visual Notes
- Use `C.green` as primary accent throughout (green = growth + giving in Islamic tradition)
- Header: dark green with Arabic calligraphy style subtitle
- Empty state quote: "The best of deeds are those done consistently, even if small."

---

## MODULE 3 — Savings Goals
**File:** `app/savings/savings-client.tsx`
**Arabic:** الأهداف المالية
**Concept:** Each child sets savings targets — a toy, a trip, a gift for someone. They allocate coins to goals. Parents can set family goals (Hajj fund, emergency reserve, holiday). Teaches that saving is intentional, not accidental.

### Tabs

**Tab 1 — 🎯 All Goals**
- Grid of goal cards (2 columns)
- Each card: icon, name, progress bar (saved / target), coin count, % complete, child name chip, deadline (if set)
- Click card → expands to show "Add coins" input and goal history
- "＋ New Goal" button → create goal form
- Completed goals shown with ✅ at bottom

**Tab 2 — 👶 By Child**
- Tab row: Yahya | Isa | Linah | Dana | Family
- Shows only that child's goals + their current coin balance
- "Allocate to Goal" button from available balance

**Tab 3 — 📊 Progress**
- All goals shown as a progress list (sorted by % complete)
- Stats: goals completed this year, total coins saved across all children, biggest goal in progress
- Motivation text per child based on their role (Yahya: "Keep leading the way", Isa: "You're building something", etc.)

### Goal Form Fields
- Child (select)
- Goal name (text)
- Goal icon (emoji picker — 6 preset: 🎮 🚲 ✈️ 📚 🎁 ⚽)
- Target coins (number)
- Deadline (date, optional)

### Visual Notes
- Progress bars use child's accent color
- Completed goals: overlay with gold checkmark, muted opacity
- Family goals (no child_id): use `C.green` accent
- Empty state: "Every big achievement started with a small, consistent action."

---

## OUTPUT FORMAT

Return exactly three code blocks in order:

### File 1 of 3
```tsx
// app/family-coin/family-coin-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/sadaqah/sadaqah-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/savings/savings-client.tsx
'use client'
// ... full file
```

No explanation before or after. Three code blocks. That's it.
