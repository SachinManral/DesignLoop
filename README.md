# DesignLoop — Low-Level Design Practice & Evaluation Studio

DesignLoop is an evidence-grounded Low-Level Design (LLD) learning and practice platform. It moves beyond passive reading by providing an interactive 7-step architecture studio, real-time rubric evaluation, and adaptive requirement mutation challenges.

---

## Why DesignLoop?

Traditional interview preparation treats Low-Level Design like algorithmic coding or rote pattern memorization. In practice, LLD is about:

1. **Clarifying Ambiguity** — Understanding constraints and stating invariants before writing code.
2. **Cohesive Responsibility Modeling** — Designing decoupled entities with high cohesion and minimal public interfaces.
3. **Defending Against Change** — Ensuring systems adhere to the Open/Closed Principle when business requirements mutate.
4. **Actionable, Evidence-Grounded Feedback** — Receiving specific rubric evaluations referencing actual design decisions instead of arbitrary scores.

---

## Key Features

### 1. Landing Hub
- Quick-launch access to benchmark LLD problems (Parking Lot, Splitwise, Elevator, Vending Machine, LRU Cache).
- Direct entry into the Practice Arena, Theory Curriculum, and Competency Analytics.

### 2. 7-Step Interactive Architecture Studio
Candidates solve problems through a structured interview workflow:
1. **Problem Briefing & Requirements** — Scope understanding and functional/non-functional constraints.
2. **Clarification Chat** — Real-time inquiry with the AI interviewer to uncover hidden constraints.
3. **Assumptions & Boundary Invariants** — Stating operational limits and concurrency models.
4. **Visual UML & Architecture Modeler** — Constructing classes, interfaces, attributes, methods, and relationships.
5. **Pre-Flight Validation** — Deterministic Layer 1 & 2 checks before AI evaluation.
6. **AI Rubric Scorecard** — Evidence-grounded scoring across 8 architectural dimensions with specific suggestions and trade-offs.
7. **Requirement Mutation Challenge** — Stress-testing the design against follow-up requirement changes to evaluate OCP compliance.

### 3. Theory Curriculum
- 80+ core chapters covering Object-Oriented Programming, SOLID Principles, UML, and 22 GoF Design Patterns.
- 3-column chapter reader with collapsible syllabus navigation, audio companion, UML Blueprint cards, and multi-language code snippets.

### 4. Progress & Analytics
- Real-time tracking of problem attempts, rubric dimension scores, and concept mastery with zero hardcoded mock data.

---

## 8-Dimension Evaluation Rubric

Every submission is evaluated against an evidence-based rubric:

| Dimension | Weight | Focus Area |
| :--- | :---: | :--- |
| **Requirement Understanding** | 15% | Scope definition, boundary invariants, and constraint clarity. |
| **Class Responsibilities (SRP)** | 15% | Single Responsibility Principle, cohesive domain entities. |
| **Coupling & Cohesion** | 15% | Dependency direction and loose coupling via interfaces. |
| **Encapsulation & Interfaces** | 10% | Information hiding, state protection, minimal public APIs. |
| **Patterns & Abstraction** | 10% | Appropriate use of design patterns for real variation points. |
| **Extensibility & Mutation** | 15% | Resilience against follow-up requirement changes. |
| **Edge Cases & Testability** | 10% | Boundary conditions, error states, and mockability. |
| **Quality of Explanation** | 10% | Articulating architectural trade-offs and design rationale. |

---

## Architecture

```
Frontend (React 19 + TypeScript + Vite + Vanilla CSS)
   │
   ├── State & Storage (LocalStorage + Real-time Event Sync)
   │
   └── API Client ──► Backend Service (Express + TypeScript)
                         │
                         ├── Gemini 2.5 Flash (Deep Architectural Reasoning)
                         │
                         └── Groq Llama 3.3 (Low-Latency Evaluations)
```

- **Deterministic vs. AI Division** — Input validation, syntax checks, and state transitions are handled deterministically. Semantic reasoning, responsibility critique, and pattern evaluations are delegated to structured AI prompts.
- **Fail-Safe Fallback** — If server connectivity is unavailable, an offline evaluation engine provides structured rubric feedback so the practice flow is never interrupted.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Add your GROQ_API_KEY and GEMINI_API_KEY to .env

# 3. Start the backend evaluation server (port 3001)
npm run server

# 4. Start the Vite development frontend (port 5173)
npm run dev

# 5. Run the test suite
npm test

# 6. Production build check
npm run build
```

---

## Deploy to Render

1. Push the repository to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your repo.
3. Render will auto-detect `render.yaml` and configure itself.
4. In the Render dashboard, add two **Environment Variables** under the service settings:
   - `GROQ_API_KEY` — your Groq API key
   - `GEMINI_API_KEY` — your Gemini API key
5. Click **Deploy**. Render runs `npm install && npm run build` then `npm start`.

The Express server serves both the API (`/api/*`) and the built React frontend from the same URL.

---

## Documentation Index

Detailed specs and design documents are in [`docs/`](./docs):

- [`docs/ARCHITECTURE_LLD.md`](./docs/ARCHITECTURE_LLD.md) — Domain entities, TypeScript contracts, and evaluation pipeline.
- [`docs/AI_USAGE.md`](./docs/AI_USAGE.md) — Prompt engineering, model routing, and JSON schemas.
- [`docs/PRD.md`](./docs/PRD.md) — Product requirements and user journeys.
- [`docs/RESEARCH.md`](./docs/RESEARCH.md) — Learner problem analysis, platform comparison, and rubric rationale.
- [`docs/DESIGN.md`](./docs/DESIGN.md) — Design tokens, color palette, and component layout specs.
- [`docs/BRD.md`](./docs/BRD.md) — Business context, objectives, and user personas.
