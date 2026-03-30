'server-only';

import { forbidden } from 'next/navigation';
import { ApiClient } from '@workspace/api-client/src/core';
import { getCookie } from './auth/cookie';

const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
if (!baseUrl) throw new Error('Missing API_URL');

function getApiClientServer() {
  return new ApiClient(baseUrl!, {
    getAccessToken: async () => {
      const tokenData = await getCookie<{ accessToken: string }>('token');
      return tokenData?.accessToken;
    },
    onAuthError: async () => {
      forbidden();
    },
  });
}

export const apiClient = getApiClientServer();
