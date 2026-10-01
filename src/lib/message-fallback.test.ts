import { describe, expect, test } from 'vitest';
import { createMessageFallback } from './message-fallback';

const fallback = createMessageFallback({
  label: { visitors: 'Visitors', 'current-visitors': 'current visitors' },
});

describe('createMessageFallback', () => {
  test('resolves a missing translation from the source catalog', () => {
    expect(fallback({ key: 'label.visitors' })).toBe('Visitors');
    expect(fallback({ namespace: 'label', key: 'current-visitors' })).toBe('current visitors');
  });

  test('returns the id when the source has no message', () => {
    expect(fallback({ key: 'label.unknown-thing' })).toBe('label.unknown-thing');
  });

  test('does not throw for an undefined key', () => {
    expect(fallback({ key: undefined })).toBe('');
    expect(fallback({ namespace: 'label', key: undefined })).toBe('label');
  });
});
