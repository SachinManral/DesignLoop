import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Flame, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  X, 
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Attempt, Problem } from '../types';
import { StorageService } from '../services/storageService';
import { EvaluationEngine } from '../services/evaluationEngine';

interface ProgressViewProps {
  attempts: Attempt[];
  problems: Problem[];
  onSelectProblem: (id: string) => void;
}

interface DimensionMeta {
  key: 'requirements' | 'modeling' | 'responsibility' | 'decoupling' | 'extensibility';
  label: string;
  shortLabel: string;
  tagline: string;
  color: string;
  gradient: string;
  advice: string;
  steps: string[];
}

const DIMENSIONS: DimensionMeta[] = [
  { 
    key: 'requirements', 
    label: 'Requirements & Assumptions', 
    shortLabel: 'Requirements & Assumptions',
    tagline: 'Scope Definition & Invariants',
    color: '#2563eb',
    gradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
    advice: 'Clarify ambiguous constraints early. Define explicit invariants and bounds before modeling.',
    steps: [
      'Capture non-functional requirements (scale, latency, concurrency) before class design.',
      'Explicitly document assumptions for edge case behavior.',
      'Submit a revision to test requirement coverage.'
    ]
  },
  { 
    key: 'modeling', 
    label: 'Domain Modeling & Invariants', 
    shortLabel: 'Domain Modeling & Invariants',
    tagline: 'Encapsulation & Entity Design',
    color: '#10b981',
    gradient: 'linear-gradient(90deg, #10b981, #059669)',
    advice: 'Encapsulate core business entities with explicit attributes, typed methods, and clean abstract base contracts.',
    steps: [
      'Identify the 3 core domain entities and their life cycles.',
      'Ensure strict private/protected encapsulation on internal state.',
      'Validate that entity relationships map to real-world domain interactions.'
    ]
  },
  { 
    key: 'responsibility', 
    label: 'Responsibility Allocation (SRP)', 
    shortLabel: 'Responsibility Allocation (SRP)',
    tagline: 'Single Reason to Change',
    color: '#f59e0b',
    gradient: 'linear-gradient(90deg, #f59e0b, #d97706)',
    advice: 'Ensure each class has exactly one reason to change. Avoid coordinator classes that handle logic, storage, and presentation alone.',
    steps: [
      'Scan classes with more than 4 methods for hidden coordinator smells.',
      'Extract dedicated calculation, strategy, or persistence delegates.',
      'Verify that methods only manipulate their own internal state.'
    ]
  },
  { 
    key: 'decoupling', 
    label: 'Abstraction & Decoupling (ISP/DIP)', 
    shortLabel: 'Abstraction & Decoupling',
    tagline: 'Loose Coupling & Contracts',
    color: '#3b82f6',
    gradient: 'linear-gradient(90deg, #60a5fa, #2563eb)',
    advice: 'Program against interfaces and abstract contracts rather than concrete implementations to keep modules loosely coupled.',
    steps: [
      'Introduce interfaces for interchangeable behaviors or algorithms.',
      'Use dependency injection in constructors rather than concrete instantiation.',
      'Ensure high cohesion within classes and low coupling between modules.'
    ]
  },
  { 
    key: 'extensibility', 
    label: 'Extensibility & Mutation Resilience (OCP)', 
    shortLabel: 'Extensibility & Resilience',
    tagline: 'Open/Closed Design Patterns',
    color: '#8b5cf6',
    gradient: 'linear-gradient(90deg, #a855f7, #7c3aed)',
    advice: 'Isolate strategy variations. Design with strategy and factory patterns for frictionless evolution.',
    steps: [
      'Identify the primary dimension of anticipated business variation.',
      'Apply the Strategy or Factory pattern to isolate variable logic.',
      'Test against the mutation challenge to verify zero modifications to core classes.'
    ]
  },
];

const RESOURCE_GUIDES: Record<string, { title: string; subtitle: string; principle: string; takeaways: string[]; example: string }> = {
  'SRP: one reason to change': {
    title: 'Single Responsibility Principle (SRP)',
    subtitle: 'A class should have one, and only one, reason to change.',
    principle: 'Every module, class, or function should be responsible for a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class.',
    takeaways: [
      'Cohesion over aggregation: Group data and functions together only if they change together.',
      'Beware of "God Classes" named Manager, Controller, or Coordinator that do 10+ unrelated tasks.',
      'Separate domain logic from presentation, storage, and notification concerns.'
    ],
    example: '// BAD: ParkingLot manages spots, processes payments, AND sends SMS alerts\nclass ParkingLot { parkVehicle(); processCreditCard(); sendSMSReceipt(); }\n\n// GOOD: Separated single responsibilities\nclass ParkingLot { parkVehicle(); }\nclass PaymentProcessor { process(); }\nclass NotificationService { sendReceipt(); }'
  },
  'Domain modeling basics': {
    title: 'Domain Modeling Fundamentals',
    subtitle: 'Translate real-world problem domains into clean, expressive object models.',
    principle: 'Domain modeling bridges the gap between problem requirements and OOP software structure. Good domain models make code self-documenting and intuitive.',
    takeaways: [
      'Identify Entities (objects with identity like User, Ticket) vs Value Objects (immutable descriptors like Money, Duration).',
      'Use Enums for fixed categorical states (SpotType, VehicleType, PaymentStatus).',
      'Prefer Composition ("has-a") over Inheritance ("is-a") for flexible code reuse.'
    ],
    example: '// Clean domain model with Encapsulation\nenum SpotType { COMPACT, LARGE, ELECTRIC }\n\nclass ParkingSpot {\n  private spotNumber: number;\n  private type: SpotType;\n  private isOccupied: boolean;\n\n  public occupy(vehicle: Vehicle): void { this.isOccupied = true; }\n  public release(): void { this.isOccupied = false; }\n}'
  },
  'Strategy pattern guide': {
    title: 'The Strategy Design Pattern',
    subtitle: 'Define a family of algorithms, encapsulate each one, and make them interchangeable.',
    principle: 'Strategy lets the algorithm vary independently from clients that use it. It enables open-ended extensibility without fragile switch-case statements.',
    takeaways: [
      'Declare an interface common to all supported algorithms (e.g., FeeCalculationStrategy).',
      'Create concrete strategy classes that implement the specific algorithm variants (HourlyRate, PeakSurgeRate).',
      'The context object holds a reference to the strategy and delegates the calculation at runtime.'
    ],
    example: 'interface PricingStrategy {\n  calculate(ticket: Ticket, durationHours: number): number;\n}\n\nclass FlatHourlyStrategy implements PricingStrategy {\n  calculate(ticket: Ticket, hours: number) { return hours * 20; }\n}\n\nclass WeekendSurgeStrategy implements PricingStrategy {\n  calculate(ticket: Ticket, hours: number) { return hours * 35; }\n}'
  },
  'Designing for extensibility': {
    title: 'Designing for Extensibility (OCP)',
    subtitle: 'Software entities should be open for extension, but closed for modification.',
    principle: 'You should be able to extend a system’s behavior without modifying its existing source code. When new requirements arrive, you add new code rather than altering existing tested code.',
    takeaways: [
      'Program to interfaces and abstract contracts rather than concrete classes.',
      'Use polymorphism instead of instanceof or switch(type) checks.',
      'Verify extensibility by attempting mutation scenarios: Can a new variation be plugged in with zero edits to core classes?'
    ],
    example: '// Open for Extension: Adding EV charging spots requires zero changes to ParkingLot!\ninterface SpotAllocator {\n  findSpot(vehicle: Vehicle): ParkingSpot | null;\n}\n\nclass EVSpotAllocator implements SpotAllocator {\n  findSpot(vehicle: Vehicle) { /* EV specialized logic */ return null; }\n}'
  }
};

const getMasteryBadge = (score: number, hasEvaluations: boolean): { label: string; className: string } => {
  if (!hasEvaluations || score === 0) return { label: 'Not Started', className: 'badge-focus' };
  if (score >= 75) return { label: 'Strong', className: 'badge-strong' };
  if (score >= 50) return { label: 'Good', className: 'badge-good' };
  if (score >= 35) return { label: 'Improving', className: 'badge-improving' };
  return { label: 'Focus Area', className: 'badge-focus' };
};

interface RadarChartProps {
  dimensions: DimensionMeta[];
  scores: Record<string, number>;
  hasEvaluations: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({ dimensions, scores, hasEvaluations }) => {
  const cx = 160;
  const cy = 105;
  const r = 62;
  const total = dimensions.length;

  const getCoordinates = (index: number, value: number, radius = r) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
    const distance = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return {
      x: cx + distance * Math.cos(angle),
      y: cy + distance * Math.sin(angle),
      outerX: cx + radius * Math.cos(angle),
      outerY: cy + radius * Math.sin(angle),
      labelX: cx + (radius + 20) * Math.cos(angle),
      labelY: cy + (radius + 20) * Math.sin(angle),
    };
  };

  const webLevels = [1, 0.75, 0.5, 0.25];
  const polygonPoints = dimensions.map((dim, i) => {
    const val = hasEvaluations ? (scores[dim.key] ?? 0) : 0;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
      <svg viewBox="0 0 320 215" style={{ width: '100%', maxWidth: '310px', height: '205px', overflow: 'visible' }} role="img" aria-label="Skill Radar">
        <defs>
          <radialGradient id="radarAreaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.10" />
          </radialGradient>
        </defs>

        {/* Concentric Web Rings */}
        {webLevels.map((scale, lvlIdx) => {
          const points = dimensions.map((_, i) => {
            const { outerX, outerY } = getCoordinates(i, 100, r * scale);
            return `${outerX},${outerY}`;
          }).join(' ');
          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill={lvlIdx === 0 ? 'rgba(248, 250, 252, 0.4)' : 'none'}
              stroke="var(--border-subtle, #e2e8f0)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Spokes */}
        {dimensions.map((_, i) => {
          const { outerX, outerY } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outerX}
              y2={outerY}
              stroke="var(--border-subtle, #e2e8f0)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Filled Data Polygon */}
        {hasEvaluations && (
          <polygon
            points={polygonPoints}
            fill="url(#radarAreaGrad)"
            stroke="#4f46e5"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        )}

        {/* Vertex Nodes & Outer Labels */}
        {dimensions.map((dim, i) => {
          const val = hasEvaluations ? (scores[dim.key] ?? 0) : 0;
          const { x, y, labelX, labelY } = getCoordinates(i, val);
          
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelX > cx + 12) textAnchor = 'start';
          else if (labelX < cx - 12) textAnchor = 'end';

          let dyOffset = 3;
          if (labelY < cy - 35) dyOffset = -6;
          else if (labelY > cy + 35) dyOffset = 10;

          return (
            <g key={dim.key}>
              <circle cx={x} cy={y} r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
              <circle cx={x} cy={y} r="2" fill="#4f46e5" />

              <text
                x={labelX}
                y={labelY + dyOffset}
                textAnchor={textAnchor}
                style={{
                  fontSize: '8.5px',
                  fontWeight: 700,
                  fill: 'var(--text-primary, #1e293b)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {i === 0 ? 'Requirements' : i === 1 ? 'Domain Modeling' : i === 2 ? 'Responsibility' : i === 3 ? 'Abstraction &' : 'Extensibility'}
              </text>
              <text
                x={labelX}
                y={labelY + dyOffset + 9}
                textAnchor={textAnchor}
                style={{
                  fontSize: '7.5px',
                  fontWeight: 500,
                  fill: 'var(--text-secondary, #64748b)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {i === 0 ? '& Assumptions' : i === 1 ? '& Invariants' : i === 2 ? 'Allocation (SRP)' : i === 3 ? 'Decoupling' : '& Resilience'}
              </text>
              <text
                x={labelX}
                y={labelY + dyOffset + 18}
                textAnchor={textAnchor}
                style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  fill: hasEvaluations ? '#4f46e5' : 'var(--text-muted, #94a3b8)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {val}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const ProgressView: React.FC<ProgressViewProps> = ({ attempts: initialAttempts, problems, onSelectProblem }) => {
  const [liveAttempts, setLiveAttempts] = useState<Attempt[]>(initialAttempts);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'evaluated' | 'drafts'>('all');
  const [activeResourceKey, setActiveResourceKey] = useState<string | null>(null);

  // Real-time synchronization from StorageService whenever storage updates or view gains focus
  useEffect(() => {
    const syncAttempts = () => {
      const stored = StorageService.getAttempts();
      setLiveAttempts(stored);
    };

    syncAttempts();
    window.addEventListener('focus', syncAttempts);
    window.addEventListener('storage', syncAttempts);
    return () => {
      window.removeEventListener('focus', syncAttempts);
      window.removeEventListener('storage', syncAttempts);
    };
  }, [initialAttempts]);

  // Extract all evaluated submissions with real scores and timestamps
  const activity = liveAttempts.flatMap(attempt => {
    const problem = problems.find(item => item.id === attempt.problemId);
    if (!problem) return [];
    return (attempt.submissions || []).map(submission => {
      const score = submission.evaluation?.overallScore ?? 
        EvaluationEngine.evaluate(problem, submission.content, submission.versionNumber).overallScore;
      return {
        problem,
        attempt,
        submission,
        score: Math.round(score),
        date: new Date(submission.submittedAt || attempt.updatedAt)
      };
    });
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Real evaluated attempts count
  const completedAttempts = liveAttempts.filter(a => (a.submissions && a.submissions.some(s => s.evaluation !== undefined)) || a.status === 'EVALUATED');
  const completedProblemIds = Array.from(new Set(completedAttempts.map(a => a.problemId)));
  const totalSubmissions = liveAttempts.reduce((sum, a) => sum + (a.submissions ? a.submissions.length : 0), 0);

  // Real average score across all submissions
  const average = activity.length ? Math.round(activity.reduce((sum, item) => sum + item.score, 0) / activity.length) : null;
  
  // Real score trend (last score minus first score or points gained)
  const trend = activity.length > 1 ? activity[activity.length - 1].score - activity[0].score : (activity.length === 1 ? 0 : null);

  // Practice activity: distinct calendar days practiced
  const practiceDaysSet = new Set<string>();
  liveAttempts.forEach(a => {
    if (a.createdAt) practiceDaysSet.add(new Date(a.createdAt).toDateString());
    if (a.updatedAt) practiceDaysSet.add(new Date(a.updatedAt).toDateString());
    (a.submissions || []).forEach(s => {
      if (s.submittedAt) practiceDaysSet.add(new Date(s.submittedAt).toDateString());
    });
  });
  const practiceDays = Math.max(1, practiceDaysSet.size);

  // Compute live skill radar metrics strictly from candidate's real evaluated submissions
  const dimensionScores: Record<string, number> = {
    requirements: 0,
    modeling: 0,
    responsibility: 0,
    decoupling: 0,
    extensibility: 0
  };

  const hasEvaluatedData = completedAttempts.length > 0;

  if (hasEvaluatedData) {
    let evalCount = 0;
    completedAttempts.forEach(att => {
      const latest = att.submissions[att.submissions.length - 1];
      const problem = problems.find(p => p.id === att.problemId);
      if (!latest || !problem) return;
      const feedback = latest.evaluation || EvaluationEngine.evaluate(problem, latest.content, latest.versionNumber);
      
      const getCritScore = (query: string) => {
        const crit = feedback.criteria?.find(c => 
          c.dimension.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(c.dimension.toLowerCase())
        );
        return crit && crit.maxScore > 0 
          ? Math.round((crit.score / crit.maxScore) * 100) 
          : (feedback.overallScore !== undefined ? feedback.overallScore : 0);
      };

      dimensionScores.requirements += getCritScore('Requirement');
      dimensionScores.modeling += Math.round((getCritScore('Requirement') + getCritScore('Encapsulation')) / 2);
      dimensionScores.responsibility += getCritScore('Responsibilit');
      dimensionScores.decoupling += getCritScore('Coupling');
      dimensionScores.extensibility += getCritScore('Extensibility');
      evalCount++;
    });

    if (evalCount > 0) {
      dimensionScores.requirements = Math.round(dimensionScores.requirements / evalCount);
      dimensionScores.modeling = Math.round(dimensionScores.modeling / evalCount);
      dimensionScores.responsibility = Math.round(dimensionScores.responsibility / evalCount);
      dimensionScores.decoupling = Math.round(dimensionScores.decoupling / evalCount);
      dimensionScores.extensibility = Math.round(dimensionScores.extensibility / evalCount);
    }
  }

  // Find weakest dimension for "Recommended Next Steps"
  const focus = DIMENSIONS.reduce((lowest, item) => 
    (dimensionScores[item.key] ?? 0) < (dimensionScores[lowest.key] ?? 0) ? item : lowest
  );
  const focusScore = dimensionScores[focus.key] ?? 0;

  // Next recommended problem strictly based on uncompleted problem catalog
  const nextProblem = problems.find(p => !completedProblemIds.includes(p.id)) || problems[0];
  const problemCleanName = nextProblem ? nextProblem.title.replace(/^Design\s+(a|an)\s+/i, '') : 'Practice Problem';

  // Completion percentage
  const completionPercentage = problems.length > 0 ? Math.round((completedProblemIds.length / problems.length) * 100) : 0;

  // Group latest attempts by problemId to prevent duplicate rows in the history table
  const problemLatestAttemptsMap = new Map<string, Attempt>();
  liveAttempts.forEach(att => {
    const existing = problemLatestAttemptsMap.get(att.problemId);
    if (!existing || new Date(att.updatedAt || att.createdAt).getTime() > new Date(existing.updatedAt || existing.createdAt).getTime()) {
      problemLatestAttemptsMap.set(att.problemId, att);
    }
  });

  const uniqueAttemptsList = Array.from(problemLatestAttemptsMap.values());

  // Filter history
  const filteredAttempts = uniqueAttemptsList.filter(att => {
    const hasEval = (att.submissions && att.submissions.some(s => s.evaluation !== undefined)) || att.status === 'EVALUATED';
    if (historyFilter === 'evaluated') return hasEval;
    if (historyFilter === 'drafts') return !hasEval;
    return true;
  });

  return (
    <div className="progress-page">
      {/* Top Breadcrumb & Hero */}
      <header className="progress-hero">
        <span className="progress-eyebrow">
          <Sparkles size={11} />
          MY PROGRESS & TELEMETRY
        </span>
        <h1>Your LLD Progress</h1>
        <p>Track your growth across core architectural design pillars, identify strengths, and focus on what to improve next.</p>
      </header>

      {/* 4 Stat Summary Cards */}
      <section className="progress-stats-grid" aria-label="Progress summary">
        {/* Stat 1: Submissions */}
        <article className="progress-stat-card">
          <div className="progress-stat-icon-wrap blue">
            <FileText size={18} />
          </div>
          <div className="progress-stat-info">
            <span className="progress-stat-number">{totalSubmissions || 0}</span>
            <span className="progress-stat-label">Total Submissions</span>
            <span className="progress-stat-sub positive">
              {totalSubmissions > 0 ? `+${totalSubmissions} recorded` : 'Ready to start'}
            </span>
          </div>
        </article>

        {/* Stat 2: Problems Mastered */}
        <article className="progress-stat-card">
          <div className="progress-stat-icon-wrap green">
            <CheckCircle2 size={18} />
          </div>
          <div className="progress-stat-info">
            <span className="progress-stat-number">{completedProblemIds.length}/{problems.length}</span>
            <span className="progress-stat-label">Problems Mastered</span>
            <span className="progress-stat-sub neutral">{completionPercentage}% completion</span>
          </div>
        </article>

        {/* Stat 3: Average Score */}
        <article className="progress-stat-card">
          <div className="progress-stat-icon-wrap purple">
            <TrendingUp size={18} />
          </div>
          <div className="progress-stat-info">
            <span className="progress-stat-number">{average === null ? '—' : `${average}%`}</span>
            <span className="progress-stat-label">Average Design Score</span>
            <span className="progress-stat-sub positive">
              {average === null ? 'Pending submission' : 'From evaluated submissions'}
            </span>
          </div>
        </article>

        {/* Stat 4: Practice Days */}
        <article className="progress-stat-card">
          <div className="progress-stat-icon-wrap amber">
            <Flame size={18} />
          </div>
          <div className="progress-stat-info">
            <span className="progress-stat-number">{practiceDays} {practiceDays === 1 ? 'Day' : 'Days'}</span>
            <span className="progress-stat-label">Practice Activity</span>
            <span className="progress-stat-sub amber">Active streak</span>
          </div>
        </article>
      </section>

      {/* Main Row: Architectural Skill Radar (Left) & Rubric Mastery Breakdown (Right) */}
      <section className="progress-main-grid">
        {/* Left: Architectural Skill Radar */}
        <article className="progress-card skill-card">
          <div className="progress-card-head">
            <div className="progress-card-head-title">
              <div className="progress-card-icon-pill">
                <Target size={14} />
              </div>
              <h2>Architectural Skill Radar</h2>
            </div>
            <div className="live-indicator-pill">
              <span className="live-pulse-dot" />
              <span>Live evaluation</span>
            </div>
          </div>
          
          <p className="progress-card-copy">
            Your real-time proficiency across core Low-Level Design dimensions.
          </p>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RadarChart dimensions={DIMENSIONS} scores={dimensionScores} hasEvaluations={hasEvaluatedData} />
          </div>
        </article>

        {/* Right: Rubric Mastery Breakdown */}
        <article className="progress-card">
          <div className="progress-card-head">
            <div className="progress-card-head-title">
              <div className="progress-card-icon-pill">
                <BarChart3 size={14} />
              </div>
              <h2>Rubric Mastery Breakdown</h2>
            </div>
            <button 
              type="button"
              onClick={() => setActiveResourceKey('SRP: one reason to change')}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              View Details <ChevronRight size={12} />
            </button>
          </div>

          <p className="progress-card-copy">
            Real-time score per architectural design pillar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {DIMENSIONS.map((dimension, idx) => {
              const val = hasEvaluatedData ? (dimensionScores[dimension.key] ?? 0) : 0;
              const badge = getMasteryBadge(val, hasEvaluatedData);
              return (
                <div key={dimension.key} className="rubric-dimension-row">
                  <div className="rubric-row-header">
                    <div className="rubric-dimension-title">
                      <span className="rubric-index-badge">0{idx + 1}.</span>
                      <span>{dimension.label}</span>
                    </div>
                    <div className="rubric-score-wrap">
                      <span className="rubric-score-value">{val}%</span>
                      <span className={`mastery-pill ${badge.className}`}>{badge.label}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Capsule */}
                  <div className="rubric-track">
                    <div 
                      className="rubric-bar-fill"
                      style={{ 
                        width: `${Math.max(hasEvaluatedData ? 4 : 0, Math.min(100, val))}%`, 
                        background: dimension.gradient
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Lower Row: Recommended Next Steps (Left) & Your Recent Progress (Right) */}
      <section className="progress-lower-grid">
        {/* Left: Recommended Next Steps */}
        <article className="progress-card">
          <div className="progress-card-head">
            <div className="progress-card-head-title">
              <div className="progress-card-icon-pill">
                <Target size={14} />
              </div>
              <h2>Recommended Next Steps</h2>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706' }}>
              {focusScore}% in {focus.shortLabel}
            </span>
          </div>

          <p className="progress-card-copy">
            Based on your recent design telemetry and identified focus areas.
          </p>

          <div className="focus-coach-box">
            <div className="focus-coach-icon">
              <Lightbulb size={16} />
            </div>
            <div className="focus-coach-content">
              <h3>Target {focus.shortLabel} Next</h3>
              <p>
                {focus.advice} Practice{' '}
                <strong 
                  onClick={() => nextProblem && onSelectProblem(nextProblem.id)} 
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {problemCleanName}
                </strong> to level up.
              </p>
            </div>
          </div>

          <ul className="focus-steps-list">
            {focus.steps.map((step, idx) => (
              <li key={idx} className="focus-steps-item">
                <Check size={13} className="focus-step-check" />
                <span>{step}</span>
              </li>
            ))}
          </ul>

          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '8px 14px', fontWeight: 600, fontSize: '0.78rem' }}
            onClick={() => nextProblem && onSelectProblem(nextProblem.id)}
          >
            Start Practice ({problemCleanName})
            <ArrowRight size={14} />
          </button>
        </article>

        {/* Right: Your Recent Progress (Bar Chart) */}
        <article className="progress-card">
          <div className="progress-card-head">
            <div className="progress-card-head-title">
              <div className="progress-card-icon-pill">
                <BarChart3 size={14} />
              </div>
              <h2>Your Recent Progress</h2>
            </div>
            <button 
              type="button"
              onClick={() => setHistoryFilter('all')}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              View All <ChevronRight size={12} />
            </button>
          </div>

          <p className="progress-card-copy">
            Score trajectory across your latest evaluated submissions.
          </p>

          {activity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div className="score-timeline-track">
                {activity.slice(-6).map((item, index) => {
                  const isLatest = index === activity.slice(-6).length - 1;
                  return (
                    <div 
                      className="score-col-item" 
                      key={`${item.submission.id}-${index}`} 
                      title={`${item.problem.title} (v${item.submission.versionNumber}): ${item.score}%`}
                    >
                      <span className="score-col-num" style={{ color: isLatest ? '#4f46e5' : 'var(--text-secondary)' }}>
                        {item.score}%
                      </span>
                      <div 
                        className="score-col-bar"
                        style={{ 
                          height: `${Math.max(16, Math.min(100, item.score))}%`,
                          background: isLatest 
                            ? 'linear-gradient(180deg, #4f46e5, #3730a3)' 
                            : 'linear-gradient(180deg, #c7d2fe, #818cf8)',
                          boxShadow: isLatest ? '0 2px 6px rgba(79, 70, 229, 0.35)' : 'none'
                        }} 
                      />
                      <span className="score-col-date">
                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary Callout Banner */}
              <div className="score-trend-banner">
                <TrendingUp size={14} style={{ flexShrink: 0 }} />
                <span>
                  {trend !== null && trend >= 0 
                    ? `Your design score improved by +${trend} points across submissions.`
                    : `Evaluations active. Keep practicing to boost your scores.`}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.78rem' }}>Submit a design in the studio to start your score timeline.</p>
              <button 
                className="btn-secondary" 
                style={{ marginTop: '10px', fontSize: '0.74rem' }}
                onClick={() => onSelectProblem(problems[0]?.id || 'prob-parking-lot')}
              >
                Start your first problem
              </button>
            </div>
          )}
        </article>
      </section>

      {/* Helpful Architecture Resources */}
      <section className="progress-card" style={{ marginBottom: '12px' }}>
        <div className="progress-card-head">
          <div className="progress-card-head-title">
            <div className="progress-card-icon-pill">
              <BookOpen size={14} />
            </div>
            <h2>Helpful Architecture Resources</h2>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Design patterns & best practices</span>
        </div>

        <div className="resource-cards-grid">
          {Object.keys(RESOURCE_GUIDES).map(resource => (
            <button 
              type="button"
              className="resource-guide-card"
              key={resource}
              onClick={() => setActiveResourceKey(resource)}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-primary)' }}>{resource}</strong>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {RESOURCE_GUIDES[resource].subtitle}
                </span>
              </div>
              <ChevronRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Section: Submission History */}
      <section className="progress-card">
        <div className="progress-card-head">
          <div className="progress-card-head-title">
            <div className="progress-card-icon-pill">
              <FileText size={14} />
            </div>
            <h2>Submission History</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="history-filter-pills">
              <button 
                className={`history-pill-btn ${historyFilter === 'all' ? 'active' : ''}`}
                onClick={() => setHistoryFilter('all')}
              >
                All ({uniqueAttemptsList.length})
              </button>
              <button 
                className={`history-pill-btn ${historyFilter === 'evaluated' ? 'active' : ''}`}
                onClick={() => setHistoryFilter('evaluated')}
              >
                Evaluated ({completedAttempts.length})
              </button>
              <button 
                className={`history-pill-btn ${historyFilter === 'drafts' ? 'active' : ''}`}
                onClick={() => setHistoryFilter('drafts')}
              >
                Drafts ({uniqueAttemptsList.length - completedAttempts.length})
              </button>
            </div>
          </div>
        </div>

        {filteredAttempts.length > 0 ? (
          <div className="history-rows-list">
            {filteredAttempts.map(attempt => {
              const problem = problems.find(item => item.id === attempt.problemId);
              const latestActivity = activity.filter(item => item.attempt.id === attempt.id).slice(-1)[0];
              const isEvaluated = Boolean(latestActivity);
              const formattedDate = new Date(attempt.updatedAt || attempt.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div className="history-item-row" key={attempt.id}>
                  <div className="history-item-main">
                    <div className="history-item-title-row">
                      <strong>{problem?.title || 'Practice problem'}</strong>
                      {problem && (
                        <span className={`card-difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="history-item-meta">
                      {(attempt.submissions || []).length} version{(attempt.submissions || []).length === 1 ? '' : 's'} · Updated {formattedDate}
                    </span>
                  </div>
                  <div className="history-item-actions">
                    {latestActivity ? (
                      <span 
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: latestActivity.score >= 75 ? '#ecfdf5' : latestActivity.score >= 55 ? '#eff6ff' : '#fef2f2',
                          color: latestActivity.score >= 75 ? '#059669' : latestActivity.score >= 55 ? '#2563eb' : '#dc2626',
                          border: `1px solid ${latestActivity.score >= 75 ? '#a7f3d0' : latestActivity.score >= 55 ? '#bfdbfe' : '#fecaca'}`
                        }}
                      >
                        {latestActivity.score}%
                      </span>
                    ) : (
                      <span 
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '99px',
                          background: 'var(--bg-tertiary, #f1f5f9)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Draft
                      </span>
                    )}
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => onSelectProblem(attempt.problemId)}
                    >
                      {isEvaluated ? 'Review' : 'Open'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.78rem' }}>No submission records match your filter.</p>
          </div>
        )}
      </section>

      {/* Educational Resource Modal */}
      {activeResourceKey && RESOURCE_GUIDES[activeResourceKey] && (
        <div className="modal-overlay" onClick={() => setActiveResourceKey(null)}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={17} color="#4f46e5" />
                <h3 className="modal-title">{RESOURCE_GUIDES[activeResourceKey].title}</h3>
              </div>
              <button 
                type="button" 
                className="btn-icon" 
                onClick={() => setActiveResourceKey(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
              "{RESOURCE_GUIDES[activeResourceKey].subtitle}"
            </p>

            <div style={{ background: 'var(--bg-tertiary, #f8fafc)', border: '1px solid var(--border-subtle, #e2e8f0)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {RESOURCE_GUIDES[activeResourceKey].principle}
            </div>

            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Key Architecture Takeaways:</h4>
            <ul style={{ paddingLeft: '16px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {RESOURCE_GUIDES[activeResourceKey].takeaways.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>

            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Code Pattern Example:</h4>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', lineHeight: 1.45 }}>
              <code>{RESOURCE_GUIDES[activeResourceKey].example}</code>
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.76rem' }} onClick={() => setActiveResourceKey(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
