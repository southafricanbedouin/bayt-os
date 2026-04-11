# Gemini Build Prompt — Batch 2
## Modules: Budget Planner · Subscriptions · Shopping & Household
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
- **Sabr** — we budget with intention, not anxiety
- **Ilmu** — know where every riyal goes
- **Sidq** — honest accounting, no hiding from numbers
- **Khidma** — the household runs so the family can serve

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
- Supabase for persistence, localStorage as fallback
- Loading skeletons while fetching
- No `SidebarLayout` wrapper
- No external UI libraries

---

## SHARED SUPABASE SCHEMA — Batch 2

```sql
-- Monthly budget envelopes
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INT NOT NULL,
  month       INT NOT NULL,
  category    TEXT NOT NULL,
  budget_qar  NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE(year, month, category)
);

-- Variable expense transactions (links to expenses-tracker)
CREATE TABLE IF NOT EXISTS public.variable_expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INT NOT NULL,
  month       INT NOT NULL,
  category    TEXT NOT NULL,   -- 'groceries' | 'dineout' | 'takeout' | 'leisure' | 'fuel' | 'barber' | 'other' | 'adhoc'
  amount_qar  NUMERIC(10,2) NOT NULL DEFAULT 0,
  note        TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, month, category)
);

-- Fixed costs (mirrors expenses-tracker fixed costs)
CREATE TABLE IF NOT EXISTS public.fixed_costs (
  id          TEXT PRIMARY KEY,
  icon        TEXT,
  name        TEXT NOT NULL,
  detail      TEXT,
  amount_qar  NUMERIC(10,2) NOT NULL,
  category    TEXT,
  active      BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  icon         TEXT,
  category     TEXT,            -- 'streaming' | 'education' | 'health' | 'software' | 'other'
  amount_qar   NUMERIC(10,2) NOT NULL,
  frequency    TEXT DEFAULT 'monthly',  -- 'monthly' | 'annual'
  billing_day  INT,             -- day of month
  renewal_date DATE,
  active       BOOLEAN DEFAULT true,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  store       TEXT,             -- 'talabat' | 'carrefour' | 'the grocer' | 'spar' | 'ffc' | 'other'
  status      TEXT DEFAULT 'active',  -- 'active' | 'completed'
  created_by  TEXT DEFAULT 'family',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shopping_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id      UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT,            -- 'produce' | 'dairy' | 'meat' | 'pantry' | 'household' | 'other'
  quantity     TEXT,
  checked      BOOLEAN DEFAULT false,
  added_by     TEXT,
  estimated_qar NUMERIC(8,2),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## MODULE 1 — Budget Planner
**File:** `app/budget/budget-client.tsx`
**Arabic:** ميزانية البيت
**Concept:** Monthly household budget — set targets per category, track actuals vs budget, see variance. Connected to the variable expenses data from the Expenses Tracker. The family sees clearly where money flows each month.

### Tabs

**Tab 1 — 📊 Monthly Overview**
- Month selector (Jan 2025 → current month)
- Budget vs Actual summary: total budgeted, total spent, variance (over/under)
- Category breakdown table:
  | Category | Budget | Actual | Variance | Bar |
  Each row has an inline budget-amount editor (click to edit)
- Total row at bottom
- Budget categories (pre-seeded):
  - 🛒 Groceries (default budget: QAR 3,000)
  - 🍽️ Dine Out (QAR 1,500)
  - 🥡 Take Out (QAR 800)
  - 🎡 Leisure (QAR 1,000)
  - ⛽ Fuel (QAR 600)
  - ✂️ Barber (QAR 200)
  - 📦 Other (QAR 500)
  - ⚡ Adhoc (QAR 500)
- Actual values pulled from `variable_expenses` table for that month

**Tab 2 — 📅 Trend**
- Last 6 months bar chart per category
- Category selector (one at a time)
- Shows budget line vs actual spend line
- Month-over-month percentage change

**Tab 3 — 🏠 Fixed Costs**
- Read-only summary of fixed costs (from `fixed_costs` table or the expenses-tracker data)
- Fixed items: Rent (13,000), Vodafone (399), Ooredoo Camilla (140), Ooredoo Muhammad (140), Maid (3,000), Hamilton Transport (1,400), School Bus (1,500)
- Total fixed: QAR 19,579/month
- Plus average electricity: show avg from last 3 months of BILLS data (hardcode the same BILLS array from expenses-tracker)

**Tab 4 — 📋 Full Monthly P&L**
- Selected month income fields (editable): Muhammad salary, Camilla income, Other
- Fixed costs total
- Variable costs total (from variable_expenses)
- Net position (income − fixed − variable)
- Color: green if positive, orange if negative

---

## MODULE 2 — Subscriptions Tracker
**File:** `app/subscriptions/subscriptions-client.tsx`
**Arabic:** الاشتراكات
**Concept:** All recurring monthly and annual subscriptions in one place. Never get surprised by a renewal. Know the exact annual commitment. Mark inactive when cancelled.

### Default Subscriptions (seed if table empty)
| Icon | Name | Category | Amount | Frequency |
|------|------|----------|--------|-----------|
| 🏫 | Doha College | Education | — | Annual |
| 🏫 | QFS | Education | — | Annual |
| 🎬 | Netflix | Streaming | 50 | Monthly |
| 🎵 | Spotify | Streaming | 35 | Monthly |
| 📱 | Apple iCloud | Software | 15 | Monthly |
| 🤖 | ChatGPT Plus | Software | 80 | Monthly |
| 🤖 | Claude Pro | Software | 80 | Monthly |
| 💪 | Gym | Health | — | Monthly |

(Leave school fees as 0 / editable — parents will fill)

### Tabs

**Tab 1 — 📋 All Subscriptions**
- Cards grid (2 columns): icon, name, category badge, amount, frequency, next billing date
- Active/inactive toggle per subscription
- Edit button per row → inline editor (name, amount, frequency, billing day, renewal date, notes)
- "Add Subscription" button
- Summary bar at top: monthly total, annual total

**Tab 2 — 📅 Calendar View**
- Monthly calendar showing which subscriptions renew on which day
- Highlight days with upcoming renewals (next 7 days in gold)
- List of "Due this month" with amounts

**Tab 3 — 📊 Analysis**
- Total monthly subscription spend
- Total annual commitment
- By category pie breakdown (visual: horizontal bar chart by category)
- Most expensive single subscription
- "Could save" suggestions (placeholder — just show the total)

---

## MODULE 3 — Shopping & Household
**File:** `app/shopping/shopping-client.tsx`
**Arabic:** التسوق
**Concept:** Grocery lists, household supplies, recurring purchases. The family's running shopping list — add items, assign to a store, check off when bought. Keeps the household running smoothly.

### Stores Available
Talabat · The Grocer · Carrefour · Spar · FFC · Lulu · Other

### Tabs

**Tab 1 — 🛒 Active Lists**
- Card per active shopping list: list name, store badge, item count, items checked off vs total
- Tap a list → expanded in-place view with all items (checkboxes)
- Check an item → marks it in Supabase, shows strikethrough
- "＋ New List" button → create list form (name + store)
- "Complete List" button → marks list as completed, moves to history

**Tab 2 — ➕ Add Items**
- Select or create a list (dropdown)
- Item name input + category select + quantity + estimated QAR (optional)
- "Add Item" quick-add button
- Quick-add frequent items (chips): Milk, Bread, Eggs, Rice, Chicken, Pasta, Olive Oil, Coffee, Laundry detergent, Dish soap — click to add instantly

**Tab 3 — 🔁 Recurring Staples**
- Hardcoded + user-editable list of household staples that should always be stocked
- Each item: name, category, "Add to list" button (dropdown selects which list)
- Categories: Pantry · Dairy · Produce · Cleaning · Personal Care
- Pre-seeded staples:
  - Pantry: Rice, Pasta, Olive oil, Tomato paste, Lentils, Chickpeas, Canned tomatoes
  - Dairy: Milk, Eggs, Yogurt, Butter, Cheese
  - Produce: Onions, Garlic, Tomatoes, Potatoes, Lemons
  - Cleaning: Dish soap, Laundry pods, Surface spray, Bin bags
  - Personal Care: Toothpaste, Shampoo, Hand soap

**Tab 4 — 📜 History**
- Completed shopping lists, most recent first
- Shows: date, store, total items, estimated total (sum of estimated_qar)
- Expandable to see items list

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/budget/budget-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/subscriptions/subscriptions-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/shopping/shopping-client.tsx
'use client'
// ... full file
```
