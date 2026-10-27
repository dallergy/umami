import { describe, expect, test } from 'vitest';
import { isSafeReturnUrl } from './return-url';

describe('isSafeReturnUrl', () => {
  test('accepts same-origin relative paths', () => {
    expect(isSafeReturnUrl('/')).toBe(true);
    expect(isSafeReturnUrl('/websites/abc?date=30day#top')).toBe(true);
    expect(isSafeReturnUrl('/teams/1/websites')).toBe(true);
  });

  test('rejects absolute and protocol-relative urls', () => {
    expect(isSafeReturnUrl('https://evil.example')).toBe(false);
    expect(isSafeReturnUrl('//evil.example')).toBe(false);
    expect(isSafeReturnUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeReturnUrl('websites')).toBe(false);
  });

  test('rejects paths browsers would normalize into another origin', () => {
    expect(isSafeReturnUrl('/\\evil.example')).toBe(false);
    expect(isSafeReturnUrl('/\\/evil.example')).toBe(false);
    expect(isSafeReturnUrl('/\t/evil.example')).toBe(false);
    expect(isSafeReturnUrl('/\n/evil.example')).toBe(false);
    expect(isSafeReturnUrl('/\r\n/evil.example')).toBe(false);
  });

  test('rejects non-strings', () => {
    expect(isSafeReturnUrl(undefined)).toBe(false);
    expect(isSafeReturnUrl(null)).toBe(false);
    expect(isSafeReturnUrl(['/'])).toBe(false);
  });
});
