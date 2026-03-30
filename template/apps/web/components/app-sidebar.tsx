import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarContent,
  SidebarFooter,
} from '@workspace/ui/components/sidebar';
import SideBarHeader from './sidebar-navHeader';
import { NavMain } from './nav-main';
import { Suspense } from 'react';
import { NavUser } from './nav-user';
import { NavDocuments } from './nav-documents';
import { documentItems, navMain, navSecondary } from '@/config/nav';
import { NavSecondary } from './nav-secondary';
import { getSession } from '@/lib/auth/session';
import { unauthorized } from 'next/navigation';

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();
  if (!session.user) unauthorized();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Suspense fallback={<div>Loading...</div>}>
              <SideBarHeader />
            </Suspense>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documentItems} />
        <NavSecondary items={navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
