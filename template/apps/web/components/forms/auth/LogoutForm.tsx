'use client';

import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, LogOutIcon } from 'lucide-react';
import { useActionState } from 'react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { logOut } from '@/lib/actions/auth.actions';
import { GenericLoading } from '../loading-states/loading';
import LoadingIcon from '../loading-states/loading-icon';

export function LogoutForm() {
  const [formState, action, isPending] = useActionState(logOut, {
    success: false,
    errors: {
      title: [''],
    },
  });

  if (!action) {
    return null; // or handle the case when action is not defined
  }

  return (
    <form action={action}>
      {formState.data && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{formState.message}</AlertDescription>
        </Alert>
      )}
      <DropdownMenuItem>
        <button type='submit' className='w-full' disabled={isPending}>
          {isPending ? (
            <>
              <LoadingIcon />
              <GenericLoading text='Logging out...' />
            </>
          ) : (
            <>
              <LogOutIcon />
              Log out
            </>
          )}
        </button>
      </DropdownMenuItem>
    </form>
  );
}
