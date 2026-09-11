import { Problem, StructuredDesignContent, FeedbackReport, CriterionResult, MutationAssessment } from '../types';
import { DeterministicValidator } from './deterministicValidator';

export class EvaluationEngine {
  public static evaluate(
    problem: Problem,
    content: StructuredDesignContent,
    versionNumber: number
  ): FeedbackReport {
    // 1. Run Layer 1 & 2 Deterministic Checks
    const validation = DeterministicValidator.validate(content, problem);
    if (!validation.isValid) {
      throw new Error(`Deterministic validation failed: ${validation.errors.map(e => e.message).join('; ')}`);
    }

    // 2. Perform Evidence-Grounded Semantic Analysis across 8 Dimensions (1 to 5 scale)
    const criteria: CriterionResult[] = [];
    const recurringSmells: string[] = [];
    const nextActions: string[] = [];

    const classNames = content.classes.map(c => c.name);
    const classesMap = new Map(content.classes.map(c => [c.name, c]));
    const lowerClassNames = classNames.map(name => name.toLowerCase());
    const missingParkingDomain = problem.slug === 'parking-lot'
      ? [
          ['floor', 'parking floor'],
          ['spot', 'slot', 'parking spot'],
          ['vehicle', 'car', 'vehicle'],
          ['ticket', 'parking ticket'],
        ].filter(([token]) => !lowerClassNames.some(name => name.includes(token as string)))
          .map(([, label]) => label as string)
      : [];
    const hasMissingCoreDomain = missingParkingDomain.length > 0;

    // Check for dummy / placeholder / empty / non-domain methods
    const allMethods = content.classes.flatMap(c => c.methods || []);
    const methodNames = allMethods.map(m => m.name.toLowerCase());
    const parkingKeywords = ['park', 'unpark', 'spot', 'slot', 'ticket', 'vehicle', 'fee', 'calc', 'pay', 'floor', 'entry', 'exit', 'capacity', 'avail', 'assign', 'release'];
    
    const domainRelevantMethods = methodNames.filter(name => 
      parkingKeywords.some(keyword => name.includes(keyword))
    );

    const hasZeroMethods = allMethods.length === 0;
    const hasNoDomainMethods = domainRelevantMethods.length === 0;
    const isDummySubmission = hasZeroMethods || hasNoDomainMethods || content.classes.length === 0;
    const dummyMethodNames = allMethods.filter(m => !parkingKeywords.some(kw => m.name.toLowerCase().includes(kw))).map(m => m.name);

    // --- 1. Requirement Understanding (Weight: 15%) ---
    const assumptionsCount = content.assumptions?.length || 0;
    const hasGoodAssumptions = assumptionsCount >= 2;
    const firstAssumption = assumptionsCount > 0 ? content.assumptions[0] : 'None recorded';

    if (isDummySubmission) {
      recurringSmells.push('Dummy / Unrelated Methods in Domain Model');
      criteria.push({
        dimension: 'Requirement Understanding',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: `Submitted methods like "${dummyMethodNames.join(', ') || 'none'}" in "${classNames.join(', ')}" have no domain relevance to the ${problem.title} problem.`,
        interpretation: 'The submission does not capture the core business requirements or domain workflow (parking, ticketing, spot allocation).',
        impact: 'Zero functional requirements are met. The system cannot execute any parking operations.',
        suggestion: 'Replace placeholder/dummy methods with actual domain operations: parkVehicle(Vehicle), unparkVehicle(Ticket), findAvailableSpot(SpotType).',
        tradeoff: 'None. Proper domain modeling is required.',
        practiceAction: 'Identify the 3-4 core use cases from the problem statement and model them directly.',
        severity: 'critical'
      });
      nextActions.push(`Model actual operations (e.g. parkVehicle, unparkVehicle) instead of "${dummyMethodNames.slice(0, 2).join(', ')}".`);
    } else if (hasMissingCoreDomain) {
      recurringSmells.push('Incomplete Core Domain Model');
      criteria.push({
        dimension: 'Requirement Understanding',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: `The submitted diagram defines ${classNames.join(', ') || 'no classes'}, but is missing ${missingParkingDomain.join(', ')}.`,
        interpretation: 'The core parking workflow cannot be represented without the missing domain entities.',
        impact: 'Spot allocation, vehicle entry/exit, and ticket lifecycle rules have no clear owner.',
        suggestion: 'Add ParkingFloor, ParkingSpot, Vehicle, and ParkingTicket (or equivalent named entities) before refining pricing strategies.',
        tradeoff: 'Adds model classes, but keeps business state explicit and testable.',
        practiceAction: 'Model the core domain entities and connect them to ParkingLot with meaningful relationships.',
        severity: 'critical'
      });
      nextActions.push(`Model the missing core entities: ${missingParkingDomain.join(', ')}.`);
    } else if (hasGoodAssumptions) {
      criteria.push({
        dimension: 'Requirement Understanding',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: `Explicitly listed ${assumptionsCount} scope boundaries (e.g., "${firstAssumption}").`,
        interpretation: 'Clear understanding of system boundaries and upfront constraints.',
        impact: 'Reduces ambiguity before designing class hierarchies.',
        suggestion: 'Keep maintaining explicit assumptions for concurrency and scaling thresholds.',
        tradeoff: 'Documenting upfront scope prevents mid-interview rewrites.',
        practiceAction: 'Validate your assumptions against interviewer prompts before finalizing classes.',
        severity: 'positive'
      });
    } else {
      criteria.push({
        dimension: 'Requirement Understanding',
        score: 3,
        maxScore: 5,
        confidence: 'high',
        evidence: `Stated ${assumptionsCount} assumption(s): "${firstAssumption}".`,
        interpretation: 'Minimal boundary assumptions defined prior to drawing classes.',
        impact: 'Implicit assumptions risk violating unstated requirements.',
        suggestion: 'State key rules explicitly (e.g., ticket duration calculation point, rate change frequency).',
        tradeoff: 'None. Always clarify scope before drawing.',
        practiceAction: 'Add 2-3 explicit domain assumptions defining system boundaries.',
        severity: 'important'
      });
    }

    // --- 2. Class Responsibilities (SRP) (Weight: 15%) ---
    let godClassFound = false;
    let godClassName = '';

    for (const cls of content.classes) {
      const methodsCount = cls.methods?.length || 0;
      const respCount = cls.responsibilities?.length || 0;
      const lowerName = cls.name.toLowerCase();

      const handlesCoordination = lowerName.includes('lot') || lowerName.includes('manager') || lowerName.includes('machine') || lowerName.includes('service');
      const hasFeeLogic = cls.methods?.some(m => m.name.toLowerCase().includes('fee') || m.name.toLowerCase().includes('calc') || m.name.toLowerCase().includes('pay'));
      const hasPersistenceLogic = cls.methods?.some(m => m.name.toLowerCase().includes('save') || m.name.toLowerCase().includes('db') || m.name.toLowerCase().includes('repo'));

      if (handlesCoordination && hasFeeLogic && (methodsCount > 4 || respCount > 2)) {
        godClassFound = true;
        godClassName = cls.name;
        break;
      }
    }

    if (isDummySubmission) {
      criteria.push({
        dimension: 'Class Responsibilities',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: `Defined entity "${classNames[0] || 'Unknown'}" contains arbitrary methods (${dummyMethodNames.join(', ') || 'none'}) with no single responsibility.`,
        interpretation: 'SRP cannot be validated because no domain responsibilities exist in the design.',
        impact: 'Architecture cannot be reviewed for cohesion or responsibility boundaries.',
        suggestion: 'Define distinct classes for entity storage (ParkingSpot), state management (ParkingLot), and billing (FeeCalculator).',
        tradeoff: 'Splits behavior across focused objects.',
        practiceAction: 'Assign each business requirement to exactly one responsible class.',
        severity: 'critical'
      });
    } else if (godClassFound) {
      recurringSmells.push('God Class / Overloaded Coordinator');
      criteria.push({
        dimension: 'Class Responsibilities',
        score: 2,
        maxScore: 5,
        confidence: 'high',
        evidence: `Class "${godClassName}" handles coordination alongside fee calculation and state persistence.`,
        interpretation: 'Violates Single Responsibility Principle (SRP). The coordinator has multiple unrelated reasons to change.',
        impact: 'Changing billing rules or adding payment providers forces modifications inside the core coordination workflow.',
        suggestion: `Extract fee calculation into a dedicated Strategy (e.g., FeeStrategy) and inject it into ${godClassName}.`,
        tradeoff: 'Requires an extra interface, but insulates the coordinator from pricing changes.',
        practiceAction: `Refactor ${godClassName} to coordinate actions while delegating fee logic to FeeStrategy.`,
        severity: 'critical'
      });
      nextActions.push(`Refactor "${godClassName}" by extracting fee calculation and persistence into dedicated classes.`);
    } else if (hasMissingCoreDomain || content.classes.length < 4) {
      criteria.push({
        dimension: 'Class Responsibilities',
        score: 2,
        maxScore: 5,
        confidence: 'high',
        evidence: `Only ${content.classes.length} abstraction(s) are present, so core responsibilities such as spot allocation and ticket lifecycle are not assigned.`,
        interpretation: 'The coordinator may be thin, but the design is incomplete rather than demonstrably well separated.',
        impact: 'Unmodelled responsibilities will accumulate in ParkingLot as features are added.',
        suggestion: 'Assign allocation to a SlotManager/AllocationPolicy and model floors, spots, vehicles, and tickets explicitly.',
        tradeoff: 'More domain objects, with clearer ownership and lower change cost.',
        practiceAction: 'Add the missing domain classes before claiming SRP compliance.',
        severity: 'important'
      });
      nextActions.push('Assign each core parking responsibility to a concrete domain abstraction.');
    } else {
      criteria.push({
        dimension: 'Class Responsibilities',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: 'Class responsibilities are focused; coordinators delegate calculation and persistence.',
        interpretation: 'High cohesion with clear separation between workflow coordination and domain policies.',
        impact: 'Classes can be tested and modified independently with low regression risk.',
        suggestion: 'Maintain this separation as new features or rules are added.',
        tradeoff: 'None.',
        practiceAction: 'Keep coordinator classes thin and policy-free.',
        severity: 'positive'
      });
    }

    // --- 3. Coupling & Cohesion (Weight: 15%) ---
    const hasStrategyOrInterface = content.classes.some(c => 
      c.type === 'interface' || 
      c.name.toLowerCase().includes('strategy') || 
      c.name.toLowerCase().includes('processor') ||
      c.name.toLowerCase().includes('policy')
    );

    const hasStrategyRelationship = content.relationships.some(rel =>
      rel.type === 'implementation' ||
      (rel.type === 'dependency' && content.classes.find(c => c.name === rel.toClass)?.type === 'interface') ||
      (rel.type === 'composition' && content.classes.find(c => c.name === rel.toClass)?.type === 'interface')
    );

    if (isDummySubmission) {
      criteria.push({
        dimension: 'Coupling & Cohesion',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: 'No meaningful domain relationships or interfaces defined.',
        interpretation: 'Cohesion and coupling cannot be evaluated on an isolated dummy entity.',
        impact: 'Components cannot interact or exchange data.',
        suggestion: 'Model inter-class relationships (e.g. ParkingLot 1--* ParkingFloor, ParkingFloor 1--* ParkingSpot).',
        tradeoff: 'Clear structural topology.',
        practiceAction: 'Define composition and association arrows between your domain entities.',
        severity: 'critical'
      });
    } else if (hasStrategyOrInterface && hasStrategyRelationship && !hasMissingCoreDomain) {
      criteria.push({
        dimension: 'Coupling & Cohesion',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: 'Orchestrators depend on strategy interfaces rather than concrete implementations.',
        interpretation: 'Loose coupling and high cohesion adhering to Dependency Inversion.',
        impact: 'Enables swappable algorithms without altering coordinator classes.',
        suggestion: 'Ensure dependencies are passed via constructor injection.',
        tradeoff: 'Small dependency injection setup.',
        practiceAction: 'Favor composition over inheritance when injecting strategies.',
        severity: 'positive'
      });
    } else {
      recurringSmells.push('Tight Coupling to Concretes');
      criteria.push({
        dimension: 'Coupling & Cohesion',
        score: 2,
        maxScore: 5,
        confidence: 'high',
        evidence: 'Direct concrete dependencies used for calculation without strategy abstractions.',
        interpretation: 'Violates Dependency Inversion Principle (DIP). High-level orchestrators depend directly on concrete classes.',
        impact: 'Adding an alternate strategy requires modifying the caller.',
        suggestion: 'Introduce a strategy interface and inject it into the coordinator.',
        tradeoff: 'Adds an interface contract, justified by anticipated policy changes.',
        practiceAction: 'Define an interface for the variable algorithm and depend on it.',
        severity: 'important'
      });
      nextActions.push('Introduce strategy interfaces for business rules that are likely to change.');
    }

    // --- 4. Encapsulation & Interfaces (Weight: 10%) ---
    const enumsCount = content.classes.filter(c => c.type === 'enum').length;
    const hasEnums = enumsCount > 0 || content.classes.some(c => c.name.toLowerCase().includes('type') || c.name.toLowerCase().includes('status'));

    if (isDummySubmission) {
      criteria.push({
        dimension: 'Encapsulation & Interfaces',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: 'No domain types, enums, or encapsulation boundaries modeled.',
        interpretation: 'Missing VehicleType, SpotType, and TicketStatus enums.',
        impact: 'Without domain types, data contracts cannot be enforced.',
        suggestion: 'Create enums for VehicleType (CAR, BIKE, TRUCK) and SpotType (COMPACT, LARGE, MOTORCYCLE).',
        tradeoff: 'Type-safe contracts.',
        practiceAction: 'Add enum types for categories and operational statuses.',
        severity: 'critical'
      });
    } else if (hasEnums) {
      criteria.push({
        dimension: 'Encapsulation & Interfaces',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: `Domain states modeled with type-safe enums and private fields.`,
        interpretation: 'Strong encapsulation of internal state invariants.',
        impact: 'Prevents illegal state transitions and primitive obsession.',
        suggestion: 'Keep internal collections unmodifiable.',
        tradeoff: 'None.',
        practiceAction: 'Maintain encapsulation across all state aggregates.',
        severity: 'positive'
      });
    } else {
      criteria.push({
        dimension: 'Encapsulation & Interfaces',
        score: 2,
        maxScore: 5,
        confidence: 'medium',
        evidence: 'Domain entities rely on string/int primitives for types and statuses.',
        interpretation: 'Potential primitive obsession.',
        impact: 'Runtime errors from invalid status values.',
        suggestion: 'Extract status and category primitives into dedicated domain enums.',
        tradeoff: 'Small file count increase in exchange for compile-time safety.',
        practiceAction: 'Define explicit enums for entity categories and state transitions.',
        severity: 'important'
      });
    }

    // --- 5. Abstraction & Patterns (Weight: 10%) ---
    if (isDummySubmission) {
      criteria.push({
        dimension: 'Abstraction & Patterns',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: 'No design patterns or behavioral abstractions present.',
        interpretation: 'Candidate has not applied Strategy, Factory, or State patterns.',
        impact: 'No extensibility or algorithm isolation.',
        suggestion: 'Introduce a PricingStrategy interface to support flat vs hourly rate calculations.',
        tradeoff: 'Promotes Open-Closed Principle.',
        practiceAction: 'Identify variation points and abstract them with the Strategy Pattern.',
        severity: 'critical'
      });
    } else if (hasStrategyOrInterface && hasStrategyRelationship && !hasMissingCoreDomain) {
      criteria.push({
        dimension: 'Abstraction & Patterns',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: 'Design patterns (Strategy/State) applied at genuine variation points.',
        interpretation: 'Appropriate pattern application without cargo-culting.',
        impact: 'Protects system from future requirement volatility.',
        suggestion: 'Ensure interfaces remain minimal (ISP).',
        tradeoff: 'Justified abstraction.',
        practiceAction: 'Only introduce patterns where real variation exists.',
        severity: 'positive'
      });
    } else {
      criteria.push({
        dimension: 'Abstraction & Patterns',
        score: 2,
        maxScore: 5,
        confidence: 'medium',
        evidence: 'No clear design pattern applied for algorithm variations.',
        interpretation: 'Missed opportunity for Strategy or Factory pattern.',
        impact: 'Conditionals (switch statements) may proliferate as options grow.',
        suggestion: 'Apply Strategy pattern to encapsulate variable algorithms.',
        tradeoff: 'Adds one interface and concrete implementations.',
        practiceAction: 'Encapsulate variable behaviors behind a clean interface.',
        severity: 'important'
      });
    }

    // --- 6. Extensibility (Weight: 15%) ---
    const extensionText = content.extensionResponse || '';
    const addressedMutation = extensionText.length > 20;
    let mutationAssessment: MutationAssessment;

    if (isDummySubmission) {
      mutationAssessment = {
        mutationTitle: problem.mutationScenario.title,
        changeCost: 'High',
        openClosedVerdict: 'Fail',
        classesModified: content.classes.map(c => c.name),
        classesAdded: ['ParkingSpot', 'Vehicle', 'ParkingTicket', 'PricingStrategy'],
        analysis: 'The baseline architecture is incomplete and cannot support requirement extensions without rebuilding from scratch.',
        recommendedRefactoring: 'Build the fundamental domain entities first, then apply Strategy Pattern for rate calculations.'
      };

      criteria.push({
        dimension: 'Extensibility',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: 'Cannot evaluate extensibility when the core domain model is missing.',
        interpretation: 'Any requirement change requires a complete architectural rewrite.',
        impact: 'Maximum change cost.',
        suggestion: 'Establish a working baseline model before testing mutations.',
        tradeoff: 'Foundation first.',
        practiceAction: 'Build foundational domain classes first.',
        severity: 'critical'
      });
    } else if (addressedMutation) {
      mutationAssessment = {
        mutationTitle: problem.mutationScenario.title,
        changeCost: 'Low',
        openClosedVerdict: 'Pass',
        classesModified: [content.classes[0]?.name || 'Coordinator'],
        classesAdded: ['NewExtensionStrategy', 'ExtensionModel'],
        analysis: `Your extension plan cleanly introduces new abstractions without rewriting existing classes.`,
        recommendedRefactoring: 'Inject the new strategy via configuration.'
      };

      criteria.push({
        dimension: 'Extensibility',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: `Extension response: "${extensionText.slice(0, 90)}..."`,
        interpretation: 'Open-Closed Principle satisfied. Core classes stay closed for modification.',
        impact: 'Low Change Cost when new requirements arrive.',
        suggestion: 'Ensure new strategies conform strictly to interface contracts.',
        tradeoff: 'Configuration setup.',
        practiceAction: 'Keep testing designs against requirement changes.',
        severity: 'positive'
      });
    } else {
      mutationAssessment = {
        mutationTitle: problem.mutationScenario.title,
        changeCost: 'High',
        openClosedVerdict: 'Partial',
        classesModified: content.classes.slice(0, 2).map(c => c.name),
        classesAdded: ['NewFeatureClass'],
        analysis: 'No detailed extension response provided for the mutation challenge.',
        recommendedRefactoring: 'Extract variable logic behind polymorphic interfaces.'
      };

      criteria.push({
        dimension: 'Extensibility',
        score: 2,
        maxScore: 5,
        confidence: 'medium',
        evidence: 'Mutation challenge unaddressed or lacks concrete extension mapping.',
        interpretation: 'High risk of shotgun surgery when new rules are introduced.',
        impact: 'Modifications will ripple across multiple classes.',
        suggestion: `Review the mutation challenge ("${problem.mutationScenario.title}") and describe added vs modified classes.`,
        tradeoff: 'Requires thinking through extension points.',
        practiceAction: 'Answer the mutation challenge to stress-test your design.',
        severity: 'important'
      });
      nextActions.push(`Answer the mutation challenge: ${problem.mutationScenario.title}`);
    }

    // --- 7. Edge Cases & Testability (Weight: 10%) ---
    const edgeCasesCount = content.edgeCases?.length || 0;
    if (isDummySubmission || hasZeroMethods || domainRelevantMethods.length < 2) {
      criteria.push({
        dimension: 'Edge Cases & Testability',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: `Classes (${classNames.join(', ')}) have ${allMethods.length} method(s). Documented edge cases (e.g. "${content.edgeCases?.[0] || 'Full parking facility'}") cannot be tested or handled without operational methods.`,
        interpretation: 'Listing edge cases is insufficient if classes lack the operational methods (e.g. isFull(), parkVehicle()) to handle boundary failures.',
        impact: 'The system cannot enforce capacity boundaries, reject invalid tickets, or prevent concurrent overwrite errors.',
        suggestion: 'Add operational methods with defensive checks: parkVehicle(Vehicle) checking capacity and throwing LotFullException.',
        tradeoff: 'Writing explicit method contracts prevents silent runtime failures.',
        practiceAction: 'Implement boundary check methods and exception paths for every documented edge case.',
        severity: 'critical'
      });
    } else if (edgeCasesCount >= 2) {
      criteria.push({
        dimension: 'Edge Cases & Testability',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: `Documented ${edgeCasesCount} edge case handling scenarios (e.g. "${content.edgeCases[0]}").`,
        interpretation: 'System accounts for invalid states and boundary failures.',
        impact: 'Ensures robust behavior in production.',
        suggestion: 'Consider concurrency locks on shared mutable state.',
        tradeoff: 'None.',
        practiceAction: 'Identify boundary conditions in every use case.',
        severity: 'positive'
      });
    } else {
      criteria.push({
        dimension: 'Edge Cases & Testability',
        score: 2,
        maxScore: 5,
        confidence: 'medium',
        evidence: 'Few explicit edge cases declared.',
        interpretation: 'Boundary conditions not fully modeled.',
        impact: 'Potential race conditions or unhandled full-state exceptions.',
        suggestion: 'Specify how full capacity, invalid tickets, or duplicate entries are handled.',
        tradeoff: 'None.',
        practiceAction: 'Add edge cases for full capacity and invalid states.',
        severity: 'important'
      });
    }

    // --- 8. Quality of Explanation (Weight: 10%) ---
    const meaningfulRationales = content.classes.filter(c => 
      c.whyExists && 
      c.whyExists.trim().length > 10 && 
      !c.whyExists.includes('Candidate-defined domain abstraction')
    ).length;

    if (isDummySubmission) {
      criteria.push({
        dimension: 'Quality of Explanation',
        score: 1,
        maxScore: 5,
        confidence: 'high',
        evidence: `Default placeholder rationale present with no real architectural justification.`,
        interpretation: 'Candidate did not articulate why abstractions were chosen or trade-offs made.',
        impact: 'Interviewer cannot assess engineering decision-making.',
        suggestion: 'Explain why each class exists (e.g. "ParkingLot orchestrates entry/exit while delegating spot search to SlotManager").',
        tradeoff: 'Takes 1 minute, creates senior engineering signal.',
        practiceAction: 'Write a 1-sentence "Why this abstraction exists" for each entity.',
        severity: 'critical'
      });
    } else if (meaningfulRationales >= content.classes.length * 0.7 && content.classes.length > 1) {
      criteria.push({
        dimension: 'Quality of Explanation',
        score: 5,
        maxScore: 5,
        confidence: 'high',
        evidence: `Provided explicit "Why?" rationales for ${meaningfulRationales} classes/interfaces.`,
        interpretation: 'Clear trade-off reasoning and architectural articulation.',
        impact: 'Demonstrates senior-level communication in interviews.',
        suggestion: 'Continue explaining why specific abstractions were selected over simpler alternatives.',
        tradeoff: 'Takes a minute to document, creates high signal.',
        practiceAction: 'Always explain why an abstraction exists.',
        severity: 'positive'
      });
    } else {
      criteria.push({
        dimension: 'Quality of Explanation',
        score: 2,
        maxScore: 5,
        confidence: 'medium',
        evidence: 'Classes lack customized design rationales.',
        interpretation: 'Intent behind abstractions is implicit or uses placeholder text.',
        impact: 'Hard for an interviewer to assess whether patterns were chosen intentionally.',
        suggestion: 'State the reason for each class/interface in the workspace inspector.',
        tradeoff: 'None.',
        practiceAction: 'Provide a 1-sentence "Why?" for every class.',
        severity: 'important'
      });
    }

    // Calculate Overall Weighted Score (0 to 100)
    let totalWeightedScore = 0;
    for (let i = 0; i < criteria.length; i++) {
      const dimensionWeight = problem.rubric[i]?.weight || (100 / 8);
      const normalizedScore = (criteria[i].score / criteria[i].maxScore) * 100;
      totalWeightedScore += (normalizedScore * dimensionWeight) / 100;
    }

    // Strict integrity cap:
    // If submission is dummy / placeholder methods only -> score is 10–15%
    // If core domain entities are completely missing -> capped at 30%
    const overallScore = Math.min(
      Math.round(totalWeightedScore),
      isDummySubmission ? 12 : hasMissingCoreDomain ? 30 : 100
    );

    const overallSummary = isDummySubmission
      ? `The submitted design does not model the ${problem.title} problem. The defined methods (${dummyMethodNames.slice(0, 2).map(m => `"${m}"`).join(', ') || 'placeholders'}) do not fulfill core parking operations (parkVehicle, unparkVehicle, spot allocation, ticket issuance).`
      : hasMissingCoreDomain
      ? `The submitted diagram defines initial classes, but its core domain model is incomplete: ${missingParkingDomain.join(', ')} are missing from the architecture.`
      : overallScore >= 80
      ? 'Strong, cohesive object-oriented design with clean separation of concerns and clear variation points.'
      : overallScore >= 60
      ? 'Good foundational domain model, but exhibits coupling or responsibility leakage in coordinator classes.'
      : 'Basic structure captured, but requires refactoring to resolve God classes and introduce proper abstractions.';

    return {
      overallScore,
      overallSummary,
      confidence: 'high',
      criteria,
      mutationReview: mutationAssessment,
      nextPracticeActions: nextActions.length > 0 ? nextActions : ['Explore concurrency locks during spot reservation.'],
      recurringSmellsIdentified: recurringSmells
    };
  }
}
