import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart2,
  Lightbulb,
  FileText,
  CheckCircle2,
  Edit3,
  MessageSquare,
  TrendingUp,
  Car,
  ArrowUpDown,
  ShoppingBag,
  Navigation,
  Users
} from 'lucide-react';
import { Problem, Attempt } from '../types';
import { MainNavTab } from './AppSidebar';

interface HomePageProps {
  problems: Problem[];
  attempts: Attempt[];
  onNavigateToTab: (tab: MainNavTab, path?: string) => void;
  onSelectProblem: (problemId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  problems,
  attempts,
  onNavigateToTab,
  onSelectProblem
}) => {
  // Find real attempt stats or map to problems
  const getProblemAttempts = (id: string, defaultAttempts: string) => {
    const matched = attempts.filter((a) => a.problemId === id);
    if (matched.length > 0) {
      const subCount = matched.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
      if (subCount > 0) return `${subCount} attempt${subCount > 1 ? 's' : ''} (yours)`;
    }
    return defaultAttempts;
  };

  // Popular problems benchmark list matching the clean design
  const popularProblems = [
    {
      id: 'prob-parking-lot',
      title: 'Parking Lot',
      difficulty: 'Medium',
      diffColor: 'warning',
      icon: Car,
      description: 'Design a parking lot system with multiple floors, spot allocation, ticketing, and pricing.',
      tags: ['OOP', 'Design Patterns', 'Scalability'],
      attemptCount: getProblemAttempts('prob-parking-lot', '12.4k attempts')
    },
    {
      id: 'prob-elevator',
      title: 'Elevator System',
      difficulty: 'Medium',
      diffColor: 'warning',
      icon: ArrowUpDown,
      description: 'Design an elevator system to handle multiple elevators and requests efficiently.',
      tags: ['Concurrency', 'Scheduling', 'OOP'],
      attemptCount: getProblemAttempts('prob-elevator', '8.7k attempts')
    },
    {
      id: 'prob-vending-machine',
      title: 'Vending Machine',
      difficulty: 'Easy',
      diffColor: 'success',
      icon: ShoppingBag,
      description: 'Design a vending machine to manage products, payment, and dispensing.',
      tags: ['State Pattern', 'OOP', 'Extensibility'],
      attemptCount: getProblemAttempts('prob-vending-machine', '15.1k attempts')
    },
    {
      id: 'prob-ride-sharing',
      title: 'Ride Sharing',
      difficulty: 'Hard',
      diffColor: 'danger',
      icon: Navigation,
      description: 'Design a ride sharing system like Uber with matching, ride tracking, and pricing.',
      tags: ['Scalability', 'System Design', 'OOP'],
      attemptCount: getProblemAttempts('prob-ride-sharing', '9.3k attempts')
    }
  ];

  const handleStartProblem = (targetId: string) => {
    const exists = problems.find((p) => p.id === targetId || p.slug === targetId.replace('prob-', ''));
    if (exists) {
      onSelectProblem(exists.id);
    } else if (problems.length > 0) {
      onSelectProblem(problems[0].id);
    } else {
      onNavigateToTab('practice');
    }
  };

  return (
    <div className="clean-home-wrapper">
      {/* Hero Section */}
      <section className="clean-hero-grid">
        {/* Left Column: Call to Action */}
        <div className="clean-hero-left">
          <div className="clean-pill-badge">
            <span>PRACTICE</span>
            <span className="dot-sep">•</span>
            <span>DESIGN</span>
            <span className="dot-sep">•</span>
            <span>IMPROVE</span>
          </div>

          <h1 className="clean-hero-heading">
            Master Low Level Design <br />
            <span className="clean-heading-accent">One Problem at a Time</span>
          </h1>

          <p className="clean-hero-description">
            Design real-world systems, get AI-powered feedback, and improve with every attempt.
          </p>

          <div className="clean-hero-actions">
            <button
              className="clean-btn-primary"
              onClick={() => handleStartProblem('prob-parking-lot')}
            >
              <span>Start Practicing</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="clean-btn-secondary"
              onClick={() => onNavigateToTab('library')}
            >
              <span>Browse Problems</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Graphic & UML Studio Preview */}
        <div className="clean-hero-right">
          {/* Vertical step buttons */}
          <div className="clean-steps-sidebar">
            <div className="clean-step-pill active">
              <Edit3 size={14} className="clean-step-icon text-indigo" />
              <span>Design</span>
            </div>
            <div className="clean-step-pill">
              <FileText size={14} className="clean-step-icon text-blue" />
              <span>Submit</span>
            </div>
            <div className="clean-step-pill">
              <MessageSquare size={14} className="clean-step-icon text-purple" />
              <span>Get Feedback</span>
            </div>
            <div className="clean-step-pill">
              <TrendingUp size={14} className="clean-step-icon text-green" />
              <span>Improve</span>
            </div>
          </div>

          {/* Window Container */}
          <div className="clean-mockup-window">
            {/* Window dots */}
            <div className="mockup-window-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>

            {/* Floating AI Feedback Badge */}
            <div className="mockup-ai-feedback-badge">
              <div className="ai-feedback-header">
                <CheckCircle2 size={15} className="ai-check-icon" />
                <span className="ai-feedback-title">AI Feedback</span>
              </div>
              <div className="ai-feedback-text">
                Good separation of responsibilities!
              </div>
            </div>

            {/* UML Interactive Diagram Canvas */}
            <div className="mockup-uml-canvas">
              {/* Root Class: ParkingLot */}
              <div className="uml-box root-box">
                <div className="uml-box-header">ParkingLot</div>
                <div className="uml-box-body">
                  <div className="uml-member">+ parkVehicle() : Ticket</div>
                  <div className="uml-member">+ unparkVehicle() : Receipt</div>
                </div>
              </div>

              {/* Connecting Tree SVG */}
              <div className="uml-connector-tree">
                <svg className="connector-svg" width="100%" height="34" viewBox="0 0 320 34" fill="none">
                  {/* Center vertical down from ParkingLot */}
                  <path d="M160 0 L160 16" stroke="var(--border-strong, #cbd5e1)" strokeWidth="1.5" />
                  {/* Horizontal bar spanning children */}
                  <path d="M50 16 L270 16" stroke="var(--border-strong, #cbd5e1)" strokeWidth="1.5" />
                  {/* Left drop */}
                  <path d="M50 16 L50 34" stroke="var(--border-strong, #cbd5e1)" strokeWidth="1.5" />
                  {/* Center drop */}
                  <path d="M160 16 L160 34" stroke="var(--border-strong, #cbd5e1)" strokeWidth="1.5" />
                  {/* Right drop */}
                  <path d="M270 16 L270 34" stroke="var(--border-strong, #cbd5e1)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Children Classes */}
              <div className="uml-children-row">
                {/* Floor */}
                <div className="uml-box child-box">
                  <div className="uml-box-header">Floor</div>
                  <div className="uml-box-body">
                    <div className="uml-member">+ findAvailableSpot()</div>
                  </div>
                </div>

                {/* ParkingSpot */}
                <div className="uml-box child-box">
                  <div className="uml-box-header">ParkingSpot</div>
                  <div className="uml-box-body">
                    <div className="uml-member">+ isAvailable()</div>
                    <div className="uml-member">+ assignVehicle()</div>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="uml-box child-box">
                  <div className="uml-box-header">Vehicle</div>
                  <div className="uml-box-body">
                    <div className="uml-member">+ getType()</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Handwritten Tagline */}
            <div className="mockup-handwritten-note">
              Better designs. Brighter engineers.
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Highlights Row */}
      <section className="clean-highlights-row">
        <div className="clean-highlight-card">
          <div className="highlight-icon-wrapper bg-indigo-subtle">
            <BookOpen size={20} className="text-indigo-theme" />
          </div>
          <div className="highlight-content">
            <div className="highlight-title">Curated LLD Problems</div>
            <div className="highlight-desc">Real-world scenarios with clear requirements</div>
          </div>
        </div>

        <div className="clean-highlight-card">
          <div className="highlight-icon-wrapper bg-purple-subtle">
            <Sparkles size={20} className="text-purple-theme" />
          </div>
          <div className="highlight-content">
            <div className="highlight-title">AI-Powered Feedback</div>
            <div className="highlight-desc">Get structured, actionable feedback</div>
          </div>
        </div>

        <div className="clean-highlight-card">
          <div className="highlight-icon-wrapper bg-blue-subtle">
            <BarChart2 size={20} className="text-blue-theme" />
          </div>
          <div className="highlight-content">
            <div className="highlight-title">Track Your Progress</div>
            <div className="highlight-desc">See your attempts and improve over time</div>
          </div>
        </div>

        <div className="clean-highlight-card">
          <div className="highlight-icon-wrapper bg-amber-subtle">
            <Lightbulb size={20} className="text-amber-theme" />
          </div>
          <div className="highlight-content">
            <div className="highlight-title">Learn by Doing</div>
            <div className="highlight-desc">Build strong design intuition</div>
          </div>
        </div>
      </section>

      {/* Popular Problems Grid */}
      <section className="clean-problems-section">
        <div className="clean-section-header">
          <div>
            <h2 className="clean-section-title">Popular Problems</h2>
            <p className="clean-section-subtitle">Start with these handpicked problems</p>
          </div>
          <button
            className="clean-view-all-link"
            onClick={() => onNavigateToTab('library')}
          >
            <span>View All Problems</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="clean-problems-grid">
          {popularProblems.map((prob) => {
            const Icon = prob.icon;
            return (
              <div key={prob.id} className="clean-problem-card">
                <div className="problem-card-top">
                  <div className="problem-title-row">
                    <div className="problem-icon-box">
                      <Icon size={18} />
                    </div>
                    <div className="problem-card-title">{prob.title}</div>
                    <span className={`clean-diff-badge diff-${prob.diffColor}`}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <p className="problem-card-description">{prob.description}</p>
                </div>

                <div className="problem-tags-row">
                  {prob.tags.map((tag) => (
                    <span key={tag} className="clean-tech-tag">{tag}</span>
                  ))}
                </div>

                <div className="problem-card-footer">
                  <div className="problem-attempts-stat">
                    <Users size={14} />
                    <span>{prob.attemptCount}</span>
                  </div>
                  <button
                    className="clean-start-btn"
                    onClick={() => handleStartProblem(prob.id)}
                  >
                    <span>Start</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
