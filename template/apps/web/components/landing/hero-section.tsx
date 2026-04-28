import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { IconArrowRight } from '@tabler/icons-react';

export function HeroSection() {
  return (
    <section className='relative overflow-hidden py-20 sm:py-32'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background' />
      
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl text-center'>
          <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary'>
            <span className='size-1.5 rounded-full bg-primary' />
            14 Tage kostenlos testen
          </div>

          <h1 className='text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Dein ERP-System für KMU{' '}
            <span className='text-primary'>modular, automatisiert, sofort startklar</span>
          </h1>

          <p className='mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl'>
            Verwalte Kunden, Bestellungen, Auslieferung und Analysen in einem System. 
            Schluss mit Excel-Chaos und manuellen Prozessen.
          </p>

          <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button size='lg' asChild className='w-full sm:w-auto'>
              <Link href='/onboarding'>
                Kostenlos starten
                <IconArrowRight className='ml-2 size-4' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='w-full sm:w-auto'>
              <Link href='#features'>Features entdecken</Link>
            </Button>
          </div>
        </div>

        <div className='mt-16 sm:mt-20'>
          <div className='relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5'>
            <div className='flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3'>
              <div className='flex gap-1.5'>
                <div className='size-3 rounded-full bg-destructive/60' />
                <div className='size-3 rounded-full bg-yellow-500/60' />
                <div className='size-3 rounded-full bg-green-500/60' />
              </div>
              <span className='text-xs text-muted-foreground'>OrderLink Admin Tool</span>
            </div>
            <div className='aspect-[16/9] bg-gradient-to-br from-muted/30 to-muted/10 p-8'>
              <div className='grid h-full grid-cols-4 gap-4'>
                <div className='col-span-1 rounded-xl bg-card/80 p-4 ring-1 ring-border'>
                  <div className='mb-4 h-3 w-20 rounded bg-muted' />
                  <div className='space-y-2'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className='flex items-center gap-2'>
                        <div className='size-6 rounded-lg bg-primary/10' />
                        <div className='h-2 flex-1 rounded bg-muted' />
                      </div>
                    ))}
                  </div>
                </div>
                <div className='col-span-3 rounded-xl bg-card/80 p-4 ring-1 ring-border'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='h-3 w-32 rounded bg-muted' />
                    <div className='h-8 w-24 rounded-lg bg-primary/20' />
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='rounded-lg bg-muted/30 p-4'>
                        <div className='mb-2 h-2 w-16 rounded bg-muted' />
                        <div className='text-2xl font-bold text-primary'>
                          {i === 1 ? '1,234' : i === 2 ? '567' : '89'}
                        </div>
                        <div className='mt-1 h-1.5 w-12 rounded bg-muted' />
                      </div>
                    ))}
                  </div>
                  <div className='mt-4 space-y-2'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='flex items-center gap-4 rounded-lg bg-muted/20 p-3'>
                        <div className='size-8 rounded-lg bg-primary/10' />
                        <div className='flex-1 space-y-1'>
                          <div className='h-2 w-32 rounded bg-muted' />
                          <div className='h-1.5 w-24 rounded bg-muted/60' />
                        </div>
                        <div className='h-6 w-16 rounded-full bg-primary/20' />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
