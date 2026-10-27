import { getItem, removeItem, setItem } from '@/lib/storage';

const RETURN_URL = 'umami.return-url';

const PLACEHOLDER_ORIGIN = 'http://umami.invalid';

/**
 * Only same-origin relative paths are accepted to prevent open redirects. Resolving with the
 * URL parser applies the same normalization browsers do (backslashes, stripped tabs and
 * newlines), so tricks like `/\\evil.com` or `/\t/evil.com` cannot escape the origin.
 */
export function isSafeReturnUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return false;
  }

  try {
    return new URL(value, PLACEHOLDER_ORIGIN).origin === PLACEHOLDER_ORIGIN;
  } catch {
    return false;
  }
}

export function setReturnUrl(url: string) {
  if (isSafeReturnUrl(url)) {
    setItem(RETURN_URL, url, true);
  }
}

export function consumeReturnUrl(): string | null {
  const value = getItem(RETURN_URL, true);

  removeItem(RETURN_URL, true);

  return isSafeReturnUrl(value) ? value : null;
}
