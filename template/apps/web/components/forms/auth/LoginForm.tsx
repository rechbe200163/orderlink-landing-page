'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { useActionState, useState } from 'react';
import { IconEye, IconEyeOff, IconLock } from '@tabler/icons-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { signInAction } from '@/lib/actions/auth/signin.action';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [inputHidden, setInputHidden] = useState('password');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [_formState, action, isLoading] = useActionState(signInAction, {
    success: false,
    errors: { title: [] as string[] },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Willkommen zurück</CardTitle>
          <CardDescription>
            Willkommen im Admin-Bereich. Bitte melde dich an, um fortzufahren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>E-Mail</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='m@example.com'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <div className='flex items-center'>
                    <Label htmlFor='password'>Passwort</Label>
                    <a
                      href='#'
                      className='ml-auto text-sm underline-offset-4 hover:underline'
                    >
                      Passwort vergessen?
                    </a>
                  </div>
                  <div className='relative'>
                    <Input
                      id='password'
                      name='password'
                      type={inputHidden}
                      required
                      className='pr-10'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setInputHidden(
                          inputHidden === 'password' ? 'text' : 'password'
                        )
                      }
                      className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700'
                      tabIndex={-1}
                      aria-label={
                        inputHidden === 'password'
                          ? 'Passwort anzeigen'
                          : 'Passwort verbergen'
                      }
                    >
                      {inputHidden === 'password' ? (
                        // Eye closed icon
                        <IconEyeOff className='h-5 w-5' />
                      ) : (
                        // Eye open icon
                        <IconEye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner />
                      Anmelden...
                    </>
                  ) : (
                    <>
                      Anmelden
                      <IconLock className='ml-2 h-4 w-4' />
                    </>
                  )}
                </Button>
                <span>{_formState.message}</span>
                <span>{_formState.success}</span>
                <p className='text-center text-sm text-muted-foreground'>
                  Erster Login?
                  <a
                    href='/auth/otp'
                    className='font-medium underline underline-offset-4'
                  >
                    OTP eingeben
                  </a>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
