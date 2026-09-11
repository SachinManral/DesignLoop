import React from 'react';
import { Home, Layers, BookOpen, BarChart2, MessageSquare, Settings, Zap, ArrowRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onKeepPracticing?: () => void;
}

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'practice', label: 'Practice', icon: Layers },
  { id: 'library', label: 'Problem Library', icon: BookOpen },
  { id: 'progress', label: 'My Progress', icon: BarChart2 },
  { id: 'history', label: 'Feedback History', icon: MessageSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onKeepPracticing }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Layers size={16} />
        </div>
        <div className="sidebar-logo-text">
          <h1>DesignLoop</h1>
          <p>Practice LLD. Think deeper.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <div
              key={id}
              onClick={() => setActiveTab(id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      {/* Promo Card */}
      <div className="sidebar-promo-card">
        <div className="sidebar-promo-badge">
          <Zap size={12} />
          Build deliberately
        </div>
        <div className="sidebar-promo-title">Better designs build better engineers.</div>
        <div className="sidebar-promo-desc">
          Practice. Get feedback. Grow like an engineer.
        </div>
        <button
          onClick={onKeepPracticing}
          className="sidebar-promo-btn"
        >
          Keep practicing <ArrowRight size={13} />
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          onClick={() => setActiveTab('settings')}
          className="sidebar-nav-item"
        >
          <Settings size={17} />
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
};
