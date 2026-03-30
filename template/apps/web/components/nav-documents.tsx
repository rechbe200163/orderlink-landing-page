'use client';

import {
  IconDatabase,
  IconDots,
  IconFolder,
  IconReport,
  IconShare3,
  IconTrash,
} from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';

const ICONS = {
  dataLibrary: IconDatabase,
  reports: IconReport,
  wordAssistant: IconFolder,
} as const;

export type IconKey = keyof typeof ICONS;

export function NavDocuments({
  items,
}: {
  items: readonly {
    title: string;
    url: string;
    icon: IconKey;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Documents</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const Icon = ICONS[item.icon];

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<a href={item.url} />}
                tooltip={item.title}
              >
                <Icon />
                <span>{item.title}</span>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className='data-[state=open]:bg-accent rounded-sm'
                    >
                      <IconDots />
                      <span className='sr-only'>More</span>
                    </SidebarMenuAction>
                  }
                />

                <DropdownMenuContent
                  className='w-24 rounded-lg'
                  side={isMobile ? 'bottom' : 'right'}
                  align={isMobile ? 'end' : 'start'}
                >
                  <DropdownMenuItem>
                    <IconFolder />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconShare3 />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant='destructive'>
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}

        <SidebarMenuItem>
          <SidebarMenuButton
            className='text-sidebar-foreground/70'
            tooltip='More'
          >
            <IconDots className='text-sidebar-foreground/70' />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
