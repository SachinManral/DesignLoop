import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './db';
import { AiProvider } from './services/aiProvider';
import { DeterministicValidator } from '../src/services/deterministicValidator';
import { EvaluationEngine } from '../src/services/evaluationEngine';
import { Attempt, Submission, StructuredDesignContent } from '../src/types/index';

dotenv.config();

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Database
Database.init();

// --- Problem Endpoints ---

app.get('/api/problems', (req, res) => {
  const problems = Database.getProblems();
  res.json(problems);
});

app.get('/api/problems/:id', (req, res) => {
  const problem = Database.getProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  res.json(problem);
});

// --- Attempt Endpoints ---

app.get('/api/attempts', (req, res) => {
  const attempts = Database.getAttempts();
  res.json(attempts);
});

app.get('/api/attempts/:id', (req, res) => {
  const attempt = Database.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  res.json(attempt);
});

app.get('/api/attempts/problem/:problemId', (req, res) => {
  const problem = Database.getProblemById(req.params.problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  let attempt = Database.getAttemptByProblemId(problem.id);
  if (!attempt) {
    const starterDraft: StructuredDesignContent = {
      assumptions: problem.seedAssumptions.slice(0, 2),
      clarificationsSelected: [],
      classes: [
        {
          id: 'cls-1',
          name: problem.slug === 'parking-lot' ? 'ParkingLot' : 'MainCoordinator',
          type: 'class',
          responsibilities: ['Coordinates core workflow operations'],
          whyExists: 'Central facade coordinator',
          attributes: [{ name: 'id', type: 'string', visibility: '-' }],
          methods: [{ name: 'execute', returnType: 'void', parameters: '', visibility: '+' }]
        }
      ],
      relationships: [],
      decisions: [
        {
          id: 'dec-1',
          decision: 'Isolate policies behind strategy interfaces',
          reason: 'Protects system from future requirement changes'
        }
      ],
      edgeCases: ['Full capacity handling', 'Invalid transaction states'],
      extensionResponse: ''
    };

    attempt = {
      id: `att-${Date.now()}`,
      problemId: problem.id,
      learnerId: 'user-sachin',
      status: 'DRAFT',
      currentVersion: 1,
      draftContent: starterDraft,
      submissions: [],
      activeStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    Database.saveAttempt(attempt);
  }

  res.json(attempt);
});

app.put('/api/attempts/:id/draft', (req, res) => {
  const attempt = Database.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  const { draftContent, activeStep } = req.body;
  if (draftContent) attempt.draftContent = draftContent;
  if (activeStep !== undefined) attempt.activeStep = activeStep;

  Database.saveAttempt(attempt);
  res.json(attempt);
});

// --- Store-Before-Execute Submission & Async Evaluation ---

app.post('/api/attempts/:id/submit', async (req, res) => {
  const attempt = Database.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  const problem = Database.getProblemById(attempt.problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // 1. Deterministic Validation Check
  const validation = DeterministicValidator.validate(attempt.draftContent, problem);
  if (!validation.isValid) {
    return res.status(400).json({ error: 'Deterministic validation failed', validation });
  }

  // 2. Store-Before-Execute: Save submission snapshot immediately
  const submission: Submission = {
    id: `sub-${Date.now()}`,
    attemptId: attempt.id,
    versionNumber: attempt.currentVersion,
    content: JSON.parse(JSON.stringify(attempt.draftContent)),
    submittedAt: new Date().toISOString(),
    validationResult: validation
  };

  attempt.status = 'SUBMITTED';
  attempt.submissions.push(submission);
  Database.saveAttempt(attempt);

  // Return 202 Accepted with state SUBMITTED
  res.status(202).json({
    message: 'Submission persisted successfully. Evaluation queued.',
    attemptId: attempt.id,
    submissionId: submission.id,
    status: attempt.status
  });

  // 3. Asynchronously trigger AI evaluation
  (async () => {
    try {
      attempt.status = 'EVALUATING';
      Database.saveAttempt(attempt);

      const feedback = await AiProvider.evaluateSubmissionWithAi(
        problem,
        submission.content,
        submission.versionNumber
      );

      submission.evaluation = feedback;
      attempt.status = 'EVALUATED';
      attempt.activeStep = 6;
      Database.saveAttempt(attempt);
      console.log(`[Server] Attempt ${attempt.id} evaluation completed with score ${feedback.overallScore}%.`);
    } catch (err: any) {
      console.error(`[Server] Evaluation failed for attempt ${attempt.id}:`, err.message);
      attempt.status = 'FAILED';
      Database.saveAttempt(attempt);
    }
  })();
});

// --- Direct Evaluation Submission via AI (Synchronous RPC) ---

app.post('/api/evaluations/submit', async (req, res) => {
  const { problemId, draftContent, versionNumber, attemptId } = req.body;
  const problem = Database.getProblemById(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // 1. Run deterministic checks first
  const validation = DeterministicValidator.validate(draftContent, problem);
  if (!validation.isValid) {
    return res.status(400).json({ error: 'Deterministic validation failed', validation });
  }

  try {
    console.log(`[Server] Running live AI evaluation for problem "${problem.title}" (Attempt: ${attemptId || 'direct'})...`);
    const feedback = await AiProvider.evaluateSubmissionWithAi(
      problem,
      draftContent,
      versionNumber || 1
    );

    if (attemptId) {
      const attempt = Database.getAttemptById(attemptId);
      if (attempt) {
        const sub: Submission = {
          id: `sub-${Date.now()}`,
          attemptId: attempt.id,
          versionNumber: attempt.currentVersion,
          content: draftContent,
          submittedAt: new Date().toISOString(),
          validationResult: validation,
          evaluation: feedback
        };
        attempt.status = 'EVALUATED';
        attempt.submissions.push(sub);
        attempt.activeStep = 6;
        Database.saveAttempt(attempt);
      }
    }

    res.json(feedback);
  } catch (err: any) {
    console.error('[Server] Live evaluation issue, falling back gracefully:', err.message);
    const fallbackFeedback = EvaluationEngine.evaluate(problem, draftContent, versionNumber || 1);
    res.json(fallbackFeedback);
  }
});

// --- AI Interviewer & Interactive Features ---

app.post('/api/ai/ask-interviewer', async (req, res) => {
  const { problemId, question } = req.body;
  const problem = Database.getProblemById(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const result = await AiProvider.askInterviewer(problem, question);
  res.json(result);
});

app.post('/api/ai/review-assumptions', async (req, res) => {
  const { problemId, assumptions } = req.body;
  const problem = Database.getProblemById(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  try {
    const result = await AiProvider.reviewAssumptions(problem, assumptions || []);
    res.json(result);
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'Live AI review is unavailable' });
  }
});

app.post('/api/ai/design-advice', async (req, res) => {
  const { problemId, content, prompt } = req.body;
  const problem = Database.getProblemById(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const result = await AiProvider.getDesignAdvice(problem, content, prompt || 'Review my architecture');
  res.json(result);
});

app.post('/api/ai/evaluate-mutation', async (req, res) => {
  const { problemId, content, extensionResponse } = req.body;
  const problem = Database.getProblemById(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const result = await AiProvider.evaluateMutationWithAi(problem, content, extensionResponse);
  res.json(result);
});

app.post('/api/ai/ask-tutor', async (req, res) => {
  const { contextTitle, question, contextSummary } = req.body;
  if (!contextTitle || !question) {
    return res.status(400).json({ error: 'contextTitle and question are required' });
  }

  try {
    const result = await AiProvider.askTutor(contextTitle, question, contextSummary);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Tutor failed' });
  }
});


// --- Revision (v2) Creation ---

app.post('/api/attempts/:id/revision', (req, res) => {
  const attempt = Database.getAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  const latestSub = attempt.submissions[attempt.submissions.length - 1];
  if (latestSub) {
    attempt.draftContent = JSON.parse(JSON.stringify(latestSub.content));
  }

  attempt.currentVersion += 1;
  attempt.status = 'DRAFT';
  attempt.activeStep = 4; // Go directly to Design workspace

  Database.saveAttempt(attempt);
  res.json(attempt);
});

// --- AI Settings Configuration ---

app.get('/api/settings', (req, res) => {
  const settings = Database.getSettings();
  // Mask API key for security in response
  const maskedKey = settings.apiKey 
    ? `${settings.apiKey.slice(0, 4)}...${settings.apiKey.slice(-4)}`
    : '';
  res.json({
    ...settings,
    apiKey: maskedKey,
    hasApiKey: Boolean(settings.apiKey)
  });
});

app.post('/api/settings', (req, res) => {
  const { aiProvider, apiKey, modelName } = req.body;
  const updated = Database.updateSettings({
    ...(aiProvider && { aiProvider }),
    ...(apiKey && { apiKey }),
    ...(modelName && { modelName })
  });
  res.json({ success: true, message: 'Settings updated successfully' });
});

// Serve the built Vite frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[DesignLoop] Server running on port ${PORT}`);
});

