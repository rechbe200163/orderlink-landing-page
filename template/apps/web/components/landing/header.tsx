'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Vorteile', href: '#benefits' },
  { label: 'Preise', href: '#pricing' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-primary'>
            <span className='text-sm font-bold text-primary-foreground'>
              OL
            </span>
          </div>
          <span className='text-xl font-semibold tracking-tight'>
            OrderLink
          </span>
        </Link>

        <nav className='hidden items-center gap-8 md:flex'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='hidden items-center gap-3 md:flex'>
          <Button variant='ghost'>
            <Link href='/auth/signin'>Anmelden</Link>
          </Button>
          <Button>
            <Link href='/onboarding'>Kostenlos starten</Link>
          </Button>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='md:hidden'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <IconX className='size-5' />
          ) : (
            <IconMenu2 className='size-5' />
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className='border-t border-border bg-background px-4 py-4 md:hidden'>
          <nav className='flex flex-col gap-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className='flex flex-col gap-2 pt-4'>
              <Button variant='outline' className='w-full'>
                <Link href='/auth/signin'>Anmelden</Link>
              </Button>
              <Button className='w-full'>
                <Link href='/onboarding'>Kostenlos starten</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
