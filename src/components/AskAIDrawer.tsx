import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Bot, User, RefreshCw, Zap, Lightbulb, 
  Code2, Scale, FileText, HelpCircle, Briefcase, Layers, ArrowUp, RotateCcw,
  Copy, Check, Award, CheckCircle2, XCircle, ArrowRight, BookOpen, Trophy
} from 'lucide-react';
import { UserSettings } from '../types';
import { AiService, TutorMessage } from '../services/aiService';
import { StorageService } from '../services/storageService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isActionResponse?: boolean;
}

interface AskAIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle: string;
  contextSummary?: string;
  settings: UserSettings;
}

interface QuizOption {
  key: string;
  text: string;
}

interface ActiveQuizQuestion {
  questionNumber: number;
  questionText: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  userSelection?: string;
}

// Tokenize and colorize code lines
const highlightCodeLine = (line: string) => {
  if (!line) return <span>&nbsp;</span>;

  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span style={{ color: '#8b949e', fontStyle: 'italic' }}>{line}</span>;
  }

  const tokenRegex = /(\/\/.*$|".*?"|'.*?'|\b(?:public|private|protected|static|final|abstract|interface|class|enum|implements|extends|void|return|new|this|super|if|else|for|while|switch|case|break|continue|try|catch|throw|throws|const|let|var|function|def|import|export|from|default|package|type)\b|\b(?:String|Integer|Double|Float|Boolean|List|Map|Set|ArrayList|HashMap|Object|PaymentProcessor|StripePayment|RazorpayPayment|PaymentGateway|CheckoutService|NotificationService|EmailNotifier|Array|Promise|Record|double|int|float|boolean|char|byte|long|short)\b|\b(?:true|false|null|undefined|\d+(?:\.\d+)?)\b|[{}();[\],.])/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`txt-${lastIndex}`} style={{ color: '#c9d1d9' }}>
          {line.substring(lastIndex, match.index)}
        </span>
      );
    }

    const token = match[0];
    let color = '#c9d1d9';
    let fontWeight = 400;
    let fontStyle: 'normal' | 'italic' = 'normal';

    if (token.startsWith('//')) {
      color = '#8b949e';
      fontStyle = 'italic';
    } else if (token.startsWith('"') || token.startsWith("'")) {
      color = '#7ee787';
    } else if (
      /^(public|private|protected|static|final|abstract|interface|class|enum|implements|extends|void|return|new|this|super|if|else|for|while|switch|case|break|continue|try|catch|throw|throws|const|let|var|function|def|import|export|from|default|package|type)$/.test(token)
    ) {
      color = '#ff7b72';
      fontWeight = 600;
    } else if (
      /^(String|Integer|Double|Float|Boolean|List|Map|Set|ArrayList|HashMap|Object|PaymentProcessor|StripePayment|RazorpayPayment|PaymentGateway|CheckoutService|NotificationService|EmailNotifier|Array|Promise|Record|double|int|float|boolean|char|byte|long|short)$/.test(token)
    ) {
      color = '#79c0ff';
      fontWeight = 600;
    } else if (/^(true|false|null|undefined|\d+(?:\.\d+)?)$/.test(token)) {
      color = '#ffa657';
    } else if (/^[{}();[\],.]$/.test(token)) {
      color = '#d2a8ff';
    }

    parts.push(
      <span key={`tok-${match.index}`} style={{ color, fontWeight, fontStyle }}>
        {token}
      </span>
    );

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`end-${lastIndex}`} style={{ color: '#c9d1d9' }}>
        {line.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? <>{parts}</> : <span>{line}</span>;
};

// Syntax-colored code block with copy button
const SyntaxCodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim();
  const langDisplay = (language || 'JAVA').toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = cleanCode.split('\n');

  return (
    <div
      style={{
        margin: '6px 0',
        borderRadius: '8px',
        background: '#090d16',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          fontSize: '0.68rem',
          color: '#8b949e',
          fontFamily: 'monospace',
          fontWeight: 600,
        }}
      >
        <span style={{ color: '#79c0ff', letterSpacing: '0.5px' }}>{langDisplay}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? '#10b981' : '#8b949e',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.66rem',
            transition: 'color 0.15s ease',
          }}
          title="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre
        style={{
          margin: 0,
          padding: '8px 12px',
          fontFamily: 'Consolas, Monaco, "JetBrains Mono", "Fira Code", monospace',
          fontSize: '0.78rem',
          lineHeight: '1.42',
          overflowX: 'auto',
          color: '#c9d1d9',
          whiteSpace: 'pre',
        }}
      >
        {lines.map((line, idx) => (
          <div key={idx} style={{ minHeight: '18px' }}>
            {highlightCodeLine(line)}
          </div>
        ))}
      </pre>
    </div>
  );
};

// Helper to format inline markdown tokens (bold, code, italics)
const renderTutorTokens = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#79c0ff',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={index} style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

// Formats message blocks with lists, code blocks, flashcards, and paragraphs
const renderTutorMessage = (text: string) => {
  if (!text) return null;

  const codeBlockRegex = /```(?:(\w+)\s*)?\n([\s\S]*?)```|`(\w+)\n([\s\S]*?)`/g;
  const elements: React.ReactNode[] = [];
  let lastIdx = 0;
  let blockMatch;

  while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIdx, blockMatch.index);
    if (textBefore) {
      elements.push(renderTextSection(textBefore, `txt-${lastIdx}`));
    }

    const lang = blockMatch[1] || blockMatch[3] || 'java';
    const codeContent = blockMatch[2] || blockMatch[4] || '';
    elements.push(
      <SyntaxCodeBlock key={`code-${blockMatch.index}`} code={codeContent} language={lang} />
    );

    lastIdx = blockMatch.index + blockMatch[0].length;
  }

  if (lastIdx < text.length) {
    const remainingText = text.substring(lastIdx);
    elements.push(renderTextSection(remainingText, `txt-end`));
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>{elements}</div>;
};

// Render regular text sections with compact spacing
const renderTextSection = (sectionText: string, keyPrefix: string) => {
  const lines = sectionText.split('\n');
  return (
    <div key={keyPrefix} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('🎴') || trimmed.startsWith('Card:')) {
          return (
            <div
              key={`${keyPrefix}-${i}`}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: '6px 10px',
                margin: '2px 0',
                borderLeft: '3px solid #10b981',
                fontSize: '0.80rem',
                lineHeight: '1.4',
              }}
            >
              {renderTutorTokens(trimmed)}
            </div>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div
              key={`${keyPrefix}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                paddingLeft: '2px',
                lineHeight: '1.42',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#10b981',
                  marginTop: '7px',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, fontSize: '0.82rem' }}>{renderTutorTokens(trimmed.substring(2))}</div>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)$/);
          return (
            <div
              key={`${keyPrefix}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                paddingLeft: '2px',
                lineHeight: '1.42',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: '#10b981',
                  minWidth: '16px',
                  fontSize: '0.80rem',
                }}
              >
                {match ? match[1] : '•'}
              </span>
              <div style={{ flex: 1, fontSize: '0.82rem' }}>
                {renderTutorTokens(match ? match[2] : trimmed)}
              </div>
            </div>
          );
        }

        return (
          <p key={`${keyPrefix}-${i}`} style={{ margin: 0, lineHeight: '1.42', fontSize: '0.82rem' }}>
            {renderTutorTokens(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AskAIDrawer: React.FC<AskAIDrawerProps> = ({
  isOpen,
  onClose,
  contextTitle,
  contextSummary,
  settings,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 10-Question Interactive Revision Quiz State ---
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizHistory, setQuizHistory] = useState<ActiveQuizQuestion[]>([]);
  const [currentQuizQ, setCurrentQuizQ] = useState<ActiveQuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Stored score for this topic
  const [savedQuizScore, setSavedQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    if (contextTitle) {
      const stored = StorageService.getTopicQuizScore(contextTitle);
      setSavedQuizScore(stored);
    }
  }, [contextTitle, quizFinished]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, currentQuizQ, quizFinished]);

  if (!isOpen) return null;

  // Start a fresh 10-question AI revision session
  const startInteractiveQuiz = async () => {
    setIsQuizMode(true);
    setQuizHistory([]);
    setQuizScore(0);
    setQuizFinished(false);
    setCurrentQuizQ(null);
    setQuizLoading(true);

    try {
      const firstQ = await AiService.generateQuizQuestion({
        contextTitle,
        questionNumber: 1,
        previousQuestions: [],
        settings,
      });

      setCurrentQuizQ(firstQ);
    } catch (e) {
      console.error('Failed to start quiz:', e);
    } finally {
      setQuizLoading(false);
    }
  };

  // User answers current quiz question
  const handleQuizAnswerSelect = (selectedKey: string) => {
    if (!currentQuizQ || currentQuizQ.userSelection) return;

    const isCorrect = selectedKey === currentQuizQ.correctAnswer;
    const newScore = isCorrect ? quizScore + 1 : quizScore;
    if (isCorrect) {
      setQuizScore(newScore);
    }

    const updatedQ: ActiveQuizQuestion = {
      ...currentQuizQ,
      userSelection: selectedKey,
    };

    setCurrentQuizQ(updatedQ);
    setQuizHistory((prev) => [...prev, updatedQ]);

    // If this was question 10, finish the quiz
    if (currentQuizQ.questionNumber >= 10) {
      StorageService.saveTopicQuizScore(contextTitle, newScore, 10);
      setQuizFinished(true);
    }
  };

  // Move to the next AI-generated question (up to 10)
  const handleNextQuizQuestion = async () => {
    if (!currentQuizQ) return;
    const nextQNum = currentQuizQ.questionNumber + 1;

    if (nextQNum > 10) {
      setQuizFinished(true);
      return;
    }

    setQuizLoading(true);
    try {
      const previousTexts = quizHistory.map((q) => q.questionText);
      const nextQ = await AiService.generateQuizQuestion({
        contextTitle,
        questionNumber: nextQNum,
        previousQuestions: previousTexts,
        settings,
      });

      setCurrentQuizQ(nextQ);
    } catch (err) {
      console.error('Failed to generate next question:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Main 4 action cards shown when chat has no messages
  const actionCards = [
    {
      id: 'quiz',
      icon: Trophy,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      title: '10-Question Revision Quiz',
      description: 'AI generates 10 adaptive questions with live scoring & revision',
      action: startInteractiveQuiz,
    },
    {
      id: 'summarize',
      icon: FileText,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      title: 'Summarize this chapter',
      description: 'Get a concise overview of this chapter',
      prompt: `Please summarize "${contextTitle}" in 3 to 4 crisp, simple-worded bullet points. Highlight the core idea, why it matters, and a quick 1-sentence analogy.`,
    },
    {
      id: 'interview',
      icon: Briefcase,
      iconColor: '#ec4899',
      iconBg: 'rgba(236, 72, 153, 0.15)',
      title: 'Interview Questions',
      description: 'Common interview questions related to topic',
      prompt: `What are the 2 most common LLD interview questions asked about "${contextTitle}"? Give a crisp, 2-sentence ideal answer for each.`,
    },
    {
      id: 'flashcards',
      icon: Layers,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      title: 'Generate Flashcards',
      description: 'Interactive study cards for memorization',
      prompt: `Generate 3 high-impact study flashcards for "${contextTitle}". Format each as: Card: [Concept Name] — [Simple definition and practical architectural rule of thumb]. Do not use emojis.`,
    },
  ];

  // Quick prompt chips shown in active chat view
  const quickPrompts = [
    { label: '10-Question Quiz', icon: Trophy, action: startInteractiveQuiz },
    { label: 'Explain simply', icon: Lightbulb, query: `Explain ${contextTitle} in simple, professional terms with a short analogy. Do not use emojis.` },
    { label: 'Real-world analogy', icon: Sparkles, query: `What is the best real-world mental model for understanding ${contextTitle}? Do not use emojis.` },
    { label: 'Show code', icon: Code2, query: `Show a minimal 4-line clean code example of ${contextTitle} with clean architectural comments. Do not use emojis.` },
    { label: 'Key trade-offs', icon: Scale, query: `What is the main design trade-off or advantage of ${contextTitle}? Do not use emojis.` },
  ];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    // Check if user is asking to start a quiz
    if (/^(quiz|start quiz|quiz me|test me|10 questions)/i.test(queryText.trim())) {
      startInteractiveQuiz();
      setInput('');
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setErrorMsg(null);

    const history: TutorMessage[] = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const replyText = await AiService.askTutor({
        contextTitle,
        contextSummary,
        question: queryText.trim(),
        history,
        settings,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[AskAIDrawer] AI request error:', err);
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `In short: **${contextTitle}** is a core design concept designed to decouple components and enforce clean boundaries. Keep implementations focused, program to contracts, and protect internal state!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setErrorMsg(err.message || 'Connected using cached architecture guidance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.9)',
          animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header - Clean, Natural, No Model Names */}
        <div
          style={{
            padding: '12px 18px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--r-md)',
                background: isQuizMode
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              }}
            >
              {isQuizMode ? <Trophy size={18} /> : <Bot size={18} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {isQuizMode ? '10-Question Revision' : 'Ask AI Tutor'}
                </h3>
                <span 
                  style={{ 
                    fontSize: '0.66rem', 
                    fontWeight: 700, 
                    padding: '1px 6px', 
                    borderRadius: 'var(--r-full)', 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    color: '#10b981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '3px' 
                  }}
                >
                  <Zap size={9} fill="currentColor" />
                  <span>Live</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.70rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '260px',
                  margin: 0,
                  marginTop: '1px',
                }}
              >
                Topic: {contextTitle}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isQuizMode ? (
              <button
                onClick={() => setIsQuizMode(false)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: '4px',
                }}
              >
                Exit Quiz
              </button>
            ) : (
              messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Start new conversation / Actions"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: 'var(--r-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <RotateCcw size={15} />
                </button>
              )
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips (when in active chat mode and not in quiz) */}
        {!isQuizMode && messages.length > 0 && (
          <div 
            style={{ 
              padding: '6px 14px', 
              background: 'var(--bg-surface-subtle)', 
              borderBottom: '1px solid var(--border-subtle)', 
              display: 'flex', 
              gap: '6px', 
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {quickPrompts.map((chip, idx) => {
              const IconComponent = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => chip.action ? chip.action() : handleSendQuery(chip.query!)}
                  disabled={loading}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 'var(--r-full)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.color = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <IconComponent size={11} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Center Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isQuizMode ? '16px 16px' : messages.length === 0 ? '20px 18px' : '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'var(--bg-surface-subtle)',
          }}
        >
          {/* Interactive Quiz Mode */}
          {isQuizMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {/* Quiz Progress & Live Score Bar */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-lg)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {quizFinished ? 'Quiz Completed' : `Question ${currentQuizQ?.questionNumber || 1} of 10`}
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Current Score: <span style={{ color: '#10b981' }}>{quizScore}</span> / {quizHistory.length}
                  </div>
                </div>

                {/* Mini progress tracker pills */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const answered = quizHistory[i];
                    const isCurrent = (currentQuizQ?.questionNumber === i + 1) && !quizFinished;
                    let pillBg = 'rgba(255, 255, 255, 0.1)';
                    if (answered) {
                      pillBg = answered.userSelection === answered.correctAnswer ? '#10b981' : '#ef4444';
                    } else if (isCurrent) {
                      pillBg = 'rgba(16, 185, 129, 0.5)';
                    }
                    return (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '14px',
                          borderRadius: '2px',
                          background: pillBg,
                          transition: 'background 0.2s ease',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Quiz Loading Question State */}
              {quizLoading && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                    gap: '10px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-lg)',
                  }}
                >
                  <RefreshCw size={24} className="animate-spin" style={{ color: '#10b981' }} />
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    AI is generating Question {currentQuizQ ? currentQuizQ.questionNumber + 1 : 1}...
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Adapting to test your conceptual depth on {contextTitle}
                  </div>
                </div>
              )}

              {/* Active Question Display */}
              {!quizLoading && !quizFinished && currentQuizQ && (
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-xl)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        padding: '3px 8px',
                        borderRadius: 'var(--r-full)',
                      }}
                    >
                      Question {currentQuizQ.questionNumber} of 10
                    </span>
                    {currentQuizQ.userSelection && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: currentQuizQ.userSelection === currentQuizQ.correctAnswer ? '#10b981' : '#ef4444',
                        }}
                      >
                        {currentQuizQ.userSelection === currentQuizQ.correctAnswer ? (
                          <>
                            <CheckCircle2 size={14} /> Correct!
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.45' }}>
                    {renderTutorTokens(currentQuizQ.questionText)}
                  </div>

                  {/* 4 Option Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    {currentQuizQ.options.map((opt) => {
                      const userChoice = currentQuizQ.userSelection;
                      const isAnswered = Boolean(userChoice);
                      const isSelected = userChoice === opt.key;
                      const isCorrect = opt.key === currentQuizQ.correctAnswer;

                      let optBg = 'var(--bg-surface-elevated)';
                      let optBorder = 'var(--border-subtle)';
                      let optColor = 'var(--text-primary)';
                      let keyBg = 'rgba(255, 255, 255, 0.08)';
                      let keyColor = 'var(--text-secondary)';

                      if (isAnswered) {
                        if (isSelected) {
                          if (isCorrect) {
                            optBg = 'rgba(16, 185, 129, 0.18)';
                            optBorder = '#10b981';
                            optColor = '#ffffff';
                            keyBg = '#10b981';
                            keyColor = '#ffffff';
                          } else {
                            optBg = 'rgba(239, 68, 68, 0.18)';
                            optBorder = '#ef4444';
                            optColor = '#ffffff';
                            keyBg = '#ef4444';
                            keyColor = '#ffffff';
                          }
                        } else if (isCorrect) {
                          optBg = 'rgba(16, 185, 129, 0.10)';
                          optBorder = 'rgba(16, 185, 129, 0.6)';
                          keyBg = 'rgba(16, 185, 129, 0.25)';
                          keyColor = '#10b981';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleQuizAnswerSelect(opt.key)}
                          disabled={isAnswered}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '10px 12px',
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            borderRadius: 'var(--r-lg)',
                            color: optColor,
                            textAlign: 'left',
                            cursor: isAnswered ? 'default' : 'pointer',
                            fontSize: '0.82rem',
                            lineHeight: '1.4',
                            transition: 'all 0.15s ease',
                            width: '100%',
                          }}
                          onMouseEnter={(e) => {
                            if (!isAnswered) {
                              e.currentTarget.style.borderColor = '#10b981';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isAnswered) {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              background: keyBg,
                              color: keyColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              flexShrink: 0,
                              marginTop: '1px',
                            }}
                          >
                            {opt.key}
                          </span>
                          <span style={{ flex: 1 }}>{renderTutorTokens(opt.text)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation and Next Button when answered */}
                  {currentQuizQ.userSelection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          background: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          fontSize: '0.78rem',
                          lineHeight: '1.45',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                        }}
                      >
                        <Lightbulb size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Why it's correct: </strong>
                          {renderTutorTokens(currentQuizQ.explanation)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextQuizQuestion}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 'var(--r-lg)',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                          marginTop: '4px',
                        }}
                      >
                        <span>{currentQuizQ.questionNumber >= 10 ? 'View Final Results' : `Next Question (${currentQuizQ.questionNumber + 1}/10)`}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Completed Final Summary Card */}
              {quizFinished && (
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-xl)',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '14px',
                    boxShadow: '0 6px 30px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <Trophy size={32} />
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Revision Quiz Complete!
                    </h2>
                    <p style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Topic: <strong style={{ color: 'var(--text-primary)' }}>{contextTitle}</strong>
                    </p>
                  </div>

                  {/* Score circle / badge */}
                  <div
                    style={{
                      padding: '12px 24px',
                      borderRadius: 'var(--r-xl)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                      {quizScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 10</span>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {quizScore >= 9 ? 'Concept Mastery: High' : quizScore >= 7 ? 'Concept Mastery: Strong' : 'Concept Mastery: Developing'}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                        Score saved for this chapter session ({Math.round((quizScore / 10) * 100)}%)
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={startInteractiveQuiz}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--r-lg)',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Retake Quiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsQuizMode(false)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--r-lg)',
                        background: 'var(--bg-surface-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat & Welcome View */}
          {!isQuizMode && messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '62px',
                    height: '62px',
                    borderRadius: '18px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Bot size={32} />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', marginTop: 0 }}>
                  How can I help you today?
                </h2>
                <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Choose a quick action below or ask me anything about <br />
                  <strong style={{ color: 'var(--text-primary)' }}>{contextTitle}</strong>
                </p>

                {savedQuizScore && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      padding: '3px 10px',
                      borderRadius: 'var(--r-full)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.72rem',
                      color: '#10b981',
                      fontWeight: 700,
                    }}
                  >
                    <Trophy size={11} />
                    <span>Saved Quiz Score: {savedQuizScore.score}/{savedQuizScore.total} ({savedQuizScore.percentage}%)</span>
                  </div>
                )}
              </div>

              {/* 4 Action Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {actionCards.map((card) => {
                  const IconComp = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => card.action ? card.action() : handleSendQuery(card.prompt!)}
                      disabled={loading}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--r-md)',
                          background: card.iconBg,
                          color: card.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComp size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>
                          {card.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {card.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE MESSAGES STREAM (Chat mode) */}
          {!isQuizMode && messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '6px',
                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {m.sender === 'assistant' && (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--r-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Bot size={14} />
                </div>
              )}
              
              <div
                style={{
                  maxWidth: '90%',
                  width: 'fit-content',
                  padding: m.sender === 'user' ? '6px 12px' : '9px 13px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.82rem',
                  lineHeight: '1.42',
                  background:
                    m.sender === 'user'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'var(--bg-surface)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {renderTutorMessage(m.text)}
                
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: m.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                    textAlign: 'right',
                    marginTop: '4px',
                    lineHeight: 1,
                  }}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--r-sm)',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {!isQuizMode && loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '6px 12px',
                borderRadius: 'var(--r-md)',
                width: 'fit-content',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <RefreshCw size={12} className="animate-spin" />
              <span>Thinking crisp answer...</span>
            </div>
          )}

          {!isQuizMode && errorMsg && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2px 0' }}>
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Streamlined Input Box Area (Only in regular chat mode) */}
        {!isQuizMode && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery(input);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '24px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                padding: '4px 6px 4px 16px',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Tutor anything..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  padding: '8px 0',
                  fontFamily: 'inherit',
                }}
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: !input.trim() || loading ? 'var(--bg-surface-subtle)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: !input.trim() || loading ? 'var(--text-muted)' : '#ffffff',
                  border: 'none',
                  cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: !input.trim() || loading ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <ArrowUp size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
