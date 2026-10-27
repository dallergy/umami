import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/redis', () => ({ default: { enabled: false } }));

import {
  clearLoginFailures,
  isLoginThrottled,
  LOGIN_WINDOW_SECONDS,
  MAX_FAILURES_PER_ACCOUNT,
  MAX_FAILURES_PER_CLIENT,
  recordLoginFailure,
  resetLoginRateLimitMemory,
} from './login-rate-limit';

async function fail(times: number, username: string, ip?: string) {
  for (let i = 0; i < times; i++) {
    await recordLoginFailure(username, ip);
  }
}

describe('login rate limit (in-memory)', () => {
  beforeEach(() => {
    resetLoginRateLimitMemory();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('allows attempts below the per-client limit', async () => {
    await fail(MAX_FAILURES_PER_CLIENT - 1, 'admin', '1.1.1.1');

    expect(await isLoginThrottled('admin', '1.1.1.1')).toBe(false);
  });

  test('throttles a client after too many failures for the same account', async () => {
    await fail(MAX_FAILURES_PER_CLIENT, 'admin', '1.1.1.1');

    expect(await isLoginThrottled('admin', '1.1.1.1')).toBe(true);
    expect(await isLoginThrottled('admin', '2.2.2.2')).toBe(false);
    expect(await isLoginThrottled('someone-else', '1.1.1.1')).toBe(false);
  });

  test('treats usernames case-insensitively', async () => {
    await fail(MAX_FAILURES_PER_CLIENT, 'Admin', '1.1.1.1');

    expect(await isLoginThrottled(' admin ', '1.1.1.1')).toBe(true);
  });

  test('throttles an account attacked from many addresses', async () => {
    for (let i = 0; i < MAX_FAILURES_PER_ACCOUNT; i++) {
      await recordLoginFailure('admin', `10.0.${Math.floor(i / 256)}.${i % 256}`);
    }

    expect(await isLoginThrottled('admin', '192.168.1.1')).toBe(true);
  });

  test('a successful login clears that client', async () => {
    await fail(MAX_FAILURES_PER_CLIENT, 'admin', '1.1.1.1');
    await clearLoginFailures('admin', '1.1.1.1');

    expect(await isLoginThrottled('admin', '1.1.1.1')).toBe(false);
  });

  test('failures expire after the window', async () => {
    await fail(MAX_FAILURES_PER_CLIENT, 'admin', '1.1.1.1');
    vi.advanceTimersByTime(LOGIN_WINDOW_SECONDS * 1000 + 1);

    expect(await isLoginThrottled('admin', '1.1.1.1')).toBe(false);
  });
});
