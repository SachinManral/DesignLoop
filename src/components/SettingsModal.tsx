import React, { useState } from 'react';
import { X, User, Bell, Cpu, BookOpen, Info, Zap, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'practice' | 'notifications' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState('Sachin');
  const [emailNotif, setEmailNotif] = useState(true);
  const [practiceReminder, setPracticeReminder] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => { setSavedMsg(false); onClose(); }, 1200);
  };

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'profile', icon: <User size={15} />, label: 'Profile' },
    { id: 'practice', icon: <BookOpen size={15} />, label: 'Practice' },
    { id: 'notifications', icon: <Bell size={15} />, label: 'Notifications' },
    { id: 'about', icon: <Info size={15} />, label: 'About' },
  ];

  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '999px', border: 'none', cursor: 'pointer',
        background: checked ? '#2563eb' : '#d1d5db', position: 'relative', flexShrink: 0,
        transition: 'background 0.18s ease', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: checked ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.18s ease',
      }} />
    </button>
  );

  const PrefRow: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>{label}</div>
        <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: '2px' }}>{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '560px', maxHeight: '82vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Settings</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px', lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar tabs */}
          <div style={{ width: '145px', borderRight: '1px solid #f3f4f6', padding: '10px 8px', flexShrink: 0 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: activeTab === t.id ? '#eff6ff' : 'transparent',
                  color: activeTab === t.id ? '#2563eb' : '#6b7280',
                  fontSize: '0.82rem', fontWeight: activeTab === t.id ? 600 : 500,
                  marginBottom: '2px', textAlign: 'left',
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '18px 22px', overflowY: 'auto' }}>

            {/* ── Profile Tab ─────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '18px' }}>Manage your profile and account details.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '14px', background: '#f8f9fb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem', fontWeight: 800 }}>SM</div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>LLD Practitioner</div>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
                  <input className="input-text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience Level</label>
                  <select className="input-text">
                    <option>Junior (0–2 years)</option>
                    <option>Mid-Level (2–5 years)</option>
                    <option>Senior (5+ years)</option>
                    <option>Staff / Principal</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── Practice Tab ────────────────────────────────── */}
            {activeTab === 'practice' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '18px' }}>Customize how you practice and learn.</p>
                <PrefRow label="Auto-save drafts" desc="Automatically save your design every 30 seconds" checked={autoSave} onChange={setAutoSave} />
                <PrefRow label="Show hints" desc="Display contextual hints during problem solving" checked={showHints} onChange={setShowHints} />
                <div style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Default difficulty</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button key={d} style={{ padding: '5px 14px', borderRadius: '999px', border: `1px solid ${d === 'Medium' ? '#2563eb' : '#e5e7eb'}`, background: d === 'Medium' ? '#eff6ff' : 'white', color: d === 'Medium' ? '#2563eb' : '#6b7280', fontSize: '0.8rem', fontWeight: d === 'Medium' ? 700 : 500, cursor: 'pointer' }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <Cpu size={14} color="#9ca3af" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>AI Evaluation</span>
                    <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '999px', background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>● Active</span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#9ca3af', lineHeight: 1.55 }}>
                    AI-powered evaluation is active. Your designs are evaluated to provide deep, rubric-based feedback across 5 dimensions.
                  </p>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ───────────────────────────── */}
            {activeTab === 'notifications' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '18px' }}>Control how and when you receive notifications.</p>
                <PrefRow label="Email notifications" desc="Receive weekly progress summaries via email" checked={emailNotif} onChange={setEmailNotif} />
                <PrefRow label="Practice reminders" desc="Daily reminder to keep your practice streak alive" checked={practiceReminder} onChange={setPracticeReminder} />
              </div>
            )}

            {/* ── About Tab ───────────────────────────────────── */}
            {activeTab === 'about' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', padding: '14px', background: '#f8f9fb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>DesignLoop</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Practice LLD. Think deeper.</div>
                  </div>
                </div>
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'AI Evaluation', value: 'Gemini 1.5 Flash' },
                  { label: 'Rubric Dimensions', value: '5-dimension LLD scoring' },
                  { label: 'Platform', value: 'Web Application' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.84rem' }}>
                    <span style={{ color: '#6b7280' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '14px', padding: '11px 14px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>All systems operational</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: '0.84rem' }}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ fontSize: '0.84rem' }}>
            {savedMsg ? <><CheckCircle2 size={14} /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
