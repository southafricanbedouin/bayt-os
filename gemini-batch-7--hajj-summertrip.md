# Gemini Build Prompt — Batch 7
## Modules: Hajj Planning · Summer Trip 2025
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **two separate `.tsx` files**. Return in **two separate labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
Passports: South African (all members)
```

### Manifesto Values (use in UX copy, empty states, tooltips)
- **Niyyah** — every journey begins with intention
- **Sabr** — preparation is patience in action
- **Tawakkul** — we plan, Allah decides
- **Barakah** — travel to seek Allah's pleasure, not escape
- **Khidma** — we bring our family's best into every journey

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

## SHARED SUPABASE SCHEMA — Batch 7

```sql
-- Hajj preparation checklist
CREATE TABLE IF NOT EXISTS public.hajj_checklist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL,   -- 'spiritual' | 'financial' | 'documents' | 'health' | 'logistics' | 'packing'
  title       TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,            -- 'muhammad' | 'camilla' | 'family'
  done        BOOLEAN DEFAULT false,
  due_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Hajj financial planning
CREATE TABLE IF NOT EXISTS public.hajj_fund (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type  TEXT NOT NULL,   -- 'deposit' | 'expense' | 'estimate'
  amount_qar  NUMERIC(10,2) NOT NULL,
  description TEXT,
  category    TEXT,            -- 'package' | 'flights' | 'accommodation' | 'spending' | 'saving' | 'other'
  entry_date  DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trip plans (reusable for any trip)
CREATE TABLE IF NOT EXISTS public.trip_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_name   TEXT NOT NULL,
  destination TEXT,
  trip_type   TEXT DEFAULT 'holiday',  -- 'holiday' | 'hajj' | 'umrah' | 'business'
  depart_date DATE,
  return_date DATE,
  budget_qar  NUMERIC(10,2),
  status      TEXT DEFAULT 'planning', -- 'planning' | 'booked' | 'completed'
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trip itinerary items
CREATE TABLE IF NOT EXISTS public.trip_itinerary (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  day_number  INT,
  date        DATE,
  time_slot   TEXT,            -- 'morning' | 'afternoon' | 'evening' | 'night'
  activity    TEXT NOT NULL,
  location    TEXT,
  notes       TEXT,
  done        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trip expenses
CREATE TABLE IF NOT EXISTS public.trip_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  category    TEXT,            -- 'flights' | 'accommodation' | 'food' | 'activities' | 'transport' | 'shopping' | 'other'
  description TEXT NOT NULL,
  amount_qar  NUMERIC(10,2) NOT NULL,
  paid        BOOLEAN DEFAULT false,
  paid_date   DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Packing list templates
CREATE TABLE IF NOT EXISTS public.packing_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  member_id   TEXT,            -- NULL = shared/family item
  item        TEXT NOT NULL,
  category    TEXT,            -- 'clothing' | 'toiletries' | 'documents' | 'electronics' | 'hajj-specific' | 'kids' | 'other'
  packed      BOOLEAN DEFAULT false,
  quantity    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Hajj Planning
**File:** `app/hajj/hajj-client.tsx`
**Export:** `export default function HajjPlanning()`
**Arabic:** الحج
**Concept:** The family's Hajj preparation hub. Not just logistics — this is a spiritual project. Muhammad and Camilla plan their first Hajj together. The children learn what it means. Financial preparation, checklists, spiritual readiness, and a countdown. This module carries weight.

### Header
- Large Arabic: `لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ` (Talbiyah — first line)
- Subtitle: "The Family's Hajj Project — Preparation begins today"
- Countdown card: days until Dhul Hijjah 1447 (calculate from current date — approx. June 2026)
- Status badge: "Planning Phase"

### Tab 1 — 🕋 Spiritual Preparation
- Hajj pillars overview (hardcoded, educational):
  - Ihram + Niyyah
  - Tawaf Al-Qudoom
  - Sa'i between Safa and Marwa
  - Wuquf at Arafah (The Day — 9th Dhul Hijjah)
  - Muzdalifah overnight
  - Rami Al-Jamarat (stoning)
  - Sacrifice (Udhiyyah)
  - Tawaf Al-Ifadah
  - Farewell Tawaf
- Each pillar: icon, Arabic name, English name, brief description, 2-line note on spiritual significance
- "Learn Together" section: 3 short family activities to prepare spiritually (hardcoded):
  1. Read Surah Al-Hajj (22) together — one page per week
  2. Watch a documentary on Hajj and discuss as a family
  3. Make dua together each Fajr: "Ya Allah, grant us Hajj mabrur"
- Mark each activity done (localStorage: `bayt-hajj-spiritual-v1`)

### Tab 2 — 📋 Preparation Checklist
- Categories as sections: Spiritual · Financial · Documents · Health · Logistics · Packing
- Each category collapsible
- Items as checkboxes, assigned to Muhammad / Camilla / Family
- Pre-seeded default items:

  **Spiritual:**
  - Learn the rites of Hajj (Muhammad)
  - Complete reading of Hajj-related chapters (Family)
  - Attend a Hajj preparation course (Muhammad + Camilla)
  - Make Tawbah and settle any debts or disputes (Muhammad + Camilla)

  **Financial:**
  - Set aside Hajj savings target (Muhammad)
  - Book Hajj package through licensed operator (Muhammad)
  - Arrange Udhiyyah (Qurbani) for the family (Muhammad)
  - Leave sufficient funds for family during absence (Muhammad + Camilla)

  **Documents:**
  - Renew passports if needed (Family)
  - Apply for Hajj visa (Muhammad + Camilla)
  - Travel insurance (Muhammad)
  - Vaccination certificates (Muhammad + Camilla)

  **Health:**
  - Meningitis vaccination (mandatory — Muhammad + Camilla)
  - COVID/flu vaccines (recommended)
  - General health check-up (Muhammad + Camilla)
  - Pack personal medications (Muhammad + Camilla)

  **Logistics:**
  - Book Hajj package (Muhammad)
  - Arrange childcare for Yahya, Isa, Linah, Dana (Muhammad + Camilla)
  - Arrange school absence permission (Muhammad + Camilla)
  - Pre-book airport transfers (Muhammad)

  **Packing:**
  - Ihram (2 sets — Muhammad)
  - Abaya and hijab sets (Camilla)
  - Comfortable walking shoes
  - Small Quran and dua booklet
  - Umrah/Hajj guide book
  - Travel adapter + portable charger

- Add custom checklist item: category, title, assigned to, due date
- Checklist saves to `hajj_checklist`
- Progress bar per category + overall progress

### Tab 3 — 💰 Hajj Fund
- Current savings balance (sum of deposits minus expenses)
- Target amount (editable — default: QAR 25,000 for 2 people)
- Progress bar: saved vs target
- Log entry form: type (deposit / expense / estimate), amount, description, category, date
- Entries table: date, type badge, description, amount, running balance
- Estimated package cost breakdown (hardcoded defaults, editable):
  - Hajj package (per person): QAR 8,000–12,000
  - Flights: included in package or ~QAR 3,000 extra
  - Personal spending: QAR 2,000 per person
  - Udhiyyah: QAR 500
  - Miscellaneous: QAR 1,000

### Tab 4 — 🗺️ Makkah & Madinah Guide
- Two-section visual guide (hardcoded, beautifully laid out):
  **Al-Masjid Al-Haram — Makkah**
  - Masjid Al-Haram overview
  - Ka'bah description
  - Zamzam well
  - Safa and Marwa
  - Mount Arafah (Jabal Al-Rahmah)
  - Mina
  - Muzdalifah
  - Jamarat (stoning pillars)

  **Al-Masjid Al-Nabawi — Madinah**
  - The Prophet's Mosque
  - Rawdah Sharif
  - Riyad Al-Jannah
  - Baqi' Cemetery
  - Masjid Quba

- Each place: name in Arabic and English, 2-sentence description, spiritual significance
- "Family Questions to Discuss" section: 5 questions to ask the children before Hajj:
  1. Why do we go to Hajj?
  2. Who built the Ka'bah and why?
  3. What is Ihram and what does it teach us?
  4. What happened at Arafah and why is it the most important day?
  5. What will we feel when we first see the Ka'bah?

---

## MODULE 2 — Summer Trip 2025
**File:** `app/summer-trip/summer-trip-client.tsx`
**Export:** `export default function SummerTrip()`
**Arabic:** رحلة الصيف
**Concept:** The Seedat family's summer holiday planner. Flexible — destination TBD or set by Muhammad. Budget planning, itinerary building, packing lists, and activity ideas. The trip that the children talk about all year.

### Note to Gemini
The destination is not fixed — build the module to be editable. Muhammad will fill in the details. Default placeholder: "Destination TBD — edit in Settings tab."

### Header
- Arabic: `رحلة الصيف ٢٠٢٥`
- Trip name: "Summer Holiday 2025" (editable)
- Destination badge (editable): shows destination or "TBD"
- Countdown: days until departure (if date is set)
- Quick stats: budget set, days planned, items packed

### Tab 1 — 📅 Itinerary
- Day-by-day planner: if depart/return dates set, show Day 1 through Day N
- Each day: date, 4 time slots (Morning / Afternoon / Evening / Night)
- Each slot: activity input (editable), location, notes
- Add itinerary item → form: day number, time slot, activity, location, notes
- Saves to `trip_itinerary` for this trip's ID
- If no dates set: prompt to set dates in Settings tab
- "Suggested Activities" section (hardcoded placeholder ideas, editable):
  - Day 1: Arrive, settle in, light local dinner
  - Family museum / cultural visit
  - Beach or outdoor activity day
  - Islamic site visit (where applicable)
  - Rest day — pool or local exploration
  - Shopping + souvenirs
  - Departure day: airport

### Tab 2 — 💰 Budget
- Trip budget: set total budget (QAR) — editable
- Budget categories with allocated vs spent:
  - ✈️ Flights
  - 🏨 Accommodation
  - 🍽️ Food & Dining
  - 🎡 Activities
  - 🚗 Local Transport
  - 🛍️ Shopping
  - 🆘 Emergency Fund
- Add expense: category, description, amount, paid/unpaid toggle
- Running total: spent vs budget, remaining
- Colour: green if under budget, orange if within 90%, red if over
- Expense log table: date, category badge, description, amount, paid badge

### Tab 3 — 🎒 Packing Lists
- Per-member packing tabs: Muhammad · Camilla · Yahya · Isa · Linah · Dana · Family
- Each tab: packing list items with checkboxes
- "Packed" status per item (saves to `packing_lists`)
- Category sections: Clothing · Toiletries · Documents · Electronics · Kids Items · Other
- Pre-seeded essentials:

  **Documents (Family):**
  - Passports (all 6)
  - Travel insurance documents
  - Hotel booking confirmations
  - Flight e-tickets

  **Clothing per child:** school holiday outfits (user fills quantity)

  **Electronics:**
  - Phone chargers
  - Universal travel adapter
  - Portable power bank
  - Camera / GoPro

  **Kids Items:**
  - Sunscreen SPF 50+
  - Kids' medicines (Calpol, antihistamine)
  - Small backpacks for day trips
  - Water bottles (1 each)
  - Earphones / tablets for travel

- Add custom item: member, item, category, quantity
- Overall packing progress bar: packed/total per person

### Tab 4 — ⚙️ Trip Settings
- Trip name (editable)
- Destination (editable)
- Depart date (date picker)
- Return date (date picker)
- Total budget (QAR)
- Trip status: Planning / Booked / Completed
- Notes (free text)
- Save → upserts to `trip_plans` (uses a fixed trip ID for Summer 2025 — hardcode as `'summer-2025'` in `trip_plans.notes` or use localStorage to find/create the trip)

---

## OUTPUT FORMAT

### File 1 of 2
```tsx
// app/hajj/hajj-client.tsx
'use client'
// ... full file
```

### File 2 of 2
```tsx
// app/summer-trip/summer-trip-client.tsx
'use client'
// ... full file
```
