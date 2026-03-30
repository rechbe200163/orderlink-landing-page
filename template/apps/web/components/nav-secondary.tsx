'use client';

import * as React from 'react';
import {
  IconBrightness,
  IconSettings,
  IconHelp,
  IconSearch,
} from '@tabler/icons-react';
import { useTheme } from 'next-themes';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Switch } from '@workspace/ui/components/switch';
import { SecondaryIconKey, SECONDARY_ICONS } from '@/config/icons';

type NavSecondaryItem = {
  title: string;
  url: string;
  icon: SecondaryIconKey;
};

export function NavSecondary({
  items,
  ...props
}: {
  items: readonly NavSecondaryItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = SECONDARY_ICONS[item.icon];

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} />}
                  tooltip={item.title}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          <SidebarMenuItem className='group-data-[collapsible=icon]:hidden'>
            <SidebarMenuButton
              render={<label className='flex w-full items-center gap-2' />}
            >
              <IconBrightness />
              <span>Dark Mode</span>
              {mounted ? (
                <Switch
                  className='ml-auto'
                  checked={resolvedTheme !== 'light'}
                  onCheckedChange={() =>
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
                  }
                />
              ) : (
                <Skeleton className='ml-auto h-4 w-8 rounded-full' />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
