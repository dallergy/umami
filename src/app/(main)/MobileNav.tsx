'use client';
import { useState } from 'react';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import Link from '@/components/common/Link';
import { useMessages, useNavigation } from '@/components/hooks';
import { Globe, Grid2x2, LayoutDashboard, LinkIcon, Menu } from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';
import { SidebarLink, SidebarSection } from '@/components/nav/SidebarLink';
import { Logo } from '@/components/svg';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AdminNav } from './admin/AdminNav';
import { SettingsNav } from './settings/SettingsNav';

export function MobileNav() {
  const { t, labels } = useMessages();
  const { pathname, websiteId, renderUrl } = useNavigation();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.includes('/admin');
  const isSettings = pathname.includes('/settings');
  const isMain = !websiteId && !isAdmin && !isSettings;
  const close = () => setOpen(false);

  const links = [
    {
      id: 'boards',
      label: t(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: t(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: t(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: t(labels.pixels),
      path: '/pixels',
      icon: <Grid2x2 />,
    },
  ];

  return (
    <div className="flex w-full items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu />
        </Button>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Logo className="size-5" />
              umami
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
            {isMain && (
              <SidebarSection>
                {links.map(link => (
                  <SidebarLink
                    key={link.id}
                    href={renderUrl(link.path)}
                    label={link.label}
                    icon={link.icon}
                    onClick={close}
                  />
                ))}
              </SidebarSection>
            )}
            {websiteId && <WebsiteNav websiteId={websiteId} onItemClick={close} />}
            {isAdmin && <AdminNav onItemClick={close} />}
            {isSettings && <SettingsNav onItemClick={close} />}
          </div>
          <div className="border-t border-sidebar-border p-2">
            <UserButton onClose={close} />
          </div>
        </SheetContent>
      </Sheet>
      <Link
        href={renderUrl('/websites')}
        className="flex flex-1 items-center justify-center gap-2 text-foreground"
      >
        <Logo className="size-5" />
        <span className="text-sm font-semibold tracking-tight">umami</span>
      </Link>
    </div>
  );
}
