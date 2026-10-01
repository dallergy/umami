'use client';
import { Settings } from 'lucide-react';
import { TopNav } from '@/app/(main)/TopNav';
import Link from '@/components/common/Link';
import { useMessages, useNavigation } from '@/components/hooks';
import { ThemeToggle } from '@/components/input/ThemeToggle';
import { UserButton } from '@/components/input/UserButton';
import { Logo } from '@/components/svg';
import { BreadcrumbSlash } from './BreadcrumbSlash';
import { NavTabLink, NavTabs } from './NavTabs';
import { useContextNav } from './useContextNav';

export const CONTAINER_CLASS = 'mx-auto w-full max-w-[1240px] px-4 md:px-6';

export function AppHeader() {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedId, settingsHref, settingsActive } = useContextNav();

  return (
    <header className="border-b border-border bg-card">
      <div className={`${CONTAINER_CLASS} flex h-14 items-center gap-1`}>
        <Link
          href={renderUrl('/websites', false)}
          aria-label="umami"
          className="flex shrink-0 items-center gap-2 rounded-md py-1 pr-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo className="size-6" />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">umami</span>
        </Link>
        <BreadcrumbSlash />
        <div className="min-w-0 flex-1">
          <TopNav />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <UserButton showText={false} placement="bottom" />
        </div>
      </div>
      {items.length > 0 && (
        <div className={CONTAINER_CLASS}>
          <NavTabs
            label={t(labels.navigation)}
            items={items}
            selectedId={selectedId}
            end={
              settingsHref ? (
                <NavTabLink
                  href={settingsHref}
                  label={t(labels.settings)}
                  icon={<Settings />}
                  active={settingsActive}
                />
              ) : null
            }
          />
        </div>
      )}
    </header>
  );
}
