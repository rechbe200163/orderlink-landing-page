import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { OnboardingForm } from '@/components/landing/onboarding-form';

export default function OnboardingPage() {
  return (
    <div className='min-h-screen bg-muted/30'>
      <div className='mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8'>
        <Link
          href='/'
          className='mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <IconArrowLeft className='size-4' />
          Zurück zur Startseite
        </Link>

        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-primary'>
              <span className='text-sm font-bold text-primary-foreground'>OL</span>
            </div>
            <span className='text-2xl font-semibold tracking-tight'>OrderLink</span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Starte jetzt mit OrderLink
          </h1>
          <p className='mt-2 text-lg text-muted-foreground'>
            Erstelle deinen Account und beginne in wenigen Minuten mit der Verwaltung deines Unternehmens.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
