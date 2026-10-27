import { beforeEach, expect, test, vi } from 'vitest';
import { fetchWebsite } from '@/lib/load';
import { getWebsiteSegment } from '@/queries/prisma';
import { getQueryFilters, isBodyTooLarge } from './request';

vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/umami?schema=public';
  delete process.env.DATABASE_REPLICA_URL;
});

vi.mock('@/lib/load', () => ({
  fetchAccount: vi.fn(),
  fetchWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsiteSegment: vi.fn(),
}));

const fetchWebsiteMock = vi.mocked(fetchWebsite);
const getWebsiteSegmentMock = vi.mocked(getWebsiteSegment);

beforeEach(() => {
  fetchWebsiteMock.mockReset();
  getWebsiteSegmentMock.mockReset();
  fetchWebsiteMock.mockResolvedValue({ id: 'website-1' } as any);
});

test("combines a saved segment's session property filters with active filters", async () => {
  getWebsiteSegmentMock.mockResolvedValue({
    parameters: {
      filters: [],
      sessionPropertyFilters: [{ propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' }],
    },
  } as any);

  const filters = await getQueryFilters(
    {
      startAt: String(+new Date('2026-09-01T00:00:00.000Z')),
      endAt: String(+new Date('2026-09-02T00:00:00.000Z')),
      segment: 'segment-1',
      spf0: '1.eq.country.US',
    },
    'website-1',
  );

  expect(filters.sessionPropertyFilters).toEqual([
    { propertyName: 'country', dataType: 1, operator: 'eq', value: 'US' },
    { propertyName: 'plan', dataType: 1, operator: 'eq', value: 'pro' },
  ]);
});

test('isBodyTooLarge trusts Content-Length when present', async () => {
  const request = (length: number) =>
    new Request('http://localhost/api/send', {
      method: 'POST',
      headers: { 'content-length': String(length) },
      body: 'x',
    });

  await expect(isBodyTooLarge(request(10), 100)).resolves.toBe(false);
  await expect(isBodyTooLarge(request(101), 100)).resolves.toBe(true);
});

test('isBodyTooLarge measures streamed bodies without Content-Length and leaves them readable', async () => {
  const streamed = (text: string) =>
    new Request('http://localhost/api/send', {
      method: 'POST',
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      }),
      // @ts-expect-error Node requires duplex for streamed request bodies.
      duplex: 'half',
    });

  const small = streamed('{"ok":true}');

  await expect(isBodyTooLarge(small, 100)).resolves.toBe(false);
  await expect(small.json()).resolves.toEqual({ ok: true });
  await expect(isBodyTooLarge(streamed('x'.repeat(500)), 100)).resolves.toBe(true);
});
