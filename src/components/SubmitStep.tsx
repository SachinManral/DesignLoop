import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  Layers,
  Box,
  Link as LinkIcon,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  Code2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Problem, Attempt, Submission } from '../types';
import { DeterministicValidator } from '../services/deterministicValidator';
import { ApiClient } from '../services/apiClient';
import { StorageService } from '../services/storageService';
import { GLOBAL_8_DIMENSION_RUBRIC } from '../data/seedProblems';

interface SubmitStepProps {
  problem: Problem;
  attempt: Attempt;
  onUpdateDraft: (updated: Attempt) => void;
  onEvaluationComplete: (updated: Attempt) => void;
  onBack: () => void;
}

export const SubmitStep: React.FC<SubmitStepProps> = ({
  problem,
  attempt,
  onUpdateDraft,
  onEvaluationComplete,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalProgress, setEvalProgress] = useState<string>('');
  const [evalStepNumber, setEvalStepNumber] = useState<number>(1);
  const [showSnapshot, setShowSnapshot] = useState(true);

  const validation = DeterministicValidator.validate(attempt.draftContent, problem);

  const handleSubmit = async () => {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setEvalStepNumber(1);
    setEvalProgress('Persisting immutable architecture snapshot...');

    // 1. Persist Submission Snapshot (Store-Before-Execute pattern)
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      attemptId: attempt.id,
      versionNumber: attempt.currentVersion,
      content: JSON.parse(JSON.stringify(attempt.draftContent)),
      submittedAt: new Date().toISOString(),
      validationResult: validation
    };

    attempt.status = 'SUBMITTED';
    attempt.submissions = [...attempt.submissions, newSubmission];
    StorageService.saveAttempt(attempt);

    // 2. Transition to EVALUATING
    await new Promise(r => setTimeout(r, 400));
    setEvalStepNumber(2);
    setEvalProgress('Evaluating architecture across 8 core interview dimensions...');
    attempt.status = 'EVALUATING';
    StorageService.saveAttempt(attempt);

    try {
      // 3. Run Live AI Evaluation
      const feedback = await ApiClient.submitEvaluation(
        problem.id,
        attempt.draftContent,
        attempt.currentVersion,
        attempt.id
      );

      setEvalStepNumber(3);
      setEvalProgress('Finalizing grounded critique citations and scoring breakdown...');
      await new Promise(r => setTimeout(r, 300));

      // 4. Complete Evaluation
      newSubmission.evaluation = feedback;
      attempt.status = 'EVALUATED';
      attempt.activeStep = 6; // Move to Feedback
      StorageService.saveAttempt(attempt);

      // Trigger celebration confetti
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      onEvaluationComplete(attempt);
    } catch (err: any) {
      attempt.status = 'FAILED';
      StorageService.saveAttempt(attempt);
      alert(`Evaluation failed: ${err.message || 'Unknown error'}. Your draft was safely stored.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classes = attempt.draftContent.classes || [];
  const relationships = attempt.draftContent.relationships || [];
  const assumptions = attempt.draftContent.assumptions || [];

  const classCount = classes.length;
  const interfacesCount = classes.filter(c => c.type === 'interface' || c.type === 'abstract').length;
  const relCount = relationships.length;
  const assumptionsCount = assumptions.length;

  return (
    <div className="submit-step-container">
      {/* Top Header Card */}
      <div className="submit-header-card">
        <div className="submit-header-left">
          <div className="submit-header-icon-box">
            <Send size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="submit-header-title">Submission & Evaluation Review</h2>
            <p className="submit-header-subtitle">
              Verify your architecture model against deterministic pre-checks and the 8 LLD interview dimensions.
            </p>
          </div>
        </div>

        <div className="submit-header-badges">
          <span className={`submit-status-pill ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid ? (
              <>
                <CheckCircle2 size={12} strokeWidth={2.4} />
                <span>Ready to Submit</span>
              </>
            ) : (
              <>
                <AlertTriangle size={12} strokeWidth={2.4} />
                <span>{validation.errors.length} Required Fix{validation.errors.length > 1 ? 'es' : ''}</span>
              </>
            )}
          </span>
          <span className="submit-version-pill">
            Version {attempt.currentVersion}
          </span>
        </div>
      </div>

      {/* 4-Stat Metrics Strip */}
      <div className="submit-metrics-strip">
        <div className="submit-metric-item">
          <div className="submit-metric-icon-box box-blue">
            <Box size={16} />
          </div>
          <div className="submit-metric-data">
            <div className="submit-metric-val">{classCount}</div>
            <div className="submit-metric-lbl">Classes Defined</div>
          </div>
        </div>

        <div className="submit-metric-divider" />

        <div className="submit-metric-item">
          <div className="submit-metric-icon-box box-purple">
            <Layers size={16} />
          </div>
          <div className="submit-metric-data">
            <div className="submit-metric-val">{interfacesCount}</div>
            <div className="submit-metric-lbl">Abstractions</div>
          </div>
        </div>

        <div className="submit-metric-divider" />

        <div className="submit-metric-item">
          <div className="submit-metric-icon-box box-emerald">
            <LinkIcon size={16} />
          </div>
          <div className="submit-metric-data">
            <div className="submit-metric-val">{relCount}</div>
            <div className="submit-metric-lbl">Relationships</div>
          </div>
        </div>

        <div className="submit-metric-divider" />

        <div className="submit-metric-item">
          <div className="submit-metric-icon-box box-indigo">
            <FileText size={16} />
          </div>
          <div className="submit-metric-data">
            <div className="submit-metric-val">{assumptionsCount}</div>
            <div className="submit-metric-lbl">Scope Rules</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="submit-content-grid">
        {/* Left Column: Pre-Flight Verification & Blueprint Snapshot */}
        <div className="submit-main-col">
          {/* Deterministic Pre-Flight Card */}
          <div className="submit-card">
            <div className="submit-card-header">
              <div className="submit-card-title-group">
                {validation.isValid ? (
                  <ShieldCheck size={18} color="#10b981" strokeWidth={2.4} />
                ) : (
                  <AlertTriangle size={18} color="#ef4444" strokeWidth={2.4} />
                )}
                <h3 className="submit-card-title">
                  {validation.isValid ? 'Deterministic Pre-Flight Checks Passed' : 'Pre-Flight Issues Detected'}
                </h3>
              </div>
              <span className="submit-check-summary-badge">
                {validation.isValid ? '3 / 3 Passed' : `${validation.errors.length} Blocking`}
              </span>
            </div>

            {/* Smart 3-Point Validation Indicators */}
            <div className="submit-checks-row">
              {/* 1. Entity Integrity */}
              <div className={`submit-check-block ${classCount > 0 ? 'passed' : 'failed'}`}>
                {classCount > 0 ? (
                  <CheckCircle2 size={16} className="check-icon passed" />
                ) : (
                  <XCircle size={16} className="check-icon failed" />
                )}
                <div className="check-block-body">
                  <div className="check-block-title">
                    {classCount > 0 ? `${classCount} Classes Modeled` : 'No Classes Defined'}
                  </div>
                  <div className="check-block-desc">
                    {classCount > 0 ? 'Core entities present' : 'At least 1 class required'}
                  </div>
                </div>
              </div>

              {/* 2. Relationship Graph */}
              <div className={`submit-check-block ${relCount > 0 ? 'passed' : 'neutral'}`}>
                {relCount > 0 ? (
                  <CheckCircle2 size={16} className="check-icon passed" />
                ) : (
                  <Info size={16} className="check-icon neutral" />
                )}
                <div className="check-block-body">
                  <div className="check-block-title">
                    {relCount > 0 ? `${relCount} Relationships` : 'Standalone Model'}
                  </div>
                  <div className="check-block-desc">
                    {relCount > 0 ? 'Coupling paths connected' : '0 connections configured'}
                  </div>
                </div>
              </div>

              {/* 3. Scope & Assumptions */}
              <div className={`submit-check-block ${assumptionsCount > 0 ? 'passed' : 'neutral'}`}>
                {assumptionsCount > 0 ? (
                  <CheckCircle2 size={16} className="check-icon passed" />
                ) : (
                  <Info size={16} className="check-icon neutral" />
                )}
                <div className="check-block-body">
                  <div className="check-block-title">
                    {assumptionsCount > 0 ? `${assumptionsCount} Scope Rules` : 'No Assumptions'}
                  </div>
                  <div className="check-block-desc">
                    {assumptionsCount > 0 ? 'Boundary context set' : 'Optional scope notes'}
                  </div>
                </div>
              </div>
            </div>

            {/* Blocking Errors Banner with Actionable Button */}
            {validation.errors.length > 0 && (
              <div className="submit-error-callout">
                <div className="error-callout-header">
                  <AlertCircle size={15} />
                  <span>Action Required:</span>
                </div>
                <ul className="error-callout-list">
                  {validation.errors.map((err, i) => (
                    <li key={i}>
                      <span>{err.message}</span>
                      {err.suggestion && <span className="error-suggestion">Advice: {err.suggestion}</span>}
                    </li>
                  ))}
                </ul>
                <button 
                  type="button" 
                  className="submit-fix-nav-btn"
                  onClick={onBack}
                >
                  <ArrowLeft size={13} />
                  <span>Back to Canvas to Add Classes</span>
                </button>
              </div>
            )}

            {/* Non-Blocking Warnings */}
            {validation.warnings.length > 0 && (
              <div className="submit-warning-callout">
                <div className="warning-callout-header">
                  <Info size={14} />
                  <span>Recommendations:</span>
                </div>
                <ul className="warning-callout-list">
                  {validation.warnings.map((w, i) => (
                    <li key={i}>{w.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Architecture Snapshot Quick-View Card */}
          <div className="submit-card">
            <div 
              className="submit-card-header interactive"
              onClick={() => setShowSnapshot(!showSnapshot)}
            >
              <div className="submit-card-title-group">
                <Code2 size={17} color="#6366f1" strokeWidth={2.4} />
                <h3 className="submit-card-title">Architecture Snapshot Preview</h3>
                <span className="submit-card-count-tag">
                  {classCount} {classCount === 1 ? 'entity' : 'entities'}
                </span>
              </div>
              <button type="button" className="submit-toggle-icon-btn">
                {showSnapshot ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {showSnapshot && (
              <div className="submit-snapshot-content">
                {classes.length === 0 ? (
                  <div className="submit-empty-snapshot-box">
                    <p className="empty-snapshot-text">
                      No classes or interfaces have been added to your draft yet.
                    </p>
                    <button 
                      type="button" 
                      className="submit-jump-btn"
                      onClick={onBack}
                    >
                      <span>Open Design Workspace</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="submit-classes-bento">
                    {classes.map((cls) => (
                      <div key={cls.id} className="submit-class-bento-card">
                        <div className="class-bento-header">
                          <span className={`dw-badge-symbol ${cls.type || 'class'}`}>
                            {cls.type === 'interface' ? 'I' : cls.type === 'abstract' ? 'A' : cls.type === 'enum' ? 'E' : 'C'}
                          </span>
                          <span className="class-bento-name">{cls.name}</span>
                        </div>
                        {cls.whyExists && (
                          <p className="class-bento-rationale">{cls.whyExists}</p>
                        )}
                        <div className="class-bento-stats">
                          <span>{cls.methods?.length || 0} methods</span>
                          <span>•</span>
                          <span>{cls.attributes?.length || 0} attributes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {relationships.length > 0 && (
                  <div className="submit-snapshot-relationships">
                    <span className="snapshot-rels-title">Defined Relationships:</span>
                    <div className="snapshot-rels-chips">
                      {relationships.map((rel) => {
                        const fromCls = classes.find(c => c.name === rel.fromClass || c.id === rel.fromClass);
                        const toCls = classes.find(c => c.name === rel.toClass || c.id === rel.toClass);
                        return (
                          <div key={rel.id} className="submit-rel-badge">
                            <span className="rel-class-name">{fromCls?.name || rel.fromClass}</span>
                            <span className="rel-arrow-type">{rel.type}</span>
                            <span className="rel-class-name">{toCls?.name || rel.toClass}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 8-Dimension Rubric Breakdown */}
        <div className="submit-side-col">
          <div className="submit-card">
            <div className="submit-card-header">
              <div className="submit-card-title-group">
                <Award size={17} color="#6366f1" strokeWidth={2.4} />
                <h3 className="submit-card-title">8-Dimension Evaluation Rubric</h3>
              </div>
              <span className="submit-card-count-tag">100% Weight</span>
            </div>

            <p className="rubric-explainer">
              The AI Evaluator will grade your submission against these 8 core system design interview pillars:
            </p>

            <div className="submit-rubric-list">
              {GLOBAL_8_DIMENSION_RUBRIC.map((dim) => (
                <div key={dim.id} className="submit-rubric-row">
                  <div className="rubric-row-left">
                    <div className="rubric-row-name">{dim.name}</div>
                    <div className="rubric-row-desc">{dim.description}</div>
                  </div>
                  <div className="rubric-row-weight">{dim.weight}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live AI Evaluation Progress Bar (Store-Before-Execute) */}
      {isSubmitting && (
        <div className="submit-progress-banner">
          <div className="submit-progress-spinner-box">
            <Loader2 size={22} className="spin" color="#6366f1" />
          </div>
          <div className="submit-progress-content">
            <div className="submit-progress-header-row">
              <span className="submit-progress-title">Running Live AI Architecture Evaluation</span>
              <span className="submit-progress-step-badge">Stage {evalStepNumber} of 3</span>
            </div>
            <div className="submit-progress-sub">{evalProgress}</div>
            <div className="submit-progress-bar-track">
              <div 
                className="submit-progress-bar-fill" 
                style={{ width: `${evalStepNumber === 1 ? 33 : evalStepNumber === 2 ? 75 : 98}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Studio Action Nav Bar */}
      <div className="studio-bottom-nav">
        <button
          type="button"
          className="studio-nav-back-btn"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
          <span>Back to Workspace</span>
        </button>

        <button
          type="button"
          className="studio-nav-next-btn"
          onClick={handleSubmit}
          disabled={!validation.isValid || isSubmitting}
          style={{ opacity: (!validation.isValid || isSubmitting) ? 0.6 : 1 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="spin" />
              <span>Running Live Evaluation...</span>
            </>
          ) : (
            <>
              <span>Submit for Live Evaluation</span>
              <ArrowRight size={14} strokeWidth={2.2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
