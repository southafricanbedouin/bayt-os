# Gemini Build Prompt — Batch 3
## Modules: Meal Planning · Travel Planning · Family Outings
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read all context first. Build **three separate `.tsx` files**. Return in **three labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya (Age 11) · Isa (Age 10) · Linah (Age 7) · Dana (Age 6)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
Context: Muslim family, halal food only, Doha-based life
```

### Manifesto Values
- **Khidma** — the table is an act of service
- **Ilmu** — plan the week, own the week
- **Sabr** — not every weekend has to be extraordinary; presence is enough
- **Mission** — raise each other toward our highest selves; that includes how we eat, rest, and play

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

### Architecture Rules
- `'use client'` at top — all inline styles — Supabase + localStorage fallback — no SidebarLayout — loading states — no external UI libraries

---

## SHARED SUPABASE SCHEMA — Batch 3

```sql
-- Weekly meal plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  DATE NOT NULL,       -- Monday of the week
  day_of_week TEXT NOT NULL,       -- 'monday' | 'tuesday' ... | 'sunday'
  meal_slot   TEXT NOT NULL,       -- 'breakfast' | 'lunch' | 'dinner'
  recipe_id   UUID,
  custom_name TEXT,                -- if no recipe_id
  notes       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start, day_of_week, meal_slot)
);

-- Recipe bank
CREATE TABLE IF NOT EXISTS public.recipes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  icon         TEXT,
  category     TEXT,               -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  cuisine      TEXT,               -- 'arabic' | 'south african' | 'international' | 'qatari'
  prep_minutes INT,
  halal        BOOLEAN DEFAULT true,
  favourite    BOOLEAN DEFAULT false,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Trips
CREATE TABLE IF NOT EXISTS public.trips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  destination  TEXT,
  start_date   DATE,
  end_date     DATE,
  status       TEXT DEFAULT 'planning',  -- 'planning' | 'confirmed' | 'completed'
  budget_qar   NUMERIC(10,2),
  actual_qar   NUMERIC(10,2),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Trip checklist items
CREATE TABLE IF NOT EXISTS public.trip_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  category   TEXT,                -- 'documents' | 'packing' | 'booking' | 'activities' | 'other'
  item       TEXT NOT NULL,
  checked    BOOLEAN DEFAULT false,
  assigned_to TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Family outings
CREATE TABLE IF NOT EXISTS public.outings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  category     TEXT,              -- 'park' | 'beach' | 'restaurant' | 'museum' | 'sport' | 'event' | 'other'
  location     TEXT,
  date         DATE,
  status       TEXT DEFAULT 'idea',  -- 'idea' | 'planned' | 'completed'
  rating       INT,               -- 1-5, family rating after
  cost_qar     NUMERIC(8,2),
  notes        TEXT,
  children_who TEXT[],            -- which kids came
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Meal Planning
**File:** `app/meals/meals-client.tsx`
**Arabic:** التخطيط للوجبات
**Concept:** The family's weekly meal planner. Halal food only. Plan breakfast/lunch/dinner for each day of the week. Build a recipe bank. Connect to the shopping list (Batch 2) by generating a grocery list from the week's meals.

### Tabs

**Tab 1 — 📅 This Week**
- 7-column weekly grid (Mon–Sun)
- Each column has 3 slots: Breakfast | Lunch | Dinner
- Each slot shows the meal name (or "—" if empty)
- Click a slot → dropdown/search to assign a recipe or type a custom name
- Week navigator: ← previous week / this week / next week →
- "Generate Shopping List" button → creates a new list in `shopping_lists` named "Meals — Week of [date]" with ingredients implied (just a simple per-recipe note, no ingredient parsing needed)

**Tab 2 — 📚 Recipe Bank**
- Grid of recipe cards: icon, name, cuisine badge, category, prep time, favourite star
- Filter by: category (All | Breakfast | Lunch | Dinner) and cuisine (All | Arabic | South African | International | Qatari)
- Toggle favourite
- "＋ Add Recipe" button → form: name, icon, category, cuisine, prep time, notes
- Default recipes pre-seeded:
  | Icon | Name | Category | Cuisine |
  |------|------|----------|---------|
  | 🥚 | Scrambled eggs | Breakfast | International |
  | 🍞 | Ful medames | Breakfast | Arabic |
  | 🥣 | Oats & honey | Breakfast | International |
  | 🍗 | Grilled chicken & rice | Lunch | Arabic |
  | 🥗 | Arabic salad | Lunch | Arabic |
  | 🍝 | Pasta bolognese | Dinner | International |
  | 🍛 | Chicken biryani | Dinner | South African |
  | 🫔 | Shawarma wraps | Dinner | Arabic |
  | 🥩 | Braai / BBQ night | Dinner | South African |
  | 🍲 | Lentil soup | Lunch | Arabic |
  | 🐟 | Grilled fish | Dinner | Qatari |
  | 🥙 | Falafel pita | Lunch | Arabic |

**Tab 3 — 📋 Meal Log**
- Completed weeks (past), collapsed by week
- Expand to see what was eaten each day
- "Best of the week" — show the most-planned recipe that week

---

## MODULE 2 — Travel Planning
**File:** `app/travel/travel-client.tsx`
**Arabic:** السفر
**Concept:** Family trip planning — where we're going, when, what we need, what it costs. From Doha to Cape Town, summer holidays, Umrah trips. The family plans together (Shura principle — kids have a voice in where we go).

### Default Trip Templates (shown when creating a new trip)
- 🕋 Umrah / Religious trip
- 🌊 Beach holiday
- 🏙️ City break
- 🏡 South Africa (Cape Town / family)
- ✈️ Custom destination

### Default Packing Checklist (per trip, pre-seeded)
**Documents:** Passports, visas, travel insurance, booking confirmations, emergency contacts
**Packing (Adults):** Clothes (n days), toiletries, medications, prayer items (prayer mat, Quran), chargers
**Packing (Kids):** School-age items if needed, snacks, entertainment for flight, favourite toy/comfort item
**Bookings:** Flights confirmed, hotel confirmed, transfers arranged, activities booked
**Finance:** Currency/cash, card notified, travel budget set

### Tabs

**Tab 1 — ✈️ Trips**
- Cards: upcoming trips (sorted by date) + past trips
- Each card: destination, dates, duration, status badge, budget vs actual
- Click → expands to full trip detail
- "＋ Plan a Trip" button → form: name, destination, dates, budget

**Tab 2 — 📋 Trip Detail** (shown when a trip is selected)
- Trip header: destination, dates, status badge, budget progress bar
- Checklist sections: Documents | Packing | Bookings | Activities | Finance
- Each item: checkbox, item name, assigned to (dropdown)
- "Add Item" per section
- Budget tracker: add expense line items (category, amount, note)
- Notes field

**Tab 3 — 🗺️ Doha Escapes**
- Curated list of short trips from Doha (hardcoded, no DB needed)
- Destinations: Inland Sea (Khor Al Adaid), Al Wakrah, Al Zubarah, Lusail, The Pearl, Katara, Souq Waqif, Education City, Aspire Park, Msheireb
- Each with: name, drive time from Al Wajba, category, best for (kids/adults/all), tips
- "Add to Trips" button → pre-fills the trip planner

**Tab 4 — 📊 Travel Stats**
- Total trips completed
- Countries visited (as a family)
- Total travel spend (from trip actual_qar)
- Upcoming trip countdown (days until next trip)

---

## MODULE 3 — Family Outings
**File:** `app/outings/outings-client.tsx`
**Arabic:** النزهات العائلية
**Concept:** Weekend plans, Doha activities, places to go. Ideas bank → planned → completed & rated. The family logs what they did and how much they loved it. Builds a memory of experiences, not just possessions.

### Outing Categories
🏖️ Beach · 🌿 Park / Nature · 🍽️ Restaurant · 🏛️ Museum / Culture · ⚽ Sport · 🎡 Entertainment · 🛍️ Shopping · 🕌 Islamic / Spiritual · 🤝 Community · ⭐ Other

### Doha Venues Seed Data (hardcoded list for suggestions)
| Name | Category | Area |
|------|----------|------|
| Aspire Park | Park | Aspire Zone |
| Katara Cultural Village | Culture | Katara |
| The Pearl | Entertainment | The Pearl |
| Souq Waqif | Culture | Old Doha |
| MIA Park | Park | Corniche |
| Doha Corniche | Park/Walk | Corniche |
| Inland Sea (Khor Al Adaid) | Nature | South Qatar |
| Al Wakrah Beach | Beach | Al Wakrah |
| Lusail Boulevard | Entertainment | Lusail |
| Msheireb | Culture | Downtown |
| QMA Kids' Art | Museum | Multiple |
| 3-2-1 Olympic Sports Museum | Museum | Aspire |
| Al Bayt Stadium | Sport | Al Khor |

### Tabs

**Tab 1 — 🗓️ This Weekend**
- Upcoming 7 days: planned outings shown prominently
- "Plan Something" quick button → add outing form
- If no plans: show 3 random suggestions from Doha venues with a "Plan It" button each

**Tab 2 — 💡 Ideas Bank**
- All outings with status = 'idea', sorted by category
- Each idea: name, category icon, location, estimated cost, "Plan It" button (sets date + changes status to 'planned'), "Delete" button
- "＋ Add Idea" button

**Tab 3 — ✅ Completed**
- All completed outings, most recent first
- Each shows: date, name, location, who came (child chips), cost, star rating (1-5, editable)
- Filter by category
- "Memories" summary: total outings this year, favourite category (most attended), total spend

**Tab 4 — 📍 Doha Guide**
- The hardcoded Doha venues list with rich display
- Filter by category
- Each venue card: name, category, area, click to "Add to Ideas"

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/meals/meals-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/travel/travel-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/outings/outings-client.tsx
'use client'
// ... full file
```
