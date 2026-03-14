# BAYT OS — Prototype PRD
## Product Requirements Document for Claude Code
### Version 1.0 · Seedat Family · Doha, Qatar · March 2026

---

## Architecture Decision: Supabase

**Use Supabase (cloud).** Not a local database.

Reasons:
- Family members on different devices (phones, tablets, laptops) on the home network get real-time sync with zero config
- Auth, database, storage, and realtime in one free tier — no server to manage or maintain
- Works on home network AND outside it (travel, school, etc.) without VPN or port-forwarding
- Claude Code has excellent Supabase patterns — fastest path to a working prototype
- Row Level Security means parents see everything, children see their own view
- Free tier handles a family of 6 with room to spare

**Run locally** via `npm run dev` — accessible to all devices on the home network via your machine's local IP. When ready to share beyond the home, deploy to Vercel (one command).

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Best Claude Code support, file-based routing, server components |
| Language | TypeScript | Type safety for family data models |
| Database | Supabase (PostgreSQL) | Auth + DB + Realtime + Storage in one |
| Styling | Tailwind CSS | Fast, consistent, responsive |
| UI Components | shadcn/ui | Pre-built accessible components |
| Icons | Lucide React | Clean, lightweight |
| Fonts | Next/font (Geist) | Zero layout shift |
| State | Zustand | Simple client state for active child/view |
| Forms | React Hook Form + Zod | Validated forms for logs and entries |

---

## Brand Tokens (Tailwind Config)

```js
// tailwind.config.js — extend colors
colors: {
  bayt: {
    green:  '#1A3D28',
    forest: '#12251A',
    gold:   '#C9A84C',
    'gold-dim': '#8B7034',
    'gold-pale': '#F0E0B0',
    cream:  '#FDF8F0',
    black:  '#060E09',
  }
}
```

---

## User Roles

| Role | Who | Access |
|---|---|---|
| `parent` | Muhammad, Camilla | Full access — all children, all data, admin panel |
| `child` | Yahya, Isa, Linah, Dana | Own profile, own goals, own coins, family feed |

Auth strategy: **Supabase Magic Link + PIN fallback**
- Parents log in via email magic link
- Children log in via 4-digit family PIN (stored as Supabase custom claims)
- Session persists on device — children don't re-login every time

---

## Database Schema (Supabase SQL)

Run this in the Supabase SQL editor to scaffold all tables.

```sql
-- ── PROFILES ──────────────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  display_name text,                        -- "Yahya", "Dana" etc
  role         text not null default 'child' check (role in ('parent','child')),
  avatar_emoji text default '🌿',
  date_of_birth date,
  colour       text default '#1A3D28',      -- per-child accent colour
  superpower   text,                        -- child's self-described superpower
  created_at   timestamptz default now()
);

-- ── GOALS ─────────────────────────────────────────────────────
create table goals (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles(id) on delete cascade,
  title        text not null,
  description  text,
  scope        text not null default 'personal' check (scope in ('family','personal')),
  status       text not null default 'active' check (status in ('active','complete','paused')),
  due_date     date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── TASKS ─────────────────────────────────────────────────────
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  goal_id      uuid references goals(id) on delete set null,
  owner_id     uuid references profiles(id) on delete cascade,
  title        text not null,
  completed    boolean not null default false,
  coin_value   int default 0,
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

-- ── COIN LEDGER ───────────────────────────────────────────────
create table coins (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles(id) on delete cascade,
  amount       int not null,               -- positive = earned, negative = spent
  category     text not null default 'earned' check (category in ('earned','spent','sadaqah','save')),
  note         text,
  awarded_by   uuid references profiles(id),
  created_at   timestamptz default now()
);

-- ── SALAH TRACKER ─────────────────────────────────────────────
create table salah_logs (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles(id) on delete cascade,
  prayer       text not null check (prayer in ('fajr','dhuhr','asr','maghrib','isha')),
  prayed       boolean not null default false,
  logged_date  date not null default current_date,
  created_at   timestamptz default now(),
  unique(owner_id, prayer, logged_date)
);

-- ── ONE-ON-ONE LOGS ───────────────────────────────────────────
create table checkins (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid references profiles(id) on delete cascade,
  parent_id    uuid references profiles(id),
  session_date date not null default current_date,
  wins         text,
  challenges   text,
  focus_next   text,
  coin_awarded int default 0,
  created_at   timestamptz default now()
);

-- ── SHURA MEETING LOGS ────────────────────────────────────────
create table meetings (
  id           uuid primary key default gen_random_uuid(),
  meeting_date date not null default current_date,
  type         text not null default 'shura' check (type in ('shura','1on1','parents','standup')),
  summary      text,
  decisions    text,
  action_items text,
  next_meeting date,
  created_at   timestamptz default now()
);

-- ── FAMILY NOTES / FEED ───────────────────────────────────────
create table feed_items (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references profiles(id),
  type         text not null default 'note' check (type in ('note','milestone','dua','quote','announcement')),
  content      text not null,
  pinned       boolean default false,
  created_at   timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table profiles      enable row level security;
alter table goals         enable row level security;
alter table tasks         enable row level security;
alter table coins         enable row level security;
alter table salah_logs    enable row level security;
alter table checkins      enable row level security;
alter table meetings      enable row level security;
alter table feed_items    enable row level security;

-- Parents see everything
create policy "parents_all" on profiles      for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on goals         for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on tasks         for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on coins         for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on salah_logs    for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on checkins      for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on meetings      for all using (auth.jwt() ->> 'role' = 'parent');
create policy "parents_all" on feed_items    for all using (auth.jwt() ->> 'role' = 'parent');

-- Children see own data
create policy "children_own" on goals      for select using (owner_id = auth.uid());
create policy "children_own" on tasks      for select using (owner_id = auth.uid());
create policy "children_own" on coins      for select using (owner_id = auth.uid());
create policy "children_own" on salah_logs for all    using (owner_id = auth.uid());
create policy "children_feed" on feed_items for select using (true);
create policy "children_profiles_self" on profiles for select using (id = auth.uid());

-- Realtime — enable for live dashboard updates
alter publication supabase_realtime add table coins;
alter publication supabase_realtime add table salah_logs;
alter publication supabase_realtime add table feed_items;
alter publication supabase_realtime add table goals;
```

---

## Seed Data

```sql
-- Run after creating auth users for each family member
-- Replace UUIDs with actual auth.users IDs after signup

insert into profiles (id, full_name, display_name, role, avatar_emoji, date_of_birth, colour, superpower) values
  ('<muhammad-uuid>', 'Muhammad Seedat', 'Dad', 'parent', '🌿', '1985-01-01', '#1A3D28', null),
  ('<camilla-uuid>',  'Camilla Seedat',  'Mum', 'parent', '🌸', '1987-01-01', '#1A3D28', null),
  ('<yahya-uuid>',   'Yahya Seedat',    'Yahya', 'child', '⚡', '2014-05-20', '#1A4D38', 'I lead people'),
  ('<isa-uuid>',     'Isa Seedat',      'Isa',   'child', '🔧', '2015-10-03', '#2D5A3D', 'I build things'),
  ('<linah-uuid>',   'Linah Seedat',    'Linah', 'child', '💛', '2018-05-29', '#8B7034', 'I see people'),
  ('<dana-uuid>',    'Dana Seedat',     'Dana',  'child', '🔥', '2020-02-22', '#C9A84C', 'I create beauty');
```

---

## File Structure

```
bayt-os/
├── app/
│   ├── layout.tsx                  # Root layout — brand fonts, Supabase provider
│   ├── page.tsx                    # Redirect to /dashboard or /login
│   ├── login/
│   │   └── page.tsx                # Login — magic link (parents) + PIN (children)
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar + top nav
│   │   ├── page.tsx                # Family home — overview dashboard
│   │   ├── salah/
│   │   │   └── page.tsx            # Daily salah tracker — all family members
│   │   ├── goals/
│   │   │   ├── page.tsx            # Goals list — family + personal
│   │   │   └── [id]/page.tsx       # Goal detail + linked tasks
│   │   ├── coins/
│   │   │   └── page.tsx            # Coin ledger — each child balance + history
│   │   ├── children/
│   │   │   ├── page.tsx            # Children overview — 4 cards
│   │   │   └── [childId]/
│   │   │       └── page.tsx        # Individual child tab
│   │   ├── checkins/
│   │   │   └── page.tsx            # 1:1 log list + new entry form
│   │   ├── shura/
│   │   │   └── page.tsx            # Meeting log + new meeting form
│   │   ├── manifesto/
│   │   │   └── page.tsx            # The Manifesto — read-only display
│   │   └── feed/
│   │       └── page.tsx            # Family feed — notes, milestones, du'as
│   └── api/
│       ├── coins/award/route.ts    # POST — award coins to a child
│       └── salah/log/route.ts      # POST — log a prayer
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation sidebar — BAYT OS branded
│   │   ├── TopBar.tsx              # Header with greeting + family name
│   │   └── ChildSwitcher.tsx       # Quick-switch between child views
│   ├── dashboard/
│   │   ├── FamilyOverview.tsx      # Home dashboard — stats grid
│   │   ├── SalahGrid.tsx           # Today's prayer status for all members
│   │   ├── CoinSummary.tsx         # Quick coin totals per child
│   │   ├── GoalsSummary.tsx        # Active goals count + progress
│   │   └── FeedPreview.tsx         # Latest 3 feed items
│   ├── salah/
│   │   ├── PrayerCard.tsx          # Single prayer toggle — tap to mark
│   │   └── SalahRow.tsx            # One family member's daily prayer row
│   ├── coins/
│   │   ├── CoinBalance.tsx         # Balance card for one child
│   │   ├── CoinLedger.tsx          # Transaction history table
│   │   └── AwardCoinModal.tsx      # Modal — parent awards coins
│   ├── goals/
│   │   ├── GoalCard.tsx            # Goal summary card
│   │   ├── GoalForm.tsx            # Create/edit goal form
│   │   └── TaskList.tsx            # Tasks linked to a goal
│   ├── children/
│   │   ├── ChildCard.tsx           # Summary card — emoji, name, coins, goals
│   │   └── ChildProfile.tsx        # Full child tab view
│   ├── checkins/
│   │   ├── CheckinCard.tsx         # Past 1:1 log entry
│   │   └── CheckinForm.tsx         # New 1:1 log form
│   ├── shura/
│   │   ├── MeetingCard.tsx         # Past meeting summary
│   │   └── MeetingForm.tsx         # Log a new meeting
│   ├── manifesto/
│   │   └── ManifestoView.tsx       # Full manifesto — formatted display
│   ├── feed/
│   │   ├── FeedItem.tsx            # Single feed entry
│   │   └── FeedPostForm.tsx        # Quick post to family feed
│   └── ui/                         # shadcn/ui generated components
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client (cookies)
│   │   └── middleware.ts           # Auth session refresh
│   ├── types/
│   │   └── database.ts             # Generated Supabase types
│   └── utils/
│       ├── coins.ts                # Coin calculation helpers
│       ├── salah.ts                # Prayer time utilities
│       └── dates.ts                # Hijri/Gregorian conversion helpers
├── hooks/
│   ├── useFamily.ts                # All profiles
│   ├── useCoins.ts                 # Realtime coin balances
│   ├── useSalah.ts                 # Today's prayer logs
│   └── useGoals.ts                 # Goals with filters
├── store/
│   └── ui.ts                       # Zustand — active child, sidebar state
├── middleware.ts                   # Supabase auth middleware — protect routes
├── .env.local                      # Environment variables (see below)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: family PIN for children (set as Supabase custom JWT claim instead)
# FAMILY_PIN_SALT=a-random-salt-string
```

---

## Pages — Detailed Spec

### `/dashboard` — Family Home

**Purpose:** The first screen every family member sees after login.

**Layout:** Two-column on desktop, stacked on mobile.

**Left column (2/3 width):**
- Greeting: `"بسم الله — Good evening, Muhammad."` (time-aware, Arabic opener)
- Today's Salah Grid — all 6 family members × 5 prayers — green checkboxes
- Active Family Goals — top 3, with progress bars
- Recent Feed — latest 3 items (milestones, du'as, notes)

**Right column (1/3 width):**
- Coin balances — 4 children, compact cards
- Upcoming (next 3 days from Google Calendar — Phase 2, placeholder for now)
- Quick Actions: `+ Award Coins` · `+ Log 1:1` · `+ Add Goal`

---

### `/dashboard/salah` — Daily Salah Tracker

**Purpose:** Mark each prayer for each family member. The family's spiritual spine.

**Layout:** Table view — rows = family members, columns = 5 prayers.

**Behaviour:**
- Default to today's date
- Date picker to view historical days
- Tap/click cell to toggle prayer complete
- Children can only mark their own row
- Parents can mark any row
- Green cell = prayed, empty = not yet
- Streak counter per person (days with all 5 complete)
- Weekly summary at top: "Family completed X/Y prayers this week"

**Design note:** This is the most important screen. Make it clean, fast, and satisfying to tap. The checkmark should feel like an act of ibadah.

---

### `/dashboard/coins` — The Family Coin Ledger

**Purpose:** Track the family reward economy. Each child has a balance split into spend/save/sadaqah.

**Layout:** 4 child cards across the top (name, emoji, total balance), ledger table below.

**Each child card shows:**
- Display name + avatar emoji
- Total balance (large, gold coloured)
- Split: Spend / Save / Sadaqah (three smaller numbers)
- `+ Award` button (parent only)

**Ledger table (filtered per selected child):**
- Date · Description · Amount · Category · Awarded by
- Filterable by child and category

**Award Coin Modal (parent only):**
- Select child
- Amount (number input)
- Category (earned / sadaqah / bonus)
- Note (what it was for)
- Submit → realtime update on all devices

**Coin split logic (automatic on earning):**
- 70% → Spend
- 20% → Save  
- 10% → Sadaqah
*(These percentages should be configurable in a future admin panel)*

---

### `/dashboard/goals` — Goals Tracker

**Purpose:** Family goals and individual child goals. Owned, tracked, visible.

**Layout:** Toggle between Family Goals and individual child goals.

**Goal card shows:**
- Title
- Owner (family or child name)
- Status badge (active / complete / paused)
- Due date
- Progress (X of Y tasks complete)
- `View` button → `/dashboard/goals/[id]`

**Goal detail page:**
- Full description
- Linked tasks (checklist)
- Mark task complete → auto awards coins if coin_value set
- Add task (parent and the goal's owner)
- Edit/archive goal (parent only)

---

### `/dashboard/children/[childId]` — Child Tab

**Purpose:** Each child has their own personal tab. This is their home.

**The child sees (when logged in as that child):**
- Their name, emoji, superpower statement
- Today's salah (their row only)
- Their coin balance + split
- Their goals
- Messages/notes from parents (feed filtered by `@childname`)

**Parent sees (when viewing a child's tab):**
- Everything above
- 1:1 log history for this child
- Coins awarded history
- Goal progress

**Design note:** Each child should have a distinct accent colour (configured in their profile). Yahya = deep teal. Isa = forest green. Linah = gold. Dana = amber. The colour accent runs through their tab header.

---

### `/dashboard/checkins` — 1:1 Logs

**Purpose:** Log each parent-child 1:1 session. The record of intentional time.

**Layout:** List of past sessions grouped by child.

**Log entry form:**
- Select child
- Date (default today)
- Wins (text area — what went well since last time)
- Challenges (text area — what was hard)
- Focus next (text area — one thing to work on)
- Coin awarded this session (number)
- Submit

---

### `/dashboard/shura` — Meeting Log

**Purpose:** Record Monthly Shura meetings and any family meeting.

**Log entry form:**
- Meeting type (Monthly Shura / 1:1 / Parents Only / Friday Standup)
- Date
- Summary (what was discussed)
- Decisions (what was decided — important)
- Action items (who does what by when)
- Next meeting date

---

### `/dashboard/manifesto` — The Manifesto

**Purpose:** The family constitution. Always accessible. Never editable from the app (to preserve its weight).

**Layout:** Full-page reading view. BAYT brand styling. Arabic text supported.

**Content:** Hardcoded or fetched from a `manifesto` table (single row). Display only.

**At the bottom:** Version number, founding date, next review date (Ramadan 2027).

---

### `/dashboard/feed` — Family Feed

**Purpose:** The family's living memory. Milestones, du'as, announcements, quotes.

**Layout:** Chronological feed, newest first. Pinned items at top.

**Post types (each has distinct icon/colour):**
- 📌 Announcement (parent only)
- ⭐ Milestone ("Yahya completed his first 5-prayer day streak!")
- 🤲 Du'a (Arabic text supported — renders right-to-left)
- 💬 Note (general family note)
- 📖 Quote (Quran ayah or hadith)

**Quick post form** at the top — type, content, pin toggle (parent only).

---

## Navigation Structure (Sidebar)

```
BAYT OS
بيت سيدات
─────────────────
🏠  Home
🕌  Salah
🎯  Goals
🪙  Coins
👦  Children
   └── Yahya
   └── Isa
   └── Linah
   └── Dana
💬  Feed
─────────────────
📋  1:1 Logs      (parent only)
🤝  Shura         (parent only)
📜  Manifesto
─────────────────
⚙️   Settings     (parent only)
```

---

## Responsive / Network Access

The app runs on `http://localhost:3000` by default.

To make it accessible to all family devices on the home network:

```bash
# Run the dev server bound to all network interfaces
npx next dev --hostname 0.0.0.0

# Find your machine's local IP
# macOS: ifconfig | grep "inet 192"
# Windows: ipconfig

# Family accesses the app at:
# http://192.168.X.X:3000
```

For production on local network, build and run:

```bash
npm run build
npx next start --hostname 0.0.0.0 --port 3000
```

---

## Setup Instructions for Claude Code

1. **Scaffold the project**
   ```bash
   npx create-next-app@latest bayt-os \
     --typescript --tailwind --eslint --app \
     --src-dir=false --import-alias="@/*"
   ```

2. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr \
     zustand react-hook-form @hookform/resolvers zod \
     lucide-react date-fns
   npx shadcn@latest init
   npx shadcn@latest add button card badge dialog \
     input textarea select table tabs sheet avatar \
     progress separator dropdown-menu
   ```

3. **Set up Supabase**
   - Create project at supabase.com
   - Run the SQL schema above in the SQL Editor
   - Copy URL + anon key to `.env.local`
   - Generate TypeScript types: `npx supabase gen types typescript --project-id YOUR_ID > lib/types/database.ts`

4. **Configure Tailwind** with BAYT brand colours (see Brand Tokens above)

5. **Build in this order:**
   - `lib/supabase/` — client, server, middleware
   - `middleware.ts` — auth route protection
   - `app/login/page.tsx` — auth screen
   - `app/dashboard/layout.tsx` — shell with sidebar
   - `app/dashboard/page.tsx` — home dashboard
   - Salah tracker (most important — build this second)
   - Coin ledger
   - Children tabs
   - Goals
   - Feed
   - Checkins + Shura logs
   - Manifesto page (last — it's static)

---

## Design System Notes for Claude Code

- **Background:** `#060E09` (near black) for the app shell / sidebar
- **Content area background:** `#ffffff` or `#FDF8F0` (cream) for main content panels
- **Primary accent:** `#1A3D28` (forest green) — headings, nav active states, buttons
- **Secondary accent:** `#C9A84C` (gold) — highlights, coin values, important numbers
- **Typography:** System font stack (`font-sans`) is fine — no custom fonts needed for prototype
- **Arabic text:** Use `dir="rtl"` and `font-family: 'Scheherazade New', serif` for any Arabic strings
- **Salah checkboxes:** Large (min 44px tap target), green fill when complete, smooth transition
- **Coin numbers:** Always display in gold (`text-bayt-gold`), bold
- **Child accent colours:** Apply as left border or top border on their cards, not as full backgrounds

---

## Out of Scope for Prototype (Phase 2)

- Google Calendar integration
- Push notifications / reminders for salah
- AI-powered child profile synthesis
- Photo/media uploads to family feed
- Quran reading tracker
- Coin marketplace / reward redemption store
- Parent admin settings panel
- Export to PDF
- Multi-language (Arabic interface)
- Mobile app (React Native)

---

## Prototype Success Criteria

The prototype is complete when:

- [ ] All 6 family members can log in on separate devices
- [ ] Daily salah can be marked by each person in under 10 seconds
- [ ] Coins can be awarded by a parent and appear instantly on child's screen
- [ ] Each child has a working personal tab
- [ ] The manifesto is readable on any device
- [ ] A 1:1 log can be created and saved
- [ ] The app loads in under 3 seconds on home WiFi
- [ ] Yahya can navigate it without explanation

---

*BAYT OS · بيت سيدات · Prototype v0.1 · Seedat Family · Doha, Qatar*
*"The best of you is the one who is best to his family."*
