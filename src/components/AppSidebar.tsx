import React from 'react';
import {
  Home,
  BookOpen,
  Code2,
  FileText,
  BarChart2,
  MessageSquare,
  Crown,
  ArrowRight,
  Boxes,
} from 'lucide-react';

export type MainNavTab = 'home' | 'learn' | 'practice' | 'library' | 'progress' | 'history';

interface AppSidebarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, onSelectTab }) => {
  // Navigation items for the left app drawer
  const navItems = [
    { id: 'home' as MainNavTab, label: 'Home', icon: Home },
    { id: 'learn' as MainNavTab, label: 'Learn', icon: BookOpen },
    { id: 'practice' as MainNavTab, label: 'Practice', icon: Code2 },
    { id: 'library' as MainNavTab, label: 'Problem Library', icon: FileText },
    { id: 'progress' as MainNavTab, label: 'My Progress', icon: BarChart2 },
    { id: 'history' as MainNavTab, label: 'Feedback History', icon: MessageSquare },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand logo badge */}
      <div className="sidebar-brand" onClick={() => onSelectTab('home')}>
        <div className="brand-icon-wrapper">
          <Boxes size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-name">DesignLoop</span>
            <span className="sidebar-pro-badge">PRO</span>
          </div>
          <div className="brand-tagline">LLD Theory & Practice</div>
        </div>
      </div>

      {/* Main navigation list */}
      <nav className="sidebar-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade to Pro footer card */}
      <div className="sidebar-upgrade-card">
        <div className="upgrade-crown-icon">
          <Crown size={18} strokeWidth={2.2} />
        </div>
        <div className="upgrade-card-title">Upgrade to Pro</div>
        <div className="upgrade-card-text">
          Get access to premium problems, solutions and AI feedback.
        </div>
        <button
          className="upgrade-action-btn"
          onClick={() => onSelectTab('progress')}
        >
          <span>Upgrade Now</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </aside>
  );
};

