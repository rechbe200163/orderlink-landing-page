import Link from 'next/link';

const footerLinks = {
  produkt: [
    { label: 'Features', href: '#features' },
    { label: 'Preise', href: '#pricing' },
    { label: 'Dokumentation', href: '#' },
  ],
  unternehmen: [
    { label: 'Über uns', href: '#' },
    { label: 'Kontakt', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  rechtliches: [
    { label: 'Datenschutz', href: '#' },
    { label: 'Impressum', href: '#' },
    { label: 'AGB', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className='border-t border-border bg-muted/30'>
      <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <Link href='/' className='flex items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary'>
                <span className='text-sm font-bold text-primary-foreground'>OL</span>
              </div>
              <span className='text-xl font-semibold tracking-tight'>OrderLink</span>
            </Link>
            <p className='mt-4 text-sm text-muted-foreground'>
              Das ERP-System für kleine und mittlere Unternehmen. Modular, automatisiert, sofort startklar.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className='mb-4 text-sm font-semibold capitalize'>{category}</h3>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} OrderLink. Alle Rechte vorbehalten.
          </p>
          <div className='flex gap-6'>
            <Link href='#' className='text-sm text-muted-foreground transition-colors hover:text-foreground'>
              Twitter
            </Link>
            <Link href='#' className='text-sm text-muted-foreground transition-colors hover:text-foreground'>
              LinkedIn
            </Link>
            <Link href='#' className='text-sm text-muted-foreground transition-colors hover:text-foreground'>
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
