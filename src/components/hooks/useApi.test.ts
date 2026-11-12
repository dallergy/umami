import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { setShareData } from '@/store/app';

const mocks = vi.hoisted(() => ({
  httpGet: vi.fn(),
  token: 'first-token',
}));

vi.mock('@/lib/fetch', () => ({
  httpGet: mocks.httpGet,
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpDelete: vi.fn(),
}));

vi.mock('@/lib/client', () => ({
  getClientAuthToken: () => mocks.token,
}));

import { useApi } from './useApi';

beforeEach(() => {
  mocks.token = 'first-token';
  mocks.httpGet.mockReset();
  mocks.httpGet.mockResolvedValue({ ok: true, data: { ok: true } });
  setShareData(null, null);
});

afterEach(() => {
  setShareData(null, null);
});

test('memoized requests use credentials that changed after the component mounted', async () => {
  const { result, rerender } = renderHook(() => useApi());
  const firstGet = result.current.get;

  mocks.token = 'second-token';
  setShareData({ shareId: 'share-1' }, { token: 'share-token' });
  rerender();

  expect(result.current.get).toBe(firstGet);

  await result.current.get('/websites');

  const headers = mocks.httpGet.mock.calls[0][2];

  expect(headers.authorization).toBe('Bearer second-token');
  expect(headers[SHARE_TOKEN_HEADER]).toBe('share-token');
  expect(headers[SHARE_CONTEXT_HEADER]).toBe('1');
});

test('omits share headers outside a share', async () => {
  const { result } = renderHook(() => useApi());

  await result.current.get('/websites', {}, { 'x-extra': '1' });

  const headers = mocks.httpGet.mock.calls[0][2];

  expect(headers[SHARE_TOKEN_HEADER]).toBeUndefined();
  expect(headers['x-extra']).toBe('1');
});
