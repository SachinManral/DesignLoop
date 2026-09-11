import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Bot,
  MessageSquareQuote,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ShieldCheck,
  Layers,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { Problem, Attempt, ClarificationQA } from '../types';
import { ApiClient } from '../services/apiClient';

interface ClarifyStepProps {
  problem: Problem;
  attempt: Attempt;
  onUpdateDraft: (updated: Attempt) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ClarifyStep: React.FC<ClarifyStepProps> = ({
  problem,
  attempt,
  onUpdateDraft,
  onNext,
  onBack
}) => {
  const [qas, setQas] = useState<ClarificationQA[]>(problem.clarificationQAs);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'pattern' | 'boundary'>('all');
  const [latestAiCritique, setLatestAiCritique] = useState<{
    feedback: string;
    rating: string;
    pattern?: string;
  } | null>(null);
  const [showSelfCheck, setShowSelfCheck] = useState(false);
  const [addedAssumptions, setAddedAssumptions] = useState<Record<string, boolean>>({});

  const revealedCount = qas.filter((q) => q.revealed).length;
  const isAllClarified = revealedCount === qas.length && qas.length > 0;

  const toggleReveal = (id: string) => {
    setQas((prev) =>
      prev.map((qa) => {
        if (qa.id === id) {
          const nextState = !qa.revealed;

          const currentSelected = new Set(attempt.draftContent.clarificationsSelected || []);
          if (nextState) {
            currentSelected.add(qa.question);
          } else {
            currentSelected.delete(qa.question);
          }

          const updatedAttempt: Attempt = {
            ...attempt,
            draftContent: {
              ...attempt.draftContent,
              clarificationsSelected: Array.from(currentSelected)
            }
          };
          onUpdateDraft(updatedAttempt);

          return { ...qa, revealed: nextState };
        }
        return qa;
      })
    );
  };

  const handleAddAssumptionFromQA = (qa: ClarificationQA) => {
    const assumptionText = `${qa.question.replace(/\?$/, '')} → ${qa.answer}`;
    const currentAssumptions = [...(attempt.draftContent.assumptions || [])];

    if (!currentAssumptions.includes(assumptionText)) {
      currentAssumptions.push(assumptionText);
      const updatedAttempt: Attempt = {
        ...attempt,
        draftContent: {
          ...attempt.draftContent,
          assumptions: currentAssumptions
        }
      };
      onUpdateDraft(updatedAttempt);
    }

    setAddedAssumptions((prev) => ({ ...prev, [qa.id]: true }));
  };

  const handleAddCustom = async (e?: React.FormEvent, questionTextOverride?: string) => {
    if (e) e.preventDefault();
    const qText = (questionTextOverride || customQuestion).trim();
    if (!qText || isAskingAi) return;

    setIsAskingAi(true);
    setCustomQuestion('');
    setLatestAiCritique(null);

    try {
      const aiResponse = await ApiClient.askAiInterviewer(problem.id, qText);
      const newQA: ClarificationQA = {
        id: `custom-${Date.now()}`,
        question: qText,
        answer: aiResponse.answer,
        impactOnDesign: aiResponse.impactOnDesign,
        whyItMatters: 'Custom constraint clarified during active interview session.',
        signalType: 'Critical',
        recommendedPattern: aiResponse.recommendedPattern || 'Strategy / Decoupled Coordinator',
        interviewerEvaluation: aiResponse.interviewerFeedback || 'Shows proactive exploration of real-world edge cases before writing classes.',
        questionRating: aiResponse.questionRating || 'High Signal',
        revealed: true
      };

      setQas((prev) => [...prev, newQA]);

      if (aiResponse.interviewerFeedback || aiResponse.questionRating) {
        setLatestAiCritique({
          feedback: aiResponse.interviewerFeedback || 'Strong candidate question. Demonstrates architectural maturity.',
          rating: aiResponse.questionRating || 'High Signal',
          pattern: aiResponse.recommendedPattern
        });
      }

      const currentSelected = new Set(attempt.draftContent.clarificationsSelected || []);
      currentSelected.add(qText);

      const updatedAssumptions = [...(attempt.draftContent.assumptions || [])];
      if (aiResponse.suggestedAssumption && !updatedAssumptions.includes(aiResponse.suggestedAssumption)) {
        updatedAssumptions.push(aiResponse.suggestedAssumption);
      }

      const updatedAttempt: Attempt = {
        ...attempt,
        draftContent: {
          ...attempt.draftContent,
          clarificationsSelected: Array.from(currentSelected),
          assumptions: updatedAssumptions
        }
      };
      onUpdateDraft(updatedAttempt);
    } catch {
      const newQA: ClarificationQA = {
        id: `custom-${Date.now()}`,
        question: qText,
        answer: 'Design to decouple policy from coordinator so multiple strategies can be supported dynamically.',
        impactOnDesign: 'Provides architectural flexibility for future business variations.',
        whyItMatters: 'Decouples variable algorithms from entity managers.',
        signalType: 'Pattern',
        recommendedPattern: 'Strategy Pattern',
        interviewerEvaluation: 'Tests if candidate anticipates runtime variations.',
        questionRating: 'High Signal',
        revealed: true
      };
      setQas((prev) => [...prev, newQA]);
    } finally {
      setIsAskingAi(false);
    }
  };

  const filteredQAs = qas.filter((qa) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return qa.signalType === 'Critical';
    if (activeFilter === 'pattern') return qa.signalType === 'Pattern';
    if (activeFilter === 'boundary') return qa.signalType === 'Boundary' || qa.signalType === 'Invariant';
    return true;
  });

  const quickPrompts = [
    'Can rates surge during peak hours?',
    'How should hardware failure or network timeout be handled?',
    'Are reservation slots cancellable with refund?'
  ];

  return (
    <div className="studio-step-wrapper">
      {/* Top Stage Header Card */}
      <div className="studio-stage-header-card">
        <div className="studio-stage-top-row">
          <div className="studio-stage-title-row" style={{ margin: 0, flex: 1 }}>
            <div className="studio-stage-icon-box">
              <HelpCircle size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="studio-stage-heading">Clarify Ambiguous Requirements</h2>
              <p className="studio-stage-description">
                In real LLD interviews, requirements are deliberately open-ended. Clarifying constraints before drawing classes demonstrates engineering maturity.
              </p>
            </div>
          </div>

          <div className={`studio-progress-badge ${isAllClarified ? 'completed' : ''}`} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            {isAllClarified ? <Check size={13} strokeWidth={2.5} /> : <MessageSquareQuote size={13} />}
            <span>{revealedCount} of {qas.length} Clarified</span>
          </div>
        </div>

        {/* Interactive Learning Filters */}
        <div className="clarify-filter-bar">
          <button
            className={`clarify-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({qas.length})
          </button>
          <button
            className={`clarify-filter-btn ${activeFilter === 'critical' ? 'active' : ''}`}
            onClick={() => setActiveFilter('critical')}
          >
            <Zap size={12} color="#dc2626" />
            Critical Signals
          </button>
          <button
            className={`clarify-filter-btn ${activeFilter === 'pattern' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pattern')}
          >
            <Layers size={12} color="#7c3aed" />
            Pattern Hooks
          </button>
          <button
            className={`clarify-filter-btn ${activeFilter === 'boundary' ? 'active' : ''}`}
            onClick={() => setActiveFilter('boundary')}
          >
            <ShieldCheck size={12} color="#16a34a" />
            Boundaries & Rules
          </button>
        </div>
      </div>

      {/* Clarification Questions List */}
      <div className="clarify-questions-list">
        {filteredQAs.map((qa, index) => {
          const signal = qa.signalType || 'Pattern';
          const isAdded = addedAssumptions[qa.id];
          const questionNumber = String(index + 1).padStart(2, '0');

          return (
            <div
              key={qa.id}
              className={`clarify-qa-card ${qa.revealed ? 'revealed' : ''}`}
            >
              <div
                className="clarify-qa-main-row"
                onClick={() => toggleReveal(qa.id)}
              >
                <div className="clarify-qa-left">
                  <div className="clarify-q-index-pill">
                    {qa.revealed ? <Check size={14} strokeWidth={2.5} /> : questionNumber}
                  </div>

                  <div className="clarify-q-text-group">
                    <span className="clarify-q-text">{qa.question}</span>

                    <span className={`clarify-signal-tag ${signal.toLowerCase()}`}>
                      {signal === 'Critical' && '⚡ Critical'}
                      {signal === 'Pattern' && '🧩 Pattern'}
                      {signal === 'Boundary' && '🛡️ Boundary'}
                      {signal === 'Invariant' && '⚖️ Invariant'}
                    </span>
                  </div>
                </div>

                <button
                  className={`clarify-action-btn ${qa.revealed ? 'revealed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReveal(qa.id);
                  }}
                >
                  {qa.revealed ? (
                    <>
                      <CheckCircle2 size={13} color="#059669" />
                      <span>Clarified</span>
                      <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      <Bot size={13} />
                      <span>Clarify with Interviewer</span>
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Interviewer Answer & Insights */}
              {qa.revealed && (
                <div className="clarify-answer-drawer">
                  {/* Interviewer Response Bubble */}
                  <div className="clarify-response-bubble">
                    <div className="bubble-header">
                      <span className="interviewer-tag">
                        <CheckCircle2 size={11} strokeWidth={2.4} />
                        <span>Interviewer Answer</span>
                      </span>

                      <button
                        type="button"
                        className={`clarify-sync-btn ${isAdded ? 'synced' : ''}`}
                        onClick={() => handleAddAssumptionFromQA(qa)}
                        title="Add this constraint to Step 2 Assumptions"
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} color="#059669" strokeWidth={2.5} />
                            <span>Saved to Assumptions</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>+ Add to Assumptions</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="bubble-text">{qa.answer}</p>
                  </div>

                  {/* 2-Column Insights Grid */}
                  <div className="clarify-insights-grid">
                    <div className="insight-card eval">
                      <div className="insight-title">
                        <Award size={12} />
                        <span>Interviewer Signal</span>
                      </div>
                      <p className="insight-desc">
                        {qa.interviewerEvaluation || qa.whyItMatters || 'Tests domain boundary modeling and invariant identification.'}
                      </p>
                    </div>

                    <div className="insight-card impact">
                      <div className="insight-title">
                        <Sparkles size={12} />
                        <span>Architecture & Pattern Link</span>
                      </div>
                      <p className="insight-desc">
                        {qa.impactOnDesign}
                      </p>
                    </div>
                  </div>

                  {qa.recommendedPattern && (
                    <div className="clarify-drawer-footer">
                      <span className="clarify-pattern-chip">
                        <Layers size={12} />
                        <span>Recommended: {qa.recommendedPattern}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom AI Interviewer Box */}
      <div className="clarify-ai-custom-card">
        <div className="ai-custom-header">
          <div className="ai-custom-title-row">
            <Bot size={16} color="#6366f1" />
            <h3>Ask a custom clarifying question</h3>
          </div>
          <span className="ai-custom-badge">AI Interviewer</span>
        </div>

        <form onSubmit={handleAddCustom} className="ai-custom-form">
          <div className="ai-custom-input-wrapper">
            <Search size={15} className="ai-custom-input-icon" />
            <input
              type="text"
              className="ai-custom-input"
              placeholder="e.g. Can rates surge during peak hours? How are parking spots locked under high concurrency?"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              disabled={isAskingAi}
            />
          </div>

          <button
            type="submit"
            className="ai-custom-submit-btn"
            disabled={isAskingAi || !customQuestion.trim()}
          >
            {isAskingAi ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Bot size={14} />
                <span>Ask Interviewer</span>
              </>
            )}
          </button>
        </form>

        {latestAiCritique && (
          <div className="ai-critique-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                  Interviewer Assessment
                </span>
              </div>
              <span className="interviewer-tag">{latestAiCritique.rating}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.45 }}>
              {latestAiCritique.feedback}
            </p>
            {latestAiCritique.pattern && (
              <div style={{ fontSize: '0.76rem', color: '#4338ca', fontWeight: 700 }}>
                Pattern Recommendation: {latestAiCritique.pattern}
              </div>
            )}
          </div>
        )}

        <div className="ai-quick-chips-row" style={{ marginTop: '8px' }}>
          <span className="ai-quick-label">Try asking:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-quick-chip"
              onClick={() => handleAddCustom(undefined, prompt)}
              disabled={isAskingAi}
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Self-Check Interview Drill */}
      <div className="self-check-drill-box">
        <div className="drill-header">
          <div className="drill-title">
            <Award size={16} color="#6366f1" />
            <span>Interview Concept Checkpoint</span>
          </div>

          <button
            type="button"
            className="clarify-filter-btn"
            onClick={() => setShowSelfCheck(!showSelfCheck)}
          >
            {showSelfCheck ? 'Hide Answer' : 'Reveal Pattern Solution'}
          </button>
        </div>

        {showSelfCheck && (
          <div className="drill-answer-box">
            <p style={{ margin: 0 }}>
              <strong>Architecture Insight:</strong> When fee calculations or spot allocation policies can vary per facility or change dynamically, avoid hardcoding the algorithms inside <code>ParkingLot</code>. Instead, inject a <code>FeeCalculationStrategy</code> and <code>SpotAssignmentStrategy</code> interface (Strategy Pattern).
            </p>
          </div>
        )}
      </div>

      {/* Studio Bottom Navigation Bar */}
      <div className="studio-bottom-nav">
        <button className="studio-nav-back-btn" onClick={onBack}>
          <ArrowLeft size={15} strokeWidth={2.2} />
          <span>Back to Problem Overview</span>
        </button>

        <button className="studio-nav-next-btn" onClick={onNext}>
          <span>Proceed to Assumptions</span>
          <ArrowRight size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};
