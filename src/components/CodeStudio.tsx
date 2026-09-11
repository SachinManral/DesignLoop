import React, { useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  Play,
  Sparkles,
  Hash,
  Palette,
  ChevronUp,
  Maximize2,
  Code2,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface CodeStudioProps {
  snippets: Record<SupportedLanguage, string>;
  sampleOutput?: string;
  initialLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  title?: string;
  showRun?: boolean;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({
  snippets,
  sampleOutput,
  initialLanguage = 'java',
  onLanguageChange,
  showRun = false,
}) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(initialLanguage);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [outputVisible, setOutputVisible] = useState(Boolean(sampleOutput));

  const handleLangChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleCopy = () => {
    const code = snippets[currentLang] || snippets.java || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setOutputVisible(true);
    }, 350);
  };

  const code = snippets[currentLang] || snippets.java || '// No code snippet available';
  const lines = code.split('\n');

  // Tokenize line cleanly without string injection bugs
  const renderHighlightedLine = (line: string) => {
    if (!line) return <span>&nbsp;</span>;

    const tokenRegex = /(\/\/.*$|#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:public|private|protected|class|interface|abstract|enum|void|return|new|this|extends|implements|import|package|def|self|const|let|var|static|final|function)\b)|(\b(?:String|int|double|float|boolean|long|List|Map|Set|ArrayList|Car|Engine|Order|FoodOrder|Main|vector|cout|endl)\b)|(\b(?:true|false|null|nullptr|\d+)\b)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const parts: React.ReactNode[] = [];
    let keyIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#e2e8f0' }}>
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const [comment, str, keyword, type, literal] = [
        match[1],
        match[2],
        match[3],
        match[4],
        match[5],
      ];

      if (comment) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#4ade80', fontStyle: 'italic', opacity: 0.9 }}>
            {comment}
          </span>
        );
      } else if (str) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#fdba74' }}>
            {str}
          </span>
        );
      } else if (keyword) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#60a5fa', fontWeight: 600 }}>
            {keyword}
          </span>
        );
      } else if (type) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#38bdf8', fontWeight: 600 }}>
            {type}
          </span>
        );
      } else if (literal) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#f472b6' }}>
            {literal}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(
        <span key={keyIdx++} style={{ color: '#e2e8f0' }}>
          {line.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const getLangDisplayName = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'java': return '☕ Java';
      case 'python': return '🐍 Python';
      case 'cpp': return '⚡ C++';
      case 'typescript': return '🔷 TypeScript';
      case 'go': return '🐹 Go';
      default: return lang;
    }
  };

  return (
    <div style={{ margin: '14px 0 20px 0' }}>
      <div
        className="chapter-code-block"
        style={{
          margin: 0,
          background: '#0d1117',
          border: '1px solid #21262d',
          borderRadius: '12px',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Code Header Bar */}
        <div
          className="chapter-code-header"
          style={{
            background: '#161b22',
            borderBottom: '1px solid #21262d',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Window dots + Language indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={currentLang}
                onChange={(e) => handleLangChange(e.target.value as SupportedLanguage)}
                style={{
                  background: '#21262d',
                  color: '#f0f6fc',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '4px 26px 4px 10px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="java">☕ Java</option>
                <option value="python">🐍 Python</option>
                <option value="cpp">⚡ C++</option>
                <option value="typescript">🔷 TypeScript</option>
              </select>
              <ChevronDown
                size={12}
                color="#8b949e"
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Right: Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showRun && (
              <button
                onClick={handleRun}
                disabled={isRunning}
                style={{
                  background: isRunning ? '#30363d' : '#238636',
                  border: '1px solid rgba(240, 246, 252, 0.1)',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
                title="Execute Code"
              >
                <Play size={12} fill="currentColor" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="code-toolbar-btn"
              title={copied ? 'Copied!' : 'Copy Code'}
            >
              {copied ? <Check size={14} color="#3fb950" /> : <Copy size={14} />}
            </button>

            <button
              className="code-toolbar-btn"
              onClick={() => setShowLineNumbers((prev) => !prev)}
              title="Toggle Line Numbers"
            >
              <Hash size={14} />
            </button>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="chapter-code-body" style={{ background: '#0d1117', padding: '16px 18px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)' }}>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} style={{ lineHeight: '1.65' }}>
                  {showLineNumbers && (
                    <td
                      style={{
                        width: '32px',
                        color: '#484f58',
                        textAlign: 'right',
                        paddingRight: '18px',
                        userSelect: 'none',
                        fontSize: '0.82rem',
                        verticalAlign: 'top',
                      }}
                    >
                      {idx + 1}
                    </td>
                  )}
                  <td style={{ whiteSpace: 'pre', color: '#c9d1d9', fontSize: '0.86rem' }}>
                    {renderHighlightedLine(line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output Console Drawer */}
      {sampleOutput && outputVisible && (
        <div className="dl-console-drawer">
          <div className="dl-console-bar">
            <div className="dl-console-title">
              <Code2 size={14} color="#58a6ff" />
              <span>Console Output</span>
            </div>
            <div className="dl-console-status">
              ● Process finished (0 ms)
            </div>
          </div>
          <div className="dl-console-output">
            {sampleOutput}
          </div>
        </div>
      )}
    </div>
  );
};
