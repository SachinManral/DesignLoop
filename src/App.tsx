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
import { useAppRouter, RouteRegistry } from './router';
import { Problem, Attempt, SupportedLanguage, UserSettings } from './types';

export const App: React.FC = () => {
  // Problem library and attempt state
  const [problems, setProblems] = useState<Problem[]>(BENCHMARK_PROBLEMS);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(BENCHMARK_PROBLEMS[0].id);
  const [attempts, setAttempts] = useState<Attempt[]>(StorageService.getAttempts());
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  // Type-safe decoupled application router
  const { route, navigate, navigateToChapter, navigateToPractice, navigateToTab } = useAppRouter(
    problems,
    selectedProblem
  );

  // Derive active view states from route contract
  const activeTab: MainNavTab =
    route.type === 'home'
      ? 'home'
      : route.type === 'learn-index' || route.type === 'learn-chapter'
      ? 'learn'
      : route.type === 'problems'
      ? 'library'
      : route.type === 'practice'
      ? 'practice'
      : route.type === 'progress'
      ? 'progress'
      : route.type === 'history'
      ? 'history'
      : 'home';

  const learnViewMode: 'index' | 'chapter' = route.type === 'learn-chapter' ? 'chapter' : 'index';
  const currentChapterId = route.params.chapterId || 'classes-and-objects';
  const practiceStarted = route.type === 'practice' && Boolean(route.params.problemId);
  const isReaderMode = activeTab === 'learn' && learnViewMode === 'chapter';

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

  // Synchronize route parameters with problem and step states
  useEffect(() => {
    if (route.params.problemId && route.params.problemId !== selectedProblemId) {
      setSelectedProblemId(route.params.problemId);
    }
    if (route.params.step && route.params.step !== activeStep) {
      setActiveStep(route.params.step);
    }
  }, [route]);

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

  // Step change handler synchronizing step and URL path
  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    if (newStep > maxReachedStep) {
      setMaxReachedStep(newStep);
    }

    const problemSlug = selectedProblem?.slug || selectedProblem?.id;
    if (problemSlug && practiceStarted) {
      const newUrl = RouteRegistry.practiceUrl(problemSlug, newStep);
      navigate(newUrl, { replace: true });
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
    navigateToChapter(chapterId);
  };

  const handleNavigateToPractice = (problemIdOrSlug: string, step?: number) => {
    navigateToPractice(problemIdOrSlug, step);
    const resolved = RouteRegistry.resolveProblem(problemIdOrSlug, problems);
    setSelectedProblemId(resolved.id);
    const existing = StorageService.getAttemptForProblem(resolved.id);
    let initialStep = step || 1;
    if (!step && existing) {
      initialStep = existing.activeStep || 1;
      if (existing.submissions && existing.submissions.length > 0) {
        initialStep = Math.max(initialStep, 6);
      }
    }
    setActiveStep(initialStep);
    setMaxReachedStep(Math.max(initialStep, existing?.activeStep || 1));
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
          onSelectTab={(tab) => navigateToTab(tab)}
        />
      )}

      {/* Main page viewport */}
      <div className="main-viewport" style={{ width: '100%' }}>
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onSelectTab={(tab) => navigateToTab(tab)}
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
                onNavigateToTab={(tab, path) => navigateToTab(tab, path)}
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
                  onViewProgressTab={() => navigateToTab('progress')}
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
                  onBackToHome={() => navigateToTab('learn')}
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
                    handleNavigateToPractice(id);
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
                      onBackToProblems={() => navigateToTab('problems')}
                      onSelectProblem={(pId) => {
                        handleNavigateToPractice(pId);
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
                      onViewComparison={() => navigateToTab('history')}
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
                  handleNavigateToPractice(id);
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
                  handleNavigateToPractice(pId);
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
                  onBack={() => navigateToTab('practice')}
                  onStartNewProblem={() => {
                    navigateToTab('practice');
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
