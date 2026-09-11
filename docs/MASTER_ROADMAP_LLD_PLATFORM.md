# Master Roadmap & Technical Specification

## Executive Summary

This specification outlines the phased development and production architecture of **DesignLoop** — a platform that unites structured curriculum learning with a hands-on 7-step architectural practice studio and schema-constrained AI evaluation.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph GlobalHeader ["Global Navigation Bar"]
        NavLearn["Learn (Curriculum)"]
        NavPractice["Practice (Problem Arena)"]
        NavLibrary["Library (Resources & Cheatsheets)"]
        NavProgress["My Progress (Score Timeline & Analytics)"]
        NavTheme["Theme Switcher (Dark/Light)"]
    end

    subgraph LearnModule ["Module 1: Theory & Curriculum"]
        CurriculumNav["Curriculum Sidebar (15 Modules, 80+ Chapters)"]
        ReaderEngine["Chapter Reader Canvas"]
        UMLRenderer["Interactive UML Blueprint Cards"]
        CodeRunner["5-Language Code Studio (Java, Python, C++, TS, Go)"]
        InlineQuiz["Inline Quizzes & Mini-Exercises"]
        NotesDrawer["Chapter Notes & Bookmarking"]
        AIAssistant["Ask AI Drawer (Groq + Gemini)"]
    end

    subgraph PracticeModule ["Module 2: Problem Library & 7-Step Studio"]
        ProblemCatalog["Domain Problem Catalog (9 Domains, Company Tags)"]
        BriefingRoom["Problem Briefing & Requirements"]
        StepStudio["7-Step Interactive Architecture Studio"]
        Step1["Step 1: Problem Overview & Briefing"]
        Step2["Step 2: Clarification Q&A Chat"]
        Step3["Step 3: Boundaries & Assumptions"]
        Step4["Step 4: UML Class Designer & Mermaid Preview"]
        Step5["Step 5: Pre-Flight Fast-Fail Checks"]
        Step6["Step 6: 8-Dimension AI Rubric Scorecard"]
        Step7["Step 7: Mutation Challenge & OCP Defense"]
    end

    subgraph CoreServices ["Module 3: Core Engines & Persistence"]
        StorageEngine["Unified LocalStorage & Session Engine"]
        AiProvider["Dual AI Provider Router (Gemini 2.5 Flash + Groq Llama 3.3)"]
        EvalEngine["Deterministic (L1/L2) & LLM Rubric Engine (L3)"]
        ProgressAggregator["Rubric Telemetry & Progress Tracker"]
    end

    GlobalHeader --> LearnModule
    GlobalHeader --> PracticeModule
    GlobalHeader --> CoreServices
    LearnModule --> CoreServices
    PracticeModule --> CoreServices
```

---

## 2. Delivery Roadmap

```mermaid
gantt
    title DesignLoop Multi-Phase Delivery Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Architecture & Docs
    Complete Specs, PRD, Roadmap & Design Tokens :active, p1_1, 2026-09-11, 2d
    section Phase 2: Learn Subsystem
    Curriculum Sidebar & 15-Module Navigation   :p2_1, 2026-09-13, 3d
    Chapter Reader Canvas & Typography           :p2_2, 2026-09-14, 3d
    5-Language Code Studio & Output Console      :p2_3, 2026-09-16, 2d
    UML Blueprint Cards & Interactive Elements   :p2_4, 2026-09-17, 2d
    section Phase 3: Practice Studio
    9-Domain Catalog & Company Badging           :p3_1, 2026-09-19, 3d
    7-Step Studio UX & Mermaid Live Render       :p3_2, 2026-09-21, 3d
    Deterministic Pre-Checks (L1/L2)             :p3_3, 2026-09-23, 2d
    section Phase 4: AI Engine & Quizzes
    Groq & Gemini Dual-Router Integration        :p4_1, 2026-09-25, 2d
    Ask AI Tutor & Inline Quizzes                :p4_2, 2026-09-27, 3d
    8-Dimension Rubric Scorecard Engine          :p4_3, 2026-09-29, 3d
    Mutation Stress-Test & OCP Defense           :p4_4, 2026-10-01, 2d
    section Phase 5: Analytics, Notes & Telemetry
    Notes Modal, Bookmark Revision System        :p5_1, 2026-10-03, 2d
    Progress Score Timeline & Telemetry          :p5_2, 2026-10-05, 3d
    Responsive QA & E2E Validation               :p5_3, 2026-10-07, 3d
```

---

## 3. Component Hierarchy

### Learn Mode (3 Columns + Top Nav + Bottom Dock)

1. **Top Navigation (`TopNav.tsx`)** — Brand logo, primary tabs (Learn, Practice, Library, Progress), theme toggle, user profile badge.
2. **Left Column (`CurriculumSidebar.tsx`)** — Progress counter, chapter search, 15 module accordions with badge counters, chapter status indicators (unread, active, completed, starred, quiz).
3. **Center Column (`ChapterReader.tsx`)** — Priority badge, read time, last updated; markdown reader; UML Blueprint Cards; 5-language Code Studio with simulated output; real-world case study; inline quizzes.
4. **Right Column (`ChapterTOC.tsx`)** — `On this page` heading index with active scroll spy; reading progress indicator; resources widget.
5. **Bottom Dock (`BottomActionBar.tsx`)** — Previous/Next chapter, Notes modal, Star/Bookmark, Mark Complete, Ask AI drawer, Font Size toggle.

---

### Practice Mode (Problem Library & 7-Step Studio)

1. **Problem Library (`ProblemLibrary.tsx`)** — Domain filter tabs, difficulty pills, company logos, search bar, and completion status toggles.
2. **Problem Overview (`ProblemOverview.tsx`)** — Full-page briefing with functional requirements, non-functional constraints, and CTA to start the studio.
3. **7-Step Studio (`DesignWorkspace.tsx`)**:
   - Step 1: Overview
   - Step 2: Clarification Q&A
   - Step 3: Assumptions Registry
   - Step 4: Visual UML Class Designer + Live Mermaid Diagram
   - Step 5: Fast-Fail Structural Validation
   - Step 6: 8-Dimension AI Rubric Scorecard
   - Step 7: Mutation Scenario Defense

---

## 4. Non-Functional Requirements

- **Performance** — Vite-optimized build with sub-second HMR and lightweight bundle splitting.
- **State Resilience** — LocalStorage schema versioning with automatic migrations.
- **AI Latency** — <1.5s for interactive chat via Groq; <4s for rubric evaluations via Gemini.
- **Accessibility** — WCAG AAA compliant contrast ratios across dark and light themes.
