import { Attempt, Submission, Problem, StructuredDesignContent, LearnerProgress, SupportedLanguage, UserSettings } from '../types';
import { BENCHMARK_PROBLEMS } from '../data/seedProblems';
import { EvaluationEngine } from './evaluationEngine';

const STORAGE_KEY_ATTEMPTS = 'designloop_attempts_v1';
const STORAGE_KEY_PROGRESS = 'designloop_progress_v1';
const STORAGE_KEY_COMPLETED_CHAPTERS = 'designloop_completed_chapters_v1';
const STORAGE_KEY_STARRED_CHAPTERS = 'designloop_starred_chapters_v1';
const STORAGE_KEY_CHAPTER_NOTES = 'designloop_chapter_notes_v1';
const STORAGE_KEY_LANGUAGE = 'designloop_preferred_language_v1';
const STORAGE_KEY_SETTINGS = 'designloop_user_settings_v1';
const STORAGE_KEY_BOOKMARKS = 'designloop_bookmarked_problems_v1';

export class StorageService {
  // -------------------------------------------------------------
  // Problem Bookmarks
  // -------------------------------------------------------------
  public static getBookmarkedProblems(): string[] {
    const data = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static toggleBookmarkedProblem(problemId: string): string[] {
    const list = this.getBookmarkedProblems();
    const exists = list.includes(problemId);
    const updated = exists ? list.filter((id) => id !== problemId) : [...list, problemId];
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
    return updated;
  }
  // -------------------------------------------------------------
  // Curriculum Chapter Progress, Notes, Stars & Language
  // -------------------------------------------------------------

  public static getCompletedChapters(): string[] {
    const data = localStorage.getItem(STORAGE_KEY_COMPLETED_CHAPTERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static toggleCompletedChapter(chapterId: string): string[] {
    const list = this.getCompletedChapters();
    const exists = list.includes(chapterId);
    const updated = exists ? list.filter((id) => id !== chapterId) : [...list, chapterId];
    localStorage.setItem(STORAGE_KEY_COMPLETED_CHAPTERS, JSON.stringify(updated));
    return updated;
  }

  public static getStarredChapters(): string[] {
    const data = localStorage.getItem(STORAGE_KEY_STARRED_CHAPTERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static toggleStarredChapter(chapterId: string): string[] {
    const list = this.getStarredChapters();
    const exists = list.includes(chapterId);
    const updated = exists ? list.filter((id) => id !== chapterId) : [...list, chapterId];
    localStorage.setItem(STORAGE_KEY_STARRED_CHAPTERS, JSON.stringify(updated));
    return updated;
  }

  public static getChapterNotes(): Record<string, string> {
    const data = localStorage.getItem(STORAGE_KEY_CHAPTER_NOTES);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  public static saveChapterNote(chapterId: string, noteContent: string): Record<string, string> {
    const notes = this.getChapterNotes();
    notes[chapterId] = noteContent;
    localStorage.setItem(STORAGE_KEY_CHAPTER_NOTES, JSON.stringify(notes));
    return notes;
  }

  public static getPreferredLanguage(): SupportedLanguage {
    const lang = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (lang === 'java' || lang === 'python' || lang === 'cpp' || lang === 'typescript' || lang === 'go') {
      return lang;
    }
    return 'java';
  }

  public static setPreferredLanguage(lang: SupportedLanguage): void {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
  }

  public static getUserSettings(): UserSettings {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // fallback
      }
    }
    return {
      aiProvider: 'gemini',
      geminiApiKey: '',
      groqApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      groqModel: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      enableASTValidation: true,
      theme: 'dark',
      fontSize: 'normal',
      preferredLanguage: 'java',
    };
  }

  public static saveUserSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  // -------------------------------------------------------------
  // Practice Studio Attempts & Progress
  // -------------------------------------------------------------

  public static getAttempts(): Attempt[] {
    const data = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getAttemptForProblem(problemId: string): Attempt | null {
    const attempts = this.getAttempts();
    return attempts.find((a) => a.problemId === problemId) || null;
  }

  public static getOrCreateAttempt(problem: Problem): Attempt {
    const existing = this.getAttemptForProblem(problem.id);
    if (existing) return existing;

    const starterDraft: StructuredDesignContent = {
      assumptions: (problem.seedAssumptions || []).slice(0, 2),
      clarificationsSelected: [],
      classes: this.getStarterClasses(problem.slug),
      relationships: this.getStarterRelationships(problem.slug),
      decisions: [
        {
          id: 'dec-1',
          decision: 'Separate core domain hierarchy from coordination logic',
          reason: 'Prevents allocation rules from changing when new types are added',
        },
      ],
      edgeCases: ['System overload', 'Invalid request arguments'],
      extensionResponse: '',
    };

    const newAttempt: Attempt = {
      id: `att-${Date.now()}`,
      problemId: problem.id,
      learnerId: 'user-sachin',
      userId: 'user-sachin',
      status: 'DRAFT',
      currentVersion: 1,
      version: 1,
      draftContent: starterDraft,
      content: starterDraft,
      submissions: [],
      activeStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
    };

    this.saveAttempt(newAttempt);
    return newAttempt;
  }

  public static saveAttempt(attempt: Attempt): void {
    const attempts = this.getAttempts();
    const index = attempts.findIndex((a) => a.id === attempt.id);

    attempt.updatedAt = new Date().toISOString();

    if (index >= 0) {
      attempts[index] = attempt;
    } else {
      attempts.push(attempt);
    }

    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
    this.updateProgress(attempts);
  }

  public static createRevision(attempt: Attempt): Attempt {
    const latestSubmission = attempt.submissions[attempt.submissions.length - 1];
    const draftContent: StructuredDesignContent = latestSubmission
      ? JSON.parse(JSON.stringify(latestSubmission.content))
      : JSON.parse(JSON.stringify(attempt.draftContent));

    attempt.currentVersion = (attempt.currentVersion || 1) + 1;
    attempt.version = attempt.currentVersion;
    attempt.status = 'DRAFT';
    attempt.draftContent = draftContent;
    attempt.activeStep = 4;
    this.saveAttempt(attempt);
    return attempt;
  }

  public static getProgress(): LearnerProgress {
    return this.buildProgress(this.getAttempts());
  }

  private static updateProgress(attempts: Attempt[]): void {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(this.buildProgress(attempts)));
  }

  private static buildProgress(attempts: Attempt[]): LearnerProgress {
    const completed = attempts.filter((a) => a.status === 'EVALUATED' || (a.submissions && a.submissions.length > 0));
    const allSmells: string[] = [];
    const dimensionTotals = { requirements: 0, modeling: 0, responsibility: 0, decoupling: 0, extensibility: 0 };
    let scoredAttempts = 0;

    completed.forEach((att) => {
      const latest = att.submissions[att.submissions.length - 1];
      const problem = BENCHMARK_PROBLEMS.find((p) => p.id === att.problemId);
      if (!latest || !problem) return;
      const feedback = latest.evaluation || EvaluationEngine.evaluate(problem, latest.content, latest.versionNumber);
      allSmells.push(...(feedback.recurringSmellsIdentified || []));
      const score = (query: string) => {
        const criterion = feedback.criteria?.find((c) =>
          c.dimension.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(c.dimension.toLowerCase())
        );
        return criterion && criterion.maxScore > 0 
          ? Math.round((criterion.score / criterion.maxScore) * 100) 
          : (feedback.overallScore !== undefined ? feedback.overallScore : 0);
      };
      dimensionTotals.requirements += score('Requirement');
      dimensionTotals.modeling += Math.round((score('Requirement') + score('Encapsulation')) / 2);
      dimensionTotals.responsibility += score('Responsibilit');
      dimensionTotals.decoupling += score('Coupling');
      dimensionTotals.extensibility += score('Extensibility');
      scoredAttempts += 1;
    });

    const average = (value: number) => (scoredAttempts ? Math.round(value / scoredAttempts) : 0);

    return {
      totalAttempts: attempts.reduce((acc, curr) => acc + (curr.submissions ? curr.submissions.length : 0), 0),
      completedProblems: Array.from(new Set(completed.map((a) => a.problemId))),
      skillRadar: {
        requirements: average(dimensionTotals.requirements),
        modeling: average(dimensionTotals.modeling),
        responsibility: average(dimensionTotals.responsibility),
        decoupling: average(dimensionTotals.decoupling),
        extensibility: average(dimensionTotals.extensibility),
      },
      recurringWeaknesses: Array.from(new Set(allSmells)),
    };
  }

  private static getStarterClasses(_slug: string) {
    // Learners start with an empty canvas to model and practice on their own
    return [];
  }

  private static getStarterRelationships(_slug: string) {
    return [];
  }

  // -------------------------------------------------------------
  // AI Interactive Topic Quiz Score Persistence
  // -------------------------------------------------------------

  public static getTopicQuizScore(topicTitle: string): { score: number; total: number; timestamp: string; percentage: number } | null {
    try {
      const data = localStorage.getItem(`designloop_quiz_score_${topicTitle}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static saveTopicQuizScore(topicTitle: string, score: number, total: number = 10): void {
    try {
      const percentage = Math.round((score / total) * 100);
      const payload = {
        score,
        total,
        percentage,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`designloop_quiz_score_${topicTitle}`, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save quiz score:', e);
    }
  }
}
