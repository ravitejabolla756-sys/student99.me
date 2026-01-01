# StuDENt Platform Design Guidelines

## Design Approach: Reference-Based (Productivity + Education Hybrid)

**Primary References:**
- **Notion** - Card-based layouts, clean tool organization, professional simplicity
- **Linear** - Sharp typography, minimal chrome, functional beauty
- **Khan Academy** - Student-friendly, approachable educational aesthetic

**Design Philosophy:** Professional productivity tool that respects students' time with clarity, speed, and zero visual clutter.

---

## Typography System

**Font Stack:**
- Primary: `Inter` (Google Fonts) - All UI, navigation, body text
- Accent: `Space Grotesk` (Google Fonts) - Headlines, hero section only

**Hierarchy:**
- Hero Headline: Space Grotesk, 3.5rem (desktop) / 2.25rem (mobile), font-weight 700
- Page Titles: Inter, 2rem, font-weight 600
- Section Headers: Inter, 1.5rem, font-weight 600
- Tool Card Titles: Inter, 1.125rem, font-weight 600
- Body Text: Inter, 1rem, font-weight 400
- Small Text/Labels: Inter, 0.875rem, font-weight 500

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 8, 12, 16** exclusively
- Component padding: `p-4` or `p-8`
- Section spacing: `py-16` (desktop), `py-12` (mobile)
- Card gaps: `gap-8` (desktop), `gap-4` (mobile)
- Element margins: `m-2`, `m-4`, `mb-8`

**Grid System:**
- Tool Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-8`
- Max container width: `max-w-7xl mx-auto px-8`
- Sidebar width: Fixed `280px` on desktop, hidden on mobile (hamburger menu)

---

## Component Library

### Navigation Components
**Top Navigation Bar:**
- Full-width, sticky, backdrop-blur effect
- Height: `h-16`
- Layout: Logo (left) → Search Bar (center, max-w-2xl) → "All Tools" button (right)
- Search bar: Rounded `rounded-full`, prominent with soft shadow

**Left Sidebar:**
- Fixed position, `w-70` (280px)
- Menu items with icon + text, `p-4` spacing
- Active state: Subtle background highlight
- Collapsed on mobile (hamburger icon reveals overlay)

### Tool Cards
**Design:**
- White background, `rounded-2xl` corners
- Border: `border border-gray-200` (subtle)
- Padding: `p-8`
- Hover: Subtle lift with `shadow-lg` and `scale-105` transform
- Icon area at top (80x80px placeholder or Heroicons icon)
- Title below icon
- Short description (2 lines max)
- Category badge in top-right corner (`text-xs`, `px-3 py-1`, `rounded-full`)

### Buttons
**Primary CTA:**
- `rounded-full`, `px-8 py-3.5`
- Font: Inter, font-weight 600
- Size: `text-base`

**Secondary Buttons:**
- `rounded-lg`, `px-6 py-2.5`
- Outlined style with border

**Tool Action Buttons:**
- `rounded-lg`, full-width or auto-width based on context
- Loading state shows spinner inside button

### Input Fields
**Consistency:**
- All inputs: `rounded-lg`, `border`, `px-4 py-3`
- Focus state: Ring effect `focus:ring-2`
- Labels above inputs with `mb-2` spacing
- File upload: Dashed border drag-drop zone, `p-12` vertical padding

### Category Sections
- Category header with icon (Heroicons)
- Title + tool count ("Calculators (9)")
- Grid of tool cards below with `mt-8`

---

## Landing Page Layout

**Hero Section:**
- Height: `min-h-screen` (full viewport)
- Centered content: `max-w-4xl mx-auto text-center`
- Large hero image (abstract geometric illustration of student tools/workspace, modern, clean)
- Image placement: Background with gradient overlay OR side-by-side split (60% text, 40% image)
- Headline + description + CTA button stack vertically
- Spacing: `space-y-8` between elements

**Features Section:**
- 3-column grid: "Free Forever" | "No Login Required" | "Lightning Fast"
- Each feature: Icon (large, 64px) + Title + Description
- Background: Subtle gradient or pattern

**Tools Preview Section:**
- "Browse by Category" heading
- 4-5 category preview cards in horizontal scroll or 2-column grid
- Each card shows category name + tool count + sample tool names

**Footer:**
- 3-column layout: About | Quick Links | Legal
- Social icons if applicable
- Copyright notice
- Background: Distinct from main content

---

## Dashboard/Tools Page Layout

**Structure:**
```
┌─────────────────────────────────────────┐
│  Top Nav (Logo | Search | All Tools)    │
├─────┬───────────────────────────────────┤
│ S   │                                   │
│ i   │   Category Section 1              │
│ d   │   [Card] [Card] [Card]            │
│ e   │                                   │
│ b   │   Category Section 2              │
│ a   │   [Card] [Card] [Card]            │
│ r   │                                   │
└─────┴───────────────────────────────────┘
```

**Dashboard View:**
- Welcome header: "Welcome to StuDENt" + current date/time
- Quick access: Recently used tools (if applicable, using localStorage)
- All categories displayed sequentially with full tool grids

---

## Individual Tool Pages

**Layout:**
- Breadcrumb navigation: Dashboard > Category > Tool Name
- Tool title + description at top
- Two-column layout (when applicable): Input (left) | Output (right)
- Single column on mobile
- Action buttons always visible, sticky if needed
- Clear "Download" or "Copy" buttons for results

---

## Animations

**Allowed:**
- Page transitions: Fade in `duration-300`
- Tool card hover: `transform scale-105 duration-200`
- Button hover: Subtle brightness/shadow change
- Loading spinners: Standard rotation animation

**Prohibited:**
- Parallax effects
- Auto-playing carousels
- Excessive micro-interactions

---

## Images

**Hero Section Image:**
- Abstract illustration showing student at desk with floating tool icons (calculator, document, timer, notepad)
- Style: Modern, flat design with soft gradients
- Placement: Background with 50% opacity gradient overlay OR right-side split layout
- Dimensions: 1200x800px minimum

**Tool Category Icons:**
- Use Heroicons throughout for consistency
- Calculator: CalculatorIcon
- Image: PhotoIcon
- PDF: DocumentIcon
- Student Tools: AcademicCapIcon
- AI Tools: SparklesIcon

**No other images required** - icon-based design throughout for speed and clarity.

---

## Accessibility & Polish

- All interactive elements have `:focus-visible` states
- Minimum touch target: 44x44px
- Keyboard navigation fully supported
- Loading states for all async operations
- Empty states with helpful guidance
- Error states with clear messaging