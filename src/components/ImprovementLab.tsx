import React, { useState } from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  FileText,
  Award,
  Layers
} from 'lucide-react';
import { Attempt } from '../types';

interface ImprovementLabProps {
  attempt: Attempt;
  onBack: () => void;
  onStartNewProblem: () => void;
}

export const ImprovementLab: React.FC<ImprovementLabProps> = ({
  attempt,
  onBack,
  onStartNewProblem
}) => {
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const sub1 = attempt.submissions[0];
  const sub2 = attempt.submissions[attempt.submissions.length - 1];

  const score1 = sub1?.evaluation?.overallScore || 0;
  const score2 = sub2?.evaluation?.overallScore || 0;
  const delta = score2 - score1;

  const classesV1 = sub1?.content.classes || [];
  const classesV2 = sub2?.content.classes || [];

  return (
    <div className="mutation-container" style={{ maxWidth: '1020px', margin: '0 auto' }}>
      {/* Header Card */}
      <div className="mutation-header-card">
        <div className="mutation-header-left">
          <div className="mutation-header-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <TrendingUp size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="mutation-header-title">Improvement Lab: Iteration Diff</h2>
            <p className="mutation-header-subtitle">
              Measuring architectural evolution from Baseline (v1) to Current (v{attempt.submissions.length})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-surface-subtle)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>BASELINE (v1)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{score1}%</div>
          </div>
          <div style={{ fontSize: '1.1rem', color: '#6366f1', fontWeight: 900 }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>LATEST (v{attempt.submissions.length})</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{score2}%</div>
          </div>
          <span className={`mutation-badge ${delta >= 0 ? 'low' : 'high'}`}>
            {delta >= 0 ? `+${delta}% Growth` : `${delta}% Delta`}
          </span>
        </div>
      </div>

      {/* Side-by-Side Diff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Attempt v1 Panel */}
        <div className="mutation-card">
          <div className="mutation-card-header">
            <h3 className="mutation-card-title">
              <Layers size={15} color="#64748b" />
              <span>Attempt v1 Baseline ({classesV1.length} entities)</span>
            </h3>
            <span className="submit-version-pill" style={{ background: 'var(--bg-surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              Baseline
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classesV1.map((cls, i) => (
              <div key={i} style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`dw-badge-symbol ${cls.type}`} style={{ fontSize: '0.65rem' }}>
                    {cls.type === 'interface' ? 'I' : cls.type === 'enum' ? 'E' : 'C'}
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{cls.name}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
                  {cls.methods?.map(m => m.name).join(', ') || 'No methods defined'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attempt v2 (Refactored) Panel */}
        <div className="mutation-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div className="mutation-card-header">
            <h3 className="mutation-card-title">
              <Layers size={15} color="#10b981" />
              <span>Attempt v{attempt.submissions.length} Refactored ({classesV2.length} entities)</span>
            </h3>
            <span className="mutation-badge low">
              Refactored
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classesV2.map((cls, i) => {
              const isNew = !classesV1.some(c1 => c1.name === cls.name);
              return (
                <div 
                  key={i} 
                  style={{ 
                    background: isNew ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface-subtle)', 
                    border: '1px solid', 
                    borderColor: isNew ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)', 
                    borderRadius: '8px', 
                    padding: '9px 12px', 
                    fontSize: '0.8rem' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`dw-badge-symbol ${cls.type}`} style={{ fontSize: '0.65rem' }}>
                        {cls.type === 'interface' ? 'I' : cls.type === 'enum' ? 'E' : 'C'}
                      </span>
                      <span style={{ fontWeight: 800, color: isNew ? '#059669' : 'var(--text-primary)' }}>{cls.name}</span>
                    </div>
                    {isNew && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                        NEW ENTITY
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
                    {cls.methods?.map(m => m.name).join(', ') || 'No methods defined'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metacognitive Reflection Step */}
      <div className="mutation-card">
        <div className="mutation-card-header">
          <h3 className="mutation-card-title">
            <Sparkles size={16} color="#6366f1" />
            <span>Architectural Consolidation & Reflection</span>
          </h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Explaining your refactoring in your own words consolidates architectural intuition for live engineering interviews.
        </p>

        <textarea 
          className="mutation-textarea"
          rows={3}
          placeholder="I decoupled the fee calculation from ParkingLot by extracting a PricingStrategy interface. This made adding EV charging & surge rates straightforward without altering core coordinators..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            className="feedback-action-btn secondary"
            onClick={() => setReflectionSaved(true)}
            style={{ fontSize: '0.78rem' }}
          >
            {reflectionSaved ? '✓ Reflection Saved' : 'Save Reflection'}
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mutation-bottom-bar">
        <button type="button" className="feedback-action-btn secondary" onClick={onBack}>
          <ArrowLeft size={13} />
          <span>Back to Challenge</span>
        </button>

        <button type="button" className="feedback-action-btn primary" onClick={onStartNewProblem}>
          <span>Practice Next Recommended Problem</span>
        </button>
      </div>
    </div>
  );
};

