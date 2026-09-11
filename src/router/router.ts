import { RouteState, RouteRegistry } from './routes';
import { CURRICULUM_CHAPTERS } from '../data/curriculumData';
import { Problem } from '../types';

type RouteListener = (route: RouteState) => void;

export class AppRouter {
  private static listeners: Set<RouteListener> = new Set();
  private static currentRoute: RouteState = AppRouter.parseRoute(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  private static isInitialized = false;

  /**
   * Parse a URL pathname into a typed RouteState
   */
  public static parseRoute(pathname: string, problems?: Problem[]): RouteState {
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length === 0 || segments[0] === 'home') {
      return {
        type: 'home',
        path: '/home',
        params: {}
      };
    }

    if (segments[0] === 'learn') {
      if (segments[1]) {
        const chapterId = RouteRegistry.resolveChapterId(segments[1]);
        return {
          type: 'learn-chapter',
          path: `/learn/${chapterId}`,
          params: { chapterId }
        };
      }
      return {
        type: 'learn-index',
        path: '/learn',
        params: {}
      };
    }

    if (segments[0] === 'practice' || segments[0] === 'problems') {
      if (segments[1]) {
        const problem = RouteRegistry.resolveProblem(segments[1], problems);
        let step = 1;
        if (segments[2] === 'step' && segments[3]) {
          const parsed = parseInt(segments[3], 10);
          if (parsed >= 1 && parsed <= 7) step = parsed;
        }

        const slug = problem.slug || problem.id;
        const canonicalPath = step > 1 ? `/practice/${slug}/step/${step}` : `/practice/${slug}`;

        return {
          type: 'practice',
          path: canonicalPath,
          params: {
            problemId: problem.id,
            problemSlug: slug,
            step
          }
        };
      }

      if (segments[0] === 'problems') {
        return {
          type: 'problems',
          path: '/problems',
          params: {}
        };
      }

      return {
        type: 'problems',
        path: '/practice',
        params: {}
      };
    }

    if (segments[0] === 'library') {
      return {
        type: 'problems',
        path: '/problems',
        params: {}
      };
    }

    if (segments[0] === 'progress') {
      return {
        type: 'progress',
        path: '/progress',
        params: {}
      };
    }

    if (segments[0] === 'history') {
      return {
        type: 'history',
        path: '/history',
        params: {}
      };
    }

    return {
      type: 'home',
      path: '/home',
      params: {}
    };
  }

  /**
   * Initialize window listeners
   */
  public static init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('popstate', () => {
      const nextRoute = this.parseRoute(window.location.pathname);
      this.currentRoute = nextRoute;
      this.notify();
    });
  }

  /**
   * Get the current active RouteState
   */
  public static getRoute(): RouteState {
    return this.currentRoute;
  }

  /**
   * Navigate to a new route path
   */
  public static navigate(targetUrl: string, options?: { replace?: boolean; problems?: Problem[] }): void {
    if (typeof window === 'undefined') return;

    const nextRoute = this.parseRoute(targetUrl, options?.problems);

    if (options?.replace) {
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState(null, '', targetUrl);
      }
    } else {
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }

    this.currentRoute = nextRoute;
    this.notify();
  }

  /**
   * Subscribe to route changes
   */
  public static subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update browser title according to the active route
   */
  public static updateDocumentTitle(route: RouteState, activeProblem?: Problem): void {
    if (typeof document === 'undefined') return;

    switch (route.type) {
      case 'home':
        document.title = 'CipherSchool — Software Architecture & LLD Studio';
        break;
      case 'learn-index':
        document.title = 'Curriculum & Concepts | CipherSchool';
        break;
      case 'learn-chapter': {
        const ch = route.params.chapterId ? CURRICULUM_CHAPTERS[route.params.chapterId] : null;
        document.title = ch ? `${ch.title} | CipherSchool` : 'Learn | CipherSchool';
        break;
      }
      case 'practice': {
        const title = activeProblem?.title || 'Design Practice';
        const stepNum = route.params.step || 1;
        document.title = `${title} (Step ${stepNum}/7) | CipherSchool`;
        break;
      }
      case 'problems':
        document.title = 'Problem Library | CipherSchool';
        break;
      case 'progress':
        document.title = 'My Progress | CipherSchool';
        break;
      case 'history':
        document.title = 'Submission History | CipherSchool';
        break;
    }
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentRoute);
    }
  }
}
