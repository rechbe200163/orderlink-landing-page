import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import { IconCheck, IconArrowRight } from '@tabler/icons-react';

const includedFeatures = [
  'Alle Module inklusive',
  'Unbegrenzte Benutzer',
  'Automatische Backups',
  'E-Mail Support',
  'Regelmäßige Updates',
  'DSGVO-konform',
];

export function PricingSection() {
  return (
    <section id='pricing' className='py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Starte jetzt kostenlos
          </h2>
          <p className='mt-4 text-pretty text-lg text-muted-foreground'>
            Teste OrderLink 14 Tage lang unverbindlich und überzeuge dich selbst
            von den Vorteilen.
          </p>
        </div>

        <div className='mt-16 flex justify-center'>
          <Card className='relative w-full max-w-lg overflow-hidden'>
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50' />
            <CardHeader className='text-center'>
              <div className='mb-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
                Kostenlose Testversion
              </div>
              <CardTitle className='text-2xl'>14 Tage kostenlos</CardTitle>
              <CardDescription className='text-base'>
                Keine Kreditkarte erforderlich. Keine versteckten Kosten.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-8'>
              <ul className='grid gap-3 sm:grid-cols-2'>
                {includedFeatures.map((feature) => (
                  <li key={feature} className='flex items-center gap-3'>
                    <div className='flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                      <IconCheck className='size-3 text-primary' />
                    </div>
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size='lg'
                nativeButton={false}
                className='w-full'
                render={
                  <Link href='/onboarding'>
                    Jetzt starten
                    <IconArrowRight className='ml-2 size-4' />
                  </Link>
                }
              />

              <p className='text-center text-xs text-muted-foreground'>
                Nach der Testphase ab 29€/Monat. Jederzeit kündbar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
