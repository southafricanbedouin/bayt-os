# BAYT OS — Seedat Family Operating System

A comprehensive family management system built with Next.js 14, Supabase, and TypeScript.

## 🚀 Quick Start

### 1. Environment Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials (see setup instructions below).

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

## 📋 Complete Setup Instructions

### Step 1: Supabase Project Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (choose region closest to Doha)
3. Note your Project URL and anon key from Settings → API

### Step 2: Database Schema

Go to SQL Editor in Supabase and run the complete schema from `bayt-os-prototype-prd.md`. This creates:

- Core tables: profiles, salah_logs, coins, goals, tasks
- Rhythm tables: meetings, checkins, feed_items
- Extended tables: meals, trips, outings, quran_progress, health_log, skills, character_log, chores, budget_entries, projects, milestones, letters, knowledge_archive
- RLS policies for parent/child access control
- Realtime subscriptions

### Step 3: Create Users

In Supabase Dashboard → Authentication → Users, create 6 email users:

```
muhammad@seedat.family
camilla@seedat.family
yahya@seedat.family
isa@seedat.family
linah@seedat.family
dana@seedat.family
```

### Step 4: Seed Profile Data

In SQL Editor, insert profiles (replace UUIDs with actual user IDs):

```sql
insert into profiles (id, full_name, display_name, role, avatar_emoji, dob, colour) values
('UUID-1', 'Muhammad Seedat', 'Muhammad', 'parent', '👨', '1985-01-01', '#c9a84c'),
('UUID-2', 'Camilla Seedat', 'Camilla', 'parent', '👩', '1988-01-01', '#b084cc'),
('UUID-3', 'Yahya Seedat', 'Yahya', 'child', '👦', '2014-05-20', '#1a4d38'),
('UUID-4', 'Isa Seedat', 'Isa', 'child', '👦', '2015-10-03', '#2d5a3d'),
('UUID-5', 'Linah Seedat', 'Linah', 'child', '👧', '2018-05-29', '#8b7034'),
('UUID-6', 'Dana Seedat', 'Dana', 'child', '👧', '2020-02-22', '#c9a84c');
```

### Step 5: Test Login

1. Go to http://localhost:3000
2. Enter one of the family email addresses
3. Check email for magic link
4. Click link → redirects to /dashboard

## 📦 What's Built So Far

### ✅ Phase 1: Foundation (Partial)
- [x] Next.js 14 + TypeScript
- [x] Tailwind CSS v4 with BAYT brand colors
- [x] Google Fonts (Crimson Pro, IBM Plex Mono, Amiri)
- [x] Supabase browser & server clients
- [x] Auth middleware (session refresh + route protection)
- [x] Login page (magic link with branded UI)
- [x] Root page (auth redirect logic)
- [ ] Sidebar component
- [ ] TopBar component
- [ ] Home dashboard

### 🚧 Next Up
- Sidebar with 9-layer navigation
- TopBar with Notion badge
- Home dashboard components (hadith, stats, family tree, calendar, roadmap)
- Then continue with Phases 2-14

## 🏗️ Architecture

BAYT OS follows a 9-layer system:

1. **Constitution** — Manifesto, Values, Vision
2. **Rhythm** — Daily/Weekly/Monthly/Annual
3. **People** — Parents + 4 Children
4. **Operations** — Meals, Travel, Outings
5. **Development** — Deen, Health, Education, Character, Entrepreneurship
6. **Economy** — Chores, Coins, Sadaqah, Budget
7. **Projects** — Family, Child-Led, Parent
8. **Memory** — Milestones, Letters, Knowledge Archive
9. **Integrations** — Notion, Google Calendar

## 🎨 Brand Identity

**Colors:**
```css
--bayt-green: #1a3d28      /* Sidebar, primary */
--bayt-gold: #c9a84c        /* Accents */
--bayt-cream: #faf8f2       /* Background */
--bayt-black: #0d1a0f       /* Text */
--bayt-grey: #6b7c6e        /* Muted */
```

**Typography:**
- Body: Crimson Pro (serif)
- UI: IBM Plex Mono (monospace)
- Arabic: Amiri (serif)

**Usage:**
```tsx
<div className="bg-bayt-green text-white">Sidebar</div>
<h1 className="text-bayt-gold font-mono">BAYT OS</h1>
<p className="font-arabic" dir="rtl">بِسْمِ اللَّهِ</p>
```

## 📁 Project Structure

```
baytOS/
├── app/
│   ├── layout.tsx          # Root with fonts
│   ├── page.tsx            # Auth redirect
│   ├── globals.css         # BAYT brand styles
│   ├── login/page.tsx      # Magic link login
│   └── dashboard/          # Protected routes
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # Sidebar, TopBar
│   └── [features]/         # Feature components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── types/              # TypeScript types
├── middleware.ts           # Auth middleware
├── .env.local.example      # Environment template
└── README.md               # This file
```

## 🔐 Security Notes

- Magic link auth for all users (parents + children)
- RLS policies enforce parent vs child access
- Parents see all data; children see only their own
- Session cookies httpOnly, secure
- No passwords stored

## 🚀 Deployment

When ready to deploy:

1. Push to GitHub/GitLab
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Domain suggestion: `bayt.seedat.family`

## 📞 Support

For questions or issues, contact Muhammad Seedat.

---

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**

*BAYT OS v0.1 — Seedat Family · Doha, Qatar · March 2026*
