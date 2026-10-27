import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findLink: vi.fn(),
  send: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({ findLink: mocks.findLink }));
vi.mock('@/lib/redis', () => ({ default: { enabled: false } }));
vi.mock('@/app/api/send/route', () => ({ POST: mocks.send }));

import { GET } from './route';

const visit = (slug: string) =>
  GET(new Request(`http://localhost/q/${slug}`), { params: Promise.resolve({ slug }) });

beforeEach(() => {
  mocks.findLink.mockReset();
  mocks.send.mockReset();
  mocks.send.mockResolvedValue(new Response('{}'));
});

test('redirects to an http(s) destination', async () => {
  mocks.findLink.mockResolvedValue({ id: 'link-1', url: 'https://example.com/docs' });

  const response = await visit('abcdefgh');

  expect(response.status).toBe(307);
  expect(response.headers.get('location')).toBe('https://example.com/docs');
});

test('refuses to redirect to non-web schemes stored before validation existed', async () => {
  mocks.findLink.mockResolvedValue({ id: 'link-1', url: 'javascript:alert(document.cookie)' });

  const response = await visit('abcdefgh');

  expect(response.status).toBe(404);
  expect(response.headers.get('location')).toBeNull();
});

test('returns 404 for unknown slugs', async () => {
  mocks.findLink.mockResolvedValue(null);

  expect((await visit('missing1')).status).toBe(404);
});
