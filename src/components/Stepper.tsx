import React from 'react';
import { Check, Lock } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxReachedStep: number;
}

const STEPS = [
  { step: 2, title: 'Clarify' },
  { step: 3, title: 'Assumptions' },
  { step: 4, title: 'Design' },
  { step: 5, title: 'Submit' },
  { step: 6, title: 'Feedback' },
  { step: 7, title: 'Improve' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick, maxReachedStep }) => {
  return (
    <div
      className="practice-stepper-header"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        height: '46px',
        marginBottom: '4px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
      }}
    >
      {STEPS.map((s, idx) => {
        const isCurrent = currentStep === s.step;
        const isCompleted = currentStep > s.step;
        const isAccessible = s.step <= maxReachedStep;
        const isLocked = s.step > maxReachedStep;

        return (
          <React.Fragment key={s.step}>
            <div
              className="stepper-tab-item"
              onClick={() => {
                if (isAccessible) onStepClick(s.step);
              }}
              title={isLocked ? 'Complete previous steps to unlock' : s.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '0 12px',
                height: '100%',
                fontSize: '0.82rem',
                fontWeight: isCurrent ? 700 : 600,
                color: isCurrent
                  ? '#4f46e5'
                  : isCompleted
                  ? '#10b981'
                  : 'var(--text-muted)',
                cursor: isAccessible ? 'pointer' : 'not-allowed',
                opacity: isLocked ? 0.45 : 1,
                borderBottom: isCurrent ? '2px solid #4f46e5' : '2px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  background: isCurrent
                    ? '#6366f1'
                    : isCompleted
                    ? '#10b981'
                    : 'var(--bg-surface-subtle)',
                  color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-muted)',
                  border: isCurrent || isCompleted ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : isLocked ? <Lock size={10} /> : idx + 1}
              </div>
              <span style={{ color: isCurrent ? 'var(--text-primary)' : undefined }}>{s.title}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: '20px',
                  height: '1.5px',
                  background: 'var(--border-subtle)',
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
