import { StructuredDesignContent, ValidationResult, ValidationIssue, Problem } from '../types';

export class DeterministicValidator {
  public static validate(content: StructuredDesignContent, problem?: Problem): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // --- Layer 1: Structural & Referential Checks ---

    // 1. Check classes count
    if (!content.classes || content.classes.length === 0) {
      errors.push({
        type: 'error',
        field: 'classes',
        message: 'No classes or interfaces defined.',
        suggestion: 'Add core domain entities and interfaces required for the system.'
      });
      return { isValid: false, errors, warnings };
    }

    // 2. Check duplicate class names
    const classNames = new Set<string>();
    const classMap = new Map<string, boolean>();

    for (const cls of content.classes) {
      const trimmedName = cls.name.trim();
      if (!trimmedName) {
        errors.push({
          type: 'error',
          field: 'classes',
          message: 'Found an unnamed class or interface.',
          suggestion: 'Provide a valid identifier for all classes.'
        });
        continue;
      }

      if (classNames.has(trimmedName.toLowerCase())) {
        errors.push({
          type: 'error',
          field: 'classes',
          message: `Duplicate class name detected: "${trimmedName}".`,
          suggestion: 'Class names must be unique within the domain model.'
        });
      } else {
        classNames.add(trimmedName.toLowerCase());
        classMap.set(trimmedName, true);
      }

      // Check responsibilities and rationale
      if (!cls.whyExists || cls.whyExists.trim().length < 5) {
        warnings.push({
          type: 'warning',
          field: `class:${trimmedName}`,
          message: `Class "${trimmedName}" lacks a clear "Why?" rationale.`,
          suggestion: 'State the variation point or domain responsibility this class encapsulates.'
        });
      }

      // Check methods
      if (cls.type !== 'enum' && (!cls.methods || cls.methods.length === 0) && (!cls.attributes || cls.attributes.length === 0)) {
        warnings.push({
          type: 'warning',
          field: `class:${trimmedName}`,
          message: `Class "${trimmedName}" has no methods or attributes (potential anemic class).`,
          suggestion: 'Add public behavior methods or state attributes.'
        });
      }
    }

    // 3. Check relationships referential integrity
    if (content.relationships && content.relationships.length > 0) {
      for (const rel of content.relationships) {
        if (!classMap.has(rel.fromClass)) {
          errors.push({
            type: 'error',
            field: 'relationships',
            message: `Relationship references non-existent source class "${rel.fromClass}".`,
            suggestion: `Ensure "${rel.fromClass}" is declared in the classes list.`
          });
        }
        if (!classMap.has(rel.toClass)) {
          errors.push({
            type: 'error',
            field: 'relationships',
            message: `Relationship references non-existent target class "${rel.toClass}".`,
            suggestion: `Ensure "${rel.toClass}" is declared in the classes list.`
          });
        }
      }
    } else if (content.classes.length > 2) {
      warnings.push({
        type: 'warning',
        field: 'relationships',
        message: 'No relationships defined between classes.',
        suggestion: 'Connect your classes with composition, inheritance, or dependency relationships.'
      });
    }

    // 4. Check assumptions
    if (!content.assumptions || content.assumptions.length === 0) {
      warnings.push({
        type: 'warning',
        field: 'assumptions',
        message: 'No explicit assumptions recorded.',
        suggestion: 'State at least one key domain assumption (e.g. rate calculation frequency or spot occupancy rule).'
      });
    }

    // --- Layer 2: Domain Invariant Heuristics ---
    if (problem) {
      const lowerClassNames = Array.from(classNames);
      const combinedText = JSON.stringify(content).toLowerCase();

      if (problem.slug === 'parking-lot') {
        const hasSpot = lowerClassNames.some(c => c.includes('spot') || c.includes('slot'));
        const hasVehicle = lowerClassNames.some(c => c.includes('vehicle') || c.includes('car'));
        const hasFeeOrTicket = lowerClassNames.some(c => c.includes('fee') || c.includes('ticket') || c.includes('price') || c.includes('payment'));

        if (!hasSpot) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'No Spot/Slot abstraction detected in parking model.',
            suggestion: 'Model parking spots (e.g., ParkingSpot, SpotType).'
          });
        }
        if (!hasVehicle) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'No Vehicle abstraction detected.',
            suggestion: 'Represent vehicle entities or vehicle types.'
          });
        }
        if (!hasFeeOrTicket) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'Fee calculation or ticket lifecycle is missing.',
            suggestion: 'Include ticket tracking or pricing abstractions.'
          });
        }
      } else if (problem.slug === 'vending-machine') {
        const hasState = lowerClassNames.some(c => c.includes('state'));
        const hasInventory = lowerClassNames.some(c => c.includes('inventory') || c.includes('item') || c.includes('product'));
        const hasPayment = lowerClassNames.some(c => c.includes('coin') || c.includes('money') || c.includes('payment') || c.includes('cash'));

        if (!hasState) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'State pattern abstractions not clearly identified.',
            suggestion: 'Consider modeling machine states (e.g., IdleState, HasMoneyState, DispensingState).'
          });
        }
        if (!hasInventory) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'Inventory or Product modeling is missing.',
            suggestion: 'Model items, shelves, or stock counts.'
          });
        }
        if (!hasPayment) {
          warnings.push({
            type: 'warning',
            field: 'domain',
            message: 'Payment handling or change calculation is missing.',
            suggestion: 'Model payment processing or coin dispensers.'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public static generateMermaid(content: StructuredDesignContent): string {
    if (!content.classes || content.classes.length === 0) {
      return 'classDiagram\n  class EmptyDesign {\n    +startDesigning()\n  }';
    }

    let mermaid = 'classDiagram\n';

    // Add classes
    for (const cls of content.classes) {
      const cleanName = cls.name.replace(/[^a-zA-Z0-9_]/g, '');
      if (!cleanName) continue;

      if (cls.type === 'interface') {
        mermaid += `  class ${cleanName} {\n    <<interface>>\n`;
      } else if (cls.type === 'abstract') {
        mermaid += `  class ${cleanName} {\n    <<abstract>>\n`;
      } else if (cls.type === 'enum') {
        mermaid += `  class ${cleanName} {\n    <<enumeration>>\n`;
      } else {
        mermaid += `  class ${cleanName} {\n`;
      }

      // Add attributes
      if (cls.attributes) {
        for (const attr of cls.attributes) {
          const vis = attr.visibility || '-';
          const typeStr = attr.type ? `: ${attr.type}` : '';
          mermaid += `    ${vis}${attr.name}${typeStr}\n`;
        }
      }

      // Add methods
      if (cls.methods) {
        for (const m of cls.methods) {
          const vis = m.visibility || '+';
          const params = m.parameters || '';
          const ret = m.returnType ? ` ${m.returnType}` : '';
          mermaid += `    ${vis}${m.name}(${params})${ret}\n`;
        }
      }

      mermaid += '  }\n';
    }

    // Add relationships
    if (content.relationships) {
      for (const rel of content.relationships) {
        const from = rel.fromClass.replace(/[^a-zA-Z0-9_]/g, '');
        const to = rel.toClass.replace(/[^a-zA-Z0-9_]/g, '');
        if (!from || !to) continue;

        let arrow = '-->';
        switch (rel.type) {
          case 'inheritance':
            arrow = '--|>';
            break;
          case 'composition':
            arrow = '--*';
            break;
          case 'aggregation':
            arrow = '--o';
            break;
          case 'implementation':
            arrow = '..|>';
            break;
          case 'dependency':
            arrow = '..>';
            break;
          case 'association':
          default:
            arrow = '-->';
            break;
        }

        const label = rel.description ? ` : "${rel.description}"` : '';
        mermaid += `  ${from} ${arrow} ${to}${label}\n`;
      }
    }

    return mermaid;
  }
}
