import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Clock,
  Users,
  FileText,
  Layers,
  Target,
  Info,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Problem, Attempt } from '../types';
import { CompanyAvatarStack } from './CompanyLogo';
import { StorageService } from '../services/storageService';

interface ProblemOverviewProps {
  problem: Problem;
  attempt: Attempt | null;
  onStartPractice: () => void;
  onBackToProblems: () => void;
  onSelectProblem?: (problemId: string) => void;
  relatedProblems?: Problem[];
  practiceStarted?: boolean;
  maxReachedStep?: number;
}

export const ProblemOverview: React.FC<ProblemOverviewProps> = ({
  problem,
  attempt,
  onStartPractice,
  onBackToProblems,
  maxReachedStep = 1
}) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    const bookmarked = StorageService.getBookmarkedProblems();
    setIsBookmarked(bookmarked.includes(problem.id));
  }, [problem.id]);

  const handleToggleBookmark = () => {
    const updated = StorageService.toggleBookmarkedProblem(problem.id);
    setIsBookmarked(updated.includes(problem.id));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const hasSubmissions = !!(attempt && attempt.submissions && attempt.submissions.length > 0);
  const latestSubmission = hasSubmissions
    ? attempt.submissions[attempt.submissions.length - 1]
    : null;
  const latestEvaluation = latestSubmission?.evaluation;

  // Real-time progress computation synced with problem state:
  // Step 1: Overview (0%)
  // Step 2: Clarify (17%)
  // Step 3: Assumptions (33%)
  // Step 4: Design Workspace (50%)
  // Step 5: Submit (67%)
  // Step 6: Feedback (83% or evaluation overall score)
  // Step 7: Mutation Defense (100% or evaluation overall score)
  const effectiveMaxStep = Math.max(
    maxReachedStep,
    attempt?.activeStep || 1,
    hasSubmissions ? 6 : 1
  );

  let progressStatus = 'Not Started';
  let progressPercent = 0;
  let buttonLabel = 'Start Practice (Step 1: Clarify)';

  if (hasSubmissions && latestEvaluation?.overallScore !== undefined) {
    progressPercent = latestEvaluation.overallScore;
    if (effectiveMaxStep >= 7) {
      progressStatus = 'Completed (Defense Ready)';
      buttonLabel = 'Resume Mutation Defense (Step 6)';
    } else {
      progressStatus = `Evaluated (${progressPercent}%)`;
      buttonLabel = 'View Feedback (Step 5)';
    }
  } else if (effectiveMaxStep > 1) {
    const stageCompleted = effectiveMaxStep - 1; // 1 to 6
    progressPercent = Math.min(Math.round((stageCompleted / 6) * 100), 100);

    switch (effectiveMaxStep) {
      case 2:
        progressStatus = 'In Progress (Clarifications)';
        buttonLabel = 'Resume Practice (Step 1: Clarify)';
        break;
      case 3:
        progressStatus = 'In Progress (Assumptions)';
        buttonLabel = 'Resume Practice (Step 2: Assumptions)';
        break;
      case 4:
        progressStatus = 'In Progress (Design Canvas)';
        buttonLabel = 'Resume Design Workspace (Step 3)';
        break;
      case 5:
        progressStatus = 'Ready to Submit';
        buttonLabel = 'Proceed to Submit (Step 4)';
        break;
      case 6:
        progressStatus = 'Feedback Review';
        buttonLabel = 'View Feedback (Step 5)';
        break;
      case 7:
        progressStatus = 'Mutation Defense';
        buttonLabel = 'Resume Mutation Defense (Step 6)';
        break;
      default:
        progressStatus = `In Progress (Stage ${stageCompleted}/6)`;
        buttonLabel = `Resume Practice (Step ${effectiveMaxStep - 1})`;
        break;
    }
  } else {
    progressStatus = 'Not Started';
    progressPercent = 0;
    buttonLabel = 'Start Practice (Step 1: Clarify)';
  }

  const heroImageSrc =
    problem.slug === 'parking-lot'
      ? '/images/parking-lot.jpg'
      : problem.slug === 'splitwise'
      ? '/images/splitwise.jpg'
      : '/images/parking-lot.jpg';

  const initialLetter = problem.title.charAt(0) || 'P';

  return (
    <div className="overview-page-wrapper">
      {/* Top Bar: Back link + Save & Share buttons */}
      <div className="overview-top-nav">
        <button className="overview-back-btn" onClick={onBackToProblems}>
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back to Problem Catalog</span>
        </button>

        <div className="overview-top-actions">
          <button
            className={`overview-action-pill-btn ${isBookmarked ? 'active' : ''}`}
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
          >
            <Bookmark
              size={15}
              strokeWidth={isBookmarked ? 2.4 : 1.8}
              fill={isBookmarked ? '#4f46e5' : 'none'}
            />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            className="overview-action-pill-btn"
            onClick={handleCopyLink}
            title="Copy Problem URL"
          >
            {copiedLink ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Problem Hero Card */}
      <div className="overview-hero-card">
        <div className="hero-content-column">
          <div className="hero-header-section">
            <div className="hero-symbol-avatar">
              <span>{initialLetter}</span>
            </div>

            <div className="hero-meta-block">
              <div className="hero-category-label">
                <Sparkles size={12} className="category-sparkle-icon" />
                <span>SYSTEM DESIGN</span>
              </div>

              <div className="hero-title-badge-row">
                <h1 className="overview-problem-title">{problem.title}</h1>
                <span className={`card-difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <Clock size={14} strokeWidth={2} />
                  <span>{problem.estimatedMinutes} mins</span>
                </div>
                <div className="hero-stat-item">
                  <Users size={14} strokeWidth={2} />
                  <span>12.4k attempts</span>
                </div>
                <div className="hero-stat-item companies-meta">
                  <span className="companies-label">Popular at</span>
                  <CompanyAvatarStack companies={problem.companies} size={22} maxVisible={4} />
                </div>
              </div>
            </div>
          </div>

          <p className="overview-problem-subtitle">{problem.subtitle}</p>

          <div className="overview-tags-row">
            {problem.tags.map((tag, idx) => (
              <span key={idx} className="card-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="hero-image-column">
          <img src={heroImageSrc} alt={problem.title} className="hero-banner-img" />
        </div>
      </div>

      {/* 2-Column Split: Content & Right Sidebar */}
      <div className="overview-main-grid">
        {/* Left Column */}
        <div className="overview-left-column">
          {/* Card 1: Problem Statement & Overview */}
          <div className="overview-content-card">
            <div className="card-section-header">
              <div className="section-title-box">
                <FileText size={18} color="#4f46e5" strokeWidth={2.2} />
                <h2>Problem Statement & Overview</h2>
              </div>
            </div>

            <div className="statement-prose-box">
              <p>{problem.statement}</p>
            </div>

            {/* What's the goal callout banner */}
            <div className="goal-callout-box">
              <div className="goal-icon-circle">
                <Target size={18} color="#4f46e5" strokeWidth={2.2} />
              </div>
              <div className="goal-content">
                <h4 className="goal-title">What's the goal?</h4>
                <p className="goal-text">
                  {problem.slug === 'parking-lot'
                    ? 'Design a scalable, maintainable, and extensible parking lot system that can handle real-world scenarios.'
                    : `Design a scalable, robust, and extensible ${problem.title.toLowerCase()} system that can handle real-world scenarios.`}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Functional Requirements */}
          <div className="overview-content-card">
            <div className="card-section-header">
              <div className="section-title-box">
                <Layers size={18} color="#4f46e5" strokeWidth={2.2} />
                <h2>Functional Requirements</h2>
              </div>
              <span className="requirements-count-badge">
                {problem.functionalRequirements.length} Core Rules
              </span>
            </div>

            <div className="clean-requirements-list">
              {problem.functionalRequirements.map((req, idx) => (
                <div key={idx} className="clean-req-item">
                  <span className="clean-req-num">{idx + 1}</span>
                  <span className="clean-req-text">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Non-Functional Requirements & Scalability */}
          {problem.nonFunctionalConsiderations && problem.nonFunctionalConsiderations.length > 0 && (
            <div className="overview-content-card">
              <div className="card-section-header">
                <div className="section-title-box">
                  <ShieldCheck size={18} color="#4f46e5" strokeWidth={2.2} />
                  <h2>Non-Functional Requirements & System Scalability</h2>
                </div>
              </div>

              <div className="nfc-items-grid">
                {problem.nonFunctionalConsiderations.map((nfc, idx) => (
                  <div key={idx} className="nfc-item-card">
                    <CheckCircle2 size={15} className="nfc-check-icon" />
                    <span>{nfc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Key Architecture Questions to Defend */}
          {problem.thingsToThinkAbout && problem.thingsToThinkAbout.length > 0 && (
            <div className="overview-think-card">
              <div className="think-header-row">
                <div className="think-header-title">
                  <Lightbulb size={18} color="#d97706" strokeWidth={2.2} />
                  <h2>Key Architecture Questions to Defend</h2>
                </div>
              </div>

              <div className="think-bullets-list">
                {problem.thingsToThinkAbout.map((item, idx) => (
                  <div key={idx} className="think-bullet-item">
                    <span className="think-question-num">Q{idx + 1}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar */}
        <div className="overview-right-column">
          {/* Problem Info Card */}
          <div className="overview-sidebar-card">
            <div className="sidebar-card-header">
              <Info size={17} color="#4f46e5" strokeWidth={2.2} />
              <h3>Problem Info</h3>
            </div>

            <div className="sidebar-meta-list">
              <div className="sidebar-meta-row">
                <span className="meta-label">Difficulty</span>
                <span className={`card-difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="sidebar-meta-row">
                <span className="meta-label">Estimated Time</span>
                <span className="meta-value">{problem.estimatedMinutes} – {problem.estimatedMinutes + 25} mins</span>
              </div>

              <div className="sidebar-meta-row">
                <span className="meta-label">Attempts</span>
                <span className="meta-value">12.4k</span>
              </div>

              <div className="sidebar-meta-row" style={{ alignItems: 'center' }}>
                <span className="meta-label">Companies</span>
                <CompanyAvatarStack companies={problem.companies} size={22} maxVisible={3} />
              </div>

              <div className="sidebar-meta-row">
                <span className="meta-label">Last Updated</span>
                <span className="meta-value">{problem.lastUpdated || 'Sep 10, 2026'}</span>
              </div>
            </div>
          </div>

          {/* Your Progress Card */}
          <div className="overview-sidebar-card">
            <div className="sidebar-card-header">
              <TrendingUp size={17} color="#4f46e5" strokeWidth={2.2} />
              <h3>Your Progress</h3>
            </div>

            <div className="progress-card-content">
              <div className="progress-score-header">
                <span className="progress-status-label">{progressStatus}</span>
                <span className="progress-percentage-num">{progressPercent}%</span>
              </div>

              <div className="status-progress-track">
                <div
                  className="status-progress-bar"
                  style={{
                    width: `${Math.min(progressPercent, 100)}%`,
                    backgroundColor: progressPercent > 0 ? (progressPercent >= 80 ? '#10b981' : progressPercent >= 50 ? '#3b82f6' : '#f59e0b') : 'transparent'
                  }}
                />
              </div>

              <button className="progress-cta-btn" onClick={onStartPractice}>
                <span>{buttonLabel}</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="pro-tip-card">
            <div className="tip-icon-circle">
              <Lightbulb size={16} color="#16a34a" strokeWidth={2.2} />
            </div>
            <div className="tip-content-box">
              <h4 className="tip-title">Pro Tip</h4>
              <p className="tip-text">
                Take time to clarify requirements and list important assumptions before jumping into the design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
