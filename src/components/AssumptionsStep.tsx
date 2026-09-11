import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Bot,
  PlusCircle,
  Pencil,
  Check,
  CheckCircle2,
  Lightbulb,
  Target,
  Quote
} from 'lucide-react';
import { Problem, Attempt } from '../types';
import { ApiClient } from '../services/apiClient';

interface AssumptionsStepProps {
  problem: Problem;
  attempt: Attempt;
  onUpdateDraft: (updated: Attempt) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AssumptionsStep: React.FC<AssumptionsStepProps> = ({
  problem,
  attempt,
  onUpdateDraft,
  onNext,
  onBack
}) => {
  const [assumptions, setAssumptions] = useState<string[]>(
    attempt.draftContent.assumptions || problem.seedAssumptions
  );
  const [newAssumption, setNewAssumption] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<{
    critique: string;
    suggestedAssumptions: string[];
    missedBoundaries: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssumption.trim()) return;

    const updated = [...assumptions, newAssumption.trim()];
    setAssumptions(updated);

    const updatedAttempt: Attempt = {
      ...attempt,
      draftContent: {
        ...attempt.draftContent,
        assumptions: updated
      }
    };
    onUpdateDraft(updatedAttempt);
    setNewAssumption('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(assumptions[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updated = [...assumptions];
    updated[index] = editingText.trim();
    setAssumptions(updated);

    const updatedAttempt: Attempt = {
      ...attempt,
      draftContent: {
        ...attempt.draftContent,
        assumptions: updated
      }
    };
    onUpdateDraft(updatedAttempt);
    setEditingIndex(null);
  };

  const handleAddSuggested = (suggested: string) => {
    if (assumptions.includes(suggested)) return;
    const updated = [...assumptions, suggested];
    setAssumptions(updated);

    const updatedAttempt: Attempt = {
      ...attempt,
      draftContent: {
        ...attempt.draftContent,
        assumptions: updated
      }
    };
    onUpdateDraft(updatedAttempt);
  };

  const handleDelete = (index: number) => {
    const updated = assumptions.filter((_, i) => i !== index);
    setAssumptions(updated);

    const updatedAttempt: Attempt = {
      ...attempt,
      draftContent: {
        ...attempt.draftContent,
        assumptions: updated
      }
    };
    onUpdateDraft(updatedAttempt);
  };

  const handleReviewWithAi = async () => {
    setIsReviewing(true);
    setAiError(null);
    try {
      const review = await ApiClient.reviewAiAssumptions(problem.id, assumptions);
      setAiReview(review);
    } catch (err) {
      setAiReview(null);
      setAiError(err instanceof Error ? err.message : 'Live AI review is unavailable.');
    } finally {
      setIsReviewing(false);
    }
  };

  const tipsList = [
    'Be explicit about business rules',
    'Define boundaries and constraints',
    'Call out edge cases',
    "Mention what's out of scope",
    'Keep them concise and clear'
  ];

  return (
    <div className="studio-step-wrapper">
      {/* 2-Column Main Layout */}
      <div className="assumptions-page-layout">
        {/* Left Main Column */}
        <div className="assumptions-main-column">
          <div className="assumptions-main-card">
            {/* Header with Document Icon */}
            <div className="assumptions-header-row">
              <div className="assumptions-icon-box">
                <FileText size={20} strokeWidth={2.4} />
              </div>
              <div className="assumptions-header-text">
                <h2 className="assumptions-heading">Define Scope & Assumptions</h2>
                <p className="assumptions-subtitle">
                  Explicit assumptions protect your design against arbitrary edge cases and give the evaluation engine concrete boundary context.
                </p>
              </div>
            </div>

            {/* List Header: Count Badge + Review with AI Button */}
            <div className="assumptions-list-header">
              <div className="assumptions-count-pill">
                <span className="assumptions-count-number">{assumptions.length}</span>
                <span>Assumptions Defined</span>
              </div>

              <button
                type="button"
                className="assumptions-ai-review-btn"
                onClick={handleReviewWithAi}
                disabled={isReviewing}
              >
                {isReviewing ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Reviewing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Review with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Assumptions Items List */}
            <div className="assumptions-items-list">
              {assumptions.map((item, idx) => (
                <div key={idx} className="assumption-item-card">
                  <div className="assumption-item-left">
                    <span className="assumption-number-badge">{idx + 1}</span>

                    {editingIndex === idx ? (
                      <input
                        type="text"
                        className="assumption-add-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(idx);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="assumption-item-text">{item}</span>
                    )}
                  </div>

                  <div className="assumption-item-actions">
                    {editingIndex === idx ? (
                      <button
                        type="button"
                        className="assumption-action-icon-btn"
                        onClick={() => handleSaveEdit(idx)}
                        title="Save Changes"
                      >
                        <Check size={16} color="#059669" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="assumption-action-icon-btn"
                        onClick={() => handleStartEdit(idx)}
                        title="Edit Assumption"
                      >
                        <Pencil size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="assumption-action-icon-btn delete"
                      onClick={() => handleDelete(idx)}
                      title="Delete Assumption"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Assumption Form */}
            <form onSubmit={handleAdd} className="assumption-add-form">
              <Plus size={16} color="#6366f1" style={{ flexShrink: 0 }} />
              <input
                type="text"
                className="assumption-add-input"
                placeholder='Add a new assumption (e.g., "Parking rates are duration-based")'
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
              />
              <button
                type="submit"
                className="assumption-add-btn"
                disabled={!newAssumption.trim()}
              >
                <Plus size={14} strokeWidth={2.4} />
                <span>Add</span>
              </button>
            </form>

            {/* AI Review Drawer */}
            {aiReview && (
              <div className="assumptions-ai-drawer">
                <div className="ai-drawer-header">
                  <Sparkles size={15} color="#4f46e5" />
                  <span>AI Scope & Boundary Critique</span>
                </div>
                <p className="ai-drawer-critique">
                  {aiReview.critique}
                </p>

                {aiReview.suggestedAssumptions?.length > 0 && (
                  <div>
                    <div className="ai-suggestions-title">
                      Suggested Boundaries to Add:
                    </div>
                    <div className="ai-suggestions-list">
                      {aiReview.suggestedAssumptions.map((s, i) => (
                        <div key={i} className="ai-suggestion-item">
                          <span className="ai-suggestion-text">{s}</span>
                          <button
                            type="button"
                            onClick={() => handleAddSuggested(s)}
                            className="ai-adopt-btn"
                          >
                            <PlusCircle size={13} />
                            <span>Adopt</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div role="alert" style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '12px 16px', borderRadius: '10px', fontSize: '0.82rem', color: '#9a3412' }}>
                <strong>Live AI unavailable.</strong> {aiError}
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="studio-bottom-nav">
            <button className="studio-nav-back-btn" onClick={onBack}>
              <ArrowLeft size={15} strokeWidth={2.2} />
              <span>Back to Clarify</span>
            </button>

            <button className="studio-nav-next-btn" onClick={onNext}>
              <span>Proceed to Design Workspace</span>
              <ArrowRight size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="assumptions-sidebar">
          {/* Card 1: Tips for Good Assumptions */}
          <div className="assumptions-sidebar-card assumptions-tips-card">
            <div className="sidebar-card-title-row">
              <Lightbulb size={18} color="#4f46e5" strokeWidth={2.4} />
              <h3 className="sidebar-card-title">Tips for Good Assumptions</h3>
            </div>

            <div className="tips-checklist">
              {tipsList.map((tip, idx) => (
                <div key={idx} className="tip-check-item">
                  <Check size={14} strokeWidth={2.6} className="tip-check-icon" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Why it matters? */}
          <div className="assumptions-sidebar-card assumptions-why-card">
            <div className="why-header">
              <Target size={18} strokeWidth={2.4} />
              <span>Why it matters?</span>
            </div>
            <p className="why-text">
              Clear assumptions help you design better, avoid wrong abstractions, and show engineering maturity.
            </p>
          </div>

          {/* Card 3: Quote Card */}
          <div className="assumptions-sidebar-card assumptions-quote-card">
            <span className="quote-icon">❝</span>
            <p className="quote-text">
              "Good assumptions turn an open-ended problem into a well-defined design."
            </p>
            <span className="quote-author">— Experienced Engineer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
