import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'OrderLink - Dein ERP-System für KMU',
  description:
    'Verwalte Kunden, Bestellungen, Auslieferung und Analysen in einem System. Modular, automatisiert, sofort startklar.',
  keywords: ['ERP', 'KMU', 'Bestellungen', 'Kundenverwaltung', 'SaaS'],
  openGraph: {
    title: 'OrderLink - Dein ERP-System für KMU',
    description:
      'Verwalte Kunden, Bestellungen, Auslieferung und Analysen in einem System.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
