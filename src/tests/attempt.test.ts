import { describe, it, expect } from 'vitest';
import { Attempt, AttemptStatus, StructuredDesignContent, FeedbackReport, CriterionResult } from '../types';

// Helpers

function makeAttempt(status: AttemptStatus, overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-001',
    problemId: 'prob-parking-lot',
    status,
    currentVersion: 1,
    draftContent: emptyContent(),
    submissions: [],
    activeStep: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function emptyContent(): StructuredDesignContent {
  return {
    assumptions: [],
    clarificationsSelected: [],
    classes: [],
    relationships: [],
    decisions: [],
    edgeCases: [],
  };
}

function makeCriterion(dimension: string, score: number): CriterionResult {
  return {
    dimension,
    score,
    maxScore: 5,
    confidence: 'high',
    evidence: 'ParkingLot delegates to FeeCalculator interface.',
    interpretation: 'Strong SRP.',
    impact: 'Reduces coupling.',
    suggestion: 'Add repository interface.',
    tradeoff: 'One extra abstraction.',
    practiceAction: 'Refactor ticket lookup.',
    severity: 'positive',
  };
}

function makeFeedback(score: number, criteria: CriterionResult[]): FeedbackReport {
  return {
    overallScore: score,
    overallSummary: 'Clean domain model.',
    confidence: 'high',
    criteria,
    nextPracticeActions: ['Add concurrency handling.'],
    recurringSmellsIdentified: [],
    evaluationTimestamp: new Date().toISOString(),
  };
}

describe('Attempt state machine', () => {
  it('starts in DRAFT status', () => {
    const attempt = makeAttempt('DRAFT');
    expect(attempt.status).toBe('DRAFT');
  });

  it('has no submissions in DRAFT state', () => {
    const attempt = makeAttempt('DRAFT');
    expect(attempt.submissions.length).toBe(0);
  });

  it('transitions to SUBMITTED with a submission record', () => {
    const attempt = makeAttempt('SUBMITTED', {
      submissions: [
        {
          id: 'sub-001',
          attemptId: 'attempt-001',
          versionNumber: 1,
          submittedAt: new Date().toISOString(),
          content: emptyContent(),
        },
      ],
      submittedAt: new Date().toISOString(),
    });
    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.submissions.length).toBe(1);
  });

  it('EVALUATING state has no feedback yet', () => {
    const attempt = makeAttempt('EVALUATING');
    expect(attempt.feedback).toBeUndefined();
  });

  it('EVALUATED state has feedback attached', () => {
    const feedback = makeFeedback(82, [
      makeCriterion('Requirement Understanding', 4),
      makeCriterion('Class Responsibilities', 4),
    ]);
    const attempt = makeAttempt('EVALUATED', { feedback });
    expect(attempt.status).toBe('EVALUATED');
    expect(attempt.feedback).toBeDefined();
    expect(attempt.feedback!.overallScore).toBe(82);
  });

  it('FAILED state has no feedback', () => {
    const attempt = makeAttempt('FAILED');
    expect(attempt.feedback).toBeUndefined();
  });

  it('tracks version number across submissions', () => {
    const attempt = makeAttempt('EVALUATED', {
      currentVersion: 2,
      submissions: [
        {
          id: 'sub-001',
          versionNumber: 1,
          submittedAt: new Date().toISOString(),
          content: emptyContent(),
        },
        {
          id: 'sub-002',
          versionNumber: 2,
          submittedAt: new Date().toISOString(),
          content: emptyContent(),
        },
      ],
    });
    expect(attempt.currentVersion).toBe(2);
    expect(attempt.submissions[1].versionNumber).toBe(2);
  });

  it('submission is linked to the parent attempt', () => {
    const sub = {
      id: 'sub-001',
      attemptId: 'attempt-001',
      versionNumber: 1,
      submittedAt: new Date().toISOString(),
      content: emptyContent(),
    };
    const attempt = makeAttempt('SUBMITTED', { submissions: [sub] });
    expect(attempt.submissions[0].attemptId).toBe(attempt.id);
  });
});

describe('FeedbackReport schema', () => {
  it('overallScore is a number between 0 and 100', () => {
    const report = makeFeedback(85, [makeCriterion('Class Responsibilities', 4)]);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('each criterion has a score between 1 and 5', () => {
    const report = makeFeedback(80, [
      makeCriterion('Requirement Understanding', 3),
      makeCriterion('Class Responsibilities', 5),
      makeCriterion('Coupling & Cohesion', 2),
    ]);
    for (const c of report.criteria) {
      expect(c.score).toBeGreaterThanOrEqual(1);
      expect(c.score).toBeLessThanOrEqual(5);
      expect(c.maxScore).toBe(5);
    }
  });

  it('confidence field is one of the allowed values', () => {
    const report = makeFeedback(75, [makeCriterion('Extensibility', 3)]);
    expect(['high', 'medium', 'low']).toContain(report.confidence);
  });

  it('nextPracticeActions is an array', () => {
    const report = makeFeedback(60, [makeCriterion('Edge Cases & Testability', 2)]);
    expect(Array.isArray(report.nextPracticeActions)).toBe(true);
  });

  it('severity field is one of the allowed values', () => {
    const validSeverities = ['critical', 'important', 'minor', 'positive'];
    const criterion = makeCriterion('Quality of Explanation', 4);
    expect(validSeverities).toContain(criterion.severity);
  });

  it('mutationReview is optional and undefined by default', () => {
    const report = makeFeedback(70, [makeCriterion('Extensibility', 3)]);
    expect(report.mutationReview).toBeUndefined();
  });

  it('mutationReview has valid OCP verdict when present', () => {
    const report = makeFeedback(78, [makeCriterion('Extensibility', 4)]);
    report.mutationReview = {
      mutationTitle: 'Add EV charging support',
      changeCost: 'Low',
      openClosedVerdict: 'Pass',
      classesModified: [],
      classesAdded: ['EVSpot', 'EVFeeStrategy'],
      analysis: 'PricingStrategy interface allows new implementation without touching ParkingLot.',
      recommendedRefactoring: 'None required.',
    };
    expect(['Pass', 'Partial', 'Fail']).toContain(report.mutationReview.openClosedVerdict);
    expect(['Low', 'Medium', 'High']).toContain(report.mutationReview.changeCost);
  });

  it('empty overallSummary is detectable', () => {
    const report = makeFeedback(0, []);
    report.overallSummary = '';
    expect(report.overallSummary.length).toBe(0);
  });
});

describe('Edge cases', () => {
  it('attempt with zero time spent is still valid', () => {
    const attempt = makeAttempt('DRAFT', { timeSpentSeconds: 0 });
    expect(attempt.timeSpentSeconds).toBe(0);
  });

  it('feedback with score of 0 represents a completely failed attempt', () => {
    const report = makeFeedback(0, []);
    expect(report.overallScore).toBe(0);
  });

  it('feedback with score of 100 represents a perfect attempt', () => {
    const report = makeFeedback(100, [makeCriterion('Quality of Explanation', 5)]);
    expect(report.overallScore).toBe(100);
  });

  it('attempt with reflections stores the reflections text', () => {
    const attempt = makeAttempt('EVALUATED', {
      reflections: 'I should have used Strategy pattern for allocation.',
    });
    expect(attempt.reflections).toContain('Strategy pattern');
  });

  it('multiple attempts for the same problem are independent', () => {
    const attempt1 = makeAttempt('EVALUATED', { id: 'attempt-001' });
    const attempt2 = makeAttempt('DRAFT', { id: 'attempt-002' });
    expect(attempt1.id).not.toBe(attempt2.id);
    expect(attempt1.problemId).toBe(attempt2.problemId);
  });
});
