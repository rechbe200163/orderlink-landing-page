import Link from 'next/link';
import React from 'react';
import { SidebarMenuButton } from '@workspace/ui/components/sidebar';

async function ErrorComponent() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>Error</h1>
        <p className='mt-2 text-gray-600'>
          An error occurred while loading the sidebar header.
        </p>
      </div>
    </div>
  );
}

interface SideBarHeaderProps {
  homeName?: string;
}

const SideBarHeader = async ({
  homeName = 'Rechberger HomeLink',
}: SideBarHeaderProps) => {
  if (!homeName) {
    return <ErrorComponent />;
  }

  return (
    <SidebarMenuButton
      render={<Link href='/' />}
      className='data-[slot=sidebar-menu-button]:p-1.5!'
    >
      {/* <ArrowUpCircleIcon className='h-5 w-5' /> */}
      <span className='text-base font-semibold'>{homeName}</span>
    </SidebarMenuButton>
  );
};

export default SideBarHeader;
