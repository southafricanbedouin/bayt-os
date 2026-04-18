# BaytOS v1.1 — Design System

> Polished, learning-platform aesthetic with pastel accents. Sidebar-driven navigation. Accessible, clear hierarchy. Designed for family engagement.

---

## Design Tokens

### Color Palette

#### Core Colors
| Token | Value | Usage |
|-------|-------|-------|
| `white` | `#ffffff` | Primary background, card surfaces |
| `grey-50` | `#f9fafb` | Secondary backgrounds, subtle surfaces |
| `grey-100` | `#f3f4f6` | Tertiary backgrounds, hover states |
| `grey-400` | `#9ca3af` | Secondary text, muted elements, borders |
| `grey-600` | `#4b5563` | Primary text, labels |
| `grey-900` | `#111827` | Headings, strong emphasis |

#### Module Background Colors (Pastel Accents)
| Token | Value | Usage |
|-------|-------|-------|
| `blue-50` | `#f0f9ff` | Dashboard module background |
| `emerald-50` | `#f0fdf4` | Reading/Goals module background |
| `amber-50` | `#fffbeb` | Economy/Shopping module background |
| `pink-50` | `#fdf2f8` | Family/Council module background |
| `purple-50` | `#faf5ff` | Assessments module background |
| `cyan-50` | `#ecf0ff` | Transport module background |
| `orange-50` | `#fff7ed` | Entrepreneurship module background |
| `indigo-50` | `#eef2ff` | Savings module background |
| `teal-50` | `#f0fdfa` | Additional module background |
| `rose-50` | `#fff1f2` | Additional module background |

#### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#10b981` (emerald) | Positive feedback, checkmarks |
| `warning` | `#f59e0b` (amber) | Cautions, pending actions |
| `error` | `#ef4444` (red) | Errors, destructive actions |
| `info` | `#3b82f6` (blue) | Information, notifications |

#### Accent Colors (for mentor/user profiles)
| Token | Value | Usage |
|-------|-------|-------|
| `user-blue` | `#3b82f6` | Primary user avatar background |
| `user-pink` | `#ec4899` | Secondary user avatar background |
| `user-emerald` | `#10b981` | Tertiary user avatar background |
| `user-amber` | `#f59e0b` | Quaternary user avatar background |

### Typography

#### Font Families
- **Primary**: System font stack (San Francisco, Segoe UI, or Helvetica)
  - Weights: 700 (bold), 600 (semibold), 500 (medium), 400 (regular)
  - Styles: Normal
  - Use: Headings, navigation, labels, strong emphasis

- **Body**: System font stack (readable defaults)
  - Weights: 400 (regular), 500 (medium)
  - Styles: Normal
  - Use: Body copy, descriptions, UI text

- **Data/Mono**: IBM Plex Mono
  - Weights: 400, 500, 700
  - Use: Numbers, codes, tabular data, duration text

#### Type Scale
| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|----|
| `h1` | 28px | 700 | 1.2 | -0.5px | Page section titles |
| `h2` | 24px | 700 | 1.3 | 0 | Card titles, module names |
| `h3` | 18px | 600 | 1.4 | 0 | Subheadings, section titles |
| `body-lg` | 16px | 600 | 1.5 | 0 | Mentor names, emphasis |
| `body` | 15px | 400 | 1.6 | 0 | Primary body text, descriptions |
| `body-sm` | 14px | 400 | 1.5 | 0 | Secondary text, metadata |
| `label` | 13px | 500 | 1.4 | 0.25px | Labels, badge text, captions |
| `caption` | 12px | 400 | 1.4 | 0 | Micro text, secondary metadata |

### Spacing System

**Base Unit**: 4px (using Tailwind scale)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro spacing (icon padding) |
| `space-2` | 8px | Tight spacing (between inline elements) |
| `space-3` | 12px | Small gaps |
| `space-4` | 16px | Standard gaps (card padding, button padding) |
| `space-5` | 20px | Medium gaps |
| `space-6` | 24px | Card gaps, section spacing |
| `space-8` | 32px | Large gaps, section dividers |
| `space-12` | 48px | Extra large gaps |
| `space-16` | 64px | Major section spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small icons, mini badges |
| `radius-md` | 8px | Standard elements (inputs, small cards) |
| `radius-lg` | 12px | Large elements (card images, containers) |
| `radius-xl` | 16px | Feature cards, major containers |
| `radius-full` | 9999px | Circular avatars, pill badges |

### Elevation & Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| `none` | none | Flat backgrounds, base surfaces |
| `sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle hover states |
| `md` | 0 4px 6px rgba(0,0,0,0.07) | Cards, buttons |
| `lg` | 0 10px 15px rgba(0,0,0,0.1) | Dropdowns, elevated cards |
| `xl` | 0 20px 25px rgba(0,0,0,0.15) | Modals, popovers |

---

## Component System

### Buttons

#### Variants
- **Primary** (blue): Main actions, calls-to-action
  - Background: `#3b82f6`, Text: white
  - Padding: 10px 20px
  - Border-radius: 8px
  - Font-weight: 500 (medium)

- **Secondary** (outlined): Alternative actions, filters
  - Background: transparent, Border: 1px grey-300
  - Text: grey-600
  - Padding: 10px 16px
  - Border-radius: 8px

- **Ghost** (transparent): Minimal actions
  - Background: transparent
  - Text: grey-600
  - Padding: 10px 12px
  - Hover: background grey-50

- **Danger** (red): Destructive actions
  - Background: `#ef4444`, Text: white

#### States
- Default: Solid color, clear affordance
- Hover: Opacity +0.9, shadow sm, scale 1.02
- Active: Opacity 0.95, shadow md
- Disabled: Opacity 50%, cursor not-allowed
- Loading: Opacity 0.7, with spinner indicator

#### Sizes
- Small (32px height): `text-sm`, padding 8px 16px
- Medium (40px height): `text-base`, padding 10px 20px (default)
- Large (48px height): `text-base`, padding 12px 24px

### User Avatars

- **Size variants**: 32px (sidebar), 48px (mentor cards), 64px (profile)
- **Colors**: blue, pink, emerald, amber (assigned per user)
- **Border-radius**: full (circular)
- **Border**: 2px white outline for elevated effect
- **Text**: Initials, white, font-weight 600

### Input Fields

#### Search Input
- **Background**: grey-50
- **Border**: 1px grey-200
- **Border-radius**: 8px
- **Padding**: 10px 16px
- **Placeholder**: grey-400, font-size 14px
- **Focus**: border blue-400, shadow sm
- **Icon**: grey-400 (left-aligned)

#### Filter Buttons
- Variant: Secondary
- Display: Inline, horizontal spacing 12px
- Hover: background grey-100
- Active: blue background, white text, blue border

#### Dropdown/Select
- **Default state**: grey-50 background, grey-600 text
- **Hover**: background grey-100
- **Focus**: blue border, blue shadow sm
- **Disabled**: grey-300, cursor not-allowed

#### States
- Default, focused (blue border + shadow), filled, disabled, error, success

### Mentor Card

#### Structure
```
┌─────────────────────────────┐
│   [Avatar Circle 48px]      │ ← User avatar (blue/pink/emerald/amber)
│                             │
│   Name (h3, 18px, 600)      │
│   Role/Title (body-sm)      │
│                             │
│   [Follow Button]           │ ← Primary blue button
└─────────────────────────────┘
```

#### Styling
- **Width**: Flexible grid (4 columns on desktop)
- **Background**: white
- **Border**: 1px grey-100
- **Border-radius**: 12px
- **Padding**: 20px
- **Shadow**: md on hover
- **Hover**: scale 1.02, shadow lg, transition 300ms

#### Avatar
- **Size**: 48px
- **Border-radius**: full
- **Background**: user-blue | user-pink | user-emerald | user-amber
- **Text**: white, bold, initials

#### Button
- **Type**: Primary
- **Size**: Medium
- **Full-width**: Yes

### Module Card

#### Structure
```
┌──────────────────────────────┐
│ [Colored Background 160px]   │ ← Pastel color (blue-50, emerald-50, etc.)
│    with Emoji Icon (5xl)     │
│                              │
│ Title (h2, 24px, 700)        │
│ Category/Instructor (body)   │
│                              │
│ [Module Count] [Duration]    │ ← Metadata, body-sm
│ [Difficulty Badge]           │
│                              │
│ ★ 4.8 (120 reviews)          │ ← Rating, body-sm
└──────────────────────────────┘
```

#### Styling
- **Width**: Flexible grid (5 columns on desktop, 2 on tablet, 1 on mobile)
- **Background**: white
- **Border**: 1px grey-100
- **Border-radius**: 12px
- **Padding**: 0 (background) + 20px (content)
- **Shadow**: md default, lg on hover
- **Hover**: scale 1.05, shadow xl, transition 300ms
- **Cursor**: pointer, group hover effect

#### Background Area
- **Height**: 160px
- **Border-radius**: 12px 12px 0 0
- **Background**: One of 10 pastel colors
- **Display**: flex items-center justify-center
- **Emoji Icon**: text-5xl, opacity-60

#### Content Area
- **Padding**: 20px
- **Spacing**: 12px between elements

#### Difficulty Badge
- **Beginner**: emerald-100 bg, emerald-700 text
- **Intermediate**: amber-100 bg, amber-700 text
- **Master**: purple-100 bg, purple-700 text
- **Padding**: 4px 12px
- **Border-radius**: full (pill)
- **Font-size**: label (12px)
- **Font-weight**: 500

### Cards (General)

#### Variants
- **Default**: White bg, subtle shadow md
- **Elevated**: White bg, shadow lg (on hover)
- **Ghost**: grey-50 bg, no shadow, border grey-100
- **Minimal**: Border-only, no background

#### Structure
- Header (title, optional icon)
- Content (flexible body)
- Footer (optional actions)

### Navigation

#### Sidebar
- **Width**: 240px (fixed on desktop, hidden on mobile)
- **Background**: white
- **Border-right**: 1px grey-100
- **Z-index**: 40 (sticky positioning)

**Structure:**
```
┌──────────────────────┐
│ BaytOS Logo (h3)     │ ← 20px padding top/bottom
│                      │
│ ────────────────     │ ← Divider grey-100
│                      │
│ GENERAL              │ ← Section header, label (13px), grey-500
│ ✓ Overview          │ ← Active: blue bg, blue text, 8px border-radius
│   Explore            │ ← Inactive: grey-600 text, hover grey-50
│   My Courses         │
│   Favorite           │
│                      │
│ ────────────────     │
│ FAMILY               │
│   Top Members        │
│   Followed           │
│                      │
│ ────────────────     │
│ RESOURCES            │
│   Help Center        │
│   Settings           │
│                      │
│ [Close Button]       │ ← Mobile only, top-right
└──────────────────────┘
```

**Menu Item Styling:**
- **Default**: grey-600 text, padding 12px 16px
- **Hover**: grey-50 background
- **Active**: blue-100 background, blue-600 text (or blue-50 bg with blue text)
- **Font-size**: body (15px)
- **Font-weight**: 500 (medium)
- **Icon**: 20px, left margin 0, right margin 8px
- **Border-radius**: 8px
- **Transition**: 200ms

#### Breadcrumbs
- **Display**: Above main content (mobile-only on small screens)
- **Separator**: `/` (forward slash)
- **Last item**: Non-interactive, grey-900
- **Previous items**: Interactive, blue-600 (links)
- **Spacing**: 8px between items
- **Font-size**: body-sm (14px)

#### Tabs
- **Variant**: Underline (active indicator below text)
- **Height**: 48px
- **Padding**: 0 16px
- **Border-bottom**: 3px solid blue (active tab)
- **Inactive**: grey-400 text
- **Active**: grey-900 text, blue underline
- **Hover**: grey-50 background
- **Keyboard navigation**: Tab, Shift+Tab, arrows

### Data Display

#### Tables
- **Header**: grey-100 background, grey-900 text, font-weight 600
- **Rows**: 
  - Default: white background
  - Striped: alternating grey-50
  - Hover: grey-100 background
- **Borders**: 1px grey-200 horizontal dividers
- **Sortable headers**: pointer cursor, arrow icon on hover
- **Pagination**: centered, with page numbers and prev/next buttons

#### Lists
- **Ordered/Unordered**: 
  - Marker color: grey-400
  - Text: grey-900
  - Spacing: 8px between items
- **Icon support**: 20px icons, grey-400 default
- **Condensed**: 8px vertical spacing (compact lists)
- **Spacious**: 16px vertical spacing (readable lists)
- **Hover states**: grey-50 background, subtle highlight

### Feedback

#### Toast/Notification
- **Variants**: Success (emerald), Error (red), Warning (amber), Info (blue)
- **Position**: Bottom-right corner, 16px from edges
- **Width**: 320px (max)
- **Padding**: 16px
- **Border-radius**: 8px
- **Shadow**: lg
- **Auto-dismiss**: 4s default (configurable)
- **Action button**: Support for secondary action (e.g., "Undo")
- **Stacking**: Max 3 visible, additional queue below

**Colors:**
- Success: bg emerald-50, border emerald-200, icon emerald-600, text grey-900
- Error: bg red-50, border red-200, icon red-600, text grey-900
- Warning: bg amber-50, border amber-200, icon amber-600, text grey-900
- Info: bg blue-50, border blue-200, icon blue-600, text grey-900

#### Modal/Dialog
- **Width**: 480px (max), 90vw on mobile
- **Background**: white
- **Border-radius**: 12px
- **Shadow**: xl
- **Padding**: 32px (header + body), 24px (footer)
- **Header**: h2 title, optional description
- **Body**: Flexible content area
- **Footer**: Left-aligned close button (optional), right-aligned action buttons
- **Keyboard**: Escape to close, Tab for focus trapping
- **Overlay**: Dark semi-transparent (bg-black/50)

#### Loading States
- **Spinner**: Blue rotating circle, 32px (default), 16px (compact)
- **Skeleton screens**: grey-200 animated shimmer (2s duration)
- **Progress bar**: Blue bar with grey-100 background, rounded corners, height 4px
- **Text overlay**: "Loading...", body-sm, grey-600, centered above spinner

---

## Icon System

### Module Card Icons (Emoji)
Used in module card background areas (160px colored boxes):

- **Dashboard** 🏠 (House)
- **Reading** 📚 (Open book)
- **Economy** 💰 (Money bag)
- **Goals** 🎯 (Target/Bullseye)
- **Family Council** 👨‍👩‍👧‍👦 (Family)
- **Assessments** 📊 (Bar chart)
- **Shopping** 🛒 (Shopping cart)
- **Transport** ✈️ (Airplane)
- **Savings** 🐷 (Piggy bank)
- **Entrepreneurship** 💼 (Briefcase)

**Emoji Display:**
- **Size**: 5xl (60px effective)
- **Opacity**: 60% (creating subtle, clean appearance)
- **Container**: 160px height, pastel background
- **Alignment**: Centered both horizontally and vertically

### UI Icons (SVG, minimal-icons.tsx)

#### Navigation Icons (20px base)
- `menu` — Hamburger menu (3 horizontal lines)
- `home` — House outline
- `settings` — Gear icon
- `user` — Person outline
- `bell` — Notification bell
- `search` — Magnifying glass
- `close` — X icon
- `back` — Left arrow

#### Action Icons
- `edit` — Pencil
- `delete` — Trash can
- `copy` — Duplicate squares
- `download` — Down arrow + line
- `upload` — Up arrow + line
- `share` — Export arrow
- `more` — Three dots

#### Status Icons
- `check` — Checkmark (green for success)
- `error` — X circle (red for errors)
- `warning` — Exclamation triangle (amber for warnings)
- `info` — Information circle (blue for info)
- `lock` — Padlock
- `unlock` — Open padlock

### Icon Properties
- **Stroke width**: 1.5px (SVG icons)
- **Stroke linecap**: Round
- **Stroke linejoin**: Round
- **Fill**: 
  - Navigation/UI: currentColor (grey-600 default)
  - Success: emerald-600
  - Error: red-600
  - Warning: amber-600
  - Info: blue-600
- **Size variants**: 16px, 20px, 24px, 32px
- **Color**: Semantic (success=green, error=red, warning=amber, info=blue)

---

## Component Hierarchy

### Page Level (Main Layout)
```
Page
├── Sidebar (240px fixed, left)
│  ├── Logo/Branding
│  ├── Section 1: General
│  │  ├── Overview (active)
│  │  ├── Explore
│  │  ├── My Courses
│  │  └── Favorite
│  ├── Section 2: Family
│  │  ├── Top Members
│  │  └── Followed
│  └── Section 3: Resources
│     ├── Help Center
│     └── Settings
│
└── Main Content Area (flex-grow, 1fr)
   ├── Header (sticky)
   │  ├── Title (h1, "Overview")
   │  ├── Search Input
   │  ├── Filter Buttons (Level, Category, Sort)
   │  ├── Upgrade Button (Primary)
   │  ├── Settings Icon
   │  └── User Avatar
   │
   ├── Family Members Section
   │  ├── Section Title (h2, "Top Family Members")
   │  └── Mentor Cards Grid (4 columns on desktop)
   │     ├── Mentor Card 1
   │     ├── Mentor Card 2
   │     ├── Mentor Card 3
   │     └── Mentor Card 4
   │
   └── Life Systems Section
      ├── Section Title (h2, "Life Systems")
      └── Module Cards Grid (5 columns on desktop, 2 on tablet, 1 on mobile)
         ├── Module Card 1: Dashboard
         ├── Module Card 2: Reading
         ├── Module Card 3: Economy
         ├── Module Card 4: Goals
         ├── Module Card 5: Council
         ├── Module Card 6: Assessments
         ├── Module Card 7: Shopping
         ├── Module Card 8: Transport
         ├── Module Card 9: Savings
         └── Module Card 10: Entrepreneurship
```

### Mentor Card Component
```
MentorCard
├── Avatar (48px circle)
├── Name (h3)
├── Role/Title (body-sm)
└── Follow Button (Primary)
```

### Module Card Component
```
ModuleCard
├── Background Area (160px colored box)
│  └── Emoji Icon (5xl)
├── Content Area
│  ├── Title (h2)
│  ├── Instructor/Category (body)
│  ├── Metadata Row
│  │  ├── Module Count (body-sm)
│  │  └── Duration (body-sm)
│  ├── Difficulty Badge
│  └── Rating + Reviews (body-sm)
```

### Form Level
```
Form
├── Form Group (multiple)
│  ├── Label + Helper Text (optional)
│  ├── Input/Select/Textarea
│  ├── Error/Success Message
│  └── Hint Text (optional)
└── Form Actions (buttons)
   ├── Submit Button (Primary)
   └── Cancel Button (Secondary)
```

---

## Usage Guidelines

### Color Usage

**Navigation & Interactive:**
- **Blue (#3b82f6)**: Primary buttons, links, active states, accents
- **Grey-600**: Primary text, secondary interactive elements
- **Grey-900**: Headings, strong emphasis

**Surfaces & Backgrounds:**
- **White**: Card backgrounds, primary surfaces
- **Grey-50**: Secondary backgrounds, subtle hover states
- **Grey-100**: Tertiary backgrounds, disabled states

**Semantic Feedback:**
- **Success (Emerald #10b981)**: Positive feedback, checkmarks, confirmations
- **Warning (Amber #f59e0b)**: Cautions, pending actions, alerts
- **Error (Red #ef4444)**: Errors, destructive actions, warnings
- **Info (Blue #3b82f6)**: Information, notifications, helpful hints

**Module Card Backgrounds (Pastel Accents):**
- Use the 10 pastel colors (blue-50, emerald-50, etc.) for visual diversity
- One color per module type (Dashboard always blue-50, Reading always emerald-50, etc.)
- Maintains consistency while creating visual interest

**User Avatars:**
- Rotate through 4 colors (blue, pink, emerald, amber) per user
- Consistent per session (same user always same color)
- Creates visual identity in mentor cards and sidebar

### Spacing
- **Minimum tap target**: 44x44px (buttons, interactive elements)
- **Card padding**: 20px (comfortable reading)
- **Button padding**: 10px 20px (medium), 12px 24px (large)
- **Gap between cards**: 16px-24px (grid layout)
- **Section spacing**: 32px-48px (major sections)
- **Sidebar menu items**: 12px vertical, 16px horizontal padding

### Typography
- **Heading hierarchy**: h1 (28px) > h2 (24px) > h3 (18px) (never skip levels)
- **Body text**: `body` (15px) for primary, `body-lg` (16px) for emphasis
- **Secondary text**: `body-sm` (14px) for captions, metadata
- **Labels**: `label` (13px, font-weight 500) for form labels, badges
- **Max line length**: 60-80 characters for readability (optimal for learning platforms)

### Icons
- **Emoji icons in module cards**: 5xl size (60px), 60% opacity, centered
- **SVG icons in UI**: 20px standard, 24px for buttons, 32px for header icons
- **Always pair with text labels** (for accessibility and clarity)
- **Color semantics**:
  - Navigation icons: currentColor (inherit from text)
  - Success indicators: emerald-600
  - Error indicators: red-600
  - Warning indicators: amber-600
  - Info indicators: blue-600
- **Consistency**: Same icon always represents same action/feature

### Grid & Responsive Layout
- **Sidebar**: 240px fixed (desktop), hidden (mobile < 768px)
- **Main content**: Flex-grow to fill available space
- **Module cards**: 5 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Mentor cards**: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch/Mobile**: Buttons minimum 44x44px, increased spacing (16px-24px), larger fonts (14px body minimum)

### Accessibility
- **Contrast**: All text meets WCAG AA (4.5:1 for text, 3:1 for UI)
- **Focus states**: Clear blue outline for keyboard navigation
- **Semantic HTML**: Use heading tags, nav, main, article, footer
- **ARIA labels**: For icon-only buttons, interactive regions
- **Color not alone**: Use icons, patterns, or text alongside color for meaning
- **Keyboard navigation**: Tab through sidebar, menu items, buttons; Escape to close modals

---

## Design Principles

1. **Polished & Professional** — Clean, refined aesthetic that builds trust and engagement
2. **Accessible & Clear** — WCAG 2.1 AA compliance, semantic HTML, keyboard navigation
3. **Family-Focused** — Visual identity for family members, celebration of relationships
4. **Content-First** — Grid layout prioritizes module/course discovery and engagement
5. **Responsive** — Works beautifully on all screen sizes (mobile-first approach)
6. **Intentional Color** — Pastel accents create visual interest without overwhelming
7. **Spacious & Breathable** — Generous whitespace prevents cognitive overload
8. **Cultural** — Support Arabic and English equally (future phases)
9. **Performance** — Fast load times, smooth transitions, optimized assets
10. **Consistent** — Unified design language across all pages and components
