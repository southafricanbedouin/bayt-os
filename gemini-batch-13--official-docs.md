# Gemini Build Prompt — Batch 13
## Module: Official Documents Dashboard
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read the full context first. Build **one `.tsx` file** (`app/documents/documents-client.tsx`). No explanation. Just the code.

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
  green:    '#1a3d28',
  midgreen: '#245235',
  forest:   '#f0ebe0',
  gold:     '#c9a84c',
  goldDim:  '#9b7d38',
  goldPale: '#f0e4c0',
  cream:    '#faf8f2',
  white:    '#ffffff',
  grey:     '#6b7c6e',
  rule:     '#ddd8cc',
  ruleLight:'#e8e3d8',
  text:     '#0d1a0f',
  orange:   '#e07b39',
  red:      '#c0392b',
  blue:     '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'
```

### Status Colour Logic
```ts
function docStatus(expiryDate: string | null): 'expired' | 'urgent' | 'soon' | 'ok' | 'none' {
  if (!expiryDate) return 'none'
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (days < 0)   return 'expired'   // red   — already expired
  if (days < 90)  return 'urgent'    // orange — < 3 months
  if (days < 365) return 'soon'      // gold   — < 12 months
  return 'ok'                        // green
}

const STATUS_COLOUR = {
  expired: '#c0392b',
  urgent:  '#e07b39',
  soon:    '#c9a84c',
  ok:      '#1a3d28',
  none:    '#6b7c6e',
}

const STATUS_LABEL = {
  expired: 'EXPIRED',
  urgent:  'URGENT',
  soon:    'RENEW SOON',
  ok:      'VALID',
  none:    'NO DATE',
}
```

### Supabase Client
```ts
import { createClient } from '@/lib/supabase/client'
```
Project ref: `dytlseyncisxsznhybkj`

### Architecture Rules
- `'use client'` at top · Inline styles only · No Tailwind · No external libraries
- Supabase for persistence · localStorage fallback with key `bayt-documents-v1`
- No SidebarLayout wrapper — page.tsx handles that
- Today's date calculated as: `const TODAY = new Date()`

---

## MODULE — Official Documents Dashboard

**File:** `app/documents/documents-client.tsx`
**Export:** `export default function DocumentsDashboard()`
**Route:** `/documents`
**Arabic:** المستندات الرسمية
**Concept:** A living document register for the Seedat family. Replaces the Excel spreadsheet. Tracks all official documents (passports, IDs, QIDs, driving licences, visas, etc.) with expiry dates, renewal windows, and direct links to the Google Drive folder where scans are stored. The core value is a single glance that tells you what's expired, what needs urgent attention, and what's fine.

---

## DATA MODEL

### Document Types
```ts
type DocType =
  | 'passport'
  | 'sa_id'
  | 'qid'
  | 'q_license'
  | 'driving_license'
  | 'hamad_card'
  | 'visa'
  | 'birth_certificate'
  | 'national_certificate'
  | 'other'

const DOC_TYPE_LABELS: Record<DocType, string> = {
  passport:             'Passport',
  sa_id:                'SA ID',
  qid:                  'QID',
  q_license:            'Q Licence',
  driving_license:      'Driving Licence',
  hamad_card:           'Hamad Card',
  visa:                 'Visa',
  birth_certificate:    'Birth Certificate',
  national_certificate: 'National Certificate',
  other:                'Other',
}

const DOC_TYPE_ICON: Record<DocType, string> = {
  passport:             '🛂',
  sa_id:                '🪪',
  qid:                  '🪪',
  q_license:            '🏥',
  driving_license:      '🚗',
  hamad_card:           '🏥',
  visa:                 '✈️',
  birth_certificate:    '📜',
  national_certificate: '🏅',
  other:                '📄',
}
```

### Document Interface
```ts
interface FamilyDocument {
  id: string
  member_id: string
  doc_type: DocType
  doc_number: string
  country: string           // issuing country
  issued_date: string | null   // ISO date
  expiry_date: string | null   // ISO date (null = no expiry e.g. birth cert)
  is_current: boolean          // false = archived
  drive_link: string | null    // direct Google Drive folder/file link
  notes: string | null
  created_at?: string
}
```

### Family Members (local constant)
```ts
const FAMILY_MEMBERS = [
  { id: 'muhammad', name: 'Muhammad', emoji: '👨', role: 'parent' },
  { id: 'camilla',  name: 'Camilla',  emoji: '👩', role: 'parent' },
  { id: 'yahya',    name: 'Yahya',    emoji: '🧒', role: 'child'  },
  { id: 'isa',      name: 'Isa',      emoji: '🧒', role: 'child'  },
  { id: 'linah',    name: 'Linah',    emoji: '👧', role: 'child'  },
  { id: 'dana',     name: 'Dana',     emoji: '👧', role: 'child'  },
]
```

### Seed Data (hardcode as DEFAULT_DOCS — used if Supabase is empty)
Pre-populate with real family data. All dates in ISO format (YYYY-MM-DD).

```ts
const DEFAULT_DOCS: Omit<FamilyDocument, 'created_at'>[] = [
  // ── MUHAMMAD ──────────────────────────────────────────────
  { id: 'muh-pp-1',  member_id: 'muhammad', doc_type: 'passport',          doc_number: 'A05617498',      country: 'ZA', issued_date: '2016-10-12', expiry_date: '2026-10-11', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-pp-2',  member_id: 'muhammad', doc_type: 'passport',          doc_number: '470948853',      country: 'ZA', issued_date: null,         expiry_date: '2017-02-12', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'muh-pp-3',  member_id: 'muhammad', doc_type: 'passport',          doc_number: 'Unknown',        country: 'ZA', issued_date: '2024-11-12', expiry_date: '2034-11-11', is_current: true,  drive_link: null, notes: 'New SA passport' },
  { id: 'muh-id',    member_id: 'muhammad', doc_type: 'sa_id',             doc_number: '8911275075083',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'muh-qid',   member_id: 'muhammad', doc_type: 'qid',               doc_number: '28971000008',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-ql',    member_id: 'muhammad', doc_type: 'q_license',         doc_number: '',               country: 'QA', issued_date: null,         expiry_date: '2026-04-10', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-hc',    member_id: 'muhammad', doc_type: 'hamad_card',        doc_number: '',               country: 'QA', issued_date: null,         expiry_date: '2026-04-10', is_current: true,  drive_link: null, notes: null },

  // ── CAMILLA ───────────────────────────────────────────────
  { id: 'cam-pp-1',  member_id: 'camilla', doc_type: 'passport',           doc_number: 'M00343006',      country: 'ZA', issued_date: '2021-03-10', expiry_date: '2031-03-09', is_current: true,  drive_link: null, notes: null },
  { id: 'cam-pp-2',  member_id: 'camilla', doc_type: 'passport',           doc_number: 'A01591971',      country: 'ZA', issued_date: null,         expiry_date: '2021-03-01', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'cam-id',    member_id: 'camilla', doc_type: 'sa_id',              doc_number: '9011030342081',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'cam-qid',   member_id: 'camilla', doc_type: 'qid',                doc_number: '29071000221',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },
  { id: 'cam-dl',    member_id: 'camilla', doc_type: 'driving_license',    doc_number: '40630010XL2R',   country: 'ZA', issued_date: null,         expiry_date: '2021-10-04', is_current: false, drive_link: null, notes: 'Expired RSA licence' },

  // ── YAHYA ─────────────────────────────────────────────────
  { id: 'yah-pp-1',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A07912686',      country: 'ZA', issued_date: '2024-02-23', expiry_date: '2029-02-22', is_current: true,  drive_link: null, notes: null },
  { id: 'yah-pp-2',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A03565622',      country: 'ZA', issued_date: null,         expiry_date: '2020-01-20', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'yah-pp-3',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A07304119',      country: 'ZA', issued_date: '2019-07-31', expiry_date: '2024-07-30', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'yah-id',    member_id: 'yahya', doc_type: 'sa_id',                doc_number: '1405205727084',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'yah-qid',   member_id: 'yahya', doc_type: 'qid',                  doc_number: '31471000058',    country: 'QA', issued_date: null,         expiry_date: '2027-01-28', is_current: true,  drive_link: null, notes: null },

  // ── ISA ───────────────────────────────────────────────────
  { id: 'isa-pp-1',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A13032802',      country: 'ZA', issued_date: '2024-11-03', expiry_date: '2029-11-02', is_current: true,  drive_link: null, notes: null },
  { id: 'isa-pp-2',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A03837568',      country: 'ZA', issued_date: '2016-10-12', expiry_date: '2021-10-11', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'isa-pp-3',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A07462887',      country: 'ZA', issued_date: '2021-03-23', expiry_date: '2026-03-22', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'isa-id',    member_id: 'isa', doc_type: 'sa_id',                  doc_number: '1510035594081',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'isa-qid',   member_id: 'isa', doc_type: 'qid',                    doc_number: '31571000048',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },

  // ── LINAH ─────────────────────────────────────────────────
  { id: 'lin-pp-1',  member_id: 'linah', doc_type: 'passport',             doc_number: 'A07716147',      country: 'ZA', issued_date: '2022-12-12', expiry_date: '2027-12-11', is_current: true,  drive_link: null, notes: null },
  { id: 'lin-pp-2',  member_id: 'linah', doc_type: 'passport',             doc_number: 'A07122101',      country: 'ZA', issued_date: '2018-08-29', expiry_date: '2023-08-28', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'lin-id',    member_id: 'linah', doc_type: 'sa_id',                doc_number: '1805291535087',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'lin-qid',   member_id: 'linah', doc_type: 'qid',                  doc_number: '3187100015',     country: 'QA', issued_date: null,         expiry_date: '2027-07-18', is_current: true,  drive_link: null, notes: null },

  // ── DANA ──────────────────────────────────────────────────
  { id: 'dan-pp-1',  member_id: 'dana', doc_type: 'passport',              doc_number: 'A13076295',      country: 'ZA', issued_date: '2025-01-02', expiry_date: '2030-01-01', is_current: true,  drive_link: null, notes: null },
  { id: 'dan-pp-2',  member_id: 'dana', doc_type: 'passport',              doc_number: 'A07424828',      country: 'ZA', issued_date: '2020-08-18', expiry_date: '2025-08-17', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'dan-id',    member_id: 'dana', doc_type: 'sa_id',                 doc_number: '2002221303088',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'dan-qid',   member_id: 'dana', doc_type: 'qid',                   doc_number: '32071000009',    country: 'QA', issued_date: null,         expiry_date: '2026-10-22', is_current: true,  drive_link: null, notes: null },
]
```

### Google Drive Links (placeholder constants — parents will update these in Settings tab)
```ts
const DRIVE_LINKS = {
  passports:            '', // https://drive.google.com/drive/folders/...
  sa_ids:               '',
  birth_certificates:   '',
  qids:                 '',
  visas:                '',
  driving_licenses:     '',
  national_certificates:'',
  attested_documents:   '',
  other:                '',
}
```

---

## TAB STRUCTURE

### Tab 1 — 🚨 Alerts (default)
This is the first thing a parent sees. Purpose: immediate awareness of what needs action.

**Alert tiers (sorted, most urgent first):**

1. **EXPIRED** — red badge · "Expired X days ago"
2. **URGENT** — orange badge · "Expires in X days / Apply by [date]"
3. **RENEW SOON** — gold badge · "Expires in X months"

Each alert card shows:
- Member emoji + name
- Document type icon + label
- Document number (partially masked: first 3 + *** for privacy, toggle to reveal)
- Expiry date formatted as "11 Oct 2026"
- Days/months remaining — exact number, coloured
- "Apply from" date — calculated as 6 months before expiry for passports, 3 months for QIDs/licences
- A "Drive →" link button if drive_link is set (opens in new tab); else a muted "No scan linked" note

**If nothing is expiring within 12 months:**
- Show a calm green card: "All documents are in order. Next renewal: [member] [doc] in [month year]."

**Summary bar at top of Alerts tab:**
```
[N] Expired  ·  [N] Urgent (<90 days)  ·  [N] Due this year  ·  [N] All valid
```
Each number is a clickable filter.

---

### Tab 2 — 👨‍👩‍👧‍👦 By Member
- Horizontal member selector (pill buttons, all 6)
- For selected member: show ALL their documents in a clean table/card list
- Toggle: "Current only" / "Show all (including archived)"
- Each document row:
  - Icon + type label + document number
  - Country flag emoji (🇿🇦 for ZA, 🇶🇦 for QA, etc.)
  - Issue date → Expiry date (or "No expiry")
  - Status pill (EXPIRED / URGENT / RENEW SOON / VALID / NO DATE)
  - Days remaining (coloured)
  - "Apply from" date for expiring docs
  - Drive link button (or placeholder)
  - Edit button (opens inline edit form)
- "+ Add Document" button at bottom — opens add form for that member

---

### Tab 3 — 📋 All Documents
Full table view. All current documents across all family members.

Columns: Member · Type · Number · Country · Issued · Expires · Status · Days Left · Drive

Sort by: Status (default — expired first) · Member · Type · Expiry date

Filter by:
- Status: All / Expired / Urgent / Soon / Valid
- Member: All / individual
- Type: All / Passport / QID / etc.
- Country: All / ZA / QA

Search: free text over doc_number and member name.

Each row has an Edit icon and a Drive icon. Clicking Edit opens an inline edit form (same fields as Add form).

**Archive toggle**: Show/hide archived documents (is_current: false). Archived docs shown with 50% opacity and strikethrough on doc number.

---

### Tab 4 — 🗂️ Drive Links
Purpose: quick-access launcher to all Google Drive document folders.

Display as a 3-column grid of folder cards. Each card:
- Folder icon (📁) + label (e.g. "Passports")
- "Open in Drive →" button (links to DRIVE_LINKS constant)
- If link is empty: "Add link" button → opens inline text input to save link

Folders to show (from the actual Google Drive structure):
- 📁 Passports
- 📁 SA IDs
- 📁 Birth Certificates
- 📁 QIDs
- 📁 Visas
- 📁 National Certificates
- 📁 Driving Licenses
- 📁 Attested Documents
- 📁 Hamad Cards / Medical
- 📁 Other Family Docs

Below the grid: a text input to add a "master folder" link — the top-level `[01] Official Docs` Google Drive folder.

Drive links are persisted to localStorage key `bayt-drive-links-v1`. They do not go to Supabase (they are environment-specific).

---

### Tab 5 — ➕ Add / Edit (modal-style inline panel)
Triggered by "+ Add Document" or any Edit button. Slides up from bottom (transform: translateY) or appears as an overlay panel.

Fields:
- Member (select)
- Document Type (select — DOC_TYPE_LABELS)
- Document Number (text)
- Issuing Country (select: ZA · QA · Other)
- Date of Issue (date input)
- Expiry Date (date input — optional)
- Is Current? (toggle — default true)
- Drive Link (text input — optional)
- Notes (textarea — optional)

On save: upsert to Supabase `family_documents` table. Also update local state immediately (optimistic UI).
On cancel: close panel without saving.
Delete button (red): sets is_current = false (soft archive), does not hard delete.

---

## HELPER FUNCTIONS

### Days to expiry
```ts
function daysToExpiry(expiry: string | null): number | null {
  if (!expiry) return null
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
}
```

### Apply-by date (when to start renewal process)
```ts
function applyByDate(expiry: string | null, docType: DocType): string | null {
  if (!expiry) return null
  const months = docType === 'passport' ? 6 : 3
  const d = new Date(expiry)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split('T')[0]
}
```

### Formatted date display
```ts
function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
```

### Country flag
```ts
function countryFlag(code: string): string {
  const flags: Record<string, string> = { ZA: '🇿🇦', QA: '🇶🇦', UK: '🇬🇧', US: '🇺🇸' }
  return flags[code] ?? '🌍'
}
```

---

## DATA FLOW

### On mount:
1. Load from Supabase `family_documents` table (filter: all records)
2. If Supabase returns empty or errors, fall back to `DEFAULT_DOCS` merged with localStorage `bayt-documents-v1`
3. Sort: current documents first, then by expiry date (soonest first)
4. Set active tab to 'alerts' if any docs are expired or urgent; otherwise 'members'

### On save (add/edit):
1. Upsert to Supabase `family_documents`
2. Update local state immediately
3. Persist current docs to localStorage `bayt-documents-v1`

---

## UI DETAILS

### Alert card layout
```
┌─────────────────────────────────────────────────────┐
│  👨 Muhammad   🛂 Passport         [EXPIRED]         │
│  A05617498     🇿🇦 South Africa                      │
│  Expired 5 months ago · 11 Oct 2026                  │
│  Apply for renewal immediately                       │
│                               [Drive →] [Edit]       │
└─────────────────────────────────────────────────────┘
```

### Status pill style
```ts
// inline style for status pill
const pillStyle = (status: ReturnType<typeof docStatus>) => ({
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: '3px',
  fontSize: '0.65rem',
  fontFamily: F_MONO,
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: C.white,
  background: STATUS_COLOUR[status],
})
```

### Empty state
If no documents at all: show a warm prompt card — "Add your first document to start tracking expiry dates. Start with passports."

---

## SUPABASE SCHEMA

The page.tsx will run this migration separately. Build the component to match this schema:

```sql
CREATE TABLE IF NOT EXISTS public.family_documents (
  id           TEXT PRIMARY KEY,
  member_id    TEXT NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  doc_type     TEXT NOT NULL,
  doc_number   TEXT,
  country      TEXT DEFAULT 'ZA',
  issued_date  DATE,
  expiry_date  DATE,
  is_current   BOOLEAN DEFAULT true,
  drive_link   TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.family_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_family_documents"
  ON public.family_documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

---

## OUTPUT FORMAT

```tsx
// app/documents/documents-client.tsx
'use client'
// ... full file
```

Return the complete, self-contained file. The DEFAULT_DOCS seed data must be fully included. All tabs must be fully built — no stubs. This is a production-quality family document tracker.
