# Handoff: Task Manager UI Kit

## Overview

This is the full UI kit for **Task Manager** — a project and task management web application styled after the monday.com Vibe design system. It covers user registration/sign-in, a project dashboard, a Kanban board with filtering and sorting, and a "create task" modal.

The goal is to help a developer build this product in a real codebase (React, Next.js, Vue, etc.) using this design as a pixel-perfect reference.

---

## About the Design Files

The files in this bundle are **HTML design prototypes** — high-fidelity interactive mockups showing the intended look, layout, and behavior of the application. They are **not** production code to copy directly.

Your task is to **recreate these designs in your target codebase** using its established framework, libraries, and patterns. If starting from scratch, **React + Next.js + Tailwind CSS** is the recommended stack for this design.

Open `Task Manager.dc.html` in any browser to interact with the full prototype.

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, border radii, shadows, and interactions are final. Recreate the UI pixel-perfectly. The prototype includes working interactions (navigation, dark mode, filtering, task creation) — match this behavior exactly.

---

## Design System: Vibe (monday.com)

This UI is built on the **Vibe design system** by monday.com.

- **Fonts:** `Poppins` (headings) · `Figtree` (all UI text) — both on Google Fonts
- **Primary brand color:** `#0073EA`
- **Neutral ink:** `#323338`
- **App canvas (light):** `#F6F7FB`
- **White surface:** `#FFFFFF`

Load fonts in your project:
```html
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Design Tokens

### Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `app-bg` | `#F6F7FB` | `#111218` | Page / canvas background |
| `surface` | `#FFFFFF` | `#1C1E2E` | Cards, sidebar, topbar |
| `surface-alt` | `#F0F1F7` | `#242636` | Input backgrounds, hover zones |
| `surface-hover` | `rgba(103,104,121,0.08)` | `rgba(255,255,255,0.05)` | Button/row hover overlay |
| `border` | `#D0D4E4` | `#2C2F46` | Dividers, card borders |
| `border-ui` | `#C3C6D4` | `#38395A` | Input borders |
| `ink` | `#323338` | `#EAEDF6` | Primary text |
| `secondary` | `#676879` | `#7C80A0` | Labels, secondary text, icons |
| `placeholder` | `#A8ABBD` | `#484B6A` | Input placeholder, kbd hints |
| `header-bg` | `#FFFFFF` | `#191B2A` | Top navigation bar |
| `blue` | `#0073EA` | `#0073EA` | Primary brand, CTAs, links |
| `blue-hover` | `#0060B9` | `#0060B9` | CTA hover state |
| `blue-surface` | `#E6EFFC` | `#0D2550` | Selected/active bg tint |
| `blue-selected` | `#CCE5FF` | `#1A3A6E` | Selected item highlight |

### Status Colors (Kanban Columns)

| Status | Color |
|---|---|
| Not Started | `#C4C4C4` |
| Working on it | `#FDAB3D` |
| In Review | `#579BFC` |
| Done | `#00C875` |
| Stuck | `#DF2F4A` |

### Priority Colors (Task Cards — left border + badge)

| Priority | Text/Border | Background tint |
|---|---|---|
| Critical | `#DF2F4A` | `rgba(223,47,74,0.1)` |
| High | `#784BD1` | `rgba(120,75,209,0.1)` |
| Medium | `#0073EA` | `rgba(0,115,234,0.1)` |
| Low | `#8B95A6` | `rgba(139,149,166,0.1)` |

### Tag Colors

| Tag | Background | Text |
|---|---|---|
| Design | `rgba(162,93,220,0.12)` | `#784BD1` |
| Dev | `rgba(0,115,234,0.1)` | `#0073EA` |
| Research | `rgba(0,133,77,0.1)` | `#00854D` |

### Typography

| Role | Font | Size | Weight | Line-height | Usage |
|---|---|---|---|---|---|
| Display | Poppins | 26–28px | 600 | 32px | Page headings |
| H2 | Poppins | 19–22px | 600 | 26px | Board/section titles |
| H3 | Poppins | 15–16px | 600 | 20px | Card section labels, modal titles |
| Stat number | Poppins | 28px | 700 | 1 | Dashboard stat values |
| Body / UI | Figtree | 14px | 400 | 20px | General UI text |
| Label | Figtree | 13px | 400–500 | 1 | Sidebar items, toolbar buttons |
| Caption | Figtree | 12px | 400 | 1 | Dates, counts, helper text |
| Micro label | Figtree | 11px | 500–600 | 1 | Filter section headings (uppercase + letter-spacing: 0.05em) |
| Brand name | Poppins | 16–21px | 600 | 1 | "Task Manager" wordmark in topbar/auth |

### Spacing

Use an 8px base grid: `4 · 8 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 24 · 26 · 30 · 32 · 36 · 40`

### Border Radius

| Name | Value | Usage |
|---|---|---|
| `xs` | `3–4px` | Tags, priority badges |
| `sm` | `7–8px` | Buttons, inputs, sidebar nav items |
| `md` | `9–10px` | Kanban cards, kanban column headers |
| `lg` | `12px` | Stat cards |
| `xl` | `14px` | Project cards |
| `2xl` | `16px` | Modals, filter panel apply button |
| `3xl` | `20px` | Auth card |
| `pill` | `9999px` | Tag/count badges |
| `full` | `50%` | Avatars |

### Shadows

```css
/* CTA button */
box-shadow: 0 2px 10px rgba(0,115,234,0.3);

/* Auth card */
box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px var(--border);

/* Modal */
box-shadow: 0 24px 80px rgba(0,0,0,0.28);

/* Kanban card hover */
box-shadow: 0 4px 14px rgba(0,0,0,0.08);

/* Project card hover */
box-shadow: 0 8px 24px rgba(0,0,0,0.09);
```

### Animations

```css
/* Page transitions */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

/* Auth card / modal pop-in */
@keyframes popIn {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to   { opacity: 1; transform: none; }
}

/* Filter panel */
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: none; }
}
```

Durations: `150ms` (fast), `200–250ms` (standard), `300–350ms` (bouncy pop). Easing: `cubic-bezier(0.4,0,0.2,1)` for standard, `cubic-bezier(0.34,1.4,0.64,1)` for the auth card/modal spring.

---

## Screens

---

### 1. Sign In

**Route:** `/login`  
**Purpose:** Existing users authenticate.

#### Layout
- Full-screen centered layout, `min-height: 100vh`, `background: app-bg`
- Two decorative radial gradient blobs (top-right blue, bottom-left purple) — purely decorative, `pointer-events: none`
- Dark mode toggle button: `position: absolute; top: 20px; right: 20px` — 36×36px, `border-radius: 8px`, `border: 1px solid var(--border)`, `background: var(--surface)`
- Card: `width: 100%; max-width: 420px; padding: 40px; border-radius: 20px`; animated with `popIn` on mount

#### Card contents (top to bottom)
1. **Logo row** — 38×38px blue rounded square icon (`border-radius: 10px`, `background: #0073EA`, `box-shadow: 0 4px 12px rgba(0,115,234,0.32)`) with a checkmark SVG + wordmark `"Task Manager"` in Poppins 600 21px
2. **Heading** — `"Welcome back"`, Poppins 600 22px, centered
3. **Subheading** — `"Sign in to continue"`, Figtree 400 14px, `color: secondary`, centered
4. **Email input** — label `"EMAIL"` (uppercase, letter-spacing 0.05em, 11px 500), `height: 42px`, `border-radius: 8px`, `border: 1.5px solid border-ui`, `background: surface-alt`
5. **Password input** — label row has `"PASSWORD"` (same style) left + `"Forgot?"` link right (`color: #0073EA`, 12px)
6. **Sign in button** — `height: 44px`, `border-radius: 8px`, `background: #0073EA`, `color: #fff`, Figtree 600 15px, `box-shadow: 0 4px 14px rgba(0,115,234,0.3)`, full width. `hover: background: #0060B9`
7. **Divider** — `"or continue with"` with horizontal lines
8. **Google OAuth button** — `height: 42px`, outlined (`border: 1.5px solid border`), Google SVG logo + `"Google"` text
9. **Switch link** — `"No account yet? Create one →"` with blue link

#### Navigation
- Click **Sign in** → `/dashboard`
- Click **Create one →** → switch to Sign Up view (same page/card, animate transition)

---

### 2. Sign Up

**Route:** `/register`  
**Purpose:** New users create an account.

#### Layout
Same auth card layout as Sign In. Card animates with `popIn`.

#### Card contents
1. Logo row (same as Sign In)
2. **Heading** — `"Get started free"`, Poppins 600 22px
3. **Subheading** — `"No credit card required"`, secondary, 14px
4. **Full name** input — label `"FULL NAME"`, `placeholder: "Robin Baker"`
5. **Work email** input — label `"WORK EMAIL"`
6. **Password** input — label `"PASSWORD"`, `placeholder: "Min. 8 characters"`
7. **Terms checkbox row** — 16×16px checkbox (`accent-color: #0073EA`) + label with inline `"Terms of Service"` and `"Privacy Policy"` links in blue
8. **Create account button** — same blue primary CTA style as Sign In
9. **Switch link** — `"Already have an account? Sign in"`

#### Navigation
- Click **Create account** → `/dashboard`
- Click **Sign in** → switch to Sign In view

---

### 3. Dashboard

**Route:** `/dashboard`  
**Purpose:** Overview of all projects and task stats.

#### App Shell Layout
```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR (height: 52px)                                  │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │   MAIN CONTENT (overflow-y: auto)        │
│  (236px)     │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

#### Topbar (height: 52px, background: header-bg, border-bottom: 1px solid border)
- **Left:** Logo icon (28×28px, `border-radius: 7px`, blue) + `"Task Manager"` wordmark Poppins 600 16px
- **Center-right:** Search pill — `width: 200px; height: 32px`, `border: 1px solid border`, `border-radius: 7px`, `background: surface-alt`, with search icon, `"Search…"` text, and `"⌘K"` badge
- **Right actions (left to right):**
  - Bell icon button 34×34px — has a 6×6px red dot badge (`background: #DF2F4A`, `border: 2px solid header-bg`) at top-right
  - Dark mode toggle 34×34px — shows moon icon in light mode, sun icon in dark mode; clicking swaps the entire theme
  - Help icon button 34×34px
  - 1px vertical divider, `height: 20px`
  - Avatar 30×30px circle — `background: #A25DDC`, `color: #fff`, Figtree 700 11px, initials `"RB"`

All topbar icon buttons: `border: none; background: none; border-radius: 7px`. Hover: `background: surface-hover`

#### Sidebar (width: 236px, background: surface, border-right: 1px solid border)
- **Top nav section** (padding: `10px 8px 4px`) — three nav items: Dashboard (home icon), My tasks (check icon), Favorites (star icon)
  - Each: `height: 34px; padding: 0 10px; border-radius: 7px; font: 400 13px; color: secondary`
  - Active state (Dashboard when on dashboard): `background: surface-alt; color: #0073EA; font-weight: 600`
  - Hover: `background: surface-hover`
- **Divider:** `height: 1px; background: border; margin: 4px 12px`
- **Projects section** — section header: `"PROJECTS"` label Figtree 600 11px uppercase + `+` icon button (blue, 20×20px)
- **Project list items** — each 32px tall, `border-radius: 7px`, 9×9px colored dot (`border-radius: 2px`) + project name truncated
  - Active project: `background: surface-alt; color: #0073EA; font-weight: 600`
  - Hover: `background: surface-hover`
- **"+ New project"** button at bottom — `color: #0073EA; font-weight: 500`

#### Dashboard Main Content (padding: `30px 36px`, overflow-y: auto)

**Greeting row (margin-bottom: 26px):**
- H1: `"Good morning, Robin"`, Poppins 600 26px, letter-spacing -0.02em
- Subtitle: Figtree 400 14px secondary — `"X tasks in progress · Y stuck"` with blue/red colored numbers
- Right: `"New project"` button — `height: 38px; padding: 0 18px; background: #0073EA; border-radius: 8px`

**Stats row (4-column grid, gap: 13px, margin-bottom: 30px):**

Each stat card: `background: surface; border: 1px solid border; border-radius: 12px; padding: 18px 20px`

| Card | Icon bg | Icon stroke | Stat | Sub-text color |
|---|---|---|---|---|
| Total tasks | `#E6EFFC` | `#0073EA` | `tasks.length` | secondary |
| Completed | `rgba(0,200,117,0.12)` | `#00854D` | `done count` | `#00854D` |
| In progress | `rgba(253,171,61,0.12)` | `#C47B00` | `working count` | `#C47B00` |
| Stuck | `rgba(223,47,74,0.1)` | `#D83A52` | `stuck count` | `#D83A52` |

Each card layout (flex column, gap 10px):
1. Row: micro label (uppercase 11px) + icon badge (30×30px, `border-radius: 8px`)
2. Stat number: Poppins 700 28px, `letter-spacing: -0.02em`
3. Change caption: Figtree 400 11px

**Projects section header:** "All projects" Poppins 600 15px + "Sort" button (outlined, 30px tall)

**Project grid:** `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 13px`

Each project card (`background: surface; border: 1px solid border; border-radius: 14px; overflow: hidden`):
1. **Color top stripe:** `height: 4px; background: project.color`
2. **Card body** (padding: `16px 18px 18px`):
   - Row: emoji icon (36×36px, `border-radius: 9px`, `background: project.color + '22'`) + name + task count + `⋯` menu button
   - Progress section: `"PROGRESS"` micro label + `"XX%"` + progress bar (`height: 5px; border-radius: 3px; background: border` → filled portion in `project.color`)
   - Footer: overlapping member avatars (22×22px circles, `border: 2px solid surface`, `margin-right: -5px`) + `"updated X ago"` caption

Hover state: `box-shadow: 0 8px 24px rgba(0,0,0,0.09); transform: translateY(-2px)`  
Click: navigate to `/project/:id` (Kanban board)

---

### 4. Kanban Board

**Route:** `/project/:id`  
**Purpose:** Manage tasks for a specific project in Kanban view.

#### Layout
Same app shell (topbar + sidebar). Sidebar shows the active project highlighted in the project list.

#### Board Header (background: surface, border-bottom: 1px solid border)
- **Breadcrumb** (Figtree 12px): `"Dashboard"` (clickable, secondary) > `"Project Name"`
- **Title row**: colored 12×12px square dot + project name Poppins 600 19px + chevron-down
- **Tabs row**: Kanban | Table | Timeline | `+`
  - Active tab: `color: #0073EA; border-bottom: 2px solid #0073EA`
  - Inactive: `color: secondary; border-bottom: 2px solid transparent`
  - Tab `height: 36px; padding: 0 14px`
  - The entire header section has `border-bottom: 1px solid border`

#### Toolbar (background: surface, border-bottom: 1px solid border, padding: `9px 24px`)
Row of controls (gap: 6px, flex-wrap: wrap):
- **"+ New task"** — blue primary, `height: 32px; padding: 0 14px; border-radius: 7px`, opens "Create Task" modal
- **Separator** — 1px vertical line, 20px tall
- **Search input** — `height: 32px; padding: 0 10px; border: 1px solid border; border-radius: 7px; background: surface-alt; width: 140px` + search icon. Filters kanban cards in real-time by title.
- **Filter button** — `height: 32px; border: 1px solid border; border-radius: 7px`. When filters active: `background: #E6EFFC; color: #0073EA; border-color: #0073EA; font-weight: 600; shows "(N)"`. Click toggles filter panel.
- **Sort button** — same style as inactive filter button. Click also opens filter panel (sort is inside the same panel).
- **Person button** — same style

#### Kanban Board Area (flex row, overflow-x: auto, padding: `14px 24px`, gap: 11px)

**5 columns** (width: 264px each, `flex: none`):

Column structure:
```
┌────────────────────────────────┐  ← header (border-bottom: 3px solid status-color)
│ ● Status Label        [3] [+]  │    height ~38px
├────────────────────────────────┤
│                                │  ← scrollable task list
│  [task card]                   │    max-height: calc(100vh - 310px)
│  [task card]                   │    background: app-bg
│  [+ Add task] (dashed border)  │    padding: 8px, gap: 7px
└────────────────────────────────┘
```

Column header (`background: surface; border-radius: 10px 10px 0 0; border: 1px solid border`):
- 9×9px status color dot
- Status label Figtree 600 13px
- Count badge: `background: surface-alt; padding: 2px 7px; border-radius: 10px; font: 600 11px; color: secondary`
- `+` icon button (22×22px)

**Task card** (`background: surface; border: 1px solid border; border-radius: 9px; padding: 11px 12px; border-left: 3px solid priority-color`):

1. **Tags row** (optional, margin-bottom: 7px): inline tag pills (`height: 17px; padding: 0 6px; border-radius: 3px; font: 500 10px`)
2. **Title**: Figtree 500 13px/17px, `word-break: break-word`
3. **Footer row** (flex, space-between):
   - Left: priority badge — `height: 16px; padding: 0 6px; border-radius: 3px; font: 600 10px; background: priority-bg; color: priority-color`
   - Right cluster (gap: 7px): comment count (chat icon + number, 11px secondary) · due date (calendar icon + date, 11px secondary) · assignee avatar (20×20px circle)

Hover: `box-shadow: 0 4px 14px rgba(0,0,0,0.08)`

**"Add task" button at column bottom**: `height: 30px; border: 1.5px dashed border; border-radius: 7px; color: secondary; font: 400 12px`. Hover: `border-color: #0073EA; color: #0073EA`. Clicking opens the Create Task modal with the column's status pre-selected.

**"Add column" button** (after all columns): `height: 44px; width: 170px; border: 1.5px dashed border; border-radius: 10px`. Hover: blue color + border.

---

### 5. Filter & Sort Panel

**Trigger:** "Filter" or "Sort" button in Kanban toolbar.  
**Position:** Right-side panel, `width: 296px`, `flex: none`, slides in from the right (`animation: slideIn 0.2s`). Sits inside the body flex row (NOT a modal overlay — it pushes the board left).

#### Panel structure (flex column, `background: surface; border-left: 1px solid border`)

**Header** (padding: `13px 18px`, border-bottom):
- `"Filter & sort"` Poppins 600 15px
- `"Clear all"` link (blue, 12px)  
- `✕` close button (26×26px)

**Scrollable body** (flex: 1, padding: `14px 18px`):

---

**Sort by section:**

4 option rows (each `height: 34px; border: 1px solid; border-radius: 7px`):
- Due date
- Priority
- Created date
- Title (A–Z)

Active sort: `background: surface-alt; border-color: #0073EA; label color: #0073EA`. Shows direction badge `"↑ Asc"` or `"↓ Desc"` + checkmark in blue. Clicking the active sort toggles asc/desc. Clicking an inactive sort selects it at asc.

---

**Status section:**

5 checkable rows (each `height: 32px; border-radius: 6px`):
- Not Started (grey dot `#C4C4C4`)
- Working on it (orange dot `#FDAB3D`)
- In Review (blue dot `#579BFC`)
- Done (green dot `#00C875`)
- Stuck (red dot `#DF2F4A`)

Each row: 15×15px custom checkbox (`border-radius: 3px; border: 2px solid border-ui`) + status color dot (9×9px) + label + count. Checked: checkbox fills blue `#0073EA` with white checkmark SVG. Row bg: `surface-alt` when checked.

---

**Priority section:**

4 checkable rows (same style as status):
- Critical (red `#DF2F4A`)
- High (purple `#784BD1`)
- Medium (blue `#0073EA`)
- Low (grey `#8B95A6`)

---

**Assignee section:**

5 checkable rows — each has a 20×20px colored avatar circle instead of a dot. Shows task count per assignee.

Assignees:
| Name | Initials | Color |
|---|---|---|
| Robin Baker | RB | `#A25DDC` |
| Taylor Kim | TK | `#00C875` |
| Morgan Jones | MJ | `#FDAB3D` |
| Sam Davis | SD | `#0086C0` |
| Pat Kim | PK | `#5559DF` |

---

**Due date section:**

Two `<input type="date">` fields side by side — "From" and "To". Each: `height: 32px; border: 1px solid border-ui; border-radius: 6px; background: surface-alt`.

---

**Panel footer** (padding: `12px 18px`, border-top):
- `"Apply filters"` button: full width, `height: 38px; background: #0073EA; border-radius: 8px; font: 600 14px`. Closes the panel.

---

### 6. Create Task Modal

**Trigger:** "New task" button in toolbar, or "+ Add task" in a column (pre-fills status).  
**Position:** Fixed overlay — semi-transparent backdrop `rgba(28,32,54,0.6)`. Click outside → close. Animated with `popIn`.

**Modal card** (`width: 480px; border-radius: 16px; background: surface; overflow: hidden`):

**Header** (padding: `17px 22px`, border-bottom): `"Create new task"` Poppins 600 16px + `✕` button (28×28px).

**Body** (padding: `20px 22px`):

1. **Task title input** — full width, `height: 42px; border-radius: 8px; font: 400 15px; background: surface-alt; border: 1.5px solid border-ui`

2. **2-column grid** (gap: 12px):
   - Status `<select>` — options: Not started / Working on it / In review / Done / Stuck
   - Priority `<select>` — options: Low / Medium / High / Critical
   - Each: `height: 38px; border-radius: 7px; border: 1.5px solid border-ui; background: surface`

3. **2-column grid** (gap: 12px):
   - Due date `<input type="date">`
   - Assignee `<select>` — options: Unassigned / Robin Baker / Taylor Kim / Morgan Jones / Sam Davis

4. **Action row** (justify: flex-end, gap: 8px):
   - Cancel: outlined `height: 38px; padding: 0 18px; border: 1px solid border; border-radius: 7px`. Hover: `background: surface-hover`
   - **Create task**: `height: 38px; padding: 0 20px; background: #0073EA; border-radius: 7px; font: 600 13px; box-shadow: 0 2px 8px rgba(0,115,234,0.28)`

On submit: add task to state, task appears immediately in the correct Kanban column.

---

## Interactions & Behavior

### Navigation Flow
```
/ (or /login)  →  Sign In  →  (click Sign In)  →  /dashboard
/register      →  Sign Up  →  (click Create)   →  /dashboard
/dashboard     →  (click project card)          →  /project/:id
/project/:id   →  (click Dashboard breadcrumb)  →  /dashboard
```

### Dark Mode
- Toggle button in top bar (and on auth screen)
- Persists to `localStorage` key: `"taskmanager-dark-mode"`
- Swaps all theme tokens simultaneously (transition: `background 0.2s, color 0.2s` on root)
- All surfaces, borders, text, and icons adapt — see Design Tokens table

### Kanban Filtering (real-time)
- Search input filters task titles as the user types (case-insensitive substring match)
- Status / Priority / Assignee checkboxes filter across all columns simultaneously
- Active filter count shown as `"Filter (N)"` on the filter button
- Filter button style changes when active: `background: #E6EFFC; border-color: #0073EA; color: #0073EA; font-weight: 600`
- "Clear all" resets all filters and sort to defaults

### Kanban Sorting
- Default: by due date ascending
- Sort applies within each column independently (tasks maintain their column, only order changes)

### Create Task
1. Click "New task" or column "+ Add task" button
2. Modal opens (column's status is pre-selected if triggered from a column)
3. Fill in title (required), status, priority, due date, assignee
4. Click "Create task" → modal closes, task appended to the correct column
5. Click "Cancel" or click outside modal → modal closes, no task created

### Hover / Active States
- Buttons: use `surface-hover` overlay or darken fill (blue buttons: `#0060B9`)
- Kanban cards: `box-shadow: 0 4px 14px rgba(0,0,0,0.08)` on hover
- Project cards: `box-shadow` + `transform: translateY(-2px)` on hover
- Sidebar items: `background: surface-hover`
- Dashed "Add task" + "Add column" buttons: `border-color: #0073EA; color: #0073EA` on hover

---

## State Management

### Recommended shape

```typescript
interface Task {
  id: string;
  title: string;
  status: 'not_started' | 'working' | 'review' | 'done' | 'stuck';
  priority: 'critical' | 'high' | 'medium' | 'low';
  due: string;          // e.g. "Jun 20"
  assignee: { n: string; c: string } | null; // initials + color hex
  comments: number;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  color: string;        // hex
  emoji: string;
  taskCount: number;
  doneCount: number;
  members: { n: string; c: string }[];
  updated: string;      // e.g. "2h ago"
}

interface AppState {
  screen: 'auth' | 'dashboard' | 'project';
  darkMode: boolean;
  activeProjectId: string;
  activeTab: 'kanban' | 'table' | 'timeline';
  filterOpen: boolean;
  isNewTaskOpen: boolean;
  searchQuery: string;
  sortBy: 'dueDate' | 'priority' | 'created' | 'title';
  sortDir: 'asc' | 'desc';
  filterStatus: string[];
  filterPriority: string[];
  filterAssignee: string[];
  tasks: Task[];
  projects: Project[];
}
```

---

## Seed Data

```typescript
const SEED_TASKS: Task[] = [
  { id:'t1',  title:'Design onboarding flow',      status:'not_started', priority:'high',     due:'Jun 20', assignee:{n:'RB',c:'#A25DDC'}, comments:3,  tags:['Design'] },
  { id:'t2',  title:'Set up analytics dashboard',  status:'not_started', priority:'medium',   due:'Jun 25', assignee:null,                  comments:0,  tags:[] },
  { id:'t3',  title:'Write API documentation',     status:'not_started', priority:'low',      due:'Jul 2',  assignee:{n:'TK',c:'#00C875'},  comments:1,  tags:['Dev'] },
  { id:'t4',  title:'Implement auth system',       status:'working',     priority:'critical', due:'Jun 15', assignee:{n:'MJ',c:'#FDAB3D'},  comments:7,  tags:['Dev'] },
  { id:'t5',  title:'Create component library',    status:'working',     priority:'high',     due:'Jun 18', assignee:{n:'RB',c:'#A25DDC'},  comments:4,  tags:['Design'] },
  { id:'t6',  title:'User testing sessions',       status:'working',     priority:'medium',   due:'Jun 22', assignee:{n:'SD',c:'#0086C0'},  comments:2,  tags:['Research'] },
  { id:'t7',  title:'Homepage hero section',       status:'review',      priority:'high',     due:'Jun 13', assignee:{n:'PK',c:'#5559DF'},  comments:5,  tags:['Design'] },
  { id:'t8',  title:'Performance audit',           status:'review',      priority:'medium',   due:'Jun 14', assignee:{n:'MJ',c:'#FDAB3D'},  comments:3,  tags:['Dev'] },
  { id:'t9',  title:'Brand color system',          status:'done',        priority:'medium',   due:'Jun 8',  assignee:{n:'RB',c:'#A25DDC'},  comments:12, tags:['Design'] },
  { id:'t10', title:'Competitor analysis',         status:'done',        priority:'low',      due:'Jun 10', assignee:{n:'TK',c:'#00C875'},  comments:6,  tags:['Research'] },
  { id:'t11', title:'Legacy API migration',        status:'stuck',       priority:'critical', due:'Jun 12', assignee:{n:'SD',c:'#0086C0'},  comments:15, tags:['Dev'] },
];

const SEED_PROJECTS: Project[] = [
  { id:'p1', name:'Website Redesign', color:'#0073EA', emoji:'🌐', taskCount:24, doneCount:18, members:[{n:'RB',c:'#A25DDC'},{n:'TK',c:'#00C875'},{n:'MJ',c:'#FDAB3D'}], updated:'2h ago' },
  { id:'p2', name:'Mobile App v2',    color:'#A25DDC', emoji:'📱', taskCount:31, doneCount:12, members:[{n:'SD',c:'#0086C0'},{n:'RB',c:'#A25DDC'},{n:'PK',c:'#5559DF'}], updated:'Yesterday' },
  { id:'p3', name:'Q3 Campaign',      color:'#00C875', emoji:'📣', taskCount:16, doneCount:16, members:[{n:'PK',c:'#5559DF'},{n:'TK',c:'#00C875'}],                        updated:'3 days ago' },
  { id:'p4', name:'Customer Portal',  color:'#FDAB3D', emoji:'🏠', taskCount:19, doneCount:7,  members:[{n:'MJ',c:'#FDAB3D'}],                                              updated:'1 week ago' },
  { id:'p5', name:'Data Pipeline',    color:'#579BFC', emoji:'⚡', taskCount:12, doneCount:9,  members:[{n:'SD',c:'#0086C0'},{n:'PK',c:'#5559DF'}],                         updated:'2 days ago' },
  { id:'p6', name:'Brand Guidelines', color:'#DF2F4A', emoji:'🎨', taskCount:8,  doneCount:3,  members:[{n:'RB',c:'#A25DDC'},{n:'TK',c:'#00C875'}],                         updated:'4 days ago' },
];
```

---

## Assets

- **Icons:** All icons in the prototype are inline SVG (single-stroke, 2px stroke-width, `stroke-linecap: round`). In production, use [Lucide Icons](https://lucide.dev) — the closest open match to Vibe's proprietary icon set. Install: `npm install lucide-react`
- **Fonts:** Google Fonts CDN (Figtree + Poppins) — or self-host for production
- **Avatars:** Initials-based colored circles — no image assets needed
- **Logo:** 38×38px blue rounded square with a checkmark SVG path inside. Replicate with CSS + inline SVG.

---

## Recommended Tech Stack (if starting fresh)

```
Next.js 14 (App Router)
React 18
TypeScript
Tailwind CSS (configure the design tokens as a custom theme)
Zustand or Jotai (lightweight state for kanban/filter state)
Lucide React (icons)
```

For the Kanban drag-and-drop (not in prototype but natural next step):
```
@dnd-kit/core + @dnd-kit/sortable
```

---

## Files in This Package

| File | Description |
|---|---|
| `README.md` | This document — full implementation spec |
| `Task Manager.dc.html` | Interactive HTML prototype — open in any browser |

---

*Generated from the Task Manager UI kit built with the Vibe (monday.com) design system.*
