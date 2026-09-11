import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Clock,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Circle,
  Briefcase,
  FileCheck2,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ArrowUpDown,
  Code2
} from 'lucide-react';
import { Problem, Attempt } from '../types';
import { StorageService } from '../services/storageService';

interface ProblemLibraryProps {
  problems: Problem[];
  attempts: Attempt[];
  onSelectProblem: (id: string) => void;
  searchQuery: string;
}

export const ProblemLibrary: React.FC<ProblemLibraryProps> = ({
  problems,
  attempts,
  onSelectProblem,
  searchQuery
}) => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(StorageService.getBookmarkedProblems());
  }, []);

  const handleToggleBookmark = (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    const updated = StorageService.toggleBookmarkedProblem(problemId);
    setBookmarkedIds([...updated]);
  };

  // Collect unique topics from all problems
  const allTopics = Array.from(
    new Set(problems.flatMap((p) => p.tags))
  ).sort();

  // Filter & sort problems
  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.statement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff =
      difficultyFilter === 'all' ||
      p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    const matchesTopic =
      topicFilter === 'all' || p.tags.includes(topicFilter);

    return matchesSearch && matchesDiff && matchesTopic;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'time-asc') {
      return a.estimatedMinutes - b.estimatedMinutes;
    }
    if (sortBy === 'time-desc') {
      return b.estimatedMinutes - a.estimatedMinutes;
    }
    if (sortBy === 'difficulty-asc') {
      const diffOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
    }
    if (sortBy === 'difficulty-desc') {
      const diffOrder: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      return (diffOrder[b.difficulty] || 0) - (diffOrder[a.difficulty] || 0);
    }
    // Default: newest/original order
    return 0;
  });

  return (
    <div className="problem-catalog-wrapper">
      {/* Hero Banner matching Image 2 */}
      <div className="catalog-hero-banner">
        <div className="banner-left-content">
          <div className="banner-title-row">
            <div className="banner-icon-container">
              <Boxes size={24} strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="banner-main-title">LLD Problem Arena & Catalog</h1>
              <p className="banner-sub-title">
                Deep, realistic engineering scenarios with typed requirements and follow-up mutation challenges.
              </p>
            </div>
          </div>

          {/* 4 Feature Badges Grid */}
          <div className="banner-features-grid">
            <div className="banner-feature-item">
              <div className="feature-icon-bubble blue">
                <Briefcase size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-text-block">
                <div className="feature-title">Real-world problems</div>
                <div className="feature-desc">Industry inspired</div>
              </div>
            </div>

            <div className="banner-feature-item">
              <div className="feature-icon-bubble indigo">
                <FileCheck2 size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-text-block">
                <div className="feature-title">Typed requirements</div>
                <div className="feature-desc">Structured & clear</div>
              </div>
            </div>

            <div className="banner-feature-item">
              <div className="feature-icon-bubble amber">
                <Sparkles size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-text-block">
                <div className="feature-title">Multiple difficulty levels</div>
                <div className="feature-desc">Step-by-step growth</div>
              </div>
            </div>

            <div className="banner-feature-item">
              <div className="feature-icon-bubble purple">
                <TrendingUp size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-text-block">
                <div className="feature-title">Track your progress</div>
                <div className="feature-desc">Solve, learn, improve</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side graphic */}
        <div className="banner-right-graphic">
          <div className="graphic-tilted-card">
            <div className="card-code-header">
              <Code2 size={24} color="#6366f1" strokeWidth={2.5} />
            </div>
            <div className="card-code-skeleton">
              <span className="skel-line l1"></span>
              <span className="skel-line l2"></span>
              <span className="skel-line l3"></span>
            </div>
          </div>
          <div className="graphic-slogan-box">
            <div className="graphic-slogan-text">Build</div>
            <div className="graphic-slogan-text">Better</div>
            <div className="graphic-slogan-text highlight">Designers</div>
            <div className="graphic-slogan-underline"></div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Control Bar */}
      <div className="catalog-control-bar">
        {/* Difficulty Tabs */}
        <div className="difficulty-pill-group">
          {['all', 'Easy', 'Medium', 'Hard'].map((diff) => {
            const isActive = difficultyFilter.toLowerCase() === diff.toLowerCase();
            return (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`diff-pill-btn ${isActive ? 'active' : ''}`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Right Dropdowns */}
        <div className="catalog-dropdown-group">
          {/* Topics Dropdown */}
          <div className="catalog-select-wrapper">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="catalog-select"
            >
              <option value="all">All Topics</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>

          {/* Sort Dropdown */}
          <div className="catalog-select-wrapper">
            <ArrowUpDown size={14} className="select-lead-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="catalog-select with-lead-icon"
            >
              <option value="newest">Sort by &nbsp; Newest</option>
              <option value="difficulty-asc">Difficulty: Low to High</option>
              <option value="difficulty-desc">Difficulty: High to Low</option>
              <option value="time-asc">Time: Short to Long</option>
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>
      </div>

      {/* Problem Cards 2-Column Grid */}
      <div className="catalog-cards-grid">
        {sorted.map((prob) => {
          const attempt = attempts.find((a) => a.problemId === prob.id);
          const hasSubmissions = !!(attempt && attempt.submissions && attempt.submissions.length > 0);
          
          let latestScore = 0;
          if (hasSubmissions) {
            latestScore =
              attempt.submissions[attempt.submissions.length - 1].evaluation?.overallScore ?? 0;
          }

          // A problem is ONLY in progress if the candidate actually entered Step 2 or beyond
          const isStarted = !!attempt && (attempt.activeStep ?? 1) > 1;

          const stepProgress = hasSubmissions
            ? latestScore
            : isStarted
            ? Math.min(Math.round(((attempt.activeStep - 1) / 6) * 100), 100)
            : 0;

          const isBookmarked = bookmarkedIds.includes(prob.id);

          return (
            <div
              key={prob.id}
              className="catalog-problem-card"
              onClick={() => onSelectProblem(prob.id)}
            >
              <div>
                {/* Top Row: Difficulty Pill, Time, Bookmark */}
                <div className="card-top-row">
                  <div className="card-top-left">
                    <span className={`card-difficulty-badge ${prob.difficulty.toLowerCase()}`}>
                      {prob.difficulty}
                    </span>
                    <div className="card-estimate-time">
                      <Clock size={14} strokeWidth={2} />
                      <span>{prob.estimatedMinutes} mins</span>
                    </div>
                  </div>

                  <button
                    className={`card-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                    onClick={(e) => handleToggleBookmark(e, prob.id)}
                    title={isBookmarked ? 'Bookmarked' : 'Bookmark problem'}
                  >
                    <Bookmark size={17} strokeWidth={isBookmarked ? 2.5 : 1.8} fill={isBookmarked ? '#6366f1' : 'none'} />
                  </button>
                </div>

                {/* Problem Title */}
                <h3 className="card-problem-title">{prob.title}</h3>

                {/* Problem Subtitle */}
                <p className="card-problem-subtitle">{prob.subtitle}</p>

                {/* Tags */}
                <div className="card-tags-list">
                  {prob.tags.map((t, idx) => (
                    <span key={idx} className="card-tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Row: Attempt status & Solve button */}
              <div className="card-bottom-footer">
                <div className="card-status-container">
                  {hasSubmissions ? (
                    <div>
                      <div className="status-attempted-text">
                        <CheckCircle2 size={16} strokeWidth={2.4} color={latestScore >= 70 ? '#10b981' : '#f59e0b'} />
                        <span style={{ color: latestScore >= 70 ? '#10b981' : '#f59e0b' }}>
                          Score: {latestScore}%
                        </span>
                      </div>
                      <div className="status-progress-track">
                        <div
                          className="status-progress-bar"
                          style={{
                            width: `${Math.min(latestScore, 100)}%`,
                            backgroundColor: latestScore >= 70 ? '#10b981' : '#f59e0b'
                          }}
                        />
                      </div>
                    </div>
                  ) : isStarted && stepProgress > 0 ? (
                    <div>
                      <div className="status-attempted-text" style={{ color: '#3b82f6' }}>
                        <Clock size={15} strokeWidth={2.2} color="#3b82f6" />
                        <span>In Progress ({stepProgress}%)</span>
                      </div>
                      <div className="status-progress-track">
                        <div
                          className="status-progress-bar"
                          style={{
                            width: `${Math.min(stepProgress, 100)}%`,
                            backgroundColor: '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="status-unattempted-text">
                      <Circle size={15} strokeWidth={1.8} className="unattempted-circle" />
                      <span>Not started</span>
                    </div>
                  )}
                </div>

                <button
                  className={`card-solve-action-btn ${hasSubmissions ? 'continue' : isStarted ? 'continue' : 'solve'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProblem(prob.id);
                  }}
                >
                  <span>{hasSubmissions ? 'Review' : isStarted ? 'Resume' : 'Solve'}</span>
                  <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
