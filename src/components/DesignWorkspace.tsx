import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  Plus, 
  Trash2, 
  Code, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Link, 
  Bot, 
  Loader2, 
  Send, 
  RotateCcw,
  Box,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Problem, Attempt, DesignClass, DesignRelationship } from '../types';
import { DeterministicValidator } from '../services/deterministicValidator';
import { ApiClient } from '../services/apiClient';

interface DesignWorkspaceProps {
  problem: Problem;
  attempt: Attempt;
  onUpdateDraft: (updated: Attempt) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DesignWorkspace: React.FC<DesignWorkspaceProps> = ({
  problem,
  attempt,
  onUpdateDraft,
  onNext,
  onBack
}) => {
  const [classes, setClasses] = useState<DesignClass[]>(attempt.draftContent.classes || []);
  const [relationships, setRelationships] = useState<DesignRelationship[]>(attempt.draftContent.relationships || []);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  
  // AI Co-Pilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ advice: string; detectedSmells: string[]; recommendedPatterns: string[] } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // New Class Form State
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassType, setNewClassType] = useState<'class' | 'interface' | 'abstract' | 'enum'>('class');
  const [newWhyExists, setNewWhyExists] = useState('');

  // New Attribute Form State
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState('String');
  const [attrVisibility, setAttrVisibility] = useState<'+' | '-' | '#'>('-');

  // New Method Form State
  const [methodName, setMethodName] = useState('');
  const [methodParams, setMethodParams] = useState('');
  const [methodReturn, setMethodReturn] = useState('void');

  // New Relationship Form State
  const [relFrom, setRelFrom] = useState(classes[0]?.name || '');
  const [relTo, setRelTo] = useState(classes[1]?.name || '');
  const [relType, setRelType] = useState<'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency' | 'implementation'>('composition');
  const [relDesc, setRelDesc] = useState('');

  // Diagram Zoom & Fullscreen State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreenModal, setIsFullScreenModal] = useState<boolean>(false);

  // Mermaid container refs
  const mermaidRef = useRef<HTMLDivElement>(null);
  const fullscreenMermaidRef = useRef<HTMLDivElement>(null);
  const [mermaidError, setMermaidError] = useState<string | null>(null);

  // Sync draft updates to parent
  const syncDraft = (updatedClasses: DesignClass[], updatedRels: DesignRelationship[]) => {
    const updatedDraft = {
      ...attempt.draftContent,
      classes: updatedClasses,
      relationships: updatedRels
    };
    onUpdateDraft({
      ...attempt,
      draftContent: updatedDraft
    });
  };

  // Keep relFrom and relTo in sync when classes change
  useEffect(() => {
    if (classes.length > 0) {
      if (!classes.some(c => c.name === relFrom)) {
        setRelFrom(classes[0].name);
      }
      if (!classes.some(c => c.name === relTo)) {
        setRelTo(classes[1]?.name || classes[0].name);
      }
      if (!selectedClassId || !classes.some(c => c.id === selectedClassId)) {
        setSelectedClassId(classes[0].id);
      }
    } else {
      setSelectedClassId('');
    }
  }, [classes]);

  // Render Mermaid Diagram whenever classes, relationships, or modal visibility change
  useEffect(() => {
    if (classes.length === 0) {
      if (mermaidRef.current) mermaidRef.current.innerHTML = '';
      if (fullscreenMermaidRef.current) fullscreenMermaidRef.current.innerHTML = '';
      setMermaidError(null);
      return;
    }

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: 'JetBrains Mono, monospace',
        flowchart: { useMaxWidth: true, htmlLabels: true }
      });

      const mermaidCode = DeterministicValidator.generateMermaid({
        ...attempt.draftContent,
        classes,
        relationships
      });

      const renderDiagram = async () => {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
        if (fullscreenMermaidRef.current) {
          fullscreenMermaidRef.current.innerHTML = svg;
        }
        setMermaidError(null);
      };

      renderDiagram().catch(() => {
        setMermaidError('Rendering class diagram...');
      });
    } catch (e: any) {
      setMermaidError(e?.message || 'Error generating diagram preview');
    }
  }, [classes, relationships, isFullScreenModal]);

  // Reset Canvas to empty practice state
  const handleResetCanvas = () => {
    if (classes.length > 0 && !window.confirm('Clear your design canvas to start fresh on your own?')) {
      return;
    }
    setClasses([]);
    setRelationships([]);
    setSelectedClassId('');
    setAiAdvice(null);
    syncDraft([], []);
  };

  // Add Class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: DesignClass = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim().replace(/\s+/g, ''),
      type: newClassType,
      responsibilities: ['Domain responsibility defined by candidate'],
      whyExists: newWhyExists.trim() || 'Candidate-defined domain abstraction',
      attributes: [],
      methods: []
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    setSelectedClassId(newClass.id);
    setNewClassName('');
    setNewWhyExists('');
    setIsAddingClass(false);
    syncDraft(updated, relationships);
  };

  // Delete Class
  const handleDeleteClass = (id: string) => {
    const clsToDelete = classes.find(c => c.id === id);
    const updatedClasses = classes.filter(c => c.id !== id);
    const updatedRels = relationships.filter(
      r => r.fromClass !== clsToDelete?.name && r.toClass !== clsToDelete?.name
    );

    setClasses(updatedClasses);
    setRelationships(updatedRels);
    if (selectedClassId === id && updatedClasses.length > 0) {
      setSelectedClassId(updatedClasses[0].id);
    }
    syncDraft(updatedClasses, updatedRels);
  };

  // Add Attribute to selected class
  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim() || !selectedClassId) return;

    const updated = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          attributes: [
            ...(cls.attributes || []),
            {
              name: attrName.trim(),
              type: attrType.trim() || 'String',
              visibility: attrVisibility
            }
          ]
        };
      }
      return cls;
    });

    setClasses(updated);
    setAttrName('');
    syncDraft(updated, relationships);
  };

  // Add Method to selected class
  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim() || !selectedClassId) return;

    const updated = classes.map(cls => {
      if (cls.id === selectedClassId) {
        return {
          ...cls,
          methods: [
            ...cls.methods,
            {
              name: methodName.trim(),
              parameters: methodParams.trim(),
              returnType: methodReturn.trim() || 'void',
              visibility: '+' as const
            }
          ]
        };
      }
      return cls;
    });

    setClasses(updated);
    setMethodName('');
    setMethodParams('');
    syncDraft(updated, relationships);
  };

  // Add Relationship
  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relFrom || !relTo || relFrom === relTo) return;

    const exists = relationships.some(
      r => r.fromClass === relFrom && r.toClass === relTo && r.type === relType
    );
    if (exists) return;

    const newRel: DesignRelationship = {
      id: `rel-${Date.now()}`,
      fromClass: relFrom,
      toClass: relTo,
      type: relType,
      description: relDesc.trim() || undefined
    };

    const updated = [...relationships, newRel];
    setRelationships(updated);
    setRelDesc('');
    syncDraft(classes, updated);
  };

  // Delete Relationship
  const handleDeleteRel = (id: string) => {
    const updated = relationships.filter(r => r.id !== id);
    setRelationships(updated);
    syncDraft(classes, updated);
  };

  // Ask AI Co-Pilot (Groq / Gemini)
  const handleAskAi = async (promptText: string) => {
    if (!promptText.trim() || isAskingAi) return;
    setIsAskingAi(true);
    setAiError(null);
    try {
      const advice = await ApiClient.getAiDesignAdvice(
        problem.id,
        { ...attempt.draftContent, classes, relationships },
        promptText
      );
      setAiAdvice(advice);
    } catch (err: any) {
      setAiAdvice(null);
      setAiError(err instanceof Error ? err.message : 'AI coaching is unavailable.');
    } finally {
      setIsAskingAi(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Deterministic live validation check
  const liveValidation = DeterministicValidator.validate({
    ...attempt.draftContent,
    classes,
    relationships
  }, problem);

  return (
    <div className="design-workspace-container">
      {/* Top Header Card */}
      <div className="design-workspace-header-card">
        <div className="dw-header-left">
          <div className="dw-header-icon-box">
            <Layers size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="dw-header-title">Structured Design Workspace</h2>
            <p className="dw-header-subtitle">
              Build your domain model from scratch. Define classes, interfaces, methods, and relationships on your own.
            </p>
          </div>
        </div>

        <div className="dw-header-right">
          {classes.length > 0 ? (
            <div className={`dw-status-badge ${liveValidation.isValid ? 'valid' : 'invalid'}`}>
              {liveValidation.isValid ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Syntax Valid</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={13} />
                  <span>{liveValidation.errors.length} Issue(s)</span>
                </>
              )}
            </div>
          ) : (
            <div className="dw-status-badge empty">
              <span>Empty Canvas</span>
            </div>
          )}

          {classes.length > 0 && (
            <button
              type="button"
              className="dw-btn-secondary"
              onClick={handleResetCanvas}
              title="Reset canvas to start fresh on your own"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <button className="studio-nav-next-btn" onClick={onNext}>
            <span>Proceed to Submit</span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Split */}
      <div className="dw-layout-grid">
        {/* Left Column: Entity Modeling & Relationships */}
        <div className="dw-column">
          {/* Card 1: Classes & Interfaces Navigator */}
          <div className="dw-card">
            <div className="dw-card-title-row">
              <h3 className="dw-card-title">
                <Box size={15} color="#4f46e5" strokeWidth={2.4} />
                <span>Defined Entities ({classes.length})</span>
              </h3>

              <button
                type="button"
                className="dw-btn-action"
                onClick={() => setIsAddingClass(!isAddingClass)}
              >
                <Plus size={13} />
                <span>{isAddingClass ? 'Close' : 'Add Entity'}</span>
              </button>
            </div>

            {/* Inline Add Class Form Drawer */}
            {isAddingClass && (
              <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '7px', background: 'var(--bg-surface-subtle)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '6px' }}>
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="Entity name (e.g., ParkingLot, Spot)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    autoFocus
                  />
                  <select
                    className="dw-select-field"
                    value={newClassType}
                    onChange={(e) => setNewClassType(e.target.value as any)}
                  >
                    <option value="class">Class</option>
                    <option value="interface">Interface</option>
                    <option value="abstract">Abstract Class</option>
                    <option value="enum">Enum</option>
                  </select>
                </div>

                <input
                  type="text"
                  className="dw-input-field"
                  placeholder="Why does this abstraction exist? (e.g., 'Coordinates spot allocation policies')"
                  value={newWhyExists}
                  onChange={(e) => setNewWhyExists(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button type="button" className="dw-btn-secondary" onClick={() => setIsAddingClass(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="dw-btn-action" disabled={!newClassName.trim()}>
                    <Plus size={13} />
                    <span>Create</span>
                  </button>
                </div>
              </form>
            )}

            {/* Class Selection Tabs */}
            {classes.length > 0 ? (
              <div className="dw-class-nav-row">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    type="button"
                    className={`dw-class-tab-btn ${selectedClassId === cls.id ? 'active' : ''}`}
                    onClick={() => setSelectedClassId(cls.id)}
                  >
                    <span className={`dw-badge-symbol ${cls.type}`}>
                      {cls.type === 'interface' ? 'I' : cls.type === 'enum' ? 'E' : cls.type === 'abstract' ? 'A' : 'C'}
                    </span>
                    <span>{cls.name}</span>
                  </button>
                ))}
              </div>
            ) : !isAddingClass ? (
              <div className="dw-empty-builder-box">
                <div className="dw-empty-icon-circle">
                  <Box size={20} />
                </div>
                <h4 className="dw-empty-title">No Entities Defined Yet</h4>
                <p className="dw-empty-desc">
                  Start practicing by creating your first core class or interface (e.g., coordinator class, domain model, or strategy pattern).
                </p>
                <button
                  type="button"
                  className="dw-btn-action"
                  onClick={() => setIsAddingClass(true)}
                  style={{ marginTop: '4px' }}
                >
                  <Plus size={14} />
                  <span>Add First Entity</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Card 2: Selected Class Deep Inspector */}
          {selectedClass && (
            <div className="dw-selected-class-card">
              <div className="dw-class-header-row">
                <div className="dw-class-title-group">
                  <span className={`dw-badge-symbol ${selectedClass.type}`}>
                    {selectedClass.type === 'interface' ? 'I' : selectedClass.type === 'enum' ? 'E' : selectedClass.type === 'abstract' ? 'A' : 'C'}
                  </span>
                  <input
                    type="text"
                    className="dw-class-name-input"
                    value={selectedClass.name}
                    onChange={(e) => {
                      const newName = e.target.value.trim().replace(/\s+/g, '');
                      const oldName = selectedClass.name;
                      const updated = classes.map(c => c.id === selectedClass.id ? { ...c, name: newName } : c);
                      const updatedRels = relationships.map(r => ({
                        ...r,
                        fromClass: r.fromClass === oldName ? newName : r.fromClass,
                        toClass: r.toClass === oldName ? newName : r.toClass
                      }));
                      setClasses(updated);
                      setRelationships(updatedRels);
                      syncDraft(updated, updatedRels);
                    }}
                  />
                  <select
                    className="dw-select-field"
                    value={selectedClass.type}
                    onChange={(e) => {
                      const updated = classes.map(c => c.id === selectedClass.id ? { ...c, type: e.target.value as any } : c);
                      setClasses(updated);
                      syncDraft(updated, relationships);
                    }}
                    style={{ fontSize: '0.74rem', padding: '3px 6px' }}
                  >
                    <option value="class">Class</option>
                    <option value="interface">Interface</option>
                    <option value="abstract">Abstract</option>
                    <option value="enum">Enum</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="assumption-action-icon-btn delete"
                  onClick={() => handleDeleteClass(selectedClass.id)}
                  title="Delete Entity"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Rationale Input */}
              <div className="dw-rationale-box">
                <span className="dw-field-label">Why This Abstraction Exists:</span>
                <input
                  type="text"
                  className="dw-rationale-input"
                  placeholder="State why this class exists (e.g., 'Encapsulates spot allocation logic')..."
                  value={selectedClass.whyExists}
                  onChange={(e) => {
                    const updated = classes.map(c => 
                      c.id === selectedClass.id ? { ...c, whyExists: e.target.value } : c
                    );
                    setClasses(updated);
                    syncDraft(updated, relationships);
                  }}
                />
              </div>

              {/* Attributes & Fields List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span className="dw-field-label">Attributes & Fields ({selectedClass.attributes?.length || 0})</span>
                
                {(selectedClass.attributes?.length || 0) > 0 ? (
                  <div className="dw-methods-list">
                    {selectedClass.attributes.map((attr, idx) => (
                      <div key={idx} className="dw-method-item">
                        <span>
                          <strong style={{ 
                            color: attr.visibility === '-' ? '#ef4444' : attr.visibility === '#' ? '#f59e0b' : '#4f46e5',
                            marginRight: '4px'
                          }}>
                            {attr.visibility || '-'}
                          </strong>
                          <strong>{attr.name}</strong>: <em style={{ color: '#059669' }}>{attr.type}</em>
                        </span>
                        <button
                          type="button"
                          className="dw-method-remove-btn"
                          onClick={() => {
                            const updated = classes.map(c => {
                              if (c.id === selectedClass.id) {
                                return { ...c, attributes: c.attributes.filter((_, i) => i !== idx) };
                              }
                              return c;
                            });
                            setClasses(updated);
                            syncDraft(updated, relationships);
                          }}
                          title="Remove attribute"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                    No attributes added yet. Add domain state attributes below.
                  </div>
                )}

                {/* Inline Add Attribute Form */}
                <form onSubmit={handleAddAttribute} className="dw-input-grid-attr" style={{ marginTop: '2px' }}>
                  <select
                    className="dw-input-field"
                    value={attrVisibility}
                    onChange={(e) => setAttrVisibility(e.target.value as '+' | '-' | '#')}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="-">- (private)</option>
                    <option value="+">+ (public)</option>
                    <option value="#"># (protected)</option>
                  </select>
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="attributeName (e.g. spotId)"
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="type (e.g. String, boolean)"
                    value={attrType}
                    onChange={(e) => setAttrType(e.target.value)}
                  />
                  <button type="submit" className="dw-btn-action" disabled={!attrName.trim()}>
                    <Plus size={12} />
                    <span>Attribute</span>
                  </button>
                </form>
              </div>

              {/* Methods List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span className="dw-field-label">Methods & Behaviors ({selectedClass.methods.length})</span>
                
                {selectedClass.methods.length > 0 ? (
                  <div className="dw-methods-list">
                    {selectedClass.methods.map((m, idx) => (
                      <div key={idx} className="dw-method-item">
                        <span>
                          <strong style={{ color: '#4f46e5' }}>+</strong> {m.name}({m.parameters}): <em style={{ color: '#059669' }}>{m.returnType}</em>
                        </span>
                        <button
                          type="button"
                          className="dw-method-remove-btn"
                          onClick={() => {
                            const updated = classes.map(c => {
                              if (c.id === selectedClass.id) {
                                return { ...c, methods: c.methods.filter((_, i) => i !== idx) };
                              }
                              return c;
                            });
                            setClasses(updated);
                            syncDraft(updated, relationships);
                          }}
                          title="Remove method"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                    No methods added yet. Add key operational methods below.
                  </div>
                )}

                {/* Inline Add Method Form */}
                <form onSubmit={handleAddMethod} className="dw-input-grid" style={{ marginTop: '2px' }}>
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="methodName"
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="params (e.g. ticket: Ticket)"
                    value={methodParams}
                    onChange={(e) => setMethodParams(e.target.value)}
                  />
                  <input
                    type="text"
                    className="dw-input-field"
                    placeholder="returnType"
                    value={methodReturn}
                    onChange={(e) => setMethodReturn(e.target.value)}
                  />
                  <button type="submit" className="dw-btn-action" disabled={!methodName.trim()}>
                    <Plus size={12} />
                    <span>Method</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Card 3: Relationship Connector */}
          {classes.length >= 2 && (
            <div className="dw-card">
              <h3 className="dw-card-title">
                <Link size={15} color="#4f46e5" strokeWidth={2.4} />
                <span>Connect Classes (Relationships)</span>
              </h3>

              <form onSubmit={handleAddRelationship} style={{ display: 'grid', gridTemplateColumns: '1fr 125px 1fr auto', gap: '5px' }}>
                <select className="dw-select-field" value={relFrom} onChange={(e) => setRelFrom(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <select className="dw-select-field" value={relType} onChange={(e) => setRelType(e.target.value as any)}>
                  <option value="composition">Composition (has-a)</option>
                  <option value="inheritance">Inheritance (is-a)</option>
                  <option value="implementation">Implements</option>
                  <option value="aggregation">Aggregation</option>
                  <option value="dependency">Dependency (uses)</option>
                  <option value="association">Association</option>
                </select>

                <select className="dw-select-field" value={relTo} onChange={(e) => setRelTo(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <button type="submit" className="dw-btn-action" disabled={!relFrom || !relTo || relFrom === relTo}>
                  <Plus size={12} />
                  <span>Connect</span>
                </button>
              </form>

              {/* Relationships List */}
              {relationships.length > 0 && (
                <div className="dw-relationship-list" style={{ marginTop: '2px' }}>
                  {relationships.map((rel) => (
                    <div key={rel.id} className="dw-relationship-item">
                      <span>
                        <strong>{rel.fromClass}</strong>
                        <span className="dw-rel-tag">{rel.type}</span>
                        <span>──►</span>
                        <strong> {rel.toClass}</strong>
                      </span>
                      <button
                        type="button"
                        className="assumption-action-icon-btn delete"
                        onClick={() => handleDeleteRel(rel.id)}
                        title="Delete connection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Mermaid Diagram + Pedagogical AI Co-Pilot */}
        <div className="dw-column">
          {/* Card 1: Live UML Class Diagram */}
          <div className="dw-card">
            <div className="dw-card-title-row">
              <h3 className="dw-card-title">
                <Code size={15} color="#2563eb" strokeWidth={2.4} />
                <span>Live Mermaid UML Class Diagram</span>
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {classes.length > 0 && (
                  <>
                    {/* Zoom Controls */}
                    <div className="dw-zoom-control-group">
                      <button
                        type="button"
                        onClick={() => setZoomLevel(prev => Math.max(0.4, Number((prev - 0.15).toFixed(2))))}
                        title="Zoom Out"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, minWidth: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel(prev => Math.min(2.5, Number((prev + 0.15).toFixed(2))))}
                        title="Zoom In"
                      >
                        <ZoomIn size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomLevel(1)}
                        title="Reset Zoom to 100%"
                      >
                        <RotateCcw size={11} />
                      </button>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      type="button"
                      className="dw-btn-secondary"
                      onClick={() => setIsFullScreenModal(true)}
                      title="Open Fullscreen Diagram"
                      style={{ padding: '3px 7px' }}
                    >
                      <Maximize2 size={13} />
                    </button>
                  </>
                )}

                {classes.length > 0 && (
                  <span className="dw-status-badge valid" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                    Synchronized
                  </span>
                )}
              </div>
            </div>

            {mermaidError && (
              <div role="alert" style={{ padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.72rem', color: '#dc2626' }}>
                {mermaidError}
              </div>
            )}

            <div className="dw-mermaid-canvas">
              {classes.length > 0 ? (
                <div 
                  ref={mermaidRef} 
                  className="dw-mermaid-svg-wrapper"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.12s ease' }}
                />
              ) : (
                <div className="dw-blueprint-placeholder">
                  <Code size={28} opacity={0.4} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>UML Diagram Canvas</span>
                  <p style={{ fontSize: '0.74rem', margin: 0 }}>
                    As you add classes, methods, and relationships on the left, your interactive UML class diagram will automatically render here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: AI Architecture Coach */}
          <div className="dw-ai-copilot-card">
            <div className="dw-card-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="dw-ai-header-icon">
                  <Sparkles size={14} />
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  AI Architecture Coach
                </h4>
              </div>
              <span className="dw-status-badge valid" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Live Tutor
              </span>
            </div>

            {/* Quick Socratic Review Chips */}
            <div className="dw-ai-chips-row">
              <button
                type="button"
                className="dw-ai-prompt-chip"
                onClick={() => handleAskAi('Check if any of my classes violate Single Responsibility or act like God classes.')}
                disabled={isAskingAi}
              >
                Check SRP
              </button>
              <button
                type="button"
                className="dw-ai-prompt-chip"
                onClick={() => handleAskAi('What design patterns or interfaces would make this architecture more extensible?')}
                disabled={isAskingAi}
              >
                Pattern Hints
              </button>
              <button
                type="button"
                className="dw-ai-prompt-chip"
                onClick={() => handleAskAi('Review the coupling and cohesion of my entity relationships.')}
                disabled={isAskingAi}
              >
                Coupling & Cohesion
              </button>
            </div>

            {/* AI Advice Output Box */}
            {aiAdvice && (
              <div className="dw-ai-response-box">
                <p className="dw-ai-response-text">
                  {aiAdvice.advice}
                </p>

                {aiAdvice.detectedSmells?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {aiAdvice.detectedSmells.map((smell, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                        {smell}
                      </span>
                    ))}
                  </div>
                )}

                {aiAdvice.recommendedPatterns?.length > 0 && (
                  <div className="dw-ai-patterns-section">
                    <span className="dw-ai-patterns-label">Suggested Patterns to Consider:</span>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {aiAdvice.recommendedPatterns.map((p, i) => (
                        <span key={i} className="dw-pattern-pill">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div role="alert" style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '6px 8px', borderRadius: '6px', fontSize: '0.74rem', color: '#9a3412' }}>
                <strong>AI:</strong> {aiError}
              </div>
            )}

            {/* Custom AI Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = aiPrompt.trim();
                setAiPrompt('');
                handleAskAi(q);
              }}
              style={{ display: 'flex', gap: '6px' }}
            >
              <input
                type="text"
                className="dw-input-field"
                placeholder="Ask for design coaching or feedback..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isAskingAi}
                style={{ flex: 1, fontSize: '0.78rem' }}
              />
              <button
                type="submit"
                className="dw-btn-action"
                disabled={isAskingAi || !aiPrompt.trim()}
                style={{ padding: '6px 12px' }}
              >
                {isAskingAi ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="studio-bottom-nav">
        <button type="button" className="studio-nav-back-btn" onClick={onBack}>
          <ArrowLeft size={14} strokeWidth={2.2} />
          <span>Back to Assumptions</span>
        </button>

        <button type="button" className="studio-nav-next-btn" onClick={onNext}>
          <span>Proceed to Submit</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      </div>

      {/* Fullscreen UML Diagram Modal */}
      {isFullScreenModal && (
        <div className="dw-fullscreen-modal-overlay" onClick={() => setIsFullScreenModal(false)}>
          <div className="dw-fullscreen-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dw-fullscreen-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Code size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  UML Class Diagram — Fullscreen View
                </h3>
                <span className="dw-status-badge valid" style={{ fontSize: '0.72rem' }}>
                  {classes.length} Entities Synchronized
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Fullscreen Zoom Controls */}
                <div className="dw-zoom-control-group">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.4, Number((prev - 0.15).toFixed(2))))}
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, minWidth: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(2.5, Number((prev + 0.15).toFixed(2))))}
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    title="Reset Zoom to 100%"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  className="dw-btn-secondary"
                  onClick={() => setIsFullScreenModal(false)}
                  style={{ padding: '6px 12px' }}
                >
                  <Minimize2 size={14} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            <div className="dw-fullscreen-canvas-body">
              <div
                ref={fullscreenMermaidRef}
                className="dw-mermaid-svg-wrapper"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.12s ease' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
