'use client';
import { Icon, Tooltip, TooltipTrigger } from '@umami/react-zen';
import type { ReactNode } from 'react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/cn';

export function SidebarLink({
  href,
  label,
  icon,
  selected,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const item = (
    <span
      className={cn(
        'flex h-8 items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        selected && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        collapsed && 'size-8 justify-center px-0',
      )}
    >
      {icon ? (
        <Icon size="sm" color={selected ? undefined : 'muted'}>
          {icon}
        </Icon>
      ) : null}
      {!collapsed && <span className="truncate">{label}</span>}
    </span>
  );

  const link = (
    <Link
      href={href}
      role="button"
      onClick={onClick}
      className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {item}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <TooltipTrigger delay={0}>
      {link}
      <Tooltip placement="right">{label}</Tooltip>
    </TooltipTrigger>
  );
}

export function SidebarSection({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      {label ? (
        <div className="px-2 pt-4 pb-1 text-xs font-medium text-muted-foreground">{label}</div>
      ) : null}
      {children}
    </div>
  );
}
