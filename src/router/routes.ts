import { CURRICULUM_CHAPTERS } from '../data/curriculumData';
import { BENCHMARK_PROBLEMS } from '../data/seedProblems';
import { Problem } from '../types';

export type RouteType =
  | 'home'
  | 'learn-index'
  | 'learn-chapter'
  | 'problems'
  | 'practice'
  | 'progress'
  | 'history';

export interface RouteState {
  type: RouteType;
  path: string;
  params: {
    chapterId?: string;
    problemId?: string;
    problemSlug?: string;
    step?: number;
  };
}

// Chapter alias dictionary for URL resolution
const CHAPTER_ALIASES: Record<string, string> = {
  'class-and-object': 'classes-and-objects',
  'class-and-objects': 'classes-and-objects',
  'classes-and-object': 'classes-and-objects',
  'class-objects': 'classes-and-objects',
  'class-object': 'classes-and-objects',
  'interface': 'interfaces',
  'solid': 'solid-summary',
  'solid-principles': 'solid-summary',
  'factory': 'factory-method',
  'abstractfactory': 'abstract-factory',
  'singleton-pattern': 'singleton',
  'observer-pattern': 'observer',
  'strategy-pattern': 'strategy',
  'decorator-pattern': 'decorator',
  'adapter-pattern': 'adapter',
  'facade-pattern': 'facade'
};

export class RouteRegistry {
  /**
   * Resolve a raw URL slug to a validated chapter ID
   */
  public static resolveChapterId(rawSlug: string): string {
    if (!rawSlug) return 'classes-and-objects';
    const normalized = rawSlug.toLowerCase().trim();

    if (CURRICULUM_CHAPTERS[normalized]) {
      return normalized;
    }

    if (CHAPTER_ALIASES[normalized]) {
      return CHAPTER_ALIASES[normalized];
    }

    const matched = Object.values(CURRICULUM_CHAPTERS).find(
      (c) =>
        c.id.toLowerCase() === normalized ||
        c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalized ||
        c.title.toLowerCase().replace(/[^a-z0-9]+/g, '') === normalized.replace(/[^a-z0-9]+/g, '')
    );

    return matched ? matched.id : 'classes-and-objects';
  }

  /**
   * Resolve a problem identifier or slug to a Problem entity
   */
  public static resolveProblem(slugOrId: string, problemPool: Problem[] = BENCHMARK_PROBLEMS): Problem {
    if (!slugOrId) return problemPool[0] || BENCHMARK_PROBLEMS[0];
    const normalized = slugOrId.toLowerCase().trim();

    const pool = problemPool.length > 0 ? problemPool : BENCHMARK_PROBLEMS;
    const matched = pool.find(
      (p) =>
        p.slug?.toLowerCase() === normalized ||
        p.id.toLowerCase() === normalized ||
        p.id.toLowerCase() === `prob-${normalized}` ||
        p.slug?.toLowerCase() === normalized.replace(/^prob-/, '') ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalized
    );

    return matched || pool[0] || BENCHMARK_PROBLEMS[0];
  }

  /**
   * URL Builder Helpers
   */
  public static homeUrl(): string {
    return '/home';
  }

  public static learnIndexUrl(): string {
    return '/learn';
  }

  public static chapterUrl(chapterIdOrSlug: string): string {
    const chapterId = this.resolveChapterId(chapterIdOrSlug);
    return `/learn/${chapterId}`;
  }

  public static problemsUrl(): string {
    return '/problems';
  }

  public static practiceUrl(problemSlugOrId: string, step?: number): string {
    const problem = this.resolveProblem(problemSlugOrId);
    const slug = problem.slug || problem.id;
    return step && step > 1 ? `/practice/${slug}/step/${step}` : `/practice/${slug}`;
  }

  public static progressUrl(): string {
    return '/progress';
  }

  public static historyUrl(): string {
    return '/history';
  }
}
