'use client';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import Link from '@/components/common/Link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';

export interface NavTabItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface NavTabGroup {
  id: string;
  label: string;
  items: NavTabItem[];
}

export type NavTabEntry = NavTabItem | NavTabGroup;

function isGroup(entry: NavTabEntry): entry is NavTabGroup {
  return 'items' in entry;
}

const tabClass =
  'group relative inline-flex h-11 shrink-0 items-center text-[13px] font-medium outline-none transition-colors';

const tabInnerClass =
  'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 transition-colors group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-ring';

function ActiveIndicator() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-foreground dark:bg-primary"
    />
  );
}

export function NavTabs({
  items,
  selectedId,
  label,
  end,
  className,
}: {
  items: NavTabEntry[];
  selectedId?: string;
  label?: string;
  end?: ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep the active tab visible when the strip scrolls horizontally (phones, narrow windows).
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[data-active="true"]');

    if (!scroller || !active || scroller.scrollWidth <= scroller.clientWidth) {
      return;
    }

    const left = active.offsetLeft - scroller.clientWidth / 2 + active.clientWidth / 2;
    scroller.scrollLeft = Math.max(0, left);
  }, [selectedId]);

  return (
    <nav aria-label={label} className={cn('flex min-w-0 items-center', className)}>
      <div
        ref={scrollerRef}
        className="scrollbar-none -ml-2.5 flex min-w-0 flex-1 items-center overflow-x-auto"
      >
        {items.map(entry => {
          if (isGroup(entry)) {
            const activeChild = entry.items.find(item => item.id === selectedId);

            return (
              <DropdownMenu key={entry.id} modal={false}>
                <DropdownMenuTrigger
                  data-active={!!activeChild}
                  className={cn(
                    tabClass,
                    activeChild ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className={tabInnerClass}>
                    {activeChild ? (
                      <>
                        <span className="text-muted-foreground">{entry.label}</span>
                        <span className="text-subtle-foreground">/</span>
                        {activeChild.label}
                      </>
                    ) : (
                      entry.label
                    )}
                    <ChevronDown className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
                  </span>
                  {activeChild && <ActiveIndicator />}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-48">
                  {entry.items.map(item => (
                    <DropdownMenuItem
                      key={item.id}
                      asChild
                      className={cn(item.id === selectedId && 'bg-accent font-medium')}
                    >
                      <Link href={item.href}>
                        {item.icon && (
                          <span className="flex size-4 items-center justify-center text-muted-foreground [&_svg]:size-4">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          const active = entry.id === selectedId;

          return (
            <Link
              key={entry.id}
              href={entry.href}
              data-active={active}
              aria-current={active ? 'page' : undefined}
              className={cn(
                tabClass,
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className={tabInnerClass}>{entry.label}</span>
              {active && <ActiveIndicator />}
            </Link>
          );
        })}
      </div>
      {end && <div className="flex shrink-0 items-center pl-2">{end}</div>}
    </nav>
  );
}

export function NavTabLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      data-active={active}
      aria-current={active ? 'page' : undefined}
      className={cn(
        tabClass,
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <span className={cn(tabInnerClass, '[&_svg]:size-4')}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
      {active && <ActiveIndicator />}
    </Link>
  );
}
