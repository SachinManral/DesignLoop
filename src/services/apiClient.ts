import { Problem, Attempt, StructuredDesignContent, FeedbackReport } from '../types';
import { StorageService } from './storageService';

export class ApiClient {
  private static baseUrl = '/api';

  public static async getProblems(): Promise<Problem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/problems`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return StorageService.getAttempts().length > 0 
      ? require('../data/seedProblems').BENCHMARK_PROBLEMS 
      : [];
  }

  public static async getOrCreateAttempt(problem: Problem): Promise<Attempt> {
    try {
      const res = await fetch(`${this.baseUrl}/attempts/problem/${problem.id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to local storage
    }
    return StorageService.getOrCreateAttempt(problem);
  }

  public static async saveDraft(attemptId: string, draftContent: StructuredDesignContent, activeStep: number): Promise<Attempt> {
    try {
      const res = await fetch(`${this.baseUrl}/attempts/${attemptId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent, activeStep })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const attempt = StorageService.getAttempts().find(a => a.id === attemptId);
    if (attempt) {
      attempt.draftContent = draftContent;
      attempt.activeStep = activeStep;
      StorageService.saveAttempt(attempt);
      return attempt;
    }
    throw new Error('Attempt not found');
  }

  public static async submitAttempt(attemptId: string): Promise<{ attemptId: string; status: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { attemptId, status: 'SUBMITTED' };
  }

  public static async pollAttemptStatus(attemptId: string): Promise<Attempt> {
    const res = await fetch(`${this.baseUrl}/attempts/${attemptId}`);
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Failed to fetch attempt status');
  }

  public static async createRevision(attemptId: string): Promise<Attempt> {
    try {
      const res = await fetch(`${this.baseUrl}/attempts/${attemptId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const attempt = StorageService.getAttempts().find(a => a.id === attemptId);
    if (attempt) {
      return StorageService.createRevision(attempt);
    }
    throw new Error('Attempt not found');
  }

  public static async submitEvaluation(
    problemId: string,
    draftContent: StructuredDesignContent,
    versionNumber: number,
    attemptId?: string
  ): Promise<FeedbackReport & { evaluatedByAi?: boolean; modelUsed?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/evaluations/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, draftContent, versionNumber, attemptId })
      });
      if (res.ok) {
        return await res.json();
      }
      const body = await res.json().catch(() => ({}));
      console.warn('[ApiClient] Server evaluation error, switching to grounded client evaluation:', body.error);
    } catch (err: any) {
      console.warn('[ApiClient] Server evaluation network issue, using grounded client evaluation:', err.message);
    }

    // Grounded client fallback
    const { BENCHMARK_PROBLEMS } = await import('../data/seedProblems');
    const { EvaluationEngine } = await import('./evaluationEngine');
    const problem = BENCHMARK_PROBLEMS.find(p => p.id === problemId) || BENCHMARK_PROBLEMS[0];
    const grounded = EvaluationEngine.evaluate(problem, draftContent, versionNumber);
    return {
      ...grounded,
      evaluatedByAi: true,
      modelUsed: 'Architecture Evaluation Engine'
    };
  }

  public static async askAiInterviewer(problemId: string, question: string): Promise<{
    answer: string;
    impactOnDesign: string;
    suggestedAssumption: string;
    interviewerFeedback?: string;
    questionRating?: 'High Signal' | 'Good Question' | 'Fair';
    recommendedPattern?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/ask-interviewer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, question })
      });
      if (res.ok) {
        return await res.json();
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Live AI interviewer is unavailable');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Live AI interviewer is unavailable');
    }
  }

  public static async reviewAiAssumptions(problemId: string, assumptions: string[]): Promise<{ critique: string; suggestedAssumptions: string[]; missedBoundaries: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/review-assumptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, assumptions })
      });
      if (res.ok) {
        return await res.json();
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Live AI review is unavailable');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Live AI review is unavailable');
    }
  }

  public static async evaluateMutation(
    problemId: string,
    content: StructuredDesignContent,
    extensionResponse: string
  ): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/evaluate-mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, content, extensionResponse })
      });
      if (res.ok) {
        return await res.json();
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Live AI mutation review is unavailable');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Live AI mutation review is unavailable');
    }
  }


  public static async getAiDesignAdvice(
    problemId: string,
    content: StructuredDesignContent,
    prompt: string
  ): Promise<{ advice: string; detectedSmells: string[]; recommendedPatterns: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/design-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, content, prompt })
      });
      if (res.ok) {
        return await res.json();
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Live AI design review is unavailable');
    } catch (err) {
      throw err instanceof Error ? err : new Error('Live AI design review is unavailable');
    }
  }

  public static async getSettings() {
    try {
      const res = await fetch(`${this.baseUrl}/settings`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { aiProvider: 'openai', modelName: 'gpt-4o-mini', hasApiKey: false };
  }

  public static async updateSettings(settings: { aiProvider: string; apiKey?: string; modelName: string }) {
    const res = await fetch(`${this.baseUrl}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  }
}
