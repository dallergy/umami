import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getApiUrl } from '@/lib/api-url';
import { getClientAuthToken } from '@/lib/client';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { type FetchResponse, httpDelete, httpGet, httpPost, httpPut } from '@/lib/fetch';
import { useApp } from '@/store/app';

async function handleResponse(res: FetchResponse): Promise<any> {
  if (!res.ok) {
    const { message, code, status } = res?.data?.error || {};

    return Promise.reject(Object.assign(new Error(message), { code, status }));
  }
  return Promise.resolve(res.data);
}

/**
 * Credentials are read when each request is made, not when the hook renders. The request
 * functions are memoized for the component's lifetime, so headers captured at render time
 * would keep sending an old auth or share token after it changes.
 */
function getHeaders(headers: object = {}) {
  const { share, shareToken } = useApp.getState() as {
    share?: { shareId?: string } | null;
    shareToken?: { token?: string } | null;
  };

  const shareHeaders =
    share?.shareId && shareToken?.token
      ? { [SHARE_TOKEN_HEADER]: shareToken.token, [SHARE_CONTEXT_HEADER]: '1' }
      : {};

  return {
    authorization: `Bearer ${getClientAuthToken()}`,
    ...shareHeaders,
    ...headers,
  };
}

export function useApi() {
  return {
    get: useCallback(async (url: string, params: object = {}, headers: object = {}) => {
      return httpGet(getApiUrl(url), params, getHeaders(headers)).then(handleResponse);
    }, []),

    post: useCallback(async (url: string, params: object = {}, headers: object = {}) => {
      return httpPost(getApiUrl(url), params, getHeaders(headers)).then(handleResponse);
    }, []),

    put: useCallback(async (url: string, params: object = {}, headers: object = {}) => {
      return httpPut(getApiUrl(url), params, getHeaders(headers)).then(handleResponse);
    }, []),

    del: useCallback(async (url: string, params: object = {}, headers: object = {}) => {
      return httpDelete(getApiUrl(url), params, getHeaders(headers)).then(handleResponse);
    }, []),
    useQuery,
    useMutation,
  };
}
