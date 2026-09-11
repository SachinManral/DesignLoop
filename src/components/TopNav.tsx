import React from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Boxes,
  BookOpen,
  Code2,
  BarChart2,
} from 'lucide-react';
import { UserSettings } from '../types';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onOpenSettings: () => void;
  showBrandLogo?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  activeTab = 'learn',
  onSelectTab,
  settings,
  onUpdateSettings,
  onOpenSettings,
  showBrandLogo = true,
}) => {
  // Toggle between dark and light theme
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header className="global-topbar">
      {/* Brand logo shown in reader mode when sidebar is hidden */}
      {showBrandLogo && (
        <div
          className="topbar-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab && onSelectTab('home')}
        >
          <div className="brand-shield-icon">
            <Boxes size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                DesignLoop
              </span>
              <span className="brand-pro-badge">PRO</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Practice LLD. Think deeper.
            </div>
          </div>
        </div>
      )}

      {/* Global search input with keyboard shortcut */}
      <div className="topbar-search-box">
        <Search size={16} className="text-muted" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search concepts, patterns, problems..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="kbd-shortcut">⌘ K</span>
      </div>

      {/* Primary section tabs shown in reader view */}
      {showBrandLogo && (
        <div className="topbar-nav-links">
          <button
            className={`topbar-nav-tab ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('learn')}
          >
            <BookOpen size={16} />
            <span>Learn</span>
          </button>

          <button
            className={`topbar-nav-tab ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('practice')}
          >
            <Code2 size={16} />
            <span>Practice</span>
          </button>

          <button
            className={`topbar-nav-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('progress')}
          >
            <BarChart2 size={16} />
            <span>Progress</span>
          </button>
        </div>
      )}

      {/* User profile and utility actions */}
      <div className="topbar-user-area">
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="icon-btn" title="Notifications">
          <Bell size={17} />
        </button>

        <div
          className="user-badge-pill"
          onClick={onOpenSettings}
          title="User Profile & Settings"
        >
          <div className="user-initials-circle">S</div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Sachin
          </span>
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </header>
  );
};
