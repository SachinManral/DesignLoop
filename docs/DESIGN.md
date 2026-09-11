# Design System & UI/UX Specification

## 1. Visual Theme

The platform uses a sleek, high-contrast developer aesthetic:

- **Dark Theme (Default)** — Deep obsidian backgrounds (`#0a0d14`, `#0f1422`), emerald accents (`#10b981`), sapphire blues (`#2563eb`, `#3b82f6`), and warm amber highlights (`#f59e0b`).
- **Light Theme** — Ivory and slate surfaces (`#ffffff`, `#f8fafc`), navy text (`#0f172a`), subtle slate borders (`#e2e8f0`).
- **Typography**:
  - Primary: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - Monospace: `"JetBrains Mono", "Fira Code", monospace` (code snippets, UML tokens, JSON)

## 2. Design Tokens

### Color Palette (Dark Mode)
- **Background Base**: `#0a0d14`
- **Surface Elevation 1**: `#0f1422` (Sidebar, Navbar, Card panels)
- **Surface Elevation 2**: `#161f33` (Code editors, nested widgets, active tabs)
- **Border Default**: `#1e293b`
- **Border Strong / Active**: `#334155`
- **Text Primary**: `#f8fafc`
- **Text Secondary**: `#94a3b8`
- **Text Muted**: `#64748b`

### Accents & Status Badges
- **Brand Primary**: `#2563eb` (Blue CTA, active step indicator)
- **Success / Completed**: `#10b981` (Green badges, checked chapters)
- **Warning / Priority**: `#f59e0b` (High Priority pill, unlock hints)
- **Critical / Danger**: `#ef4444` (Hard difficulty, critical rubric warnings)

---

## 3. Core Component Layouts

### A. Curriculum Index View

1. **Hero Header** — Title: `Learn Low-Level Design Systematically`. Subtitle describing OOP, design patterns, UML, and LLD interview questions.
2. **Filter & Control Bar**:
   - Search input for real-time filtering
   - Status filter: `All` | `In Progress` | `Completed`
   - Topics filter: `All` | `OOP` | `Design Principles` | `UML` | `Creational` | `Structural` | `Behavioral` | difficulty levels
   - Language selector: `Java` | `Python` | `C++` | `TypeScript` | `Go`
   - Global progress bar with animated completion counter
3. **Categorized Module Sections**:
   - Accordion groups per module with chapter counts
   - Table columns: `Status`, `Concept / Problem`, `Class Diagram`, `Notes`, `Star`

---

### B. Chapter Reader (3-Column Layout)

1. **Left Sidebar (280px)**:
   - Course progress header: `0% Certificate (0/80)`
   - Chapter search input
   - Collapsible modules with completion fraction badges and active chapter highlighter

2. **Main Chapter Canvas (Center)**:
   - Priority badge, read time, and last updated timestamp
   - Audio preview bar with waveform and playback speed controls
   - Markdown reader with callouts and bulleted takeaways
   - UML Class Diagram cards (class name, visibility, attributes, methods)
   - Code Studio with 5-language tabs, copy button, line numbers, and simulated output console
   - Practical real-world scenario breakdown
   - Community rating and discussion comments

3. **Right Sidebar (240px)**:
   - Sticky `On this page` table of contents with active scroll highlighting
   - Reading progress indicator
   - Quick resource buttons

4. **Bottom Floating Action Bar**:
   - `< Previous Chapter` / `Next Chapter >`
   - `Notes (Modal)`, `Star / Bookmark`, `Mark Complete`
   - `Ask AI (Slide-out Drawer)`, `Font Size (Aa)`

---

### C. Practice Arena & 7-Step Studio

- **Problem Catalog** — Filterable cards with company logo stacks (Google, Amazon, Meta, Microsoft, Uber, Netflix), difficulty pills, and estimated times.
- **Problem Briefing** — Full-width requirements view with direct CTA to start the studio.
- **7-Step Architecture Workspace**:
  1. *Problem Overview* — Requirements & Non-Functional Constraints
  2. *Clarify* — Interactive Clarification Chat with AI Interviewer
  3. *Assumptions* — Scope boundary & invariant registry
  4. *Class Modeler* — Visual UML designer with live Mermaid rendering
  5. *Pre-Flight Checks* — Fast-fail AST & structural validation
  6. *Feedback Scorecard* — 8-dimension AI rubric (Evidence → Concerns → Suggestions)
  7. *Mutation Challenge* — Live requirement evolution & OCP defense
