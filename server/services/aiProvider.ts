import { Problem, StructuredDesignContent, FeedbackReport, CriterionResult, MutationAssessment } from '../../src/types/index';
import { Database } from '../db';
import { EvaluationEngine } from '../../src/services/evaluationEngine';

// Groq production model fallback chain — active high-intelligence models
const GROQ_MODEL_CHAIN = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'groq/compound-mini'
];

// Gemini model fallback chain
const GEMINI_MODEL_CHAIN = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

/**
 * Situational AI routing:
 *   'groq'   — low-latency real-time dialogue and fast structured evaluations
 *   'gemini' — deep reasoning, architectural evaluation
 */
const TASK_ROUTING: Record<string, 'gemini' | 'groq'> = {
  evaluateSubmission: 'groq',   // Fast, reliable structured 8-dimension rubric
  evaluateMutation:   'groq',   // requirement mutation reasoning
  askInterviewer:     'groq',   // real-time clarification Q&A — ultra-fast latency
  reviewAssumptions:  'groq',   // interactive assumption checking
  getDesignAdvice:    'groq',   // real-time workspace co-pilot
  askTutor:           'groq',   // fast tutor explanations
};

export class AiProvider {
  /** Keys read from database settings or environment variables */
  private static get geminiKey() {
    const settings = Database.getSettings();
    if (settings?.apiKey && (settings.apiKey.startsWith('AIza') || settings.apiKey.startsWith('AQ.'))) {
      return settings.apiKey;
    }
    return process.env.GEMINI_API_KEY || '';
  }

  private static get groqKey() {
    const settings = Database.getSettings();
    if (settings?.apiKey && settings.apiKey.startsWith('gsk_')) {
      return settings.apiKey;
    }
    return process.env.GROQ_API_KEY || '';
  }



  /**
   * Call Gemini REST API with model fallback chain.
   */
  private static async callGemini(
    messages: Array<{ role: string; content: string }>,
    temperature: number,
    context: string
  ): Promise<string> {
    const key = this.geminiKey;
    if (!key) throw new Error('No Gemini API key configured');

    const systemMsg = messages.find((m) => m.role === 'system');
    const userMsgs = messages.filter((m) => m.role !== 'system');
    const geminiContents = [
      ...(systemMsg
        ? [
            { role: 'user', parts: [{ text: systemMsg.content }] },
            { role: 'model', parts: [{ text: 'Understood. I will follow these instructions and output strict JSON.' }] }
          ]
        : []),
      ...userMsgs.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    for (const model of GEMINI_MODEL_CHAIN) {
      try {
        console.log(`[AI] [${context}] → Gemini (${model})`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`[AI] [${context}] Gemini ${model} HTTP ${res.status}: ${errText.slice(0, 150)}`);
          continue;
        }

        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text || text.trim() === '') {
          console.warn(`[AI] [${context}] Gemini ${model} returned empty content`);
          continue;
        }

        console.log(`[AI] [${context}] ✓ Gemini success (${model})`);
        return text;
      } catch (err: any) {
        console.warn(`[AI] [${context}] Gemini ${model} threw: ${err.message}`);
        continue;
      }
    }

    throw new Error(`[AI] Gemini: all models exhausted for ${context}`);
  }

  /**
   * Call Groq with model fallback chain.
   */
  private static async callGroq(
    messages: Array<{ role: string; content: string }>,
    temperature: number,
    context: string,
    preferredModel?: string
  ): Promise<string> {
    const key = this.groqKey;
    if (!key) throw new Error('No Groq API key configured');

    const modelsToTry = preferredModel
      ? [preferredModel, ...GROQ_MODEL_CHAIN.filter((m) => m !== preferredModel)]
      : GROQ_MODEL_CHAIN;

    for (const model of modelsToTry) {
      try {
        console.log(`[AI] [${context}] → Groq (${model})`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: 'json_object' },
            temperature,
            max_tokens: 4096
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[AI] [${context}] Groq ${model} HTTP ${response.status}: ${errText.slice(0, 150)}`);
          continue;
        }

        const data: any = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content || content.trim() === '') {
          console.warn(`[AI] [${context}] Groq ${model} returned empty`);
          continue;
        }
        console.log(`[AI] [${context}] ✓ Groq success (${model})`);
        return content;
      } catch (err: any) {
        console.warn(`[AI] [${context}] Groq ${model} threw: ${err.message}`);
        continue;
      }
    }

    throw new Error(`[AI] Groq: all models exhausted for ${context}`);
  }

  /**
   * Smart router — picks primary provider based on task, falls back to the other.
   * Tasks requiring deep reasoning use Gemini first.
   * Tasks requiring low latency use Groq first.
   */
  private static async callWithRouter(
    messages: Array<{ role: string; content: string }>,
    temperature: number,
    taskKey: string
  ): Promise<string> {
    const primary = TASK_ROUTING[taskKey] ?? 'groq';
    const secondary = primary === 'gemini' ? 'groq' : 'gemini';
    const hasGemini = !!this.geminiKey;
    const hasGroq   = !!this.groqKey;

    // Try primary
    if (primary === 'gemini' && hasGemini) {
      try { return await this.callGemini(messages, temperature, taskKey); }
      catch (e: any) { console.warn(`[AI] [${taskKey}] Gemini primary failed: ${e.message}. Trying Groq fallback.`); }
    } else if (primary === 'groq' && hasGroq) {
      try { return await this.callGroq(messages, temperature, taskKey); }
      catch (e: any) { console.warn(`[AI] [${taskKey}] Groq primary failed: ${e.message}. Trying Gemini fallback.`); }
    }

    // Try secondary fallback
    if (secondary === 'gemini' && hasGemini) {
      return await this.callGemini(messages, temperature, `${taskKey}[fallback]`);
    } else if (secondary === 'groq' && hasGroq) {
      return await this.callGroq(messages, temperature, `${taskKey}[fallback]`);
    }

    throw new Error(`[AI] No provider available for task: ${taskKey}`);
  }

  /** Legacy alias — routes to appropriate provider based on taskKey */
  private static async callWithFallback(
    messages: Array<{ role: string; content: string }>,
    temperature: number,
    context: string
  ): Promise<string> {
    return this.callWithRouter(messages, temperature, context);
  }

  /** Helper to safely parse JSON from raw AI responses */
  private static extractJson<T = any>(raw: string | null | undefined): T {
    if (!raw || typeof raw !== 'string') return {} as T;
    try {
      let cleaned = raw
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      const firstBracket = cleaned.indexOf('{');
      const lastBracket = cleaned.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }

      try {
        return JSON.parse(cleaned);
      } catch (innerErr) {
        // Try repairing common LLM JSON syntax issues (unescaped newlines inside strings)
        const repaired = cleaned
          .replace(/(?<!\\)\n/g, ' ')
          .replace(/[\u0000-\u001F]+/g, ' ');
        return JSON.parse(repaired);
      }
    } catch (e: any) {
      console.warn('[AI Provider] extractJson parse error:', e.message, 'Raw preview:', raw?.slice(0, 160));
      return {} as T;
    }
  }

  /**
   * 1. 8-Dimension Rubric Evaluation via Live AI
   */
  public static async evaluateSubmissionWithAi(
    problem: Problem,
    content: StructuredDesignContent,
    versionNumber: number
  ): Promise<FeedbackReport & { evaluatedByAi?: boolean; modelUsed?: string }> {
    const hasAi = !!this.geminiKey || !!this.groqKey;

    if (!hasAi) {
      throw new Error('Live AI is not configured. Evaluation cannot be submitted until a provider key is available.');
    }

    try {
      console.log('[AI] Starting real-time 8-dimension rubric evaluation...');

      const systemPrompt = `You are a Principal Software Architect and Low-Level Design (LLD) Interview Evaluator at a top tech company (Google/Amazon/Meta).
Evaluate the candidate's structured object-oriented design against the 8-dimension rubric in real time:
1. Requirement Understanding (15%)
2. Class Responsibilities (15%)
3. Coupling & Cohesion (15%)
4. Encapsulation & Interfaces (10%)
5. Abstraction & Patterns (10%)
6. Extensibility (15%)
7. Edge Cases & Testability (10%)
8. Quality of Explanation (10%)

CRITICAL EVALUATION RULES:
1. METHOD-LEVEL SCRUTINY: Inspect every class, method name, and attribute. If the candidate submitted dummy/joke methods (e.g. 'meow()', 'guard(help chahiye)') or is missing core domain methods (e.g. for Parking Lot: parkVehicle, unparkVehicle, spot finding, ticket issuing), explicitly quote those exact names and score realistically low (1/5 across failed dimensions; total score 5-15%).
2. PEDAGOGICAL CLARITY: State the exact domain gap and what methods/entities should be built instead.
3. CONCISENESS CONSTRAINT: Keep evidence, interpretation, impact, and suggestion to 1-2 concise sentences each so the JSON response is crisp and compact.
4. Score each criterion from 1 to 5 (1=Major anti-pattern/dummy, 2=Incomplete, 3=Baseline, 4=Strong, 5=Exemplary).
5. Identify recurring architectural smells and assess the requirement mutation challenge.

Return STRICT JSON matching this schema:
{
  "overallScore": number (0-100),
  "overallSummary": string,
  "confidence": "high" | "medium" | "low",
  "criteria": [
    {
      "dimension": string,
      "score": number (1-5),
      "maxScore": 5,
      "confidence": "high" | "medium" | "low",
      "evidence": string,
      "interpretation": string,
      "impact": string,
      "suggestion": string,
      "tradeoff": string,
      "practiceAction": string,
      "severity": "critical" | "important" | "minor" | "positive"
    }
  ],
  "recurringSmellsIdentified": string[],
  "nextPracticeActions": string[],
  "mutationReview": {
    "mutationTitle": string,
    "changeCost": "Low" | "Medium" | "High",
    "openClosedVerdict": "Pass" | "Partial" | "Fail",
    "classesModified": string[],
    "classesAdded": string[],
    "analysis": string,
    "recommendedRefactoring": string
  }
}`;

      const userContent = JSON.stringify({
        problemTitle: problem.title,
        problemStatement: problem.statement,
        functionalRequirements: problem.functionalRequirements,
        mutationScenario: problem.mutationScenario,
        candidateSubmission: {
          assumptions: content.assumptions,
          classes: content.classes,
          relationships: content.relationships,
          decisions: content.decisions,
          edgeCases: content.edgeCases,
          extensionResponse: content.extensionResponse
        }
      }, null, 2);

      const rawJson = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        0.1,
        'evaluateSubmission'
      );

      const parsedReport = this.extractJson<FeedbackReport>(rawJson);

      // Validate that the live AI response is complete
      if (parsedReport && Array.isArray(parsedReport.criteria) && parsedReport.criteria.length >= 6) {
        const liveScore = typeof parsedReport.overallScore === 'number' 
          ? Math.max(0, Math.min(100, parsedReport.overallScore)) 
          : 50;

        console.log(`[AI] Real-time AI evaluation completed successfully. Score: ${liveScore}%`);

        return {
          overallScore: liveScore,
          overallSummary: parsedReport.overallSummary || 'Real-time architectural evaluation complete.',
          confidence: parsedReport.confidence || 'high',
          criteria: parsedReport.criteria.map((c, i) => ({
            dimension: c.dimension || problem.rubric[i]?.name || problem.rubric[i]?.id || `Dimension ${i + 1}`,
            score: typeof c.score === 'number' ? Math.max(1, Math.min(5, c.score)) : 1,
            maxScore: 5,
            confidence: c.confidence || 'high',
            evidence: c.evidence || 'Analyzed candidate submission.',
            interpretation: c.interpretation || '',
            impact: c.impact || '',
            suggestion: c.suggestion || '',
            tradeoff: c.tradeoff || '',
            practiceAction: c.practiceAction || '',
            severity: c.severity || (c.score <= 2 ? 'critical' : c.score === 5 ? 'positive' : 'important')
          })),
          nextPracticeActions: Array.isArray(parsedReport.nextPracticeActions) && parsedReport.nextPracticeActions.length > 0 
            ? parsedReport.nextPracticeActions 
            : ['Model missing domain entities and operations.'],
          recurringSmellsIdentified: Array.isArray(parsedReport.recurringSmellsIdentified) 
            ? parsedReport.recurringSmellsIdentified 
            : [],
          mutationReview: parsedReport.mutationReview || {
            mutationTitle: problem.mutationScenario.title,
            changeCost: 'High',
            openClosedVerdict: 'Partial',
            classesModified: [],
            classesAdded: [],
            analysis: 'Evaluated against requirement mutation.',
            recommendedRefactoring: 'Abstract variation points with interfaces.'
          },
          evaluatedByAi: true,
          modelUsed: 'Real-time AI Architecture Evaluator'
        };
      }

      console.warn('[AI] Incomplete JSON structure from LLM, using grounded deterministic engine.');
      return EvaluationEngine.evaluate(problem, content, versionNumber);
    } catch (err: any) {
      console.warn('[AI] Primary LLM evaluation error, falling back to grounded evaluator:', err.message);
      return EvaluationEngine.evaluate(problem, content, versionNumber);
    }
  }

  /**
   * 2. Live AI Interviewer Q&A (Step 2 Clarifications)
   */
  public static async askInterviewer(problem: Problem, userQuestion: string): Promise<{
    answer: string;
    impactOnDesign: string;
    suggestedAssumption: string;
    interviewerFeedback?: string;
    questionRating?: 'High Signal' | 'Good Question' | 'Fair';
    recommendedPattern?: string;
  }> {
    if (!this.groqKey && !this.geminiKey) {
      throw new Error('Live AI is not configured.');
    }

    try {
      const systemPrompt = `You are a Principal Software Engineer and Staff LLD Interview Evaluator conducting an LLD interview for "${problem.title}".
The candidate is clarifying a requirement with you.
Evaluate the candidate's question quality, provide a natural interview response (2-3 sentences), state architectural impacts on class boundaries, and highlight recommended design patterns.
Return STRICT JSON:
{
  "answer": string,
  "impactOnDesign": string,
  "suggestedAssumption": string,
  "interviewerFeedback": string (1-2 sentences on how the interviewer perceives this question and what signal it provides),
  "questionRating": "High Signal" | "Good Question" | "Fair",
  "recommendedPattern": string (e.g. "Strategy Pattern", "State Pattern", "Observer Pattern", "Factory Pattern")
}`;

      const raw = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Problem: ${problem.title}\nStatement: ${problem.statement}\nRequirements: ${problem.functionalRequirements.join('; ')}\nCandidate Question: "${userQuestion}"` }
        ],
        0.3,
        'askInterviewer'
      );
      return this.extractJson(raw);
    } catch (err: any) {
      console.error('[AI Provider] askInterviewer error:', err.message);
      throw new Error(`Live AI interviewer failed: ${err.message}`);
    }
  }

  /**
   * 3. AI Assumption & Boundary Reviewer (Step 3 Assumptions)
   */
  public static async reviewAssumptions(problem: Problem, assumptions: string[]): Promise<{ critique: string; suggestedAssumptions: string[]; missedBoundaries: string[] }> {
    if (!this.groqKey && !this.geminiKey) {
      throw new Error('Live AI is not configured. Add a valid Gemini or Groq key in the server settings.');
    }

    try {
      const systemPrompt = `You are an LLD interview coach. Analyze the candidate's stated assumptions for "${problem.title}".
Identify any vague assumptions, missing domain boundaries, or risks.
Return STRICT JSON:
{
  "critique": string,
  "suggestedAssumptions": string[],
  "missedBoundaries": string[]
}`;

      const raw = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Problem: ${problem.title}\nRequirements: ${problem.functionalRequirements.join('; ')}\nCandidate Assumptions:\n${assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n')}` }
        ],
        0.2,
        'reviewAssumptions'
      );
      return this.extractJson(raw);
    } catch (err: any) {
      console.error('[AI Provider] reviewAssumptions error:', err.message);
      throw new Error(`Live AI review failed: ${err.message}`);
    }
  }

  /**
   * 4. AI Design Advisor (Step 4 Design Workspace)
   */
  public static async getDesignAdvice(problem: Problem, content: StructuredDesignContent, prompt: string): Promise<{ advice: string; detectedSmells: string[]; recommendedPatterns: string[] }> {
    if (!this.groqKey && !this.geminiKey) {
      throw new Error('Live AI is not configured.');
    }

    try {
      const systemPrompt = `You are a Principal Software Architect and Socratic LLD Interview Coach reviewing a learner's in-progress LLD design for "${problem.title}".
Your goal is to help the candidate learn and practice on their own. Provide architectural coaching, point out code smells (e.g. God class, tight coupling, missing abstractions), and suggest 1-3 relevant design patterns to consider without giving away the complete direct solution.
Return STRICT JSON:
{
  "advice": string (2-3 concise, actionable sentences of Socratic guidance),
  "detectedSmells": string[] (up to 2 brief code smells, e.g. ["Potential God Class: ParkingLot", "Tight Coupling"]),
  "recommendedPatterns": string[] (up to 3 short pattern names only, e.g. ["Strategy Pattern", "State Pattern", "Observer Pattern"])
}`;

      const raw = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Problem: ${problem.title}\nClasses:\n${content.classes.map(c => `- ${c.name} (${c.type}): methods=[${c.methods.map(m => m.name).join(', ')}]`).join('\n')}\nCandidate Question: "${prompt}"` }
        ],
        0.2,
        'getDesignAdvice'
      );
      return this.extractJson(raw);
    } catch (err: any) {
      console.error('[AI Provider] getDesignAdvice error:', err.message);
      throw new Error(`Live AI design review failed: ${err.message}`);
    }
  }

  /**
   * 5. Live AI Mutation Stress-Test Evaluator (Step 7 Design Defense)
   */
  public static async evaluateMutationWithAi(
    problem: Problem,
    content: StructuredDesignContent,
    extensionResponse: string
  ): Promise<MutationAssessment> {
    if (!this.geminiKey && !this.groqKey) {
      throw new Error('Live AI is not configured.');
    }

    try {
      const systemPrompt = `You are a Principal Software Architect evaluating an LLD candidate's response to a requirement mutation stress-test.
Problem: ${problem.title}
Mutation Challenge: "${problem.mutationScenario.title}" - ${problem.mutationScenario.description}

Analyze the candidate's existing class structure and their proposed extension plan:
1. Determine the Change Cost: "Low" (new classes added, existing classes untouched), "Medium" (minor adjustments), or "High" (shotgun surgery / modifying core coordinators).
2. Determine the Open-Closed Principle verdict: "Pass", "Partial", or "Fail".
3. List the exact classes that would be modified vs newly added.
4. Give a concise, professional analysis (2-3 sentences) citing concrete design trade-offs.

Return STRICT JSON:
{
  "mutationTitle": string,
  "changeCost": "Low" | "Medium" | "High",
  "openClosedVerdict": "Pass" | "Partial" | "Fail",
  "classesModified": string[],
  "classesAdded": string[],
  "analysis": string,
  "recommendedRefactoring": string
}`;

      const userContent = JSON.stringify({
        candidateClasses: content.classes.map(c => ({ name: c.name, type: c.type, methods: c.methods.map(m => m.name) })),
        candidateExtensionPlan: extensionResponse
      }, null, 2);

      const raw = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        0.1,
        'evaluateMutation'
      );
      return this.extractJson(raw);
    } catch (err: any) {
      console.error('[AI Provider] evaluateMutationWithAi error:', err.message);
      throw new Error(`Live AI mutation review failed: ${err.message}`);
    }
  }

  /**
   * 6. Live AI Tutor for Chapters & Concepts
   */
  public static async askTutor(contextTitle: string, question: string, contextSummary?: string): Promise<{ answer: string }> {
    if (!this.geminiKey && !this.groqKey) {
      throw new Error('Live AI is not configured.');
    }

    try {
      const systemPrompt = `You are a friendly, expert AI Software Architect Tutor for CipherSchool.
Current Learning Context: "${contextTitle}"
${contextSummary ? `Context Summary: ${contextSummary}` : ''}

CRITICAL RULES:
1. SIMPLE WORDING: Use plain, natural English.
2. CRISP & CONCISE: Answer in 2 to 4 short bullet points or brief sentences.
3. REAL-WORLD ANALOGY: Use a quick 1-sentence analogy where helpful.
4. CODE: If asked for code, provide minimal 3-6 clean lines.`;

      const raw = await this.callWithFallback(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        0.3,
        'askTutor'
      );

      // If json_object was requested or plain text returned
      let cleanedText = raw;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.answer) cleanedText = parsed.answer;
        else if (parsed.content) cleanedText = parsed.content;
      } catch {
        // Plain text is fine
      }

      return { answer: cleanedText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() };
    } catch (err: any) {
      console.error('[AI Provider] askTutor error:', err.message);
      throw new Error(`AI Tutor failed: ${err.message}`);
    }
  }
}
