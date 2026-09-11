import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Problem, Attempt, FeedbackReport } from '../types';
import { EvaluationEngine } from '../services/evaluationEngine';

interface FeedbackScorecardProps {
  problem: Problem;
  attempt: Attempt;
  onProceedToMutation: () => void;
  onRetryDesign: () => void;
  onBack: () => void;
}

export const FeedbackScorecard: React.FC<FeedbackScorecardProps> = ({
  problem,
  attempt,
  onProceedToMutation,
  onRetryDesign,
  onBack
}) => {
  const latestSubmission = attempt.submissions[attempt.submissions.length - 1];

  // Derive feedback from evaluation report attached to submission or compute grounded fallback
  const feedback: FeedbackReport | undefined = useMemo(() => {
    if (!latestSubmission) return undefined;
    if (latestSubmission.evaluation) return latestSubmission.evaluation;
    return EvaluationEngine.evaluate(problem, latestSubmission.content, latestSubmission.versionNumber);
  }, [problem, latestSubmission]);

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  if (!feedback) {
    return (
      <div className="feedback-container">
        <div className="feedback-empty-card">
          <div className="feedback-empty-icon-box">
            <Info size={22} />
          </div>
          <h3 className="feedback-empty-title">No Evaluation Available</h3>
          <p className="feedback-empty-sub">
            Submit your architecture design in the previous step to generate an evaluation scorecard.
          </p>
          <button className="studio-nav-back-btn" onClick={onBack} style={{ margin: '0 auto' }}>
            <ArrowLeft size={14} />
            <span>Back to Submit</span>
          </button>
        </div>
      </div>
    );
  }

  const score = feedback.overallScore;
  const scoreBadgeClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-work';
  const scoreLabel = score >= 80 
    ? 'Strong Architecture' 
    : score >= 60 
    ? 'Good Baseline' 
    : score >= 40 
    ? 'Needs Polish' 
    : 'Critical Refactoring Needed';

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const RESOURCES = [
    { title: 'Single Responsibility Principle (SRP)', category: 'Core SOLID' },
    { title: 'Designing for Extensibility & OCP', category: 'Design Patterns' },
    { title: 'Domain Modeling & Boundary Invariants', category: 'Domain Design' },
    { title: 'Strategy & State Pattern Guide', category: 'Behavioral Patterns' }
  ];

  const criticalCriteria = feedback.criteria.filter((c: any) => c.severity === 'critical' || c.severity === 'important');
  const positiveCriteria = feedback.criteria.filter((c: any) => c.severity === 'positive');

  return (
    <div className="feedback-container">
      {/* Top Header Card */}
      <div className="feedback-header-card">
        <div className="feedback-header-left">
          <div className="feedback-header-icon-box">
            <Award size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="feedback-header-title-row">
              <h2 className="feedback-header-title">{problem.title}</h2>
              <span className={`badge-difficulty ${problem.difficulty?.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="feedback-header-subtitle">
              Comprehensive architectural evaluation across the 8 core low-level design interview dimensions.
            </p>
          </div>
        </div>

        <div className="feedback-header-actions">
          <span className="submit-version-pill">
            Submission v{attempt.currentVersion}
          </span>
          <button type="button" className="feedback-action-btn secondary" onClick={onBack}>
            <Eye size={13} />
            <span>View Submission Snapshot</span>
          </button>
          <button type="button" className="feedback-action-btn primary" onClick={onRetryDesign}>
            <RefreshCw size={13} />
            <span>Iterate (v{attempt.currentVersion + 1})</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="feedback-layout-grid">
        {/* Left Column: Score Hero & 8-Dimension Breakdown */}
        <div className="feedback-main-col">
          {/* Health Score Hero Card */}
          <div className="feedback-hero-card">
            <div className="feedback-gauge-section">
              <div className="feedback-gauge-wrapper">
                <svg width="114" height="114" viewBox="0 0 114 114" className="feedback-gauge-svg">
                  <circle
                    cx="57"
                    cy="57"
                    r={radius}
                    className="gauge-track"
                    strokeWidth="9"
                  />
                  <circle
                    cx="57"
                    cy="57"
                    r={radius}
                    className={`gauge-fill ${scoreBadgeClass}`}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="gauge-score-content">
                  <span className="gauge-score-value">{score}</span>
                  <span className="gauge-score-max">/ 100</span>
                </div>
              </div>

              <div className="feedback-hero-details">
                <div className="feedback-hero-status-row">
                  <span className={`feedback-score-badge ${scoreBadgeClass}`}>
                    {scoreLabel}
                  </span>
                  <span className="feedback-meta-badge">
                    <Sparkles size={11} color="#6366f1" />
                    <span>Live AI Evaluation</span>
                  </span>
                  <span className="feedback-meta-badge">
                    <ShieldCheck size={11} color="#10b981" />
                    <span>8 Dimensions Verified</span>
                  </span>
                </div>
                <h3 className="feedback-hero-headline">Architectural Health Evaluation</h3>
                <p className="feedback-hero-summary">{feedback.overallSummary}</p>
              </div>
            </div>
          </div>

          {/* 8-Dimension Evaluation Breakdown Accordion */}
          <div className="feedback-breakdown-card">
            <div className="feedback-breakdown-header">
              <div>
                <h3 className="feedback-breakdown-title">8-Dimension Evaluation Breakdown</h3>
                <p className="feedback-breakdown-subtitle">
                  In-depth grounded feedback, cited evidence, and actionable architectural refactorings.
                </p>
              </div>
              <button
                type="button"
                className="feedback-expand-toggle-btn"
                onClick={() => setExpandAll(!expandAll)}
              >
                {expandAll ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="feedback-criteria-list">
              {feedback.criteria.map((crit: any, idx: number) => {
                const isExpanded = expandAll || expandedIdx === idx;
                const isCritical = crit.severity === 'critical';
                const isPositive = crit.severity === 'positive';
                const pct = Math.round((crit.score / crit.maxScore) * 100);
                const statusClass = isPositive ? 'positive' : isCritical ? 'critical' : 'warning';
                const statusLabel = isPositive ? 'Solid' : isCritical ? 'Critical Smell' : 'Needs Polish';

                return (
                  <div key={idx} className={`feedback-criterion-card ${isExpanded ? 'expanded' : ''}`}>
                    <div
                      className="criterion-header-row"
                      onClick={() => setExpandedIdx(isExpanded && !expandAll ? null : idx)}
                    >
                      <div className={`criterion-index-badge ${statusClass}`}>
                        {idx + 1}
                      </div>

                      <div className="criterion-title-box">
                        <div className="criterion-name">{crit.dimension}</div>
                        <div className="criterion-snippet">
                          {crit.interpretation ? crit.interpretation.slice(0, 85) + '...' : ''}
                        </div>
                      </div>

                      <div className="criterion-score-bar-group">
                        <span className="criterion-score-text">
                          {crit.score} / {crit.maxScore}
                        </span>
                        <div className="criterion-progress-track">
                          <div
                            className={`criterion-progress-fill ${statusClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <span className={`criterion-status-tag ${statusClass}`}>
                        {statusLabel}
                      </span>

                      <button type="button" className="criterion-chevron-btn">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="criterion-body-content">
                        {/* Evidence Quote */}
                        {crit.evidence && (
                          <div className={`criterion-evidence-box ${statusClass}`}>
                            <span className="criterion-section-label">Cited Evidence</span>
                            <p className="criterion-evidence-text">"{crit.evidence}"</p>
                          </div>
                        )}

                        {/* Interpretation & Impact 2-Col */}
                        <div className="criterion-grid-2col">
                          <div className="criterion-sub-card">
                            <span className="criterion-section-label">Interpretation</span>
                            <p className="criterion-sub-text">{crit.interpretation}</p>
                          </div>
                          <div className="criterion-sub-card">
                            <span className="criterion-section-label">Architectural Impact</span>
                            <p className="criterion-sub-text">{crit.impact}</p>
                          </div>
                        </div>

                        {/* Suggestion & Tradeoff */}
                        <div className="criterion-suggestion-card">
                          <span className="criterion-section-label">Actionable Refactoring</span>
                          <p className="criterion-suggestion-text">{crit.suggestion}</p>
                          {crit.tradeoff && (
                            <div className="criterion-tradeoff-box">
                              <strong>Trade-off Consideration:</strong> {crit.tradeoff}
                            </div>
                          )}
                        </div>

                        {/* Practice Action */}
                        {crit.practiceAction && (
                          <div className="criterion-practice-action-box">
                            <TrendingUp size={14} className="action-icon" />
                            <span className="action-text">{crit.practiceAction}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Key Insights, Action Checklist & Reference Resources */}
        <div className="feedback-side-col">
          {/* Quick Insights Card */}
          <div className="feedback-sidebar-card">
            <div className="sidebar-card-header">
              <Lightbulb size={16} color="#f59e0b" />
              <h3 className="sidebar-card-title">Key Insights</h3>
            </div>

            <div className="feedback-insights-list">
              {criticalCriteria.length > 0 && (
                <div className="feedback-insight-item critical">
                  <div className="insight-icon-box critical">
                    <AlertCircle size={13} />
                  </div>
                  <div>
                    <div className="insight-item-title">Priority Bottleneck</div>
                    <div className="insight-item-desc">
                      {criticalCriteria[0]?.interpretation?.slice(0, 100) || 'Review class responsibilities and coupling.'}
                    </div>
                  </div>
                </div>
              )}

              {positiveCriteria.length > 0 && (
                <div className="feedback-insight-item positive">
                  <div className="insight-icon-box positive">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <div className="insight-item-title">Strong Structure</div>
                    <div className="insight-item-desc">
                      {positiveCriteria[0]?.interpretation?.slice(0, 100) || 'Cohesive domain entities with clear encapsulation.'}
                    </div>
                  </div>
                </div>
              )}

              <div className="feedback-insight-item neutral">
                <div className="insight-icon-box neutral">
                  <TrendingUp size={13} />
                </div>
                <div>
                  <div className="insight-item-title">Next Focus Point</div>
                  <div className="insight-item-desc">
                    {criticalCriteria[0]?.suggestion?.slice(0, 100) || 'Introduce polymorphic strategy interfaces for business rules.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Next Practice Actions */}
          {(feedback.nextPracticeActions?.length ?? 0) > 0 && (
            <div className="feedback-sidebar-card">
              <div className="sidebar-card-header">
                <TrendingUp size={16} color="#6366f1" />
                <h3 className="sidebar-card-title">Recommended Actions</h3>
              </div>

              <div className="feedback-actions-checklist">
                {feedback.nextPracticeActions.slice(0, 4).map((action: string, i: number) => (
                  <div key={i} className="action-checklist-item">
                    <span className="action-index">{i + 1}</span>
                    <span className="action-label">{action}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="feedback-sidebar-action-btn"
                onClick={onRetryDesign}
              >
                <span>Refine Model in Workspace</span>
                <RefreshCw size={13} />
              </button>
            </div>
          )}

          {/* Curated Resources */}
          <div className="feedback-sidebar-card">
            <div className="sidebar-card-header">
              <BookOpen size={16} color="#6366f1" />
              <h3 className="sidebar-card-title">LLD Reference Guides</h3>
            </div>

            <div className="feedback-resources-list">
              {RESOURCES.map((r, i) => (
                <div key={i} className="feedback-resource-row">
                  <div className="resource-info">
                    <span className="resource-title">{r.title}</span>
                    <span className="resource-category">{r.category}</span>
                  </div>
                  <ExternalLink size={12} className="resource-link-icon" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Studio Bottom Navigation */}
      <div className="studio-bottom-nav">
        <button
          type="button"
          className="studio-nav-back-btn"
          onClick={onBack}
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
          <span>Back to Submission</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="feedback-action-btn secondary"
            onClick={onRetryDesign}
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} />
            <span>Iterate on Canvas (v{attempt.currentVersion + 1})</span>
          </button>

          <button
            type="button"
            className="studio-nav-next-btn"
            onClick={onProceedToMutation}
          >
            <span>Proceed to Mutation Defense</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};
