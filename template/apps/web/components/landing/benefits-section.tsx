import { IconRocket, IconScale, IconCloud } from '@tabler/icons-react';

const benefits = [
  {
    icon: IconRocket,
    title: 'Schnell startklar',
    description:
      'Keine langwierige Einrichtung. Registriere dich und starte sofort mit deinem eigenen System. In wenigen Minuten einsatzbereit.',
    stat: '5 Min',
    statLabel: 'Einrichtungszeit',
  },
  {
    icon: IconScale,
    title: 'Skalierbar',
    description:
      'Wächst mit deinem Unternehmen. Ob 10 oder 10.000 Bestellungen pro Monat – OrderLink skaliert mit deinen Anforderungen.',
    stat: '99.9%',
    statLabel: 'Verfügbarkeit',
  },
  {
    icon: IconCloud,
    title: 'Multi-Tenant SaaS',
    description:
      'Deine Daten sind sicher in der Cloud gespeichert. Automatische Backups, Updates und höchste Sicherheitsstandards inklusive.',
    stat: 'DSGVO',
    statLabel: 'Konform',
  },
];

export function BenefitsSection() {
  return (
    <section id='benefits' className='border-t border-border bg-muted/30 py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Warum OrderLink?
          </h2>
          <p className='mt-4 text-pretty text-lg text-muted-foreground'>
            Eine moderne Plattform, entwickelt für die Anforderungen von heute und morgen.
          </p>
        </div>

        <div className='mt-16 grid gap-8 lg:grid-cols-3'>
          {benefits.map((benefit) => (
            <div key={benefit.title} className='relative rounded-2xl bg-card p-8 ring-1 ring-border'>
              <div className='mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                <benefit.icon className='size-6' />
              </div>
              <h3 className='text-xl font-semibold'>{benefit.title}</h3>
              <p className='mt-3 text-muted-foreground leading-relaxed'>{benefit.description}</p>
              <div className='mt-6 flex items-baseline gap-2 border-t border-border pt-6'>
                <span className='text-3xl font-bold text-primary'>{benefit.stat}</span>
                <span className='text-sm text-muted-foreground'>{benefit.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
