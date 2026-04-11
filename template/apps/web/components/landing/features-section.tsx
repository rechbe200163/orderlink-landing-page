import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import {
  IconUsers,
  IconShoppingCart,
  IconChartBar,
  IconRoute,
} from '@tabler/icons-react';

const features = [
  {
    icon: IconUsers,
    title: 'Admin Tool',
    description: 'Zentrale Verwaltung von Kunden und Bestellungen',
    details: [
      'Kundendatenbank mit Kontakthistorie',
      'Bestellverwaltung und Status-Tracking',
      'Automatische Benachrichtigungen',
      'Rechnungserstellung und Export',
    ],
  },
  {
    icon: IconChartBar,
    title: 'Data Analysis',
    description: 'Intelligente Auswertungen und Reports',
    details: [
      'Umsatz- und Bestellanalysen',
      'Kundenverhalten verstehen',
      'Trendprognosen',
      'Individuelle Dashboards',
    ],
  },
  {
    icon: IconRoute,
    title: 'Navigation',
    description: 'Effiziente Routenplanung für Auslieferungen',
    details: [
      'Optimierte Tourenplanung',
      'Echtzeit-Tracking',
      'Zeitfenster-Management',
      'Integration mit Kartendiensten',
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id='features' className='py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
            Module
          </div>
          <h2 className='text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Alles was dein Unternehmen braucht
          </h2>
          <p className='mt-4 text-pretty text-lg text-muted-foreground'>
            Drei leistungsstarke Module, die nahtlos zusammenarbeiten und sich deinen Anforderungen anpassen.
          </p>
        </div>

        <div className='mt-16 grid gap-8 md:grid-cols-3'>
          {features.map((feature) => (
            <Card key={feature.title} className='group relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5'>
              <div className='absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
              <CardHeader className='relative'>
                <div className='mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20'>
                  <feature.icon className='size-6 text-primary' />
                </div>
                <CardTitle className='text-xl'>{feature.title}</CardTitle>
                <CardDescription className='text-base'>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className='relative'>
                <ul className='space-y-3'>
                  {feature.details.map((detail) => (
                    <li key={detail} className='flex items-start gap-3'>
                      <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-primary' />
                      <span className='text-sm text-muted-foreground'>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
