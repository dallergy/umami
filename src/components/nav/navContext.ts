export type NavContext = 'main' | 'website' | 'settings' | 'admin';

export function getNavContext(pathname: string, websiteId?: string): NavContext {
  if (websiteId) {
    return 'website';
  }

  if (/^\/(teams\/[^/]+\/)?settings(\/|$)/.test(pathname)) {
    return 'settings';
  }

  if (pathname.startsWith('/admin')) {
    return 'admin';
  }

  return 'main';
}
