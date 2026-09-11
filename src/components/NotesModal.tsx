import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Check } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle: string;
  notes: Record<string, string>;
  onSaveNote: (chapterId: string, noteContent: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  chapterId,
  chapterTitle,
  notes,
  onSaveNote,
}) => {
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(notes[chapterId] || '');
    setSaved(false);
  }, [chapterId, notes, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveNote(chapterId, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '640px',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--r-md)',
              background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Personal Notes</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{chapterTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Text Area */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Notes for this concept (persisted locally in your browser):
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Key Architectural Takeaways&#10;- Core invariants...&#10;- Design pattern trade-offs..."
            style={{
              width: '100%', minHeight: '260px', background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)',
              padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem',
              color: 'var(--text-primary)', resize: 'none', outline: 'none'
            }}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-saves locally on click
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px', background: 'transparent',
                border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)',
                borderRadius: 'var(--r-md)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 16px', background: 'var(--brand-emerald)',
                border: 'none', color: '#ffffff', borderRadius: 'var(--r-md)',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              <span>{saved ? 'Saved!' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
