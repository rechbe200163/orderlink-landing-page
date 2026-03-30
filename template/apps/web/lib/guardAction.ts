'use server';

import { ApiError } from '@workspace/api-client/src/core';
import { getSession } from './auth/session';
import { FormState } from './fom.types';
import { Session } from '@workspace/types';

export async function guardAction(
  callback: (session: Session) => Promise<FormState>,
  errorMessage = 'Action failed'
): Promise<FormState> {
  let session: Session;

  try {
    session = await getSession();
  } catch {
    return {
      success: false,
      message: 'Not authenticated',
      errors: { title: ['Not authenticated'] },
    };
  }

  try {
    return await callback(session);
  } catch (e) {
    console.error(e);

    let message = errorMessage;
    if (e instanceof ApiError) message = e.message;
    else if (e && typeof e === 'object' && 'message' in e)
      message = (e as Error).message;

    return {
      success: false,
      message,
      errors: { title: [message] },
    };
  }
}
