'use client';
import { useActionState, useState } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { verifyOtp } from '@/lib/actions/auth.actions';
import LoadingIcon from '@/components/loading-states/loading-icon';

export function OtpForm({ tenantSlug }: { tenantSlug: string }) {
  const [code, setCode] = useState('');
  const [_formState, action, isLoading] = useActionState(
    verifyOtp.bind(null, tenantSlug),
    {
      success: false,
      errors: { title: [] as string[] },
    }
  );

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>OTP bestätigen</CardTitle>
          <CardDescription>
            Bitte gib den Code ein, den du per E-Mail erhalten hast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className='grid gap-6'>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              containerClassName='justify-center'
              name='otp'
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {Array.isArray(_formState.errors?.title) &&
              _formState.errors.title.length > 0 && (
                <p className='text-red-500 text-sm'>
                  {_formState.errors?.title?.[0]
                    ? _formState.errors.title[0]
                    : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'}
                </p>
              )}
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingIcon />
                  Bestätigen...
                </>
              ) : (
                'Bestätigen'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
