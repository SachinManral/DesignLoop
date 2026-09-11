import React, { useState } from 'react';
import {
  Search,
  Check,
  Star,
  FileText,
  Network,
  ChevronRight,
  BookOpen,
  Target,
  BarChart3,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  CurriculumChapter,
  CurriculumModule,
  SupportedLanguage,
} from '../types';

interface SystematicCurriculumIndexProps {
  modules: CurriculumModule[];
  chapters: CurriculumChapter[];
  completedChapterIds: string[];
  starredChapterIds: string[];
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onToggleComplete: (chapterId: string) => void;
  onToggleStar: (chapterId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onOpenNotesModal: (chapterId: string, chapterTitle: string) => void;
  onOpenUMLModal: (chapterId: string, chapterTitle: string) => void;
  onViewProgressTab: () => void;
}

export const SystematicCurriculumIndex: React.FC<SystematicCurriculumIndexProps> = ({
  modules,
  chapters,
  completedChapterIds,
  starredChapterIds,
  selectedLanguage,
  onLanguageChange,
  onToggleComplete,
  onToggleStar,
  onSelectChapter,
  onOpenNotesModal,
  onOpenUMLModal,
  onViewProgressTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  const totalChapters = chapters.length;
  const completedCount = completedChapterIds.length;
  const progressPercent = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const remainingCount = Math.max(0, totalChapters - completedCount);

  const getTopicTags = (chapter: CurriculumChapter): string[] => {
    if (chapter.topics && chapter.topics.length > 0) return chapter.topics;
    
    // Accurate concept-to-topic mappings matching reference
    const oopMap: Record<string, string[]> = {
      'classes-and-objects': ['OOP', 'Basics'],
      'interfaces': ['OOP', 'Abstraction'],
      'inheritance': ['OOP', 'Reusability'],
      'polymorphism': ['OOP', 'Dynamic Binding'],
      'abstraction': ['OOP', 'Design Principles'],
      'encapsulation': ['OOP', 'Data Hiding'],
      'aggregation': ['OOP', 'Relationships'],
      'composition': ['OOP', 'Relationships'],
      'association': ['OOP', 'Relationships'],
    };

    if (oopMap[chapter.id]) return oopMap[chapter.id];

    switch (chapter.moduleId) {
      case 'design-principles':
        return ['Principles', 'SOLID', 'Architecture'];
      case 'uml':
        return ['UML', 'Visual Design', 'Modeling'];
      case 'creational-patterns':
        return ['Patterns', 'Creational'];
      case 'structural-patterns':
        return ['Patterns', 'Structural'];
      case 'behavioral-patterns':
        return ['Patterns', 'Behavioral'];
      case 'questions-easy':
        return ['Interview', 'Easy', 'System Design'];
      case 'questions-medium':
        return ['Interview', 'Medium', 'Production'];
      case 'questions-hard':
        return ['Interview', 'Hard', 'Enterprise'];
      default:
        return ['LLD', 'Design'];
    }
  };

  const filterChapter = (ch: CurriculumChapter) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ch.title.toLowerCase().includes(q);
      const matchSummary = ch.summary.toLowerCase().includes(q);
      const matchModule = ch.moduleTitle.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchModule) return false;
    }

    const isDone = completedChapterIds.includes(ch.id);
    if (statusFilter === 'completed' && !isDone) return false;
    if (statusFilter === 'pending' && isDone) return false;

    if (topicFilter !== 'all' && ch.moduleId !== topicFilter) return false;

    return true;
  };

  return (
    <div className="curriculum-container">
      <section className="curriculum-hero">
        <div className="hero-content">
          <div className="hero-badge">
            Systematic LLD Learning Curriculum
          </div>
          <h1 className="hero-title">
            Learn Low-Level Design <span className="hero-title-gradient">Systematically</span>
          </h1>
          <p className="hero-subtitle">
            Master object-oriented programming, design patterns, UML diagrams and practice low-level design interview questions — all in one structured path.
          </p>

          <div className="hero-features-row">
            <div className="feature-item-card">
              <div className="feature-item-icon icon-blue">
                <BookOpen size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-item-text">
                <span className="feature-item-title">Structured</span>
                <span className="feature-item-sub">Learning Path</span>
              </div>
            </div>

            <div className="feature-item-card">
              <div className="feature-item-icon icon-indigo">
                <Target size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-item-text">
                <span className="feature-item-title">Interview Focused</span>
                <span className="feature-item-sub">Content</span>
              </div>
            </div>

            <div className="feature-item-card">
              <div className="feature-item-icon icon-purple">
                <BarChart3 size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-item-text">
                <span className="feature-item-title">Track Your</span>
                <span className="feature-item-sub">Progress</span>
              </div>
            </div>

            <div className="feature-item-card">
              <div className="feature-item-icon icon-amber">
                <Zap size={16} strokeWidth={2.2} />
              </div>
              <div className="feature-item-text">
                <span className="feature-item-title">Practice</span>
                <span className="feature-item-sub">as You Learn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-hud-card">
          <div className="hero-hud-header">
            <div className="hero-hud-dot" />
            <span className="hero-hud-title">Interactive LLD Studio</span>
            <span className="hero-hud-live-badge">Live System</span>
          </div>

          <div className="hero-hud-grid">
            <div className="hero-hud-stat">
              <div className="hero-hud-stat-num">80</div>
              <div className="hero-hud-stat-lbl">Core Chapters</div>
            </div>
            <div className="hero-hud-stat">
              <div className="hero-hud-stat-num">10</div>
              <div className="hero-hud-stat-lbl">System Modules</div>
            </div>
            <div className="hero-hud-stat">
              <div className="hero-hud-stat-num">5</div>
              <div className="hero-hud-stat-lbl">Polyglot Sandbox</div>
            </div>
            <div className="hero-hud-stat">
              <div className="hero-hud-stat-num">33</div>
              <div className="hero-hud-stat-lbl">Interview Problems</div>
            </div>
          </div>

          <div className="hero-hud-footer">
            <div className="hero-hud-pill">
              <Sparkles size={13} color="var(--brand-primary)" />
              <span>Includes UML Studio, Invariant Labs & Code Playground</span>
            </div>
          </div>
        </div>
      </section>

      <div className="filters-bar-card">
        <div className="filter-search-field">
          <Search size={18} />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search concepts, patterns, problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <span>Status:</span>
          <select
            className="clean-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">In Progress</option>
          </select>
        </div>

        <div className="filter-select-group">
          <span>Topics:</span>
          <select
            className="clean-select"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            <option value="all">All</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-group">
          <span>Language:</span>
          <select
            className="clean-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="typescript">TypeScript</option>
            <option value="go">Go</option>
          </select>
        </div>
      </div>

      <div className="progress-summary-card">
        <div className="progress-donut-wrapper">
          <svg className="donut-svg" viewBox="0 0 36 36">
            <path
              className="donut-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="donut-fill"
              strokeDasharray={`${progressPercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="donut-text">
            {progressPercent}%
          </div>
        </div>

        <div className="progress-info">
          <div className="progress-title-row">
            <h3 className="progress-heading">Your Learning Progress</h3>
            <span className="progress-subheading">
              {completedCount} of {totalChapters} concepts completed
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-indicator"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-meta-text">{remainingCount} remaining</div>
        </div>

        <button className="view-progress-btn" onClick={onViewProgressTab}>
          View Progress <ChevronRight size={14} />
        </button>
      </div>

      <div className="modules-stack">
        {modules.map((mod) => {
          const modChapters = chapters.filter(
            (ch) => ch.moduleId === mod.id && filterChapter(ch)
          );
          if (modChapters.length === 0) return null;

          const modAllChapters = chapters.filter((ch) => ch.moduleId === mod.id);
          const modDoneCount = modAllChapters.filter((ch) =>
            completedChapterIds.includes(ch.id)
          ).length;

          return (
            <div key={mod.id} className="module-card">
              <div className="module-card-header">
                <div className="module-header-left">
                  <div className="module-header-icon">
                    <Layers size={18} />
                  </div>
                  <h2 className="module-title-text">{mod.title}</h2>
                  <span className="module-progress-pill">
                    Progress: {modDoneCount} / {modAllChapters.length}
                  </span>
                </div>
                <button
                  className="module-view-all-btn"
                  onClick={() => onSelectChapter(modChapters[0].id)}
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <table className="curriculum-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Status</th>
                    <th>Concept</th>
                    <th>Topics</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Class Diagram</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Notes</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Star</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {modChapters.map((chapter) => {
                    const isCompleted = completedChapterIds.includes(chapter.id);
                    const isStarred = starredChapterIds.includes(chapter.id);
                    const topicTags = getTopicTags(chapter);

                    return (
                      <tr key={chapter.id}>
                        <td>
                          <button
                            className={`status-checkbox-btn ${isCompleted ? 'completed' : ''}`}
                            onClick={() => onToggleComplete(chapter.id)}
                            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                          >
                            {isCompleted && <Check size={13} strokeWidth={3} />}
                          </button>
                        </td>

                        <td>
                          <div className="concept-cell">
                            <button
                              className="concept-title-btn"
                              onClick={() => onSelectChapter(chapter.id)}
                            >
                              {chapter.title}
                            </button>
                            {chapter.priority === 'High Priority' ? (
                              <span className="priority-badge-pill">High Priority</span>
                            ) : chapter.priority === 'Core' ? (
                              <span className="priority-badge-pill priority-badge-core">Core</span>
                            ) : null}
                          </div>
                        </td>

                        <td>
                          <div className="topic-tags-cell">
                            {topicTags.map((tag, idx) => (
                              <span key={idx} className="topic-tag-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="table-action-btn"
                            title="View Class Diagram"
                            onClick={() => onOpenUMLModal(chapter.id, chapter.title)}
                          >
                            <Network size={17} />
                          </button>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="table-action-btn"
                            title="Open Chapter Notes"
                            onClick={() => onOpenNotesModal(chapter.id, chapter.title)}
                          >
                            <FileText size={17} />
                          </button>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className={`table-action-btn ${isStarred ? 'starred' : ''}`}
                            title={isStarred ? 'Unstar chapter' : 'Star chapter'}
                            onClick={() => onToggleStar(chapter.id)}
                          >
                            <Star
                              size={17}
                              fill={isStarred ? 'var(--brand-amber)' : 'none'}
                            />
                          </button>
                        </td>

                        <td>
                          <button
                            className="table-action-btn table-row-chevron"
                            title="Go to chapter"
                            onClick={() => onSelectChapter(chapter.id)}
                          >
                            <ChevronRight size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
