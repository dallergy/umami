import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getUserByUsername: vi.fn(),
  checkPassword: vi.fn(),
  checkPasswordForMissingUser: vi.fn(),
  findTwoFactorAuth: vi.fn(),
  createSecureToken: vi.fn(),
  secret: vi.fn(),
  hash: vi.fn(),
  getAllUserTeams: vi.fn(),
  saveAuth: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUserByUsername: mocks.getUserByUsername,
}));

vi.mock('@/lib/password', () => ({
  checkPassword: mocks.checkPassword,
  checkPasswordForMissingUser: mocks.checkPasswordForMissingUser,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findTwoFactorAuth,
      },
    },
  },
}));

vi.mock('@/lib/jwt', () => ({
  createSecureToken: mocks.createSecureToken,
}));

vi.mock('@/lib/crypto', () => ({
  hash: mocks.hash,
  secret: mocks.secret,
}));

vi.mock('@/lib/auth', () => ({
  saveAuth: mocks.saveAuth,
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
  },
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  getTwoFactorConfigurationError: () => ({
    code: 'two-factor-error-not-configured',
    message: 'TWO_FACTOR_ENCRYPTION_KEY is missing or invalid',
  }),
  isTwoFactorConfigured: mocks.isTwoFactorConfigured,
}));

import { MAX_FAILURES_PER_CLIENT, resetLoginRateLimitMemory } from '@/lib/login-rate-limit';
import { POST } from './route';

const loginRequest = (ip = '203.0.113.7') =>
  new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  });

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getUserByUsername.mockReset();
  mocks.checkPassword.mockReset();
  mocks.checkPasswordForMissingUser.mockReset();
  mocks.findTwoFactorAuth.mockReset();
  mocks.createSecureToken.mockReset();
  mocks.secret.mockReset();
  mocks.hash.mockReset();
  mocks.getAllUserTeams.mockReset();
  mocks.saveAuth.mockReset();
  mocks.isTwoFactorConfigured.mockReset();
  resetLoginRateLimitMemory();

  mocks.parseRequest.mockResolvedValue({
    body: { username: 'alice', password: 'secret' },
    error: undefined,
  });
  mocks.getUserByUsername.mockResolvedValue({
    id: 'user-1',
    username: 'alice',
    password: 'hashed-password',
    role: 'admin',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
  });
  mocks.checkPassword.mockReturnValue(true);
  mocks.findTwoFactorAuth.mockResolvedValue({ userId: 'user-1', isEnabled: true });
  mocks.isTwoFactorConfigured.mockReturnValue(true);
});

test('POST returns a configuration error instead of partial auth when 2FA is enabled but unavailable', async () => {
  mocks.isTwoFactorConfigured.mockReturnValue(false);

  const response = await POST(new Request('http://localhost/api/auth/login', { method: 'POST' }));

  expect(mocks.createSecureToken).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-not-configured',
    },
  });
  expect(response.status).toBe(503);
});

test('POST spends a password check on unknown users so timing does not reveal them', async () => {
  mocks.getUserByUsername.mockResolvedValue(null);
  mocks.checkPasswordForMissingUser.mockReturnValue(false);

  const response = await POST(loginRequest());

  expect(mocks.checkPasswordForMissingUser).toHaveBeenCalledWith('secret');
  expect(mocks.checkPassword).not.toHaveBeenCalled();
  expect(response.status).toBe(401);
});

test('POST throttles a client after repeated failures, even with the right password', async () => {
  mocks.checkPassword.mockReturnValue(false);

  for (let i = 0; i < MAX_FAILURES_PER_CLIENT; i++) {
    expect((await POST(loginRequest())).status).toBe(401);
  }

  mocks.checkPassword.mockReturnValue(true);
  const response = await POST(loginRequest());

  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'too-many-login-attempts' },
  });
  expect(mocks.checkPassword).toHaveBeenCalledTimes(MAX_FAILURES_PER_CLIENT);

  // Other clients are unaffected by one client's failures.
  expect((await POST(loginRequest('198.51.100.9'))).status).not.toBe(429);
});
