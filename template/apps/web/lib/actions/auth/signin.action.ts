'use server';
import { apiClient } from '@/lib/api-client.server';
import { setCookie } from '@/lib/auth/cookie';
import { ENDPOINTS } from '@/lib/endpoints';
import { FormState } from '@/lib/fom.types';
import { Session } from '@workspace/types';
import { redirect } from 'next/navigation';

export async function signInAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return {
      success: false,
      errors: { title: ['Missing credentials'] },
    };
  }

  const payload = { email: email, password: password };

  try {
    const resp = await apiClient.post<Session, typeof payload>(
      ENDPOINTS.AUTH.LOGIN,
      { body: payload }
    );
    if (!resp) redirect('/auth/error?error&try+again+later');
    await setCookie('token', {
      accessToken: resp.token.accessToken,
      issuedAt: resp.token.issuedAt,
      expiresAt: resp.token.expiresAt,
    });
    await setCookie('user', resp.user);
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, errors: { title: [error.message] } };
  }
  redirect('/');
}
