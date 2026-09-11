export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';

export type SupportedLanguage = 'java' | 'python' | 'cpp' | 'typescript' | 'go';

export type CurriculumCategory =
  | 'oop'
  | 'design-principles'
  | 'uml'
  | 'creational-patterns'
  | 'structural-patterns'
  | 'behavioral-patterns'
  | 'interview-tips'
  | 'questions-easy'
  | 'questions-medium'
  | 'questions-hard';

export interface Requirement {
  id: string;
  statement: string;
  type: 'functional' | 'non-functional' | 'extensibility' | 'invariant';
  importance: 'high' | 'medium' | 'low';
  observableEvidence?: string[];
}

export interface ClarificationQA {
  id: string;
  question: string;
  answer: string;
  impactOnDesign: string;
  revealed: boolean;
  whyItMatters?: string;
  signalType?: 'Critical' | 'Pattern' | 'Invariant' | 'Boundary';
  recommendedPattern?: string;
  interviewerEvaluation?: string;
  questionRating?: 'High Signal' | 'Good Question' | 'Fair';
}

export interface MutationScenario {
  id: string;
  title: string;
  description: string;
  expectedBehavior: string;
  targetVariation: string;
}

export interface RubricDimension {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  subtitle: string;
  tags: string[];
  companies: string[];
  lastUpdated: string;
  statement: string;
  functionalRequirements: string[];
  nonFunctionalConsiderations: string[];
  thingsToThinkAbout: string[];
  clarificationQAs: ClarificationQA[];
  seedAssumptions: string[];
  mutationScenario: MutationScenario;
  rubric: RubricDimension[];
  suggestedPatterns?: string[];
  classDiagramMermaid?: string;
  domainCategory?: string;
}

export interface DesignAttribute {
  name: string;
  type: string;
  visibility: '+' | '-' | '#';
}

export interface DesignMethod {
  name: string;
  returnType: string;
  parameters: string;
  visibility: '+' | '-' | '#';
}

export interface DesignClass {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'abstract' | 'enum';
  responsibilities: string[];
  whyExists: string;
  attributes: DesignAttribute[];
  methods: DesignMethod[];
}

export interface DesignRelationship {
  id: string;
  fromClass: string;
  toClass: string;
  type: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency' | 'implementation';
  multiplicity?: string;
  description?: string;
}

export interface DesignDecision {
  id: string;
  decision: string;
  reason: string;
  alternativeConsidered?: string;
}

export interface StructuredDesignContent {
  assumptions: string[];
  clarificationsSelected: string[];
  classes: DesignClass[];
  relationships: DesignRelationship[];
  decisions: DesignDecision[];
  edgeCases: string[];
  extensionResponse?: string;
  mermaidSyntax?: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface CriterionResult {
  dimension: string;
  score: number; // 0 - 4
  maxScore: number;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
  interpretation: string;
  impact: string;
  suggestion: string;
  tradeoff: string;
  practiceAction: string;
  severity: 'critical' | 'important' | 'minor' | 'positive';
}

export interface MutationAssessment {
  mutationTitle: string;
  changeCost: 'Low' | 'Medium' | 'High';
  openClosedVerdict: 'Pass' | 'Partial' | 'Fail';
  classesModified: string[];
  classesAdded: string[];
  analysis: string;
  recommendedRefactoring: string;
}

export interface FeedbackReport {
  overallScore: number; // 0 - 100
  overallSummary: string;
  confidence: 'high' | 'medium' | 'low';
  criteria: CriterionResult[];
  mutationReview?: MutationAssessment;
  nextPracticeActions: string[];
  recurringSmellsIdentified?: string[];
  evaluationTimestamp?: string;
}

export interface Submission {
  id: string;
  attemptId?: string;
  versionNumber: number;
  submittedAt: string;
  content: StructuredDesignContent;
  validation?: ValidationResult;
  validationResult?: ValidationResult;
  evaluation?: FeedbackReport;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId?: string;
  userId?: string;
  status: AttemptStatus;
  currentVersion: number;
  version?: number;
  draftContent: StructuredDesignContent;
  content?: StructuredDesignContent;
  submissions: Submission[];
  activeStep: number;
  createdAt: string;
  startedAt?: string;
  updatedAt: string;
  submittedAt?: string;
  feedback?: FeedbackReport;
  validationResult?: ValidationResult;
  reflections?: string;
  timeSpentSeconds?: number;
}

export interface SkillRadarData {
  requirements: number;
  modeling: number;
  responsibility: number;
  decoupling: number;
  extensibility: number;
}

export interface LearnerProgress {
  totalAttempts: number;
  completedProblems: string[];
  skillRadar: SkillRadarData;
  recurringWeaknesses: string[];
}

export interface UserSettings {
  aiProvider: 'gemini' | 'groq';
  geminiApiKey: string;
  groqApiKey: string;
  geminiModel: string;
  groqModel: string;
  temperature: number;
  enableASTValidation: boolean;
  theme: 'dark' | 'light';
  fontSize: 'normal' | 'large';
  preferredLanguage: SupportedLanguage;
}

// -------------------------------------------------------------
// Curriculum data types
// -------------------------------------------------------------

export interface UMLAttribute {
  visibility: '-' | '+' | '#';
  name: string;
  type: string;
}

export interface UMLMethod {
  visibility: '-' | '+' | '#';
  name: string;
  parameters?: string;
  returnType: string;
}

export interface UMLClassCardData {
  className: string;
  stereotype?: 'class' | 'interface' | 'abstract' | 'enum';
  attributes: UMLAttribute[];
  methods: UMLMethod[];
}

export interface ChapterSection {
  id: string;
  title: string;
  content: string;
  callout?: {
    type: 'note' | 'tip' | 'warning' | 'important';
    title: string;
    text: string;
  };
}

export interface ChapterQuiz {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ChapterDiscussionComment {
  id: string;
  author: string;
  avatarLetter: string;
  timeAgo: string;
  text: string;
  upvotes: number;
}

export interface CurriculumChapter {
  id: string;
  slug: string;
  moduleId: CurriculumCategory;
  moduleTitle: string;
  title: string;
  priority: 'High Priority' | 'Core' | 'Medium Priority';
  readTimeMinutes: number;
  lastUpdated: string;
  summary: string;
  audioDurationSeconds?: number;
  audioScript?: string;
  sections: ChapterSection[];
  umlCard?: UMLClassCardData;
  classDiagramMermaid?: string;
  codeSnippets: Record<SupportedLanguage, string>;
  sampleOutput?: string;
  practicalExample?: {
    title: string;
    scenario: string;
    code: Record<SupportedLanguage, string>;
    whyItWorks: string[];
  };
  quiz?: ChapterQuiz;
  comments?: ChapterDiscussionComment[];
  topics?: string[];
  hasPracticeProblem?: boolean;
  practiceProblemId?: string;
  difficulty?: Difficulty;
}

export interface CurriculumModule {
  id: CurriculumCategory;
  title: string;
  description: string;
  iconName: string;
  chapterIds: string[];
}
