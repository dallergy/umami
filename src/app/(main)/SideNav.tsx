import { Icon } from '@umami/react-zen';
import { AdminNav } from '@/app/(main)/admin/AdminNav';
import { SettingsNav } from '@/app/(main)/settings/SettingsNav';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import Link from '@/components/common/Link';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import {
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  PanelLeft,
  PanelsLeftBottom,
} from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';
import { SidebarLink, SidebarSection } from '@/components/nav/SidebarLink';
import { Logo } from '@/components/svg';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/cn';

export function SideNav() {
  const { t, labels } = useMessages();
  const { pathname, renderUrl, websiteId, teamId } = useNavigation();
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed', false);

  const links = [
    ...(!teamId
      ? [
          {
            id: 'dashboard',
            label: t(labels.dashboard),
            path: '/dashboard',
            icon: <PanelsLeftBottom />,
          },
        ]
      : []),
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
    <aside
      className="flex h-full min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      style={{
        width: isCollapsed ? 60 : 240,
        transition: 'width 0.2s ease-in-out',
      }}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2 px-3',
          isCollapsed && 'justify-center px-2',
        )}
      >
        {!isCollapsed && (
          <Link
            href={renderUrl('/websites', false)}
            className="flex min-w-0 flex-1 items-center gap-2 text-sidebar-foreground"
          >
            <Logo className="size-5 shrink-0" />
            <span className="truncate text-sm font-semibold tracking-tight">umami</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle sidebar"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Icon strokeColor="muted">
            <PanelLeft />
          </Icon>
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className={cn('flex flex-col gap-1 px-2 pb-3', isCollapsed && 'items-center')}>
          {websiteId ? (
            <WebsiteNav websiteId={websiteId} isCollapsed={isCollapsed} />
          ) : pathname.includes('/settings') ? (
            <SettingsNav isCollapsed={isCollapsed} />
          ) : pathname.includes('/admin') ? (
            <AdminNav />
          ) : (
            <SidebarSection>
              {links.map(({ id, path, label, icon }) => {
                const href = renderUrl(path, false);
                return (
                  <SidebarLink
                    key={id}
                    href={href}
                    label={label}
                    icon={icon}
                    collapsed={isCollapsed}
                    selected={pathname.startsWith(href)}
                  />
                );
              })}
            </SidebarSection>
          )}
        </div>
      </ScrollArea>
      <div className={cn('shrink-0 border-t border-sidebar-border p-2', isCollapsed && 'px-1.5')}>
        <UserButton showText={!isCollapsed} />
      </div>
    </aside>
  );
}
