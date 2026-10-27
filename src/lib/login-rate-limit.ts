import redis from '@/lib/redis';

/**
 * Throttles password guessing on the login endpoint.
 *
 * Two counters are kept per failed attempt:
 * - client + username: the main limit. Locks out a single source quickly.
 * - username alone: a much higher ceiling that still stops attackers who rotate IPs
 *   (or spoof forwarding headers when Umami is exposed without a proxy).
 *
 * Counters live in Redis when it is configured, so every instance shares them. Otherwise
 * they are kept in a bounded in-memory map per process.
 */
export const LOGIN_WINDOW_SECONDS = 15 * 60;
export const MAX_FAILURES_PER_CLIENT = 10;
export const MAX_FAILURES_PER_ACCOUNT = 100;
const MAX_MEMORY_ENTRIES = 10_000;

interface Entry {
  count: number;
  expiresAt: number;
}

const memory = new Map<string, Entry>();

function pruneMemory(now: number) {
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) {
      memory.delete(key);
    }
  }

  // Still full of live entries: drop the oldest so the map cannot grow without bound.
  let excess = memory.size - MAX_MEMORY_ENTRIES + 1;

  for (const key of memory.keys()) {
    if (excess-- <= 0) {
      break;
    }

    memory.delete(key);
  }
}

function readMemory(key: string, now = Date.now()) {
  const entry = memory.get(key);

  if (!entry) {
    return 0;
  }

  if (entry.expiresAt <= now) {
    memory.delete(key);
    return 0;
  }

  return entry.count;
}

function incrementMemory(key: string, now = Date.now()) {
  const entry = memory.get(key);

  if (entry && entry.expiresAt > now) {
    entry.count += 1;
    return entry.count;
  }

  if (memory.size >= MAX_MEMORY_ENTRIES) {
    pruneMemory(now);
  }

  memory.set(key, { count: 1, expiresAt: now + LOGIN_WINDOW_SECONDS * 1000 });

  return 1;
}

function getKeys(username: string, ip?: string) {
  const account = String(username ?? '')
    .trim()
    .toLowerCase();

  return {
    client: `login:client:${ip || 'unknown'}:${account}`,
    account: `login:account:${account}`,
  };
}

async function readCount(key: string) {
  if (redis.enabled) {
    return Number(await redis.client.get(key)) || 0;
  }

  return readMemory(key);
}

async function incrementCount(key: string) {
  if (redis.enabled) {
    const count = await redis.client.incr(key);

    if (count === 1) {
      await redis.client.expire(key, LOGIN_WINDOW_SECONDS);
    }

    return count;
  }

  return incrementMemory(key);
}

export async function isLoginThrottled(username: string, ip?: string) {
  const keys = getKeys(username, ip);
  const [client, account] = await Promise.all([readCount(keys.client), readCount(keys.account)]);

  return client >= MAX_FAILURES_PER_CLIENT || account >= MAX_FAILURES_PER_ACCOUNT;
}

export async function recordLoginFailure(username: string, ip?: string) {
  const keys = getKeys(username, ip);

  await Promise.all([incrementCount(keys.client), incrementCount(keys.account)]);
}

/** A successful login clears that client's counter; the account ceiling expires on its own. */
export async function clearLoginFailures(username: string, ip?: string) {
  const { client } = getKeys(username, ip);

  if (redis.enabled) {
    await redis.client.del(client);
  } else {
    memory.delete(client);
  }
}

/** Test helper. */
export function resetLoginRateLimitMemory() {
  memory.clear();
}
