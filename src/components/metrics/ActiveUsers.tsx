import { useMemo } from 'react';
import Link from '@/components/common/Link';
import { useActiveUsersQuery, useMessages } from '@/components/hooks';
import { cn } from '@/lib/cn';

export function LiveDot({
  active = true,
  pulseKey,
  className,
}: {
  active?: boolean;
  /** Changing this replays the pulse, e.g. when the visitor count updates. */
  pulseKey?: string | number;
  className?: string;
}) {
  return (
    <span className={cn('relative flex size-2 shrink-0', className)} aria-hidden>
      {active && (
        <span
          key={pulseKey}
          className="live-ping absolute inline-flex size-full rounded-full bg-live"
        />
      )}
      <span
        className={cn(
          'relative inline-flex size-2 rounded-full',
          active ? 'bg-live' : 'bg-subtle-foreground',
        )}
      />
    </span>
  );
}

export function ActiveUsers({
  websiteId,
  value,
  refetchInterval = 30000,
  allowLink = true,
  href,
  hideWhenEmpty = false,
}: {
  websiteId: string;
  value?: number;
  refetchInterval?: number;
  allowLink?: boolean;
  href?: string;
  hideWhenEmpty?: boolean;
}) {
  const { t, labels } = useMessages();
  // Polling pauses automatically while the tab is hidden (React Query's default).
  const { data } = useActiveUsersQuery(websiteId, { refetchInterval });

  const count = useMemo(() => {
    if (websiteId) {
      return data?.visitors || 0;
    }

    return value !== undefined ? value : 0;
  }, [data, value, websiteId]);

  if (count === 0 && hideWhenEmpty) {
    return null;
  }

  const content = (
    <span className="inline-flex items-center gap-2 text-[13px] whitespace-nowrap text-muted-foreground">
      <LiveDot active={count > 0} pulseKey={count} />
      <span>
        <span className="font-semibold text-foreground tabular-nums">{count.toLocaleString()}</span>{' '}
        {t(labels.currentVisitors)}
      </span>
    </span>
  );

  if (!allowLink) {
    return content;
  }

  return (
    <Link
      href={href || `/websites/${websiteId}/realtime`}
      className="-mx-1.5 rounded-md px-1.5 py-1 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
