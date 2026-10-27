import { saveAuth } from '@/lib/auth';
import { PARTIAL_AUTH_TOKEN_TYPE, ROLES } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { getIpAddress } from '@/lib/ip';
import { createSecureToken } from '@/lib/jwt';
import {
  clearLoginFailures,
  isLoginThrottled,
  LOGIN_WINDOW_SECONDS,
  recordLoginFailure,
} from '@/lib/login-rate-limit';
import { checkPassword, checkPasswordForMissingUser } from '@/lib/password';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json, serviceUnavailable, tooManyRequests, unauthorized } from '@/lib/response';
import { getTwoFactorConfigurationError, isTwoFactorConfigured } from '@/lib/two-factor/crypto';
import { getAllUserTeams, getUserByUsername } from '@/queries/prisma';
import { loginRequestSchema } from './schema';

export async function POST(request: Request) {
  const { body, error } = await parseRequest(request, loginRequestSchema, { skipAuth: true });

  if (error) {
    return error();
  }

  const { username, password } = body;
  const ip = getIpAddress(request.headers);

  // Checked before the password so a throttled client learns nothing from further guesses.
  if (await isLoginThrottled(username, ip)) {
    return tooManyRequests({ code: 'too-many-login-attempts' }, LOGIN_WINDOW_SECONDS);
  }

  const user = await getUserByUsername(username, { includePassword: true });
  const isValid = user
    ? checkPassword(password, user.password)
    : checkPasswordForMissingUser(password);

  if (!isValid) {
    await recordLoginFailure(username, ip);
    return unauthorized({ code: 'incorrect-username-password' });
  }

  await clearLoginFailures(username, ip);

  const { id, role, createdAt } = user;
  const cloudMode = !!process.env.CLOUD_MODE;

  // Check if 2FA is enabled for this user
  const twoFactor = !cloudMode
    ? await prisma.client.twoFactorAuth.findUnique({ where: { userId: id } })
    : null;

  if (twoFactor?.isEnabled) {
    if (!isTwoFactorConfigured()) {
      return serviceUnavailable(getTwoFactorConfigurationError());
    }

    const partialToken = createSecureToken(
      { userId: id, type: PARTIAL_AUTH_TOKEN_TYPE },
      secret(),
      {
        expiresIn: '5m',
      },
    );
    return json({ requiresTwoFactor: true, partialToken });
  }
  // Bind token to password hash so a password change invalidates old tokens.
  const pwd = hash(user.password);

  let token: string;

  if (redis.enabled) {
    token = await saveAuth({ userId: id, role, pwd });
  } else {
    token = createSecureToken({ userId: user.id, role, pwd }, secret());
  }

  const teams = await getAllUserTeams(id);

  return json({
    token,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
