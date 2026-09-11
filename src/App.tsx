import React, { useState, useEffect } from 'react';
import { AppSidebar, MainNavTab } from './components/AppSidebar';
import { TopNav } from './components/TopNav';
import { SystematicCurriculumIndex } from './components/SystematicCurriculumIndex';
import { ChapterReaderView } from './components/ChapterReaderView';
import { Stepper } from './components/Stepper';
import { ProblemOverview } from './components/ProblemOverview';
import { ClarifyStep } from './components/ClarifyStep';
import { AssumptionsStep } from './components/AssumptionsStep';
import { DesignWorkspace } from './components/DesignWorkspace';
import { SubmitStep } from './components/SubmitStep';
import { FeedbackScorecard } from './components/FeedbackScorecard';
import { MutationChallenge } from './components/MutationChallenge';
import { ImprovementLab } from './components/ImprovementLab';
import { ProgressView } from './components/ProgressView';
import { ProblemLibrary } from './components/ProblemLibrary';
import { HomePage } from './components/HomePage';
import { SettingsModal } from './components/SettingsModal';
import { NotesModal } from './components/NotesModal';
import { UMLModal } from './components/UMLModal';

import { BENCHMARK_PROBLEMS } from './data/seedProblems';
import { CURRICULUM_MODULES, CURRICULUM_CHAPTERS } from './data/curriculumData';
import { StorageService } from './services/storageService';
import { ApiClient } from './services/apiClient';
import { Problem, Attempt, SupportedLanguage, UserSettings } from './types';

export const App: React.FC = () => {
  // Navigation & view states - defaults to home landing page
  const [activeTab, setActiveTab] = useState<MainNavTab>('home');
  const [learnViewMode, setLearnViewMode] = useState<'index' | 'chapter'>('index');
  const [currentChapterId, setCurrentChapterId] = useState<string>('classes-and-objects');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Curriculum persistence states
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>(
    StorageService.getCompletedChapters()
  );
  const [starredChapterIds, setStarredChapterIds] = useState<string[]>(
    StorageService.getStarredChapters()
  );
  const [chapterNotes, setChapterNotes] = useState<Record<string, string>>(
    StorageService.getChapterNotes()
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    StorageService.getPreferredLanguage()
  );

  // Settings & modal controls
  const [settings, setSettings] = useState<UserSettings>(StorageService.getUserSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [modalNoteTarget, setModalNoteTarget] = useState<{ id: string; title: string } | null>(null);
  const [modalUMLTarget, setModalUMLTarget] = useState<{ id: string; title: string } | null>(null);

  // 7-step practice studio state
  const [problems, setProblems] = useState<Problem[]>(BENCHMARK_PROBLEMS);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(BENCHMARK_PROBLEMS[0].id);
  const [attempts, setAttempts] = useState<Attempt[]>(StorageService.getAttempts());
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);
  const [practiceStarted, setPracticeStarted] = useState<boolean>(false);

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];
  const isReaderMode = activeTab === 'learn' && learnViewMode === 'chapter';

  // Parse path and synchronize state
  const applyRoute = (pathname: string) => {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/');

    if (!cleanPath || cleanPath === 'home') {
      setActiveTab('home');
    } else if (segments[0] === 'learn') {
      setActiveTab('learn');
      if (segments[1]) {
        setCurrentChapterId(segments[1]);
        setLearnViewMode('chapter');
      } else {
        setLearnViewMode('index');
      }
    } else if (segments[0] === 'practice') {
      setActiveTab('practice');
      if (segments[1]) {
        setSelectedProblemId(segments[1]);
        setPracticeStarted(true);
      } else {
        setPracticeStarted(false);
      }
    } else if (segments[0] === 'library' || segments[0] === 'problems') {
      setActiveTab('library');
    } else if (segments[0] === 'progress') {
      setActiveTab('progress');
    } else if (segments[0] === 'history') {
      setActiveTab('history');
    } else {
      setActiveTab('home');
    }
  };

  // Push new URL state to browser history
  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    applyRoute(path);
  };

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      applyRoute(window.location.pathname);
    };

    // Initialize route on first load
    applyRoute(window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'light');
  }, [settings.theme]);

  // Load backend problem library if available
  useEffect(() => {
    ApiClient.getProblems().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setProblems(fetched);
      }
    });
  }, []);

  // Sync attempt state when switching problems
  useEffect(() => {
    if (selectedProblem) {
      const att = StorageService.getOrCreateAttempt(selectedProblem);
      setCurrentAttempt(att);
      setAttempts(StorageService.getAttempts());
      
      let highest = att.activeStep || 1;
      if (att.submissions && att.submissions.length > 0) {
        highest = Math.max(highest, 6);
      }
      setMaxReachedStep(highest);
    }
  }, [selectedProblemId]);

  // Centralized step change handler to keep active step and attempt progress synchronized in real time
  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    if (newStep > maxReachedStep) {
      setMaxReachedStep(newStep);
    }
    if (currentAttempt) {
      const updated: Attempt = {
        ...currentAttempt,
        activeStep: Math.max(currentAttempt.activeStep || 1, newStep),
        updatedAt: new Date().toISOString()
      };
      StorageService.saveAttempt(updated);
      setCurrentAttempt(updated);
      setAttempts(StorageService.getAttempts());
    }
  };

  // Curriculum action handlers
  const handleToggleComplete = (chapterId: string) => {
    const updated = StorageService.toggleCompletedChapter(chapterId);
    setCompletedChapterIds([...updated]);
  };

  const handleToggleStar = (chapterId: string) => {
    const updated = StorageService.toggleStarredChapter(chapterId);
    setStarredChapterIds([...updated]);
  };

  const handleSaveNote = (chapterId: string, content: string) => {
    const updated = StorageService.saveChapterNote(chapterId, content);
    setChapterNotes({ ...updated });
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    StorageService.setPreferredLanguage(lang);
    setSelectedLanguage(lang);
  };

  const handleSelectChapter = (chapterId: string) => {
    navigateTo(`/learn/${chapterId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToPractice = (problemId: string) => {
    navigateTo(`/practice/${problemId}`);
    setActiveStep(1);
    const existing = StorageService.getAttemptForProblem(problemId);
    let step = 1;
    if (existing) {
      step = existing.activeStep || 1;
      if (existing.submissions && existing.submissions.length > 0) {
        step = Math.max(step, 6);
      }
    }
    setMaxReachedStep(step);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    StorageService.saveUserSettings(updated);
    setSettings(updated);
  };

  const handleUpdateDraft = (updated: Attempt) => {
    StorageService.saveAttempt(updated);
    setCurrentAttempt(updated);
    setAttempts(StorageService.getAttempts());
  };

  const allChaptersList = Object.values(CURRICULUM_CHAPTERS);

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: isReaderMode ? 'column' : 'row' }}>
      {/* Global app sidebar: shown in dashboard mode, hidden in 3-column chapter reader */}
      {!isReaderMode && (
        <AppSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'home') {
              navigateTo('/home');
            } else if (tab === 'learn') {
              navigateTo('/learn');
            } else {
              navigateTo(`/${tab}`);
            }
          }}
        />
      )}

      {/* Main page viewport */}
      <div className="main-viewport" style={{ width: '100%' }}>
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'home') {
              navigateTo('/home');
            } else if (tab === 'learn') {
              navigateTo('/learn');
            } else {
              navigateTo(`/${tab}`);
            }
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showBrandLogo={isReaderMode}
        />

        <main style={{ flex: 1 }}>
          {/* Home / Landing Page */}
          {activeTab === 'home' && (
            <div className="app-content-container">
              <HomePage
                problems={problems}
                attempts={attempts}
                onNavigateToTab={(tab, path) => {
                  if (path) navigateTo(path);
                  else if (tab === 'home') navigateTo('/home');
                  else if (tab === 'learn') navigateTo('/learn');
                  else navigateTo(`/${tab}`);
                }}
                onSelectProblem={(pId) => handleNavigateToPractice(pId)}
              />
            </div>
          )}

          {/* Systematic syllabus & chapter reader */}
          {activeTab === 'learn' && (
            <>
              {learnViewMode === 'index' ? (
                <SystematicCurriculumIndex
                  modules={CURRICULUM_MODULES}
                  chapters={allChaptersList}
                  completedChapterIds={completedChapterIds}
                  starredChapterIds={starredChapterIds}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleSelectLanguage}
                  onToggleComplete={handleToggleComplete}
                  onToggleStar={handleToggleStar}
                  onSelectChapter={handleSelectChapter}
                  onOpenNotesModal={(id, title) => setModalNoteTarget({ id, title })}
                  onOpenUMLModal={(id, title) => setModalUMLTarget({ id, title })}
                  onViewProgressTab={() => navigateTo('/progress')}
                />
              ) : (
                <ChapterReaderView
                  currentChapterId={currentChapterId}
                  completedChapterIds={completedChapterIds}
                  starredChapterIds={starredChapterIds}
                  chapterNotes={chapterNotes}
                  selectedLanguage={selectedLanguage}
                  settings={settings}
                  onSelectChapter={(id) => {
                    handleSelectChapter(id);
                  }}
                  onToggleComplete={handleToggleComplete}
                  onToggleStar={handleToggleStar}
                  onSaveNote={handleSaveNote}
                  onSelectLanguage={handleSelectLanguage}
                  onBackToHome={() => navigateTo('/learn')}
                  onNavigateToPractice={handleNavigateToPractice}
                />
              )}
            </>
          )}

          {/* Interactive 7-step practice studio */}
          {activeTab === 'practice' && (
            <div className="app-content-container">
              {!practiceStarted ? (
                <ProblemLibrary
                  problems={problems}
                  attempts={attempts}
                  searchQuery={searchQuery}
                  onSelectProblem={(id) => {
                    setSelectedProblemId(id);
                    setPracticeStarted(true);
                    setActiveStep(1);
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeStep > 1 && (
                    <Stepper
                      currentStep={activeStep}
                      maxReachedStep={maxReachedStep}
                      onStepClick={(s) => handleStepChange(s)}
                    />
                  )}

                  {activeStep === 1 && (
                    <ProblemOverview
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      relatedProblems={problems.filter((p) => p.id !== selectedProblem.id)}
                      practiceStarted={practiceStarted}
                      maxReachedStep={maxReachedStep}
                      onStartPractice={() => {
                        const targetStep = maxReachedStep > 1 ? maxReachedStep : 2;
                        handleStepChange(targetStep);
                      }}
                      onBackToProblems={() => navigateTo('/practice')}
                      onSelectProblem={(pId) => {
                        navigateTo(`/practice/${pId}`);
                        setActiveStep(1);
                      }}
                    />
                  )}

                  {activeStep === 2 && currentAttempt && (
                    <ClarifyStep
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onUpdateDraft={handleUpdateDraft}
                      onNext={() => handleStepChange(3)}
                      onBack={() => handleStepChange(1)}
                    />
                  )}

                  {activeStep === 3 && currentAttempt && (
                    <AssumptionsStep
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onUpdateDraft={handleUpdateDraft}
                      onNext={() => handleStepChange(4)}
                      onBack={() => handleStepChange(2)}
                    />
                  )}

                  {activeStep === 4 && currentAttempt && (
                    <DesignWorkspace
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onUpdateDraft={handleUpdateDraft}
                      onNext={() => handleStepChange(5)}
                      onBack={() => handleStepChange(3)}
                    />
                  )}

                  {activeStep === 5 && currentAttempt && (
                    <SubmitStep
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onUpdateDraft={handleUpdateDraft}
                      onEvaluationComplete={(updated: Attempt) => {
                        handleUpdateDraft(updated);
                        handleStepChange(6);
                      }}
                      onBack={() => handleStepChange(4)}
                    />
                  )}

                  {activeStep === 6 && currentAttempt && (
                    <FeedbackScorecard
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onProceedToMutation={() => handleStepChange(7)}
                      onRetryDesign={() => handleStepChange(4)}
                      onBack={() => handleStepChange(5)}
                    />
                  )}

                  {activeStep === 7 && currentAttempt && (
                    <MutationChallenge
                      problem={selectedProblem}
                      attempt={currentAttempt}
                      onUpdateDraft={handleUpdateDraft}
                      onRetryWithRevision={() => handleStepChange(4)}
                      onViewComparison={() => navigateTo('/history')}
                      onBack={() => handleStepChange(6)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Problem library catalogue */}
          {activeTab === 'library' && (
            <div className="app-content-container">
              <ProblemLibrary
                problems={problems}
                attempts={attempts}
                searchQuery={searchQuery}
                onSelectProblem={(id) => {
                  navigateTo(`/practice/${id}`);
                  setActiveStep(1);
                }}
              />
            </div>
          )}

          {/* Skill progress radar & mastery view */}
          {activeTab === 'progress' && (
            <div className="app-content-container">
              <ProgressView
                attempts={attempts}
                problems={problems}
                onSelectProblem={(pId) => {
                  navigateTo(`/practice/${pId}`);
                  setActiveStep(1);
                }}
              />
            </div>
          )}

          {/* Historical feedback & revision comparison */}
          {activeTab === 'history' && (
            <div className="app-content-container">
              {currentAttempt ? (
                <ImprovementLab
                  attempt={currentAttempt}
                  onBack={() => navigateTo('/practice')}
                  onStartNewProblem={() => {
                    navigateTo('/practice');
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
                  <p>No active submission attempt to inspect. Start a practice problem first.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {modalNoteTarget && (
        <NotesModal
          isOpen={true}
          chapterId={modalNoteTarget.id}
          chapterTitle={modalNoteTarget.title}
          notes={chapterNotes}
          onSaveNote={handleSaveNote}
          onClose={() => setModalNoteTarget(null)}
        />
      )}

      {modalUMLTarget && (
        <UMLModal
          isOpen={true}
          title={modalUMLTarget.title}
          mermaidSyntax={
            CURRICULUM_CHAPTERS[modalUMLTarget.id]?.classDiagramMermaid ||
            `classDiagram\n  class ${modalUMLTarget.title.replace(/\\s+/g, '')} {\n    +String id\n    +execute()\n  }`
          }
          umlCard={CURRICULUM_CHAPTERS[modalUMLTarget.id]?.umlCard}
          onClose={() => setModalUMLTarget(null)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};
