import { useState, useEffect, useCallback } from 'react';
import { AppRouter } from './router';
import { RouteState, RouteRegistry } from './routes';
import { Problem } from '../types';

export function useAppRouter(problems?: Problem[], activeProblem?: Problem) {
  const [route, setRoute] = useState<RouteState>(() => AppRouter.getRoute());

  useEffect(() => {
    AppRouter.init();
    const unsubscribe = AppRouter.subscribe((nextRoute) => {
      setRoute(nextRoute);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    AppRouter.updateDocumentTitle(route, activeProblem);
  }, [route, activeProblem]);

  const navigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      AppRouter.navigate(path, { ...options, problems });
    },
    [problems]
  );

  const navigateToChapter = useCallback(
    (chapterIdOrSlug: string) => {
      const url = RouteRegistry.chapterUrl(chapterIdOrSlug);
      AppRouter.navigate(url, { problems });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [problems]
  );

  const navigateToPractice = useCallback(
    (problemIdOrSlug: string, step?: number) => {
      const url = RouteRegistry.practiceUrl(problemIdOrSlug, step);
      AppRouter.navigate(url, { problems });
    },
    [problems]
  );

  const navigateToTab = useCallback(
    (tab: string, customPath?: string) => {
      if (customPath) {
        AppRouter.navigate(customPath, { problems });
        return;
      }
      switch (tab) {
        case 'home':
          AppRouter.navigate(RouteRegistry.homeUrl(), { problems });
          break;
        case 'learn':
          AppRouter.navigate(RouteRegistry.learnIndexUrl(), { problems });
          break;
        case 'library':
        case 'problems':
          AppRouter.navigate(RouteRegistry.problemsUrl(), { problems });
          break;
        case 'practice':
          AppRouter.navigate('/practice', { problems });
          break;
        case 'progress':
          AppRouter.navigate(RouteRegistry.progressUrl(), { problems });
          break;
        case 'history':
          AppRouter.navigate(RouteRegistry.historyUrl(), { problems });
          break;
        default:
          AppRouter.navigate(RouteRegistry.homeUrl(), { problems });
      }
    },
    [problems]
  );

  return {
    route,
    navigate,
    navigateToChapter,
    navigateToPractice,
    navigateToTab,
  };
}
