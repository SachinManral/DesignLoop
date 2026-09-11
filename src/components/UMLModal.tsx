import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Network,
  Download,
  Moon,
  Sun,
  Minus,
  Plus,
  Info,
  Car as CarIcon,
  Box,
  ChevronDown,
} from 'lucide-react';
import mermaid from 'mermaid';
import { UMLClassCardData } from '../types';

interface UMLModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  umlCard?: UMLClassCardData;
  mermaidSyntax?: string;
}

export const UMLModal: React.FC<UMLModalProps> = ({
  isOpen,
  onClose,
  title,
  umlCard,
  mermaidSyntax,
}) => {
  const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light'>('dark');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isAttributesOpen, setIsAttributesOpen] = useState(true);
  const [isMethodsOpen, setIsMethodsOpen] = useState(true);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const modalCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && mermaidSyntax && !umlCard && mermaidRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: canvasTheme === 'dark' ? 'dark' : 'default',
        themeVariables: {
          darkMode: canvasTheme === 'dark',
          background: canvasTheme === 'dark' ? '#0b0f19' : '#ffffff',
          primaryColor: '#6366f1',
          primaryTextColor: canvasTheme === 'dark' ? '#f8fafc' : '#0f172a',
          primaryBorderColor: '#6366f1',
          lineColor: '#6366f1',
        },
      });

      const renderDiagram = async () => {
        try {
          const uniqueId = `mermaid-modal-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(uniqueId, mermaidSyntax);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error('Mermaid render error in UMLModal:', err);
        }
      };

      renderDiagram();
    }
  }, [isOpen, mermaidSyntax, umlCard, canvasTheme]);

  if (!isOpen) return null;

  const effectiveClassCard: UMLClassCardData = umlCard || {
    className: title.replace(/[^a-zA-Z0-9]/g, '') || 'DesignClass',
    stereotype: 'class',
    attributes: [
      { visibility: '-', name: 'id', type: 'String' },
      { visibility: '-', name: 'state', type: 'String' },
      { visibility: '-', name: 'timestamp', type: 'long' },
    ],
    methods: [
      { visibility: '+', name: 'execute', parameters: 'context: Context', returnType: 'void' },
      { visibility: '+', name: 'getStatus', parameters: '', returnType: 'String' },
      { visibility: '+', name: 'validate', parameters: '', returnType: 'boolean' },
    ],
  };

  const className = effectiveClassCard.className;
  const isCar = className.toLowerCase().includes('car');

  const handleDownload = () => {
    const jsonStr = JSON.stringify(effectiveClassCard, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}_uml_model.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: '820px',
          background: 'var(--bg-surface)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dbeafe',
                flexShrink: 0,
              }}
            >
              <Network size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                UML Class Diagram
              </h2>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}
              >
                Visual representation of the {className} class with its attributes and methods.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {canvasTheme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                <span>{canvasTheme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {isThemeDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-elevated)',
                    overflow: 'hidden',
                    zIndex: 20,
                    minWidth: '140px',
                  }}
                >
                  <button
                    onClick={() => {
                      setCanvasTheme('dark');
                      setIsThemeDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      width: '100%',
                      background: canvasTheme === 'dark' ? 'var(--brand-primary-subtle)' : 'transparent',
                      color: canvasTheme === 'dark' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Moon size={14} /> Dark Theme
                  </button>
                  <button
                    onClick={() => {
                      setCanvasTheme('light');
                      setIsThemeDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      width: '100%',
                      background: canvasTheme === 'light' ? 'var(--brand-primary-subtle)' : 'transparent',
                      color: canvasTheme === 'light' ? 'var(--brand-primary)' : 'var(--text-primary)',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Sun size={14} /> Light Theme
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          ref={modalCanvasRef}
          style={{
            padding: '48px 32px',
            background: canvasTheme === 'dark' ? '#090d16' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px',
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              background: canvasTheme === 'dark' ? '#0f172a' : '#ffffff',
              border: canvasTheme === 'dark' ? '1.5px solid #2563eb' : '1.5px solid #3b82f6',
              borderRadius: '16px',
              boxShadow: canvasTheme === 'dark' ? '0 12px 36px rgba(37, 99, 235, 0.2)' : '0 10px 30px rgba(59, 130, 246, 0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: canvasTheme === 'dark' ? '#0f172a' : '#f8fafc',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: canvasTheme === 'dark' ? '#1e293b' : '#eff6ff',
                  border: canvasTheme === 'dark' ? '1px solid #334155' : '1px solid #bfdbfe',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isCar ? <CarIcon size={24} strokeWidth={2.2} /> : <Box size={24} strokeWidth={2.2} />}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: canvasTheme === 'dark' ? '#ffffff' : '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {className}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: canvasTheme === 'dark' ? '#94a3b8' : '#64748b',
                    textTransform: 'capitalize',
                  }}
                >
                  {effectiveClassCard.stereotype || 'Class'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: canvasTheme === 'dark' ? '#1e293b' : '#e2e8f0' }} />

            <div style={{ padding: '14px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: isAttributesOpen ? '10px' : '0',
                }}
                onClick={() => setIsAttributesOpen(!isAttributesOpen)}
              >
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: canvasTheme === 'dark' ? '#f1f5f9' : '#1e293b',
                  }}
                >
                  Attributes
                </span>
                <span style={{ color: canvasTheme === 'dark' ? '#64748b' : '#94a3b8' }}>
                  {isAttributesOpen ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </div>

              {isAttributesOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  {effectiveClassCard.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          color: attr.visibility === '-' ? '#ef4444' : attr.visibility === '+' ? '#10b981' : '#f59e0b',
                          fontWeight: 700,
                          fontSize: '1rem',
                          width: '12px',
                        }}
                      >
                        {attr.visibility}
                      </span>
                      <span style={{ color: canvasTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                        {attr.name}
                      </span>
                      <span style={{ color: canvasTheme === 'dark' ? '#64748b' : '#94a3b8' }}>:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{attr.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: canvasTheme === 'dark' ? '#1e293b' : '#e2e8f0' }} />

            <div style={{ padding: '14px 20px 18px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: isMethodsOpen ? '10px' : '0',
                }}
                onClick={() => setIsMethodsOpen(!isMethodsOpen)}
              >
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: canvasTheme === 'dark' ? '#f1f5f9' : '#1e293b',
                  }}
                >
                  Methods
                </span>
                <span style={{ color: canvasTheme === 'dark' ? '#64748b' : '#94a3b8' }}>
                  {isMethodsOpen ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </div>

              {isMethodsOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  {effectiveClassCard.methods.map((method, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px',
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        style={{
                          color: method.visibility === '+' ? '#10b981' : method.visibility === '-' ? '#ef4444' : '#f59e0b',
                          fontWeight: 700,
                          fontSize: '1rem',
                          width: '12px',
                        }}
                      >
                        {method.visibility}
                      </span>
                      <span style={{ color: canvasTheme === 'dark' ? '#e2e8f0' : '#1e293b' }}>
                        {method.name}({method.parameters})
                      </span>
                      {method.returnType && (
                        <>
                          <span style={{ color: canvasTheme === 'dark' ? '#64748b' : '#94a3b8' }}>:</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{method.returnType}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            <Info size={16} />
            <span>
              UML class diagram shows the structure of the {className} class including its attributes and methods.
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.15s ease',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
