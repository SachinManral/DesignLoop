import { Problem, RubricDimension } from '../types';

export const GLOBAL_8_DIMENSION_RUBRIC: RubricDimension[] = [
  { id: 'req', name: 'Requirement Understanding', weight: 15, description: 'Scope understanding, assumptions, and constraint clarity' },
  { id: 'resp', name: 'Class Responsibilities', weight: 15, description: 'Single Responsibility Principle and high cohesion' },
  { id: 'coupling', name: 'Coupling & Cohesion', weight: 15, description: 'Dependency direction and avoidance of tight concrete coupling' },
  { id: 'encap', name: 'Encapsulation & Interfaces', weight: 10, description: 'Information hiding, invariant protection, and minimal interfaces' },
  { id: 'patterns', name: 'Abstraction & Patterns', weight: 10, description: 'Justified design patterns protecting real variation points' },
  { id: 'extensibility', name: 'Extensibility', weight: 15, description: 'Resilience under follow-up requirement changes' },
  { id: 'edgecases', name: 'Edge Cases & Testability', weight: 10, description: 'Handling boundary conditions, invalid inputs, and isolation' },
  { id: 'explanation', name: 'Quality of Explanation', weight: 10, description: 'Ability to defend design choices and articulate trade-offs' }
];

export const BENCHMARK_PROBLEMS: Problem[] = [
  {
    id: 'prob-parking-lot',
    slug: 'parking-lot',
    title: 'Design a Parking Lot',
    difficulty: 'Medium',
    estimatedMinutes: 45,
    subtitle: 'Design a parking lot system for a mall, supporting multiple floors, different vehicle types, ticket management, and efficient spot allocation.',
    tags: ['System Design', 'OOP', 'Design Patterns', 'Real-world'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', '+2'],
    lastUpdated: 'Sep 10, 2026',
    statement: 'Design a parking lot system for a multi-floor facility. The system must manage spot allocation, ticket issuance, vehicle entry/exit, fee calculation, and handle edge cases like full floors and invalid tickets.',
    functionalRequirements: [
      'Support multiple floors with configurable capacity per floor',
      'Handle different vehicle types (e.g., car, motorcycle, truck, EV)',
      'Allocate and free parking spots based on vehicle type and availability',
      'Issue unique tickets upon vehicle entry with timestamp and assigned spot',
      'Calculate parking fees upon exit based on duration and vehicle type',
      'Support different parking spot types (compact, large, handicapped, EV charging)',
      'Handle full parking lot scenarios with visual floor display boards',
      'Support payment processing via multiple modes (cash, credit card, UPI)'
    ],
    nonFunctionalConsiderations: [
      'Scalability for multi-floor commercial malls',
      'Extensible spot allocation policies (e.g., closest to elevator vs lowest floor)',
      'Loose coupling between fee calculation rules and parking coordination',
      'Encapsulation of internal spot occupancy states'
    ],
    thingsToThinkAbout: [
      'What are the core entities in the system, and who coordinates the entry/exit workflow?',
      'How will spot allocation work if multiple allocation strategies are introduced later?',
      'What happens when a floor is full or no matching spot type exists?',
      'How would you make fee calculation extensible without modifying the main ParkingLot class?'
    ],
    clarificationQAs: [
      {
        id: 'qa-1',
        question: 'Can one vehicle occupy multiple parking spots if it is oversized?',
        answer: 'No. Each vehicle occupies exactly one designated spot size (e.g., Truck occupies Large spot).',
        impactOnDesign: 'Simplifies Spot to 1-to-1 Vehicle relationship; avoids complex multi-spot transactional locks.',
        whyItMatters: 'Tests domain boundary modeling. Weak candidates overengineer multi-spot contiguous matrices without asking.',
        signalType: 'Boundary',
        recommendedPattern: 'Enum-based SpotType mapping',
        interviewerEvaluation: 'Strong positive signal: Clarifying entity relationship boundaries before writing class members.',
        questionRating: 'High Signal',
        revealed: false
      },
      {
        id: 'qa-2',
        question: 'Are parking rates flat, duration-based, or dynamically surge-priced?',
        answer: 'Currently duration-based with hourly rates per vehicle type, but rates may vary by peak hours, events, or EV charging in the future.',
        impactOnDesign: 'Fee calculation must be decoupled behind a FeeCalculationStrategy abstraction.',
        whyItMatters: 'Core interview trap. Hardcoding pricing into ParkingLot or Ticket violates Open-Closed Principle.',
        signalType: 'Pattern',
        recommendedPattern: 'Strategy Pattern (FeeStrategy)',
        interviewerEvaluation: 'Principal Architect signal: Candidate anticipates requirement mutation and decouples business pricing policy from state.',
        questionRating: 'High Signal',
        revealed: false
      },
      {
        id: 'qa-3',
        question: 'How are spots assigned? Nearest to entrance, random, or lowest floor first?',
        answer: 'The system should allow different allocation strategies per parking facility or floor.',
        impactOnDesign: 'Use Strategy pattern for SpotAllocationStrategy injected into ParkingManager.',
        whyItMatters: 'Determines if coordinator class will be coupled to one static search algorithm.',
        signalType: 'Pattern',
        recommendedPattern: 'Strategy Pattern (SpotAssignmentStrategy)',
        interviewerEvaluation: 'Strong design pattern signal: Enables dependency injection for spot search policies.',
        questionRating: 'High Signal',
        revealed: false
      },
      {
        id: 'qa-4',
        question: 'What happens if a vehicle tries to enter when all spots of its type are full?',
        answer: 'Entry gate must reject entry, keep barrier closed, and update DisplayBoard with "FULL" status.',
        impactOnDesign: 'Need DisplayBoardObserver and entrance gate validator before generating Ticket.',
        whyItMatters: 'Evaluates edge case handling and notification decoupling.',
        signalType: 'Critical',
        recommendedPattern: 'Observer Pattern (DisplayBoard updates)',
        interviewerEvaluation: 'Tests system invariants and user-facing state communication under capacity limits.',
        questionRating: 'High Signal',
        revealed: false
      }
    ],
    seedAssumptions: [
      'A vehicle can have only one active parking ticket at a time.',
      'Each spot accommodates exactly one vehicle.',
      'Fee is computed exclusively at checkout upon ticket presentation.',
      'Spot allocation strategy is configurable per building floor.'
    ],
    mutationScenario: {
      id: 'mut-parking-ev',
      title: 'Requirement Mutation: EV Charging & Dynamic Surge Pricing',
      description: 'The mall introduces EV charging spots that bill customers by kilowatt-hour (kWh) consumed plus duration, with 1.5x surge pricing during weekend peak hours. How does your design absorb this without rewriting parking coordination logic?',
      expectedBehavior: 'Introduce EVSpot inheriting or composing Spot, and plug in an EvFeeCalculationStrategy without altering ParkingLot core workflow.',
      targetVariation: 'Extensibility of Fee Calculation & Spot Types (Open-Closed Principle)'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  },
  {
    id: 'prob-splitwise',
    slug: 'splitwise',
    title: 'Design Splitwise (Expense Sharing)',
    difficulty: 'Medium',
    estimatedMinutes: 45,
    subtitle: 'Design an expense sharing and debt simplification application supporting equal, exact, and percentage splits.',
    tags: ['System Design', 'Algorithms', 'Strategy Pattern', 'Finance'],
    companies: ['Uber', 'Swiggy', 'Razorpay', 'Flipkart'],
    lastUpdated: 'Sep 09, 2026',
    statement: 'Design an expense sharing platform where users can create groups, record shared expenses, choose split strategies (Equal, Exact, Percentage), track individual balances, and simplify group debt transactions.',
    functionalRequirements: [
      'Add users and organize them into optional groups',
      'Record an expense paid by one or more users on behalf of multiple participants',
      'Support multiple split strategies: Equal split, Exact amount split, Percentage split',
      'Validate split invariant (sum of shares must equal total expense amount)',
      'Calculate individual balances (User A owes User B $X)',
      'Settle up balances between users and simplify debt graph transactions'
    ],
    nonFunctionalConsiderations: [
      'Extensibility for new split types (e.g., share by units / shares)',
      'Loose coupling between expense creation and balance calculation',
      'Transaction consistency when updating balance books'
    ],
    thingsToThinkAbout: [
      'How to isolate split calculation algorithms behind a Strategy interface?',
      'How is the user balance sheet updated when an expense is deleted or modified?',
      'Who coordinates the settlement workflow?'
    ],
    clarificationQAs: [
      {
        id: 'split-1',
        question: 'Can an expense be paid by multiple payers simultaneously?',
        answer: 'For MVP, single payer is standard, but the model should allow a list of payer contributions.',
        impactOnDesign: 'Model PayerContribution abstraction rather than a simple userId field.',
        whyItMatters: 'Tests if payment entity is decoupled from expense container.',
        signalType: 'Boundary',
        recommendedPattern: 'Composite / Entity Aggregation',
        interviewerEvaluation: 'Tests if you model real financial transactions or oversimplify to 1 payer.',
        questionRating: 'High Signal',
        revealed: false
      },
      {
        id: 'split-2',
        question: 'How are percentage rounding fractions handled?',
        answer: 'Any fractional cent differences should be allocated to the first participant or smallest share holder.',
        impactOnDesign: 'SplitValidator enforces exact total balance invariant before saving.',
        whyItMatters: 'Financial rounding invariants are a standard interviewer check.',
        signalType: 'Invariant',
        recommendedPattern: 'Strategy Pattern + Validator Chain',
        interviewerEvaluation: 'Demonstrates financial precision mindset and invariant enforcement.',
        questionRating: 'High Signal',
        revealed: false
      }
    ],
    seedAssumptions: [
      'All users have valid registered profiles.',
      'Expense amounts are positive non-zero numbers.',
      'Split strategy determines how split shares are computed.'
    ],
    mutationScenario: {
      id: 'mut-split-currency',
      title: 'Requirement Mutation: Multi-Currency Expenses with Real-Time FX Conversion',
      description: 'Expenses can now be recorded in foreign currencies (e.g. EUR, GBP) and converted to each participant’s preferred settlement currency using real-time exchange rates.',
      expectedBehavior: 'Introduce CurrencyConverter interface injected into ExpenseManager without modifying split strategies.',
      targetVariation: 'Currency Abstraction & Strategy Isolation'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  },
  {
    id: 'prob-vending-machine',
    slug: 'vending-machine',
    title: 'Design a Vending Machine',
    difficulty: 'Easy',
    estimatedMinutes: 35,
    subtitle: 'Design an automated snack and beverage vending machine with state transitions, inventory tracking, coin/cash processing, and change calculation.',
    tags: ['OOP', 'State Pattern', 'Transactions', 'Real-world'],
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    lastUpdated: 'Sep 08, 2026',
    statement: 'Design a software controller for a smart vending machine. The system must manage inventory, accept cash and card payments, validate inserted denominations, handle state transitions (Idle, HasMoney, Dispensing, OutOfStock), dispense products, and return accurate change.',
    functionalRequirements: [
      'Maintain inventory of items categorized by shelf and product code',
      'Accept multiple coin and note denominations or credit card payments',
      'Enforce valid machine state transitions (e.g., cannot dispense without payment)',
      'Calculate and dispense exact change using available cash reserves',
      'Allow user to cancel transaction prior to dispensing and receive full refund',
      'Handle out-of-stock items gracefully and refund balance if selection is invalid'
    ],
    nonFunctionalConsiderations: [
      'Strict state transition invariants (prevent coin drain or illegal item drops)',
      'Clean separation between payment hardware integration and item inventory',
      'Extensible payment types (e.g., adding QR code / UPI later)'
    ],
    thingsToThinkAbout: [
      'Why is the State Pattern suitable here rather than giant nested switch statements?',
      'How is inventory deduction synchronized with payment completion?',
      'What happens if the cash reserve lacks coins for exact change?'
    ],
    clarificationQAs: [
      {
        id: 'vm-1',
        question: 'Can a user purchase multiple items in a single transaction?',
        answer: 'Single item per purchase session for this version, but design should allow basket expansion.',
        impactOnDesign: 'Focus on clean state cycle per purchase session.',
        revealed: false
      },
      {
        id: 'vm-2',
        question: 'What happens if the machine runs out of change for a cash transaction?',
        answer: 'Machine transitions to an "Exact Change Only" mode or refunds payment before dispensing.',
        impactOnDesign: 'ChangeCalculator must verify available cash inventory before accepting order.',
        revealed: false
      }
    ],
    seedAssumptions: [
      'User inserts payment first or selects item first with a grace timeout.',
      'Inventory count decreases only when dispensing succeeds.',
      'Cancel button triggers instant balance return if state is HasMoney.'
    ],
    mutationScenario: {
      id: 'mut-vm-rollback',
      title: 'Requirement Mutation: Mechanical Jam Detection & Rollback',
      description: 'The physical dispenser coil now emits a "JAM_DETECTED" hardware interrupt if a snack gets stuck. The machine must automatically reverse inventory deduction, issue a full refund, and flag the slot as Jammed.',
      expectedBehavior: 'State machine handles Jammed event in Dispensing state, executing rollback actions cleanly.',
      targetVariation: 'State Transition Resilience & Transactional Integrity'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  },
  {
    id: 'prob-elevator-system',
    slug: 'elevator-system',
    title: 'Design an Elevator Dispatch System',
    difficulty: 'Medium',
    estimatedMinutes: 50,
    subtitle: 'Design a multi-elevator scheduling and dispatching controller for a 50-story commercial tower.',
    tags: ['System Design', 'Algorithms', 'State Machine', 'Concurrency'],
    companies: ['Google', 'Uber', 'Bloomberg', 'Atlassian'],
    lastUpdated: 'Sep 05, 2026',
    statement: 'Design an elevator management system controlling N elevator cars across M floors. The system must process internal floor button presses, external hall call requests (Up/Down), optimize car dispatching using SCAN/LOOK algorithms, and manage door states.',
    functionalRequirements: [
      'Control multiple elevator cars serving floors 1 to 50',
      'Process external hall call requests with Up and Down directional intents',
      'Process internal car button requests for destination floors',
      'Dispatch the most optimal elevator car to minimize wait and travel time',
      'Manage door opening, closing, holding, and obstacle safety sensors',
      'Track elevator states: MovingUp, MovingDown, Idle, Maintenance'
    ],
    nonFunctionalConsiderations: [
      'Pluggable scheduling algorithms (e.g., FIFO vs SCAN vs Zone-based dispatching)',
      'Concurrency safety when multiple requests arrive simultaneously',
      'Decoupled car controllers and central dispatcher'
    ],
    thingsToThinkAbout: [
      'Who decides which car serves an external request—the car or the CentralDispatcher?',
      'How will you model the internal directional queue of an individual car?',
      'How to add emergency or VIP modes without altering standard movement logic?'
    ],
    clarificationQAs: [
      {
        id: 'el-1',
        question: 'Are there express elevators that skip lower floors?',
        answer: 'All cars serve all floors for now, but the dispatch strategy should support zone partitioning.',
        impactOnDesign: 'DispatchStrategy should evaluate car eligibility.',
        revealed: false
      }
    ],
    seedAssumptions: [
      'Elevator moves at constant floor-to-floor velocity.',
      'Doors will not close if obstruction sensor is triggered.',
      'Central Dispatcher assigns external calls; individual cars manage internal queue.'
    ],
    mutationScenario: {
      id: 'mut-el-fire',
      title: 'Requirement Mutation: VIP Fire-Emergency Evacuation Override',
      description: 'During a Fire Alarm signal, all elevators must immediately ignore pending passenger calls, cancel current destinations, move non-stop to Ground floor, open doors, and disable further hall call processing.',
      expectedBehavior: 'ElevatorController receives EmergencyEvent, transitions to Evacuating state, and locks dispatcher.',
      targetVariation: 'Behavioral State Overrides & Event Dispatching'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  },
  {
    id: 'prob-notification-service',
    slug: 'notification-service',
    title: 'Design an Omnichannel Notification Service / Logger',
    difficulty: 'Hard',
    estimatedMinutes: 55,
    subtitle: 'Design an extensible notification dispatcher supporting Email, SMS, Push, and WhatsApp with user preferences and retry mechanisms.',
    tags: ['System Design', 'Strategy Pattern', 'Factory', 'Reliability'],
    companies: ['Netflix', 'Stripe', 'Twilio', 'Meta'],
    lastUpdated: 'Sep 02, 2026',
    statement: 'Design an enterprise notification dispatching service. The service accepts notification payloads, resolves recipient channel preferences (e.g. Email for invoices, SMS for OTPs), handles rate limits, formats templates, and dispatches via third-party providers with exponential backoff retries.',
    functionalRequirements: [
      'Support multiple notification channels: Email, SMS, Push, WhatsApp',
      'Respect recipient user preferences and opt-out settings per category',
      'Apply rate limiting and spam throttling per recipient',
      'Support templating with dynamic placeholder variable replacement',
      'Handle provider failures with configurable retry policies and fallback channels',
      'Record delivery audit logs (Sent, Delivered, Failed, Bounced)'
    ],
    nonFunctionalConsiderations: [
      'Open-Closed Principle: Adding a new channel (e.g., Slack/Webhook) requires zero edits to existing dispatchers',
      'Strategy pattern for provider selection (e.g., SendGrid vs SES for email)',
      'Loose coupling between template engines and channel transports'
    ],
    thingsToThinkAbout: [
      'How to decouple message construction, recipient preference filtering, and transport dispatching?',
      'How to handle fallback channels (e.g., if WhatsApp fails, fallback to SMS)?',
      'Where does the retry policy live?'
    ],
    clarificationQAs: [
      {
        id: 'notif-1',
        question: 'Should notifications be delivered synchronously or queued?',
        answer: 'High priority (OTP) requires immediate dispatch; bulk marketing can be queued.',
        impactOnDesign: 'NotificationPriority enum with priority-aware dispatch routing.',
        revealed: false
      }
    ],
    seedAssumptions: [
      'Each recipient has a unique ID and configured channel preferences.',
      'Third-party providers can fail transiently with rate limits or network drops.',
      'Templates are localized by recipient locale.'
    ],
    mutationScenario: {
      id: 'mut-notif-webhook',
      title: 'Requirement Mutation: Webhooks with HMAC Signatures & Dead-Letter Queue',
      description: 'Support enterprise Webhook notifications where payloads are signed with SHA-256 HMAC headers and failed deliveries after 5 retries are routed to a dead-letter inspection log.',
      expectedBehavior: 'Implement WebhookChannel : NotificationChannel with HmacSigningInterceptor and DeadLetterPolicy without changing Email/SMS flow.',
      targetVariation: 'Channel Extensibility & Transport Interceptors'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  },
  {
    id: 'prob-rate-limiter',
    slug: 'rate-limiter',
    title: 'Design a Rate Limiter',
    difficulty: 'Hard',
    estimatedMinutes: 60,
    subtitle: 'Design a distributed rate limiter that supports multiple algorithms (Token Bucket, Leaky Bucket, Fixed Window) with high scalability.',
    tags: ['System Design', 'Algorithms', 'Distributed Systems', 'Scalability'],
    companies: ['Stripe', 'Cloudflare', 'Google', 'Twitter', 'Amazon'],
    lastUpdated: 'Sep 01, 2026',
    statement: 'Design an extensible API rate limiting system capable of handling millions of requests per second. The system must support user-level and IP-level throttling, configurable limits per endpoint, multiple throttling algorithms (Token Bucket, Leaky Bucket, Sliding Window Counter), and distributed state coordination.',
    functionalRequirements: [
      'Limit requests based on client identifier (IP address, user ID, or API key)',
      'Support multiple rate limiting algorithms: Token Bucket, Leaky Bucket, Sliding Window Log, Fixed Window',
      'Configurable rules per endpoint (e.g., 100 requests/minute for /api/checkout, 500/min for /api/search)',
      'Return standard HTTP 429 Too Many Requests response with Retry-After and X-RateLimit headers',
      'Provide fallback behavior during distributed cache failures (fail-open vs fail-close)'
    ],
    nonFunctionalConsiderations: [
      'Low latency overhead (sub-millisecond evaluation)',
      'Extensibility to add new rate limiting strategies easily',
      'High availability and horizontal scalability across multiple nodes'
    ],
    thingsToThinkAbout: [
      'How to model different rate limiting algorithms using the Strategy pattern?',
      'How does the rate limiter handle race conditions with concurrent requests in a distributed environment?',
      'What data structures are optimal for sliding window vs token bucket?'
    ],
    clarificationQAs: [
      {
        id: 'rl-1',
        question: 'Is this rate limiter client-side or an API gateway middleware?',
        answer: 'It operates as an API Gateway / middleware service intercepting inbound HTTP requests.',
        impactOnDesign: 'RateLimiterMiddleware coordinates algorithmic strategy checks.',
        revealed: false
      }
    ],
    seedAssumptions: [
      'Clients are identified uniquely by client ID or IP address.',
      'Endpoints have predefined rate limit policies.',
      'System defaults to Token Bucket strategy if unspecified.'
    ],
    mutationScenario: {
      id: 'mut-rl-tiered',
      title: 'Requirement Mutation: Tiered Quota & Dynamic Tier Throttling',
      description: 'Support tiered subscription tiers (Free, Pro, Enterprise) where Enterprise users get guaranteed burst allowances and automated priority queue bypass during high system load.',
      expectedBehavior: 'TieredRateLimitRule evaluates client tier metadata and calculates dynamic bucket refill rates without modifying core token bucket algorithm.',
      targetVariation: 'Dynamic Rule Evaluation & Policy Extensibility'
    },
    rubric: GLOBAL_8_DIMENSION_RUBRIC
  }
];
