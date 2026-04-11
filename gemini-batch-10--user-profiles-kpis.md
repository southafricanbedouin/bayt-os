# Gemini Build Prompt — Batch 10
## Modules: User Profile · Family Goals & KPI Dashboard · Activity System
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **three separate `.tsx` files**. Return in **three separate labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household (admin access)
Camilla Seedat    — Mother · Partner in Leadership (admin access)
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6) — child access
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
Auth: Google SSO via Supabase (already configured)
```

### Access Levels
- **Parents (Muhammad + Camilla):** Can view and edit ALL family member profiles, see KPI system, access reports, edit goals
- **Children:** Can view their own profile only. Can log activity, add notes, complete tasks. Cannot see other children's profiles.
- Profile is identified by Supabase auth user (email matches family_member record)

### Manifesto Values
- **Sidq** — honest self-assessment, honest effort
- **Shura** — goals are set together, not imposed
- **Istiqama** — the system measures consistency, not peaks
- **Each person measured against their own best** — never against each other

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
- No `SidebarLayout` wrapper
- No external UI libraries
- Family member IDs: `'yahya' | 'isa' | 'linah' | 'dana' | 'muhammad' | 'camilla'`

---

## SHARED SUPABASE SCHEMA — Batch 10

```sql
-- Extended user profiles (linked to Supabase auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE,  -- references auth.users(id)
  member_id       TEXT UNIQUE REFERENCES public.family_members(id),
  display_name    TEXT,
  avatar_url      TEXT,
  role            TEXT DEFAULT 'child',  -- 'parent' | 'child'
  email           TEXT,
  bio             TEXT,
  interests       TEXT[],  -- ['football', 'tennis', 'coding', 'art']
  personality     TEXT,    -- free text: "energetic, creative, loves challenges"
  love_language   TEXT,    -- 'words' | 'touch' | 'acts' | 'time' | 'gifts'
  current_focus   TEXT,    -- what they're working on right now
  last_active     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Personal goals (linked to annual_goals but also standalone)
CREATE TABLE IF NOT EXISTS public.personal_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  area            TEXT,  -- 'deen' | 'health' | 'education' | 'character' | 'family' | 'personal'
  target          TEXT,
  start_date      DATE DEFAULT CURRENT_DATE,
  target_date     DATE,
  progress        INT DEFAULT 0,  -- 0-100
  linked_family_goal UUID REFERENCES public.annual_goals(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- KPI quarterly reviews
CREATE TABLE IF NOT EXISTS public.kpi_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  year            INT NOT NULL,
  quarter         INT NOT NULL,  -- 1, 2, 3, 4
  overall_score   INT,  -- 1-10 self-assessment
  parent_score    INT,  -- 1-10 parent assessment (parents only)
  wins            TEXT,
  improvements    TEXT,
  goals_met       INT DEFAULT 0,
  goals_total     INT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Activity / contribution log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  action_type     TEXT NOT NULL,  -- 'chore_complete' | 'goal_update' | 'task_complete' | 'coin_earned' | 'note_added' | 'reading_logged' | 'sadaqah_logged' | 'shopping_done' | 'review_submitted'
  module          TEXT,           -- 'family-coin' | 'education' | 'deen' | 'shopping' | etc.
  description     TEXT,
  points          INT DEFAULT 0,  -- contribution points earned
  metadata        JSONB,          -- any extra data
  logged_at       TIMESTAMPTZ DEFAULT now()
);

-- Gamification unlocks
CREATE TABLE IF NOT EXISTS public.unlocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  unlock_type     TEXT NOT NULL,  -- 'bonus_coins' | 'cash_reward' | 'privilege' | 'badge'
  title           TEXT NOT NULL,
  description     TEXT,
  value_coins     INT DEFAULT 0,
  value_qar       NUMERIC(8,2) DEFAULT 0,
  trigger_action  TEXT,           -- what action triggered this unlock
  claimed         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Development scores (IQ / EQ / Academic — age-weighted)
CREATE TABLE IF NOT EXISTS public.development_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  score_date      DATE DEFAULT CURRENT_DATE,
  iq_raw          INT,   -- raw score
  iq_age_max      INT,   -- maximum for their age (denominator)
  eq_raw          INT,
  eq_age_max      INT,
  academic_raw    INT,
  academic_max    INT,
  social_raw      INT,
  social_max      INT,
  deen_raw        INT,
  deen_max        INT,
  notes           TEXT,
  assessed_by     TEXT DEFAULT 'self',  -- 'self' | 'parent' | 'assessment'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Personal tasks / kanban
CREATE TABLE IF NOT EXISTS public.personal_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'todo',  -- 'todo' | 'in_progress' | 'done'
  tag             TEXT,   -- 'project' | 'chore' | 'goal' | 'adhoc' | 'school'
  project_ref     TEXT,   -- optional: links to a project name
  due_date        DATE,
  priority        TEXT DEFAULT 'normal',  -- 'low' | 'normal' | 'high'
  created_by      TEXT,   -- member_id of who assigned it (parents can assign to children)
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Notes / ideas / thoughts
CREATE TABLE IF NOT EXISTS public.personal_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT NOT NULL,
  type            TEXT DEFAULT 'note',  -- 'note' | 'idea' | 'thought' | 'dream' | 'question'
  pinned          BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Notifications (in-app inbox)
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_member_id    TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  from_member_id  TEXT REFERENCES public.family_members(id) ON DELETE SET NULL,
  type            TEXT,  -- 'task_assigned' | 'unlock_earned' | 'mention' | 'review_due' | 'goal_update' | 'letter' | 'request'
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,  -- route to navigate to
  read            BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — User Profile
**File:** `app/profile/profile-client.tsx`
**Export:** `export default function UserProfile({ memberId, isOwnProfile, isParent }: { memberId: string, isOwnProfile: boolean, isParent: boolean })`
**Arabic:** الملف الشخصي
**Concept:** Each family member's personal command centre. The profile shows who they are, what they're working on, how they're contributing to the family, their personal goals, tasks, notes, and development scores. Parents see everything. Children see their own.

### Profile Header
- Avatar: gold circle with first letter of name (or avatar_url if set)
- Name (large), age, role badge (Parent/Child)
- School badge (Yahya: Doha College, Isa: Doha College, Linah: QFS, Dana: QFS)
- Current focus (editable text: "What I'm working on this month")
- Bio (editable, 2-3 sentences)
- Interests (editable tags)
- Love language display (shown warmly, not labelled clinically)
- Last active timestamp
- "Edit Profile" button (own profile only, or parent)

### Tab 1 — 🏠 Overview
- Contribution score: total `activity_log.points` this month — displayed as "Family Contribution: X pts"
- Module activity cards: which modules they've used this week (from activity_log)
- Recent unlocks (from `unlocks` table, last 3) — show with unlock badge
- Personal goals in progress (top 3 by progress): mini progress bars
- Tasks this week: how many done vs. total
- Notes pinned (top 2)
- Development score snapshot: 5 bars (IQ / EQ / Academic / Social / Deen) — all displayed as raw/max relevant to their age — e.g., "IQ: 87/100" where 100 is their age-appropriate ceiling

### Tab 2 — 🎯 Goals & KPIs
- My Goals section:
  - Cards per active personal goal: title, area badge, progress bar, target date, linked family goal (if any)
  - Add Goal form: title, area, description, target, target date, link to a family annual goal
  - Edit/complete inline
- Quarterly KPI Review section (parents can initiate; children fill self-assessment):
  - Current quarter indicator (Q1/Q2/Q3/Q4 + year)
  - Self-score: 1-10 slider with label: "How did I do this quarter?"
  - Wins (free text)
  - Areas to improve (free text)
  - Goals met count
  - Parent score (only visible/editable to parents)
  - Submit → saves to `kpi_reviews`
  - Past reviews: last 4 quarters, collapsible
- For children: frame this warmly — "Your Report Card" not "KPI Review"

### Tab 3 — 📊 Development Scores
- Five score bars (one per dimension):
  1. 🧠 IQ / Reasoning — "How you think and solve problems"
  2. ❤️ EQ / Emotional Intelligence — "How you understand yourself and others"
  3. 🏫 Academic — "How you're doing at school"
  4. 🤝 Social Skills — "How you connect with people"
  5. 🌙 Deen — "Your Islamic knowledge and practice"
- Each bar: score/max displayed as fraction, coloured bar, label
- Age-appropriate ceiling: for each age, the max is calibrated (e.g., an 11-year-old's IQ max = 100, a 6-year-old's = 60 — so the bars are always meaningful for their stage)
- Score history: last 4 assessment dates shown as mini sparkline
- **Important UX note:** scores are NEVER shown side-by-side between children — each child sees only their own. Parents see all but on separate cards, never in a comparison table.
- "Update scores" button (parents only): form to input new raw scores + date + assessor + notes
- Bottom text: *"These scores measure YOU against YOUR best. Progress is personal."*

### Tab 4 — ✅ Tasks
- Kanban board: 3 columns — To Do | In Progress | Done
- Each task card: title, tag badge (Project/Chore/Goal/Adhoc/School), priority dot, due date, assigned by
- Drag between columns (or tap to change status on mobile)
- Add task: title, description, tag, project ref, due date, priority
- Parents can assign tasks to any family member
- Filter by tag
- Done tasks auto-archive after 7 days (move to Archive tab)
- "Archive" tab: list of completed tasks with dates

### Tab 5 — 📝 Notes & Ideas
- Masonry-style cards (2 columns): title, type badge, content preview, pinned indicator
- Type badges: Note=grey, Idea=gold, Thought=blue, Dream=green, Question=orange
- Tap a note → expand to full content
- Add note: type selector, title (optional), content (multi-line text)
- Pin to top (pinned shown first)
- Delete with confirmation
- Search notes (client-side filter)

### Tab 6 — 🔔 Inbox
- List of unread notifications first (bold, gold border)
- Then read notifications
- Each: type icon, from (who sent it), title, body, timestamp, "Go →" link if applicable
- Mark as read on click
- Mark all read button
- Types displayed with icons:
  - 📋 Task assigned
  - 🏆 Unlock earned  
  - 💬 Mention (@name)
  - 📅 Review due
  - ✉️ Letter from parent
  - 📨 Request (from child to parent)
- Send a request (children only): form to write a formal request to parents — title, body, type (permission/purchase/idea) → saves as notification to both parents

---

## MODULE 2 — Family Goals & KPI Dashboard
**File:** `app/family-goals/family-goals-client.tsx`
**Export:** `export default function FamilyGoals()`
**Arabic:** أهداف الأسرة
**Concept:** The family's collective goal system. Annual goals by area. Quarterly KPI reviews per member. Progress tracking across all 6 family members. Muhammad and Camilla run this. The children contribute and can see their own standing. This is the family scoreboard — run with love, not pressure.

### Access
- Full view: Muhammad + Camilla only
- Children can see the family goal cards but cannot see other children's KPI scores

### Tab 1 — 🌟 Family Scoreboard
- Year: 2026 selector (can go back to previous years)
- Family annual theme (from `annual_goals` or localStorage)
- Goal completion summary cards per area:
  - 6 area cards (Deen / Family / Health / Education / Financial / Personal)
  - Each: total goals, completed, in progress, % done
- Per-member contribution widget:
  - 6 member circles (Muhammad, Camilla, Yahya, Isa, Linah, Dana)
  - Activity points this month + goal completion % this quarter
  - Click → goes to their profile
- "Family Health Score": composite metric — average of all quarterly self-scores this quarter + % of goals on track → single number out of 10

### Tab 2 — 📋 All Goals
- Table/list of all active family goals (member_id = null) and personal goals
- Columns: Title · Area · Member · Progress · Status · Target Date
- Filter by area, status, member
- Inline progress update (click progress bar → update)
- Add family goal button (parents only)
- Group by area (expandable sections)

### Tab 3 — 📊 KPI Review Hub
- Current quarter: Q[n] 2026
- Per-member KPI cards:
  - Member name + avatar initial
  - Self-score / Parent-score (shown as X/10)
  - Goals met this quarter: n/total
  - Wins preview (first 50 chars)
  - "Review" button → opens modal with full KPI review form or last review
- Quarterly comparison: last 4 quarters per member — trend (up/flat/down)
- "Send Review Reminder" → creates a notification to that member (parents only)

### Tab 4 — 🏆 Unlocks & Gamification
- Active unlock rules (hardcoded + editable):
  **Automatically triggered unlocks:**
  - Complete the online grocery order → 100 coins + QAR 10 cash (Yahya)
  - Log 5 Salah in one day → 20 bonus coins (any child)
  - Complete all chores in a week → 50 bonus coins (any child)
  - Log a reading session every day for 7 days → 30 bonus coins + unlock "Reader badge"
  - Complete a quarterly KPI review → 25 bonus coins
  - Log a sadaqah entry → 15 bonus coins + notification to parents
  - Submit a formal request (polite tone detected) → 5 coins
- Recent unlocks feed: who earned what, when
- Total unlock value this month (coins + QAR)
- Edit unlock rules (parents only): each rule has an enabled toggle, coins value, QAR value

---

## MODULE 3 — Activity & Contribution System (background + display)
**File:** `app/contributions/contributions-client.tsx`
**Export:** `export default function ContributionsView()`
**Arabic:** المساهمات
**Concept:** Shows the family's collective activity across all BaytOS modules. Who's doing what, which modules are being used, trends over time. This is the "pulse" of BaytOS — it shows if the system is alive and being used.

### This module is READ-ONLY — it displays activity_log data

### Tab 1 — 📡 Live Feed
- Real-time activity feed (polls `activity_log` every 60 seconds)
- Each entry: member avatar initial, action description, module badge, time ago
- Module badge colours match module categories (economy=gold, deen=green, education=blue, etc.)
- Filter by member or module
- "Today" / "This Week" / "All Time" toggle

### Tab 2 — 📊 Usage Trends
- Per-module activity heatmap: which days each module was used (7-day grid per module)
- Most active module this week
- Most active family member this week (by action count)
- Activity by time of day (24h bar chart — morning/afternoon/evening/night buckets)
- Streak tracker: which members have logged activity every day this week

### Tab 3 — 🏅 Contribution Leaderboard
- This week + all-time toggle
- Ranked by points (activity_log.points)
- Member cards: rank, name, points, top module (most used), activity badge count
- "Measured against themselves" disclaimer shown at bottom
- *This is not a competition. It shows who's showing up.*

### Tab 4 — 📈 Family Health Metrics
- Composite score per member: (goals on track + activity points + KPI score) / 3 → weighted to age
- Trend over last 12 weeks: mini sparkline per member
- "Family Vitality Index": average of all member composite scores → one number
- Areas of strength (top 3 modules by activity across family)
- Areas needing attention (3 modules with no activity this week)

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/profile/profile-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/family-goals/family-goals-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/contributions/contributions-client.tsx
'use client'
// ... full file
```
