import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw,
  GitCompare,
  Sparkles,
  Loader2,
  Box,
  Layers,
  Code2,
  TrendingUp,
  FileText,
  HelpCircle,
  Award
} from 'lucide-react';
import { Problem, Attempt } from '../types';
import { ApiClient } from '../services/apiClient';

interface MutationChallengeProps {
  problem: Problem;
  attempt: Attempt;
  onUpdateDraft: (updated: Attempt) => void;
  onRetryWithRevision: () => void;
  onViewComparison: () => void;
  onBack: () => void;
}

export const MutationChallenge: React.FC<MutationChallengeProps> = ({
  problem,
  attempt,
  onUpdateDraft,
  onRetryWithRevision,
  onViewComparison,
  onBack
}) => {
  const mutation = problem.mutationScenario;
  const [extensionText, setExtensionText] = useState(attempt.draftContent.extensionResponse || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mutationAssessment, setMutationAssessment] = useState<any>(
    attempt.submissions[attempt.submissions.length - 1]?.evaluation?.mutationReview || null
  );

  const candidateClasses = attempt.draftContent.classes || [];

  const PATTERN_CHIPS = [
    { label: 'Strategy Pattern', template: 'Introduce a Strategy interface to encapsulate the variable algorithm and inject it via constructor.' },
    { label: 'Polymorphic Subclass', template: 'Extend the base entity with a dedicated subclass overriding behavior without altering existing callers.' },
    { label: 'Decorator Pattern', template: 'Wrap the existing entity with a Decorator to add dynamic capabilities transparently.' },
    { label: 'Factory Method', template: 'Use a Factory to instantiate the appropriate concrete policy based on runtime configuration.' },
    { label: 'Observer / Events', template: 'Publish domain events to decouple the core coordinator from auxiliary notification services.' }
  ];

  const handleChipClick = (template: string) => {
    if (!extensionText.trim()) {
      setExtensionText(template);
    } else {
      setExtensionText(prev => `${prev}\n\n${template}`);
    }
  };

  const handleTestExtensibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extensionText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const assessment = await ApiClient.evaluateMutation(
        problem.id,
        attempt.draftContent,
        extensionText
      );

      setMutationAssessment(assessment);

      const updatedDraft = {
        ...attempt.draftContent,
        extensionResponse: extensionText
      };
      onUpdateDraft({
        ...attempt,
        draftContent: updatedDraft
      });
    } catch (err: any) {
      console.warn('Mutation evaluation issue:', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const changeCost = mutationAssessment?.changeCost || 'High';
  const changeCostClass = changeCost === 'Low' ? 'low' : changeCost === 'Medium' ? 'medium' : 'high';

  return (
    <div className="mutation-container">
      {/* Top Header Card */}
      <div className="mutation-header-card">
        <div className="mutation-header-left">
          <div className="mutation-header-icon-box">
            <Zap size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 className="mutation-header-title">Requirement Mutation Challenge</h2>
              <span className={`badge-difficulty ${problem.difficulty?.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="mutation-header-subtitle">
              "Design Defense" • Stress-test your architecture against real-world requirement evolution without shotgun surgery.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="submit-version-pill">
            Submission v{attempt.currentVersion}
          </span>
          <button type="button" className="feedback-action-btn secondary" onClick={onBack}>
            <ArrowLeft size={13} />
            <span>Back to Scorecard</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="mutation-layout-grid">
        {/* Left Column: Mutation Scenario, Current Model Snapshot & Defense Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Scenario Card */}
          <div className="mutation-card">
            <div className="mutation-card-header">
              <h3 className="mutation-card-title">
                <Zap size={15} color="#d97706" />
                <span>Evolving Requirement Scenario</span>
              </h3>
              <span className="mutation-variation-tag">
                Target: {mutation.targetVariation}
              </span>
            </div>

            <div className="mutation-scenario-box">
              <h4 className="mutation-scenario-title">{mutation.title}</h4>
              <p className="mutation-scenario-desc">{mutation.description}</p>
            </div>

            {mutation.expectedBehavior && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#10b981" />
                <span><strong>Expected Architectural Invariant:</strong> {mutation.expectedBehavior}</span>
              </div>
            )}
          </div>

          {/* Current Architecture Snapshot Card */}
          <div className="mutation-card">
            <div className="mutation-card-header">
              <h3 className="mutation-card-title">
                <Layers size={15} color="#4f46e5" />
                <span>Your Current Architecture Snapshot ({candidateClasses.length} Entities)</span>
              </h3>
            </div>

            {candidateClasses.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {candidateClasses.map((cls, idx) => (
                  <div key={idx} className="dw-class-tab-btn" style={{ cursor: 'default', fontSize: '0.74rem' }}>
                    <span className={`dw-badge-symbol ${cls.type}`}>
                      {cls.type === 'interface' ? 'I' : cls.type === 'enum' ? 'E' : 'C'}
                    </span>
                    <span>{cls.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ({cls.methods?.length || 0}m, {cls.attributes?.length || 0}f)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                No entities defined yet in the workspace canvas.
              </p>
            )}
          </div>

          {/* Architectural Defense Form Card */}
          <div className="mutation-card">
            <div className="mutation-card-header">
              <h3 className="mutation-card-title">
                <ShieldCheck size={15} color="#2563eb" />
                <span>Propose Your Adaptation Defense</span>
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Open-Closed Principle (OCP)
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Quick architectural patterns to absorb this change:
            </p>

            <div className="mutation-chip-list">
              {PATTERN_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="mutation-chip"
                  onClick={() => handleChipClick(chip.template)}
                >
                  <Sparkles size={11} color="#6366f1" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleTestExtensibility} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                className="mutation-textarea"
                rows={5}
                placeholder="Explain which classes stay untouched, what new interface/class is introduced, and how dependency injection isolates the coordinator (e.g. 'Add EvSpot composing ParkingSpot with Meter; inject DynamicHourlyPricingStrategy into FeeCalculator without modifying ParkingLot coordinator')..."
                value={extensionText}
                onChange={(e) => setExtensionText(e.target.value)}
                disabled={isAnalyzing}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {extensionText.length} characters • Evaluated via Live AI
                </span>

                <button
                  type="submit"
                  className="feedback-action-btn primary"
                  disabled={isAnalyzing || !extensionText.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Evaluating Extensibility...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>Analyze Design Extensibility</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Extensibility Evaluation Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mutationAssessment ? (
            <div className="mutation-card">
              <div className="mutation-card-header">
                <h3 className="mutation-card-title">
                  <Award size={16} color="#2563eb" />
                  <span>Extensibility Evaluation Scorecard</span>
                </h3>
              </div>

              {/* Result Hero Banner */}
              <div className="mutation-result-hero">
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Change Cost Metric
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {changeCost} Change Cost
                  </div>
                </div>

                <span className={`mutation-badge ${changeCostClass}`}>
                  {changeCost === 'Low' ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <AlertTriangle size={13} />
                  )}
                  <span>OCP Verdict: {mutationAssessment.openClosedVerdict}</span>
                </span>
              </div>

              {/* Modification Impact Grid */}
              <div className="mutation-impact-grid">
                <div className="mutation-impact-card">
                  <span className="mutation-impact-label">Modified Classes (Risk)</span>
                  <div className="mutation-pill-list">
                    {mutationAssessment.classesModified && mutationAssessment.classesModified.length > 0 ? (
                      mutationAssessment.classesModified.map((clsName: string, idx: number) => (
                        <span key={idx} className="mutation-class-pill modified">
                          <strong>-</strong> {clsName}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#059669', fontStyle: 'italic' }}>
                        None (0 core classes modified)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mutation-impact-card">
                  <span className="mutation-impact-label">New Classes (Extensions)</span>
                  <div className="mutation-pill-list">
                    {mutationAssessment.classesAdded && mutationAssessment.classesAdded.length > 0 ? (
                      mutationAssessment.classesAdded.map((clsName: string, idx: number) => (
                        <span key={idx} className="mutation-class-pill added">
                          <strong>+</strong> {clsName}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        None declared
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluator Analysis */}
              <div className="mutation-critique-box">
                <strong style={{ display: 'block', marginBottom: '3px' }}>Principal Architect Critique:</strong>
                {mutationAssessment.analysis}
              </div>

              {/* Recommended Refactoring */}
              {mutationAssessment.recommendedRefactoring && (
                <div className="mutation-refactoring-box">
                  <strong style={{ display: 'block', marginBottom: '3px' }}>Actionable Architectural Refactoring:</strong>
                  {mutationAssessment.recommendedRefactoring}
                </div>
              )}
            </div>
          ) : (
            <div className="mutation-card">
              <div className="mutation-card-header">
                <h3 className="mutation-card-title">
                  <HelpCircle size={16} color="#6366f1" />
                  <span>Interview Evaluation Rubric</span>
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <p style={{ margin: 0 }}>
                  In low-level design interviews (Google, Amazon, Meta), interviewers introduce requirement mutations midway to test if your design follows:
                </p>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>1. Open-Closed Principle (OCP):</strong>
                  <div>Classes should be open for extension, but closed for modification.</div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>2. Low Change Cost:</strong>
                  <div>Adding a feature should require adding new classes, not editing existing coordinators.</div>
                </div>

                <div style={{ background: 'var(--bg-surface-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>3. Avoiding Shotgun Surgery:</strong>
                  <div>A single business change must not ripple across 5+ different source files.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="mutation-bottom-bar">
        <button type="button" className="feedback-action-btn secondary" onClick={onBack}>
          <ArrowLeft size={13} />
          <span>Back to Scorecard</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {attempt.submissions.length >= 2 && (
            <button type="button" className="feedback-action-btn secondary" onClick={onViewComparison}>
              <GitCompare size={13} color="#2563eb" />
              <span>Compare Iterations (v1 vs v2)</span>
            </button>
          )}

          <button type="button" className="feedback-action-btn primary" onClick={onRetryWithRevision}>
            <RefreshCw size={13} />
            <span>Apply Refactoring in Workspace (v{attempt.currentVersion + 1})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
