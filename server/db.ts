import fs from 'fs';
import path from 'path';
import { Problem, Attempt, Submission, FeedbackReport } from '../src/types/index';
import { BENCHMARK_PROBLEMS } from '../src/data/seedProblems';

interface DatabaseSchema {
  problems: Problem[];
  attempts: Attempt[];
  settings: {
    aiProvider: 'openai' | 'gemini' | 'groq' | 'mock';
    apiKey: string;
    modelName: string;
  };
}

const DB_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'database.json');

export class Database {
  private static data: DatabaseSchema;

  public static init(): void {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure problems are seeded
        if (!this.data.problems || this.data.problems.length === 0) {
          this.data.problems = BENCHMARK_PROBLEMS;
        }
      } catch {
        this.data = this.getInitialData();
      }
    } else {
      this.data = this.getInitialData();
      this.save();
    }
  }

  private static getInitialData(): DatabaseSchema {
    return {
      problems: BENCHMARK_PROBLEMS,
      attempts: [],
      settings: {
        aiProvider: 'groq',
        apiKey: process.env.GROQ_API_KEY || '',
        modelName: 'llama-3.3-70b-versatile'
      }
    };
  }

  private static ensureInit(): void {
    if (!this.data) {
      this.init();
    }
  }

  public static save(): void {
    this.ensureInit();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Problems
  public static getProblems(): Problem[] {
    this.ensureInit();
    return this.data.problems;
  }

  public static getProblemById(id: string): Problem | undefined {
    this.ensureInit();
    return this.data.problems.find(p => p.id === id);
  }

  // Attempts
  public static getAttempts(): Attempt[] {
    this.ensureInit();
    return this.data.attempts;
  }

  public static getAttemptById(id: string): Attempt | undefined {
    this.ensureInit();
    return this.data.attempts.find(a => a.id === id);
  }

  public static getAttemptByProblemId(problemId: string): Attempt | undefined {
    this.ensureInit();
    return this.data.attempts.find(a => a.problemId === problemId);
  }

  public static saveAttempt(attempt: Attempt): Attempt {
    this.ensureInit();
    const idx = this.data.attempts.findIndex(a => a.id === attempt.id);
    attempt.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      this.data.attempts[idx] = attempt;
    } else {
      this.data.attempts.push(attempt);
    }
    this.save();
    return attempt;
  }

  // Settings
  public static getSettings() {
    this.ensureInit();
    return this.data.settings;
  }

  public static updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    this.ensureInit();
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }
}
