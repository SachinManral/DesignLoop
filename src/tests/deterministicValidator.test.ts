import { describe, it, expect } from 'vitest';
import { DeterministicValidator } from '../services/deterministicValidator';
import { StructuredDesignContent, Problem, DesignClass, DesignRelationship } from '../types';

// Helpers

function makeClass(name: string, overrides: Partial<DesignClass> = {}): DesignClass {
  return {
    id: name.toLowerCase(),
    name,
    type: 'class',
    responsibilities: ['Handles domain logic'],
    whyExists: `Encapsulates ${name} state`,
    attributes: [{ name: 'id', type: 'string', visibility: '-' }],
    methods: [{ name: 'getId', returnType: 'string', parameters: '', visibility: '+' }],
    ...overrides,
  };
}

function makeRelationship(from: string, to: string): DesignRelationship {
  return {
    id: `${from}-${to}`,
    fromClass: from,
    toClass: to,
    type: 'association',
  };
}

function baseContent(classes: DesignClass[], overrides: Partial<StructuredDesignContent> = {}): StructuredDesignContent {
  return {
    assumptions: ['System assumes duration-based pricing.'],
    clarificationsSelected: [],
    classes,
    relationships: [],
    decisions: [],
    edgeCases: [],
    ...overrides,
  };
}

// Minimal Problem stub for domain-invariant tests
const parkingLotProblem: Pick<Problem, 'slug'> = { slug: 'parking-lot' };

describe('DeterministicValidator — structural checks', () => {
  it('fails when no classes are provided', () => {
    const result = DeterministicValidator.validate(baseContent([]));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'classes')).toBe(true);
  });

  it('passes with a single valid class', () => {
    const result = DeterministicValidator.validate(baseContent([makeClass('ParkingLot')]));
    expect(result.isValid).toBe(true);
  });

  it('fails on duplicate class names (case-insensitive)', () => {
    const result = DeterministicValidator.validate(
      baseContent([makeClass('ParkingSpot'), makeClass('parkingspot')])
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
  });

  it('warns on an unnamed class', () => {
    const result = DeterministicValidator.validate(
      baseContent([makeClass('')])
    );
    expect(result.errors.some(e => e.message.includes('unnamed'))).toBe(true);
  });

  it('warns when a class has no methods or attributes', () => {
    const anemic = makeClass('Ghost', { methods: [], attributes: [] });
    const result = DeterministicValidator.validate(baseContent([anemic]));
    expect(result.warnings.some(w => w.message.includes('anemic'))).toBe(true);
  });

  it('does not warn about anemic class for enums', () => {
    const enumClass = makeClass('SpotType', { type: 'enum', methods: [], attributes: [] });
    const result = DeterministicValidator.validate(baseContent([enumClass]));
    expect(result.warnings.some(w => w.message.includes('anemic') && w.field.includes('SpotType'))).toBe(false);
  });

  it('warns when class has no whyExists rationale', () => {
    const noReason = makeClass('Mystery', { whyExists: '   ' });
    const result = DeterministicValidator.validate(baseContent([noReason]));
    expect(result.warnings.some(w => w.field.includes('Mystery') && w.message.includes('Why?'))).toBe(true);
  });
});

describe('DeterministicValidator — relationship integrity', () => {
  it('fails when relationship references a non-existent source class', () => {
    const classes = [makeClass('ParkingLot'), makeClass('ParkingSpot')];
    const badRel = makeRelationship('Ghost', 'ParkingSpot');
    const result = DeterministicValidator.validate(baseContent(classes, { relationships: [badRel] }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message.includes('Ghost'))).toBe(true);
  });

  it('fails when relationship references a non-existent target class', () => {
    const classes = [makeClass('ParkingLot')];
    const badRel = makeRelationship('ParkingLot', 'NonExistent');
    const result = DeterministicValidator.validate(baseContent(classes, { relationships: [badRel] }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message.includes('NonExistent'))).toBe(true);
  });

  it('passes when all relationships reference declared classes', () => {
    const classes = [makeClass('ParkingLot'), makeClass('ParkingFloor')];
    const rel = makeRelationship('ParkingLot', 'ParkingFloor');
    const result = DeterministicValidator.validate(baseContent(classes, { relationships: [rel] }));
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('warns when more than 2 classes have no relationships defined', () => {
    const classes = [makeClass('A'), makeClass('B'), makeClass('C')];
    const result = DeterministicValidator.validate(baseContent(classes, { relationships: [] }));
    expect(result.warnings.some(w => w.field === 'relationships')).toBe(true);
  });

  it('does not warn about missing relationships for 2 or fewer classes', () => {
    const classes = [makeClass('A'), makeClass('B')];
    const result = DeterministicValidator.validate(baseContent(classes, { relationships: [] }));
    expect(result.warnings.some(w => w.field === 'relationships')).toBe(false);
  });
});

describe('DeterministicValidator — assumptions', () => {
  it('warns when no assumptions are recorded', () => {
    const result = DeterministicValidator.validate(
      baseContent([makeClass('ParkingLot')], { assumptions: [] })
    );
    expect(result.warnings.some(w => w.field === 'assumptions')).toBe(true);
  });

  it('does not warn when at least one assumption is recorded', () => {
    const result = DeterministicValidator.validate(
      baseContent([makeClass('ParkingLot')], { assumptions: ['Duration-based pricing only.'] })
    );
    expect(result.warnings.some(w => w.field === 'assumptions')).toBe(false);
  });
});

describe('DeterministicValidator — parking lot domain heuristics', () => {
  it('warns when no Spot/Slot abstraction is present', () => {
    const classes = [makeClass('ParkingLot'), makeClass('Vehicle'), makeClass('FeeCalculator')];
    const result = DeterministicValidator.validate(
      baseContent(classes),
      parkingLotProblem as Problem
    );
    expect(result.warnings.some(w => w.message.includes('Spot'))).toBe(true);
  });

  it('warns when no Vehicle abstraction is present', () => {
    const classes = [makeClass('ParkingLot'), makeClass('ParkingSpot'), makeClass('FeeCalculator')];
    const result = DeterministicValidator.validate(
      baseContent(classes),
      parkingLotProblem as Problem
    );
    expect(result.warnings.some(w => w.message.includes('Vehicle'))).toBe(true);
  });

  it('warns when no fee/ticket abstraction is present', () => {
    const classes = [makeClass('ParkingLot'), makeClass('ParkingSpot'), makeClass('Vehicle')];
    const result = DeterministicValidator.validate(
      baseContent(classes),
      parkingLotProblem as Problem
    );
    expect(result.warnings.some(w => w.message.includes('ticket') || w.message.includes('Fee'))).toBe(true);
  });

  it('produces no domain heuristic warnings for a complete parking lot model', () => {
    const classes = [
      makeClass('ParkingLot'),
      makeClass('ParkingSpot'),
      makeClass('Vehicle'),
      makeClass('ParkingTicket'),
      makeClass('FeeCalculator'),
    ];
    const result = DeterministicValidator.validate(
      baseContent(classes, {
        assumptions: ['Duration-based pricing.', 'Single currency only.'],
        relationships: [
          makeRelationship('ParkingLot', 'ParkingSpot'),
          makeRelationship('ParkingLot', 'Vehicle'),
          makeRelationship('ParkingLot', 'ParkingTicket'),
          makeRelationship('ParkingLot', 'FeeCalculator'),
        ],
      }),
      parkingLotProblem as Problem
    );
    const domainWarnings = result.warnings.filter(w => w.field === 'domain');
    expect(domainWarnings.length).toBe(0);
    expect(result.isValid).toBe(true);
  });
});

describe('DeterministicValidator — Mermaid generation', () => {
  it('returns a fallback diagram for empty content', () => {
    const diagram = DeterministicValidator.generateMermaid(baseContent([]));
    expect(diagram).toContain('classDiagram');
    expect(diagram).toContain('EmptyDesign');
  });

  it('renders class stereotypes correctly', () => {
    const classes = [
      makeClass('FeeStrategy', { type: 'interface' }),
      makeClass('AbstractVehicle', { type: 'abstract' }),
      makeClass('SpotType', { type: 'enum' }),
    ];
    const diagram = DeterministicValidator.generateMermaid(baseContent(classes));
    expect(diagram).toContain('<<interface>>');
    expect(diagram).toContain('<<abstract>>');
    expect(diagram).toContain('<<enumeration>>');
  });

  it('renders relationship arrows for each type', () => {
    const classes = [makeClass('ParkingLot'), makeClass('ParkingSpot'), makeClass('FeeStrategy')];
    const content = baseContent(classes, {
      relationships: [
        { id: '1', fromClass: 'ParkingLot', toClass: 'ParkingSpot', type: 'composition' },
        { id: '2', fromClass: 'ParkingLot', toClass: 'FeeStrategy', type: 'implementation' },
      ],
    });
    const diagram = DeterministicValidator.generateMermaid(content);
    expect(diagram).toContain('--*');
    expect(diagram).toContain('..|>');
  });

  it('strips invalid characters from class names', () => {
    const cls = makeClass('My Class!');
    const diagram = DeterministicValidator.generateMermaid(baseContent([cls]));
    expect(diagram).toContain('MyClass');
    expect(diagram).not.toContain('My Class!');
  });

  it('skips relationships with empty from/to after sanitization', () => {
    const cls = makeClass('ParkingLot');
    const content = baseContent([cls], {
      relationships: [
        { id: 'bad', fromClass: '!!!', toClass: '###', type: 'association' },
      ],
    });
    const diagram = DeterministicValidator.generateMermaid(content);
    expect(diagram).toContain('classDiagram');
  });
});
