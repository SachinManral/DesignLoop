# Agile Delivery Plan & Sprint Backlog

This document outlines the sprint structure, user stories, acceptance criteria, and delivery roadmap for DesignLoop.

```mermaid
flowchart TD
    subgraph Day1 ["Day 1: Foundation & Interactive Studio (Sept 11, 2026)"]
        S1["Sprint 1: Architecture, Specs & Design System<br/>PRD, Syllabus Spec, Theme Tokens, Layout Wireframes"]
        S2["Sprint 2: Learn Mode Engine & Chapter Reader<br/>15-Module Syllabus, 3-Column Layout, 5-Language Studio, UML Cards, Quizzes"]
        S3["Sprint 3: Practice Studio & Problem Arena<br/>9-Domain Catalog, Problem Briefing, 7-Step Modeler, Mermaid Renderer"]
    end

    subgraph Day2 ["Day 2: AI Orchestration & Telemetry (Sept 12, 2026)"]
        S4["Sprint 4: Dual-AI Evaluation & Quizzes<br/>Groq + Gemini Router, Ask AI Tutor, 8-Dimension Rubric Scorecard, Mutation Defense"]
        S5["Sprint 5: Analytics, Routing & Telemetry<br/>Chapter Notes, Bookmark System, Rubric Dimension Telemetry, Score Timeline"]
    end

    Day1 --> Day2
```

---

## 1. Epics & Story Points

| Epic | Name | Scope | Points |
| :--- | :--- | :--- | :---: |
| EPIC-01 | Architecture, Docs & Design Tokens | PRD, Curriculum Syllabus, Design Tokens, Architecture Spec | 8 |
| EPIC-02 | Learn Track | 15-Module Sidebar, Chapter Reader, UML Cards, 5-Language Studio, Inline Quizzes | 21 |
| EPIC-03 | Practice Arena & 7-Step Studio | 9-Domain Catalog, Problem Briefing, 7-Step Studio, Fast-Fail Checks | 21 |
| EPIC-04 | AI Orchestration & Evaluator | Dual-LLM Router, Ask AI Tutor, 8-Dimension Rubric, Mutation Engine | 13 |
| EPIC-05 | Notes, Telemetry & Progress | Chapter Notes, Bookmark Revision, Rubric Dimension Telemetry, Score Timeline | 13 |

---

## 2. User Stories

### EPIC-02: Learn Track

#### US-201: Collapsible Syllabus Sidebar
- **As a** learner,
- **I want to** navigate through 15 organized modules and 80+ chapters with instant search and completion tracking,
- **So that** I can monitor my syllabus progression.
- **Acceptance Criteria:**
  - *Given* I am on the Learn page,
  - *When* I view the left sidebar,
  - *Then* I see syllabus progress counter, 15 collapsible modules with completion badges, and a working search filter.

#### US-202: 5-Language Code Studio with Simulated Output
- **As a** developer preparing in my language of choice,
- **I want to** switch between Java, Python, C++, TypeScript, and Go code snippets with simulated execution output,
- **So that** I can understand idiomatic implementations of each design pattern.
- **Acceptance Criteria:**
  - *Given* I am reading a chapter,
  - *When* I click a language tab,
  - *Then* the syntax-highlighted code updates instantly with line numbers, a copy button, and realistic stdout output.

#### US-203: Interactive UML Blueprint Cards
- **As a** developer learning visual object modeling,
- **I want to** inspect class attribute visibility, interface contracts, and method signatures,
- **So that** I can bridge theoretical concepts with concrete UML models.
- **Acceptance Criteria:**
  - *Given* a chapter with structural design elements,
  - *When* I view the UML Blueprint section,
  - *Then* I see formatted cards with stereotypes, typed attributes, and access-modified method signatures.

---

### EPIC-03: Practice Arena & 7-Step Studio

#### US-301: 9-Domain Problem Catalog
- **As a** candidate practicing for interviews,
- **I want to** browse 35+ industry problems organized by domain with company tags and difficulty indicators,
- **So that** I can target company-specific design challenges.
- **Acceptance Criteria:**
  - *Given* I am in Practice mode,
  - *When* I select domain tabs or search,
  - *Then* problems show company tags (Google, Amazon, Meta, Uber), difficulty badges, and estimated times.

#### US-302: 7-Step Interactive Architecture Studio
- **As a** candidate designing an LLD solution,
- **I want to** follow a structured 7-step workflow (Clarify → Assumptions → UML → Pre-Checks → AI Rubric → Mutation),
- **So that** I practice structured architectural reasoning rather than jumping straight to code.
- **Acceptance Criteria:**
  - *Given* an active problem attempt,
  - *When* I model classes and methods,
  - *Then* a live Mermaid diagram renders immediately, deterministic checks run before AI evaluation, and I receive an 8-dimension scorecard.

---

### EPIC-04: AI Orchestration & Evaluator

#### US-401: Dual-AI Router & Ask AI Tutor
- **As a** student with questions about a chapter,
- **I want to** ask the contextual AI tutor and receive grounded explanations,
- **So that** I can clarify design trade-offs in real time.
- **Acceptance Criteria:**
  - *Given* any chapter or problem step,
  - *When* I open "Ask AI",
  - *Then* Groq (Llama 3.3) provides fast streaming responses grounded in the chapter's concepts.

#### US-402: 8-Dimension AI Rubric & Mutation Defense
- **As a** candidate submitting a design,
- **I want to** receive an evidence-backed scorecard grading Requirements, SRP, Coupling, Encapsulation, Patterns, Extensibility, Edge Cases, and Explanation Quality,
- **So that** I know exactly what to improve next.
- **Acceptance Criteria:**
  - *Given* a validated UML class submission,
  - *When* I submit for evaluation,
  - *Then* Google Gemini 2.5 Flash outputs structured scores with direct evidence quotes and actionable suggestions.
