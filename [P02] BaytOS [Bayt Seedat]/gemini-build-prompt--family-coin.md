# Gemini Build Prompt — Family Coin Module (BaytOS)

## Instructions for Gemini
Build a React/Next.js client component for the **Family Coin** module of BaytOS — a family operating system for the Seedat family in Doha, Qatar.

I am attaching a reference file (`expenses-tracker.tsx`) — this is the gold-standard template. Match its:
- Design token system exactly (same `C` object, same font variables)
- Inline style architecture (no Tailwind, no CSS modules — everything inline)
- Tab/section pattern
- `localStorage` for persistence
- Component structure (`'use client'`, named exports, sub-components above the main export)

---

## Output Format

Return **one single `.tsx` file** inside a single markdown code block like this:

```tsx
// full file contents here
```

No explanation before or after. Just the code block. I will paste it directly into my codebase.

The file will be saved at: `app/family-coin/family-coin-client.tsx`

---

## Design Tokens (copy exactly — do not invent new ones)

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
```

---

## Module: Family Coin — الدينار العائلي

### Concept
The kids (Yahya, Isa, Linah, Dana) earn "Bayt Coins" by completing household chores and tasks. They can save, spend (with parent approval), and give (Sadaqah). It teaches financial literacy through the family operating system.

### Family Members (hardcoded defaults, editable)
- **Isa** — age: editable
- **Camilla** — age: editable
- **Yusuf** — age: editable

Each child has:
- A coin balance (integer)
- A savings balance (coins allocated to savings)
- A sadaqah balance (coins donated)
- A transaction history (earn / spend / save / give)

---

## Data Model (localStorage keys)

### `bayt-coin-balances-v1`
```ts
interface CoinBalance {
  childId: string      // 'Isa' | 'Yahya' | 'Linah' | 'Dana' 
  coins: number        // spendable balance
  savings: number      // saved coins
  sadaqah: number      // total given
}
```

### `bayt-coin-transactions-v1`
```ts
interface CoinTransaction {
  id: string           // uuid or Date.now()
  childId: string
  type: 'earn' | 'spend' | 'save' | 'give'
  amount: number
  description: string
  date: string         // ISO date string
}
```

### `bayt-coin-chores-v1`
```ts
interface Chore {
  id: string
  name: string
  coins: number        // reward amount
  icon: string         // emoji
  assignedTo: string[] // childIds
  active: boolean
}
```

---

## Default Chores (pre-loaded if no localStorage data)
| Icon | Chore | Coins |
|------|-------|-------|
| 🛏️ | Make bed | 2 |
| 🧹 | Tidy room | 3 |
| 🍽️ | Clear dinner table | 2 |
| 🧺 | Put away laundry | 3 |
| 📚 | Complete homework without reminders | 5 |
| 🌿 | Water plants | 2 |
| 🐾 | Feed pet | 2 |
| 🗑️ | Take out trash | 3 |
| 🧽 | Help wash dishes | 4 |
| 🧹 | Sweep/vacuum a room | 5 |
| 📖 | Read for 20 minutes | 3 |
| 🤲 | Help a sibling without being asked | 5 |

---

## Tabs / Sections

### Tab 1: 🏠 Overview
- Three child cards side by side (Yahya, Isa, Linah, Dana)
- Each card shows: name, spendable coins (large number), savings coins, sadaqah given, and last 3 transactions
- A "⊕ Award Coins" button on each card → opens an inline form:
  - Select chore from dropdown (from chores list) OR type custom description
  - Coin amount (pre-filled from chore if selected)
  - Confirm button
- Total family coins stat at top (sum of all spendable)
- Gold coin emoji (🪙) as the currency icon throughout

### Tab 2: 📋 Chores
- List of all chores with icon, name, coin value, assigned children
- Each chore row is editable inline: name, coins, assigned children (checkboxes), active toggle
- "Add Chore" button at the bottom → adds a new empty row in edit mode
- A "Save Changes" button saves all edits to localStorage

### Tab 3: 📊 Ledger
- Full transaction history across all children
- Filterable by child (dropdown: All (Yahya, Isa, Linah, Dana))
- Filterable by type (All | Earn | Spend | Save | Give)
- Each row: date, child name (color-coded), type badge, description, +/- amount
- Running balance not needed — just the transaction log
- Most recent first
- Empty state message if no transactions

### Tab 4: ⚙️ Settings
- Edit child names and ages
- Set exchange rate label (e.g. "1 Bayt Coin = QAR 1" — display only, no calculation needed)
- Reset all data button (with confirmation step — shows "Are you sure?" before clearing)

---

## Component Architecture

Follow the same pattern as `expenses-tracker.tsx`:
- Design tokens at top
- Interfaces/types
- Static default data
- Helper functions
- Sub-components (small, above main export)
- Main `export default function FamilyCoinTracker()`
- All state via `useState`, persistence via `localStorage`
- No external dependencies beyond React

---

## Visual Style Notes
- Header bar: `background: C.green`, gold accent text, Arabic subtitle `الدينار العائلي`
- Child cards: white background, gold border on selected/active, rounded corners (8px)
- Transaction types color coding:
  - earn → `C.gold` with `+` prefix
  - spend → `C.orange` with `-` prefix
  - save → `C.blue` with `→` prefix
  - give → `C.green` with `🤲` prefix
- Coin amounts: always use `🪙 {n}` format for display
- Use `F_MONO` for all numbers and labels
- Use `F_SANS` for names and descriptions

---

## What NOT to do
- Do not use Tailwind
- Do not use any external UI libraries
- Do not use `useRef` unless essential
- Do not import anything except React hooks
- Do not add `SidebarLayout` wrapper — it will be added by the parent page
- Do not add page-level metadata

---

## Return format reminder
One code block. No preamble. No explanation. Just:

```tsx
'use client'
// ... full file
```
