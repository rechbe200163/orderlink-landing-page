import { Card, CardContent } from '@workspace/ui/components/card';
import {
  IconTableFilled,
  IconEyeOff,
  IconHandStop,
  IconLayoutDashboard,
  IconRefresh,
  IconChartBar,
  IconArrowRight,
} from '@tabler/icons-react';

const problems = [
  {
    icon: IconTableFilled,
    title: 'Excel Chaos',
    description: 'Verstreute Daten in unzähligen Tabellen und keine zentrale Übersicht.',
  },
  {
    icon: IconEyeOff,
    title: 'Keine Übersicht',
    description: 'Wichtige Informationen gehen verloren, Entscheidungen basieren auf Vermutungen.',
  },
  {
    icon: IconHandStop,
    title: 'Manuelle Prozesse',
    description: 'Zeitaufwendige Routineaufgaben binden wertvolle Ressourcen.',
  },
];

const solutions = [
  {
    icon: IconLayoutDashboard,
    title: 'Zentrale Plattform',
    description: 'Alle Daten an einem Ort, jederzeit und überall verfügbar.',
  },
  {
    icon: IconRefresh,
    title: 'Automatisierte Abläufe',
    description: 'Wiederkehrende Aufgaben werden automatisch erledigt.',
  },
  {
    icon: IconChartBar,
    title: 'Echtzeit-Daten',
    description: 'Aktuelle Kennzahlen und Reports auf Knopfdruck.',
  },
];

export function ProblemSolutionSection() {
  return (
    <section className='border-y border-border bg-muted/30 py-20 sm:py-28'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-balance text-3xl font-bold tracking-tight sm:text-4xl'>
            Von Problemen zu Lösungen
          </h2>
          <p className='mt-4 text-pretty text-lg text-muted-foreground'>
            Wir kennen die Herausforderungen kleiner und mittlerer Unternehmen und haben die passenden Antworten.
          </p>
        </div>

        <div className='mt-16 grid gap-8 lg:grid-cols-2'>
          <div>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive'>
              Probleme
            </div>
            <div className='space-y-4'>
              {problems.map((problem) => (
                <Card key={problem.title} className='border-destructive/20 bg-destructive/5'>
                  <CardContent className='flex items-start gap-4 p-5'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10'>
                      <problem.icon className='size-5 text-destructive' />
                    </div>
                    <div>
                      <h3 className='font-semibold'>{problem.title}</h3>
                      <p className='mt-1 text-sm text-muted-foreground'>{problem.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className='relative'>
            <div className='absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block'>
              <div className='flex size-10 items-center justify-center rounded-full bg-primary'>
                <IconArrowRight className='size-5 text-primary-foreground' />
              </div>
            </div>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
              Lösungen
            </div>
            <div className='space-y-4'>
              {solutions.map((solution) => (
                <Card key={solution.title} className='border-primary/20 bg-primary/5'>
                  <CardContent className='flex items-start gap-4 p-5'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                      <solution.icon className='size-5 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-semibold'>{solution.title}</h3>
                      <p className='mt-1 text-sm text-muted-foreground'>{solution.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
