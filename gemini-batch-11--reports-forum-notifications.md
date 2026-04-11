# Gemini Build Prompt — Batch 11
## Modules: Reports Dashboard · Family Forum · Notifications & Tasks Engine
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **three separate `.tsx` files**. No explanation. Just the code.

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
- Supabase for persistence · No SidebarLayout wrapper

---

## SHARED SUPABASE SCHEMA — Batch 11

```sql
-- Family forum posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  title           TEXT,
  content         TEXT NOT NULL,
  category        TEXT DEFAULT 'general',  -- 'announcement' | 'idea' | 'question' | 'shoutout' | 'request' | 'general'
  pinned          BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Forum comments / reactions
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  member_id       TEXT REFERENCES public.family_members(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  reaction        TEXT,  -- '❤️' | '🌟' | '👍' | '🤲' — if just reacting not commenting
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- System-generated reports
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type     TEXT NOT NULL,  -- 'family_dynamic' | 'usage' | 'goals' | 'financial' | 'development'
  period          TEXT,           -- 'weekly' | 'monthly' | 'quarterly'
  period_label    TEXT,           -- e.g. 'March 2026' | 'Q1 2026'
  content         JSONB,          -- structured report data
  narrative       TEXT,           -- AI-generated summary text
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Notification email log
CREATE TABLE IF NOT EXISTS public.notification_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_member_id    TEXT,
  to_email        TEXT,
  subject         TEXT,
  body            TEXT,
  sent_at         TIMESTAMPTZ,
  status          TEXT DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed'
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Reports Dashboard
**File:** `app/reports/reports-client.tsx`
**Export:** `export default function ReportsDashboard()`
**Arabic:** التقارير
**Concept:** Muhammad and Camilla's intelligence layer. Automated reports drawn from all BaytOS data. System health, family dynamic, goal progress, financial summary, development scores. One place to see the whole family's state.

### Access: Parents only (check role before rendering — show access denied for children)

### Tab 1 — 📊 System Report
- BaytOS health overview:
  - Total modules in BaytOS: count
  - Modules with activity this week: count + list
  - Modules unused this week: list (highlight in orange)
  - Total actions logged this month (from activity_log)
  - Most active module, least active module
  - Data quality: modules where data is stale (no update in 14+ days)
- Storage estimate: rows per key table (goals, tasks, transactions, notes etc.) — hardcode illustrative numbers, note "from Supabase"
- "BaytOS Vitality Score": simple formula — (active modules / total modules) × 10, displayed as X/10

### Tab 2 — 👨‍👩‍👧‍👦 Family Dynamic Report
- Auto-generated narrative (generate from templates using current data — no external AI needed):
  - Template: "This [week/month], the Seedat family has been active across [N] modules. [Member] has been the most active contributor. The most engaged area is [module]. [Positive observation]. One area to give attention to is [under-used module]."
  - Pull real values from activity_log + personal_goals + unlocks tables
- Per-member snapshot cards:
  - Activity points this week
  - Goals on track (green) / at risk (orange) / missed (red)
  - Latest unlock earned
  - Mood / energy (from jummah_reviews or last kpi_review)
- Family collaboration score: based on forum_posts + forum_comments + mentions in activity_log this week → score out of 10
- Recommended "family plays" (hardcoded based on conditions):
  - If collaboration < 5: "Host a family game night this week. No screens, just connection."
  - If deen activity low: "Do a family Quran reading after Maghrib — even 5 minutes."
  - If any child has no goal progress: "Set a 10-minute goal check-in with [name] this week."
  - If all goals green: "Hold a shoutout moment in the family forum — celebrate wins."
  - Always show 2-3 recommendations regardless

### Tab 3 — 💰 Financial Report
- Month selector (Jan 2025 → current)
- Fixed costs total: QAR 19,579
- Variable expenses by category (from variable_expenses table)
- Subscriptions total (from subscriptions table — active only)
- Sadaqah given this month (from sadaqah_records)
- Children's coin economy: total coins earned vs. spent vs. saved vs. given (from coin transactions)
- Cash QAR savings per child (from coin_balances.cashQar)
- Net family position if income entered: income − fixed − variable
- Trend: last 3 months variable spend comparison (bar chart per category)

### Tab 4 — 🧠 Development Report
- Per-child development score snapshot (from development_scores — latest record per child)
- Radar chart (draw with divs/CSS — no canvas): 5 dimensions (IQ, EQ, Academic, Social, Deen)
- Trend: Q1 vs Q2 vs Q3 vs Q4 (scores over time per child — each on their own chart, not comparative)
- Quarterly KPI scores per child (from kpi_reviews)
- "Areas of growth" and "Areas needing focus" automatically identified per child
- Always framed as: *growth since last assessment*, not comparison between siblings

### Tab 5 — 📅 Generate & Archive
- "Generate Monthly Report" button → creates a new `generated_reports` record using current data snapshot, stores in table
- Report archive: list of past generated reports — date, type, period, "View" button
- "View" → expands report: shows content JSON formatted beautifully as a readable report page
- Export note: "To export as PDF, use your browser's Print → Save as PDF feature"

---

## MODULE 2 — Family Forum
**File:** `app/forum/forum-client.tsx`
**Export:** `export default function FamilyForum()`
**Arabic:** منتدى الأسرة
**Concept:** The family's shared space for ideas, announcements, questions, shoutouts, and requests. Everyone has a voice. Muhammad pins important announcements. Children can post ideas and requests. Parents can respond. Measured: collaboration score based on post + comment frequency.

### Tab 1 — 🏠 Feed (default)
- Pinned posts at top (gold border, 📌 icon)
- Chronological feed of all posts
- Each post card: member avatar initial + name, category badge, title (if any), content preview (first 100 chars), time ago, comment count, reaction counts
- Click to expand → full content + comments
- Category badge colours: Announcement=gold, Idea=blue, Question=orange, Shoutout=green, Request=purple, General=grey
- Reaction strip on each post: ❤️ 🌟 👍 🤲 — tap to react (toggle, one reaction per member per post)
- Comment button → inline comment form: write + submit

### Tab 2 — ✏️ Post Something
- Category selector (icon buttons): 📢 Announcement · 💡 Idea · ❓ Question · 🌟 Shoutout · 📨 Request · 💬 General
- Title (optional)
- Content (multi-line textarea)
- Preview before posting
- Submit → saves to `forum_posts`, creates notifications for all family members
- If category = Request → also creates a notification in parents' inbox of type 'request'

### Tab 3 — 🔔 My Posts
- Posts by the current user
- Each with: reactions, comments count, date
- Edit / delete own posts (with confirmation)

### Tab 4 — 📊 Collaboration
- Family collaboration metrics:
  - Total posts this month: n
  - Total comments: n
  - Most active poster: [name] with n posts
  - Most reactions given: [name]
  - Collaboration score: (posts + comments) / 6 members → average per member, scaled to 10
- Weekly collaboration trend: bar chart (posts + comments per week, last 8 weeks)
- "Quiet members": family members with no forum activity this week — shown gently
- Recommended action: if score < 5, show: "The forum is quiet this week. Post a question or shoutout."

---

## MODULE 3 — Notifications & Tasks Engine
**File:** `app/notifications/notifications-client.tsx`
**Export:** `export default function NotificationsCenter()`
**Arabic:** الإشعارات
**Concept:** The family's notification centre and task management hub. All in-app notifications in one place. Task board across all family members (parents see all; children see their own). @mentions trigger notifications. Children's formal requests land here for parents.

### Tab 1 — 🔔 All Notifications
- Unread count badge in header
- Filter: All | Unread | Tasks | Mentions | Requests | Unlocks
- Each notification: type icon, from name, title, body, time, read/unread state, action link
- Mark individual as read / delete
- Mark all as read
- Notification types with icons:
  - 📋 Task assigned — "Yahya, Mama has added a task for you"
  - 🏆 Unlock earned — "You earned 100 coins for completing the shopping!"
  - 💬 @mention — "Baba mentioned you in a note"
  - 📅 Review due — "Your Q1 KPI review is due this week"
  - ✉️ Letter — "You have a new letter from Mama"
  - 📨 Request — "Yahya sent a formal request" (parents only)
  - 🌟 Shoutout — "Isa gave you a 🌟 in the family forum"
  - 🎯 Goal milestone — "You hit 50% on your reading goal!"

### Tab 2 — ✅ Tasks (Kanban)
- Member filter (parents see all; children see own)
- 3-column kanban: TO DO | IN PROGRESS | DONE
- Card: title, member badge, tag badge, priority dot (red=high, gold=normal, grey=low), due date
- Click card → expand: full description, due date, created by, edit/delete options
- Change status: click column header of target column or drag (use onClick fallback)
- Add task button → slide-in form:
  - Assign to: dropdown (parents can assign to anyone; children can only assign to themselves)
  - Title, description, tag (Project/Chore/Goal/Adhoc/School), priority, due date
  - On save: inserts to `personal_tasks` + creates notification to assignee
- Filter by tag
- Overdue tasks: shown with orange border

### Tab 3 — 📨 Family Requests (parents only; show "No access" for children)
- Formal requests submitted by children through their profile inbox
- Each request: from child, title, body, date, request type (permission/purchase/idea)
- Action buttons: ✅ Approve + respond | ❌ Decline + respond | 💬 Ask for more info
- Response → creates notification back to the child
- Archive of resolved requests

### Tab 4 — ⚙️ Notification Settings
- Per-member preferences (parents manage for children):
  - Email notifications: toggle (requires email integration — show as "coming soon" for now)
  - Notification types to receive: checklist
  - Quiet hours: start/end time (stored in localStorage: `bayt-notif-settings-v1`)
- Email format note: "Email notifications require Resend integration — connect via Settings > Integrations (coming soon)"

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/reports/reports-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/forum/forum-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/notifications/notifications-client.tsx
'use client'
// ... full file
```
