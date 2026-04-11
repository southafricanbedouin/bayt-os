# Gemini Build Prompt — Batch 4
## Modules: School Management · Medical & Health · Transport & Vehicles
### BaytOS — Bayt Seedat, Doha, Qatar

---

## HOW TO USE THIS PROMPT

Read all context. Build **three separate `.tsx` files**. Return in **three labelled code blocks**. No explanation. Just the code.

---

## SHARED CONTEXT

### Family
```
Muhammad Seedat   — Father · Head of Household
Camilla Seedat    — Mother · Partner in Leadership
Yahya Seedat      — Age 11, Eldest Son   → Doha College
Isa Seedat        — Age 10, Second Son   → Doha College
Linah Seedat      — Age 7,  First Daughter → QFS (Qatar Foundation School)
Dana Seedat       — Age 6,  Youngest      → QFS (Qatar Foundation School)
Location: B26 Al Reem Gardens, Al Wajba, Doha, Qatar
```

### Manifesto Values
- **Ilmu** — knowledge is worship; track their learning with intention
- **Taqwa** — the body is an amanah (trust); we care for it
- **Sidq** — honest record-keeping for health
- **Sabr** — raising children is a long game; every small step matters
- Vision 2035: "Yahya leads. Isa builds. Linah gives. Dana creates." — the school years are where this is forged.

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

### Child Accent Colors
```ts
const CHILD_COLORS = {
  yahya: '#4a9eca',   // blue
  isa:   '#c9a84c',   // gold
  linah: '#e07b39',   // orange
  dana:  '#7ab87a',   // soft green
}
```

### Supabase Client
```ts
import { createClient } from '@/lib/supabase/client'
```
Project ref: `dytlseyncisxsznhybkj`

### Architecture Rules
- `'use client'` at top — inline styles only — Supabase + localStorage fallback — no SidebarLayout — loading states — no external UI libraries

---

## SHARED SUPABASE SCHEMA — Batch 4

```sql
-- School subjects per child
CREATE TABLE IF NOT EXISTS public.school_subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    TEXT NOT NULL,          -- 'yahya' | 'isa' | 'linah' | 'dana'
  school      TEXT,                   -- 'doha_college' | 'qfs'
  name        TEXT NOT NULL,
  teacher     TEXT,
  color       TEXT,
  active      BOOLEAN DEFAULT true
);

-- Homework & assignments
CREATE TABLE IF NOT EXISTS public.homework (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    TEXT NOT NULL,
  subject_id  UUID REFERENCES public.school_subjects(id),
  title       TEXT NOT NULL,
  type        TEXT DEFAULT 'homework',  -- 'homework' | 'test' | 'project' | 'reading' | 'other'
  due_date    DATE,
  completed   BOOLEAN DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- School events
CREATE TABLE IF NOT EXISTS public.school_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    TEXT,                   -- null = all children
  school      TEXT,
  title       TEXT NOT NULL,
  event_date  DATE NOT NULL,
  category    TEXT,                   -- 'sports_day' | 'concert' | 'parent_meeting' | 'holiday' | 'exam' | 'other'
  notes       TEXT
);

-- Health records
CREATE TABLE IF NOT EXISTS public.health_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   TEXT NOT NULL,          -- child_id OR 'muhammad' | 'camilla'
  type        TEXT NOT NULL,          -- 'vaccination' | 'checkup' | 'dental' | 'illness' | 'medication' | 'allergy' | 'other'
  title       TEXT NOT NULL,
  date        DATE,
  doctor      TEXT,
  clinic      TEXT,
  notes       TEXT,
  next_due    DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Medications
CREATE TABLE IF NOT EXISTS public.medications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  dosage      TEXT,
  frequency   TEXT,
  start_date  DATE,
  end_date    DATE,
  notes       TEXT,
  active      BOOLEAN DEFAULT true
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  make            TEXT,
  model           TEXT,
  year            INT,
  plate           TEXT,
  color           TEXT,
  icon            TEXT,
  notes           TEXT,
  active          BOOLEAN DEFAULT true
);

-- Vehicle maintenance log
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID REFERENCES public.vehicles(id),
  type        TEXT,               -- 'oil_change' | 'service' | 'tires' | 'wash' | 'repair' | 'registration' | 'other'
  title       TEXT NOT NULL,
  date        DATE,
  mileage_km  INT,
  cost_qar    NUMERIC(8,2),
  notes       TEXT,
  next_due_km INT,
  next_due_date DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- School transport schedule (connects school module to transport)
CREATE TABLE IF NOT EXISTS public.transport_schedule (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    TEXT NOT NULL,
  type        TEXT NOT NULL,      -- 'school_bus' | 'hamilton' | 'parent_drop' | 'other'
  pickup_time TIME,
  dropoff_time TIME,
  pickup_location TEXT,
  dropoff_location TEXT,
  days        TEXT[],             -- ['monday','tuesday','wednesday','thursday','friday']
  notes       TEXT,
  active      BOOLEAN DEFAULT true
);
```

---

## MODULE 1 — School Management
**File:** `app/school/school-client.tsx`
**Arabic:** إدارة المدرسة
**Concept:** Track homework, assignments, tests, school events across Doha College (Yahya, Isa) and QFS (Linah, Dana). The family OS keeps school organised so the parents don't have to hold it all in their heads.

### Default Subjects — Doha College (Yahya & Isa)
English, Maths, Science, Arabic, History, Geography, PE, Art, Music, Computing, French

### Default Subjects — QFS (Linah & Dana)
English, Maths, Science, Arabic, Islamic Studies, PE, Art, Music

### Tabs

**Tab 1 — 📋 Today / This Week**
- Child selector tabs: Yahya | Isa | Linah | Dana
- For selected child: homework due today (highlighted in orange), homework due this week, upcoming tests/projects
- Each item: subject chip (colored), title, type badge, due date, completion checkbox
- Check off → marks complete in Supabase, moves to "done" with strikethrough
- "＋ Add Homework" quick button

**Tab 2 — 📚 All Homework**
- All children's homework in one view
- Filter by child (All | Yahya | Isa | Linah | Dana)
- Filter by status (All | Pending | Completed)
- Filter by type (All | Homework | Test | Project | Reading)
- Sorted by due date ascending
- Overdue items shown in orange with "OVERDUE" badge

**Tab 3 — 🗓️ School Calendar**
- Monthly calendar view
- Dots on days with homework due or school events
- Click a day → list of items for that day
- School events shown with a different color from homework
- "＋ Add Event" button

**Tab 4 — 📖 Subjects**
- Per-child subject list
- Add/edit subjects per child (name, teacher, color)
- Subjects used as color-coded chips throughout the module

**Tab 5 — 🚌 Transport**
- Quick view of each child's school transport schedule
- Links to full Transport module (Batch 4, Module 3)
- Shows: pickup time, type (school bus / Hamilton), pickup location

### UX Notes
- Overdue homework: orange `C.orange` background chip
- Test/exam items: gold badge
- Completed: muted grey with strikethrough
- Empty state: "No homework logged. Enjoy the quiet." (Sabr)

---

## MODULE 2 — Medical & Health
**File:** `app/health/health-client.tsx`
**Arabic:** الصحة والرعاية
**Concept:** The family's health record — vaccinations, checkups, dental, allergies, medications. The body is an amanah. Track it with the same care we give to finances and education.

### Family Members for Health
All 6: muhammad, camilla, yahya, isa, linah, dana
Display names: Muhammad · Camilla · Yahya · Isa · Linah · Dana

### Tabs

**Tab 1 — 👨‍👩‍👧‍👦 Family Overview**
- 6 member cards (2 rows of 3): name, last checkup date, any upcoming appointments, active medications count, allergy count
- "Book Appointment" quick note per member (just a text note/reminder, no external calendar link needed)
- Next due items (sorted by `next_due` date): who, what, when

**Tab 2 — 📋 Health Records**
- Filter by person (All + each family member)
- Filter by type (All | Vaccination | Checkup | Dental | Illness | Medication | Allergy | Other)
- Records table: date, person chip, type badge, title, doctor, clinic, notes, next due
- "＋ Add Record" button → form: person, type, title, date, doctor, clinic, notes, next due date
- Most recent first

**Tab 3 — 💊 Medications**
- All active medications
- Per person: medication name, dosage, frequency, start date, end date (if applicable)
- Toggle active/inactive
- "＋ Add Medication"
- Empty state: "No active medications. Alhamdulillah."

**Tab 4 — 💉 Vaccinations**
- Filtered view of type = 'vaccination'
- Per child: vaccination name, date given, next due
- QR code placeholder / note: "Keep physical vaccination cards in the red folder."
- Standard Qatar/UK vaccination schedule shown as reference (hardcoded):
  - BCG, HepB, DTaP, Hib, IPV, PCV, Rota, MenC, MMR, Varicella, HPV

**Tab 5 — 🏥 Clinics & Doctors**
- Hardcoded + editable list of family's regular clinics/doctors in Doha
- Pre-seeded:
  | Name | Type | Area |
  |------|------|------|
  | Al Ahli Hospital | General | Al Rumaila |
  | Sidra Medicine | Specialist / Paediatrics | Education City |
  | HMC Primary | GP | Multiple |
  | Qatar Dental | Dental | Various |
- Add new clinic: name, type, area, phone, notes

---

## MODULE 3 — Transport & Vehicles
**File:** `app/transport/transport-client.tsx`
**Arabic:** المواصلات
**Concept:** Vehicle maintenance log, school run schedule, drivers and transport coordination. Two cars, two school buses, Hamilton driver. Know what's due, what's been done, and who's going where.

### Default Vehicles (seed if empty)
```
Vehicle 1: Muhammad's Car — Toyota Land Cruiser, 2022, White
Vehicle 2: Camilla's Car  — (make/model/year editable)
```

### Tabs

**Tab 1 — 🚗 Vehicles**
- Card per vehicle: name/nickname, make, model, year, plate, color
- Maintenance status: last service, next service due (km or date), days/km to next service
- Status indicator: 🟢 Good | 🟡 Due soon (< 1000km or < 30 days) | 🔴 Overdue
- "＋ Log Maintenance" button per vehicle → form: type, title, date, mileage, cost, notes, next due
- Edit vehicle details

**Tab 2 — 🔧 Maintenance Log**
- All maintenance records across all vehicles
- Filter by vehicle
- Filter by type (Oil Change | Service | Tires | Repair | Registration | Wash | Other)
- Row: date, vehicle chip, type badge, title, mileage, cost, next due
- Total maintenance spend this year

**Tab 3 — 🚌 School Run**
- Each child's transport arrangement:
  - Yahya: School Bus to Doha College + Hamilton Transport for pickup
  - Isa: School Bus to Doha College + Hamilton Transport for pickup
  - Linah: School Bus to QFS + Hamilton Transport for pickup
  - Dana: School Bus to QFS + Hamilton Transport for pickup
- Editable schedule per child (pickup time, dropoff time, notes)
- Monthly cost reminder: Hamilton (QAR 1,400) + School Bus x2 schools (QAR 1,500)
- Notes field per child for any special instructions

**Tab 4 — 📅 Upcoming**
- All maintenance `next_due_date` items sorted ascending
- All school transport schedule changes or notes
- Alert bar for anything due in next 14 days (gold background warning)

### Visual Notes
- Vehicle cards: use a subtle car icon (use text emoji 🚗 🚙)
- Maintenance type badges: color-coded (oil=orange, service=gold, tires=blue, repair=red, wash=grey)
- School run section: uses child accent colors for each child's row

---

## OUTPUT FORMAT

### File 1 of 3
```tsx
// app/school/school-client.tsx
'use client'
// ... full file
```

### File 2 of 3
```tsx
// app/health/health-client.tsx
'use client'
// ... full file
```

### File 3 of 3
```tsx
// app/transport/transport-client.tsx
'use client'
// ... full file
```
