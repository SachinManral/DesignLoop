import { UserSettings } from '../types';
import { StorageService } from './storageService';


const GROQ_MODELS = [
  'openai/gpt-oss-20b',
  'groq/compound-mini',
  'qwen/qwen3.6-27b',
  'qwen/qwen3.8-27b'
];

const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AskTutorParams {
  contextTitle: string;
  contextSummary?: string;
  question: string;
  history?: TutorMessage[];
  settings?: UserSettings;
}

export class AiService {
  /**
   * Get active Groq API Key (User settings > Env variable > Seeded fallback)
   */
  public static getGroqKey(settings?: UserSettings): string {
    const userSettings = settings || StorageService.getUserSettings();
    if (userSettings?.groqApiKey && userSettings.groqApiKey.trim()) {
      return userSettings.groqApiKey.trim();
    }
    return (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  }

  /**
   * Get active Gemini API Key (User settings > Env variable > Seeded fallback)
   */
  public static getGeminiKey(settings?: UserSettings): string {
    const userSettings = settings || StorageService.getUserSettings();
    if (userSettings?.geminiApiKey && userSettings.geminiApiKey.trim()) {
      return userSettings.geminiApiKey.trim();
    }
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  /**
   * Formats the system prompt strictly enforcing crisp, simple-worded, beginner-friendly explanations.
   */
  private static buildSystemPrompt(contextTitle: string, contextSummary?: string): string {
    return `You are the expert, professional AI Software Architect Tutor for CipherSchool's Low-Level Design (LLD) Platform.
Current Learning Context: "${contextTitle}"
${contextSummary ? `Context Summary: ${contextSummary}` : ''}

CRITICAL RESPONSE RULES:
1. PROFESSIONAL & DIRECT: Maintain an objective, professional engineering tone. Do NOT use emojis anywhere in your response.
2. SIMPLE & CONCISE: Get straight to the point in 2 to 4 short bullet points or brief paragraphs. Avoid unnecessary academic jargon.
3. CLEAR MENTAL MODEL: Use a single, practical 1-sentence real-world analogy to anchor abstract concepts.
4. CLEAN CODE SNIPPETS (IF RELEVANT): Provide minimal 3 to 6 line code examples with clean, meaningful comments explaining the architectural intent.
5. TAILORED TO USER INTENT: Answer the exact question asked without tangential padding.
6. FORMATTING: Use Markdown with bolding for key concepts and backticks for methods/types.`;
  }

  /**
   * Helper to clean any raw reasoning output like <think>...</think>
   */
  public static cleanOutput(raw: string): string {
    if (!raw) return '';
    return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  /**
   * Calls Groq Chat Completions API with automatic fallback through the model chain.
   */
  public static async callGroq(
    messages: TutorMessage[],
    preferredModel?: string,
    apiKey?: string,
    asJson = false
  ): Promise<string> {
    const key = apiKey || this.getGroqKey();
    if (!key) throw new Error('Groq API Key is not configured.');

    const modelsToTry = preferredModel
      ? [preferredModel, ...GROQ_MODELS.filter((m) => m !== preferredModel)]
      : GROQ_MODELS;

    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 500,
            ...(asJson ? { response_format: { type: 'json_object' } } : {}),
          }),
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[AiService] Groq ${model} status ${response.status}:`, errData);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          const cleaned = this.cleanOutput(content);
          if (cleaned) return cleaned;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`[AiService] Groq model ${model} timeout or error:`, err?.message || err);
        continue;
      }
    }

    throw new Error('All Groq models failed. Trying Gemini fallback.');
  }

  /**
   * Calls Google Gemini REST API.
   */
  public static async callGemini(
    messages: TutorMessage[],
    preferredModel?: string,
    apiKey?: string
  ): Promise<string> {
    const key = apiKey || this.getGeminiKey();
    if (!key) throw new Error('Gemini API Key is not configured.');

    const modelsToTry = preferredModel
      ? [preferredModel, ...GEMINI_MODELS.filter((m) => m !== preferredModel)]
      : GEMINI_MODELS;

    // Separate system message and conversation turns
    const systemMsg = messages.find((m) => m.role === 'system');
    const conversationTurns = messages.filter((m) => m.role !== 'system');

    const contents = [
      ...(systemMsg
        ? [
            { role: 'user', parts: [{ text: systemMsg.content }] },
            { role: 'model', parts: [{ text: 'Understood. I will provide crisp, simple-worded explanations.' }] },
          ]
        : []),
      ...conversationTurns.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[AiService] Gemini ${model} HTTP ${response.status}:`, errText.slice(0, 150));
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (err) {
        console.warn(`[AiService] Gemini ${model} failed:`, err);
        continue;
      }
    }

    throw new Error('Gemini API request failed.');
  }

  /**
   * Ask the AI Tutor a question with full conversation history and smart provider routing.
   */
  public static async askTutor(params: AskTutorParams): Promise<string> {
    const settings = params.settings || StorageService.getUserSettings();
    const systemPrompt = this.buildSystemPrompt(params.contextTitle, params.contextSummary);

    const historyMessages: TutorMessage[] = params.history
      ? params.history.filter((m) => m.role !== 'system')
      : [];

    const fullMessages: TutorMessage[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: params.question },
    ];

    const preferredProvider = settings?.aiProvider || 'groq';

    // 1. Fast sub-second Groq provider first
    if (preferredProvider === 'groq') {
      try {
        return await this.callGroq(fullMessages, settings?.groqModel, this.getGroqKey(settings));
      } catch (groqErr) {
        console.warn('[AiService] Primary Groq failed, switching to Gemini fallback...', groqErr);
        try {
          return await this.callGemini(fullMessages, settings?.geminiModel, this.getGeminiKey(settings));
        } catch (geminiErr) {
          console.error('[AiService] Both Groq and Gemini failed:', geminiErr);
          throw new Error('Unable to connect to AI providers. Please check your API keys or network connection.');
        }
      }
    } else {
      try {
        return await this.callGemini(fullMessages, settings?.geminiModel, this.getGeminiKey(settings));
      } catch (geminiErr) {
        console.warn('[AiService] Primary Gemini failed, switching to Groq fallback...', geminiErr);
        try {
          return await this.callGroq(fullMessages, settings?.groqModel, this.getGroqKey(settings));
        } catch (groqErr) {
          console.error('[AiService] Both Gemini and Groq failed:', groqErr);
          throw new Error('Unable to connect to AI providers. Please check your API keys or network connection.');
        }
      }
    }
  }

  /**
   * Generates a dynamic single question (1 of 10) for adaptive topic revision.
   */
  public static async generateQuizQuestion(params: {
    contextTitle: string;
    questionNumber: number;
    previousQuestions?: string[];
    settings?: UserSettings;
  }): Promise<{
    questionNumber: number;
    questionText: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  }> {
    const { contextTitle, questionNumber, previousQuestions = [], settings } = params;

    const topicAspects = [
      'Core Definition & Intuition',
      'Real-world Analogy & Purpose',
      'Code Structure & Implementation rules',
      'Decoupling & Loose Coupling',
      'Key Differences from related concepts',
      'State & Behavior protection',
      'Common Anti-patterns & Mistakes to avoid',
      'Extensibility & Open-Closed design',
      'Practical Edge Cases & Considerations',
      'Mastery & Architectural Trade-offs'
    ];

    const aspectFocus = topicAspects[(questionNumber - 1) % topicAspects.length];

    const prompt = `You are creating Question ${questionNumber} of 10 for an interactive architecture revision quiz on "${contextTitle}".
Aspect focus for this question: "${aspectFocus}".
${previousQuestions.length > 0 ? `Already covered questions:\n${previousQuestions.map((q, i) => `- ${q}`).join('\n')}` : ''}

Generate a clear, high-quality, practical multiple choice question with 4 options (A, B, C, D).
Do NOT use emojis anywhere in your output.
Return STRICT JSON with no markdown wrapping:
{
  "questionNumber": ${questionNumber},
  "questionText": "Question text here (crisp and professional)",
  "options": [
    { "key": "A", "text": "Option A text" },
    { "key": "B", "text": "Option B text" },
    { "key": "C", "text": "Option C text" },
    { "key": "D", "text": "Option D text" }
  ],
  "correctAnswer": "A",
  "explanation": "Professional 1-2 sentence explanation of why this answer is correct."
}`;

    const messages: TutorMessage[] = [
      { role: 'system', content: 'You are an expert interactive Quiz Generator for software design. Always respond with strict valid JSON only without emojis.' },
      { role: 'user', content: prompt }
    ];

    try {
      const preferredProvider = settings?.aiProvider || 'groq';
      let rawJson = '';

      if (preferredProvider === 'groq') {
        try {
          rawJson = await this.callGroq(messages, settings?.groqModel, this.getGroqKey(settings), true);
        } catch {
          rawJson = await this.callGemini(messages, settings?.geminiModel, this.getGeminiKey(settings));
        }
      } else {
        try {
          rawJson = await this.callGemini(messages, settings?.geminiModel, this.getGeminiKey(settings));
        } catch {
          rawJson = await this.callGroq(messages, settings?.groqModel, this.getGroqKey(settings), true);
        }
      }

      // Try to find JSON substring
      const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
      const jsonStrToParse = jsonMatch ? jsonMatch[0] : rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const parsed = JSON.parse(jsonStrToParse);

      if (parsed.questionText && Array.isArray(parsed.options) && parsed.correctAnswer) {
        return {
          questionNumber,
          questionText: parsed.questionText,
          options: parsed.options,
          correctAnswer: String(parsed.correctAnswer).toUpperCase(),
          explanation: parsed.explanation || 'Great job! That is the correct concept.',
        };
      }
    } catch (err) {
      console.warn('[AiService] Failed to parse dynamic quiz JSON, falling back to adaptive fallback question:', err);
    }

    // Dynamic adaptive fallback based on context and questionNumber
    return {
      questionNumber,
      questionText: `In the context of ${contextTitle}, what is the primary architectural advantage of programming to contracts?`,
      options: [
        { key: 'A', text: 'It decouples callers from concrete implementations, making the code extensible and testable.' },
        { key: 'B', text: 'It forces all objects to reside in the exact same memory segment.' },
        { key: 'C', text: 'It prevents developers from creating any subclasses.' },
        { key: 'D', text: 'It automatically optimizes runtime CPU performance without compilation.' }
      ],
      correctAnswer: 'A',
      explanation: 'Contracts and interfaces decouple components so different implementations can be swapped without modifying dependent code.'
    };
  }
}
