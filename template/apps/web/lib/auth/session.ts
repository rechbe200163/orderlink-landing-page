import { unauthorized } from 'next/navigation';

import { getCookie } from './cookie';
import { SanitizedUser, Session, Token } from '@workspace/types';

export async function getSession(): Promise<Session> {
  const user = await getCookie<SanitizedUser>('user');
  const token = await getCookie<Token>('token');

  if (!user || !token) {
    unauthorized();
  }

  try {
    return { token, user };
  } catch (e) {
    unauthorized();
  }
}

export async function authenticated(): Promise<void> {
  const session = await getSession();
  if (!session) {
    unauthorized();
  }
}
