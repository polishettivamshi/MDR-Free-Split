export type RoutePage =
  | 'home'
  | 'split'
  | 'plan'
  | 'guides'
  | 'guide'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'not-found';

export interface Route {
  page: RoutePage;
  planId?: string;
  slug?: string;
}

const normalizePath = (pathname: string): string => {
  let path = pathname.split('?')[0];
  if (!path || path === '/index.html') return '/';
  path = path.replace(/\/+$/, '');
  return path || '/';
};

export const parsePath = (pathname: string): Route => {
  const path = normalizePath(pathname);

  if (path === '/') return { page: 'home' };
  if (path === '/split') return { page: 'split' };
  if (path === '/guides') return { page: 'guides' };
  if (path === '/about') return { page: 'about' };
  if (path === '/contact') return { page: 'contact' };
  if (path === '/privacy') return { page: 'privacy' };
  if (path === '/terms') return { page: 'terms' };
  if (path === '/disclaimer') return { page: 'disclaimer' };

  const planMatch = path.match(/^\/plan\/([^/]+)$/);
  if (planMatch) {
    try {
      return { page: 'plan', planId: decodeURIComponent(planMatch[1]) };
    } catch {
      return { page: 'not-found' };
    }
  }

  const guideMatch = path.match(/^\/guides\/([^/]+)$/);
  if (guideMatch) {
    try {
      return { page: 'guide', slug: decodeURIComponent(guideMatch[1]) };
    } catch {
      return { page: 'not-found' };
    }
  }

  return { page: 'not-found' };
};

export const routeToPath = (route: Route): string => {
  switch (route.page) {
    case 'home':
      return '/';
    case 'split':
      return '/split';
    case 'plan':
      return `/plan/${encodeURIComponent(route.planId || '')}`;
    case 'guides':
      return '/guides';
    case 'guide':
      return `/guides/${encodeURIComponent(route.slug || '')}`;
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'disclaimer':
      return '/disclaimer';
    default:
      return '/';
  }
};

const parseLegacyHash = (hash: string): Route | null => {
  if (!hash.startsWith('#/')) return null;
  const legacyPath = hash.slice(1);
  if (/^\/?$/.test(legacyPath)) return { page: 'home' };
  if (/^\/split\/?$/.test(legacyPath)) return { page: 'split' };

  const planMatch = legacyPath.match(/^\/plan\/([^/?#]+)\/?$/);
  if (planMatch) {
    try {
      return { page: 'plan', planId: decodeURIComponent(planMatch[1]) };
    } catch {
      return null;
    }
  }

  const guideMatch = legacyPath.match(/^\/guides\/([^/?#]+)\/?$/);
  if (guideMatch) {
    try {
      return { page: 'guide', slug: decodeURIComponent(guideMatch[1]) };
    } catch {
      return null;
    }
  }

  if (/^\/guides\/?$/.test(legacyPath)) return { page: 'guides' };

  return null;
};

/**
 * Read the current page from the URL. Older #/ links are converted to clean
 * paths so existing bookmarks and refreshable plan URLs keep working.
 */
export const parseCurrentRoute = (): Route => {
  if (typeof window === 'undefined') return { page: 'home' };

  const legacyRoute = parseLegacyHash(window.location.hash);
  if (legacyRoute) {
    const cleanPath = routeToPath(legacyRoute);
    window.history.replaceState(null, '', cleanPath);
    return legacyRoute;
  }

  return parsePath(window.location.pathname);
};

export const isEditorialRoute = (route: Route): boolean =>
  route.page === 'guides' || route.page === 'guide';
