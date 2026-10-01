'use client';
import { ChevronDown, Maximize2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import Link from '@/components/common/Link';
import { useMessages, useNavigation, useWebsiteMetricsQuery } from '@/components/hooks';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { percentFilter } from '@/lib/filters';
import { BAR_ROW_HEIGHT, BarList, type BarListRow } from './BarList';

export interface BreakdownOption {
  type: string;
  label: string;
  /** Header for the label column, e.g. "Source" for referrers. Defaults to the tab label. */
  column?: string;
  /** Header for the value column. Defaults to "Visitors". */
  metric?: string;
}

export const REPORT_ROWS = 9;

const tabClass =
  'relative inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring';

export function ReportTabs({
  value,
  options,
  onChange,
  label,
  maxVisible = 3,
}: {
  value: string;
  options: { type: string; label: string }[];
  onChange: (type: string) => void;
  label: string;
  maxVisible?: number;
}) {
  const { t, labels } = useMessages();

  if (options.length < 2) {
    return null;
  }

  const visible = options.length > maxVisible + 1 ? options.slice(0, maxVisible) : options;
  const overflow = options.slice(visible.length);
  const activeOverflow = overflow.find(option => option.type === value);

  return (
    <div role="tablist" aria-label={label} className="-mr-1.5 flex items-center">
      {visible.map(option => {
        const active = option.type === value;

        return (
          <button
            key={option.type}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.type)}
            className={cn(
              tabClass,
              active
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {option.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-1.5 -bottom-0.5 h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
      {overflow.length > 0 && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            className={cn(
              tabClass,
              'data-[state=open]:bg-accent',
              activeOverflow
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {activeOverflow ? activeOverflow.label : t(labels.more)}
            <ChevronDown className="size-3 opacity-60" />
            {activeOverflow && (
              <span
                aria-hidden
                className="absolute inset-x-1.5 -bottom-0.5 h-0.5 rounded-full bg-primary"
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {overflow.map(option => (
              <DropdownMenuItem
                key={option.type}
                onSelect={() => onChange(option.type)}
                className={cn(option.type === value && 'bg-accent font-medium')}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function ReportCard({
  title,
  tabs,
  footer,
  className,
  children,
}: {
  title: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-panel=""
      className={cn(
        'flex min-w-0 flex-col rounded-lg border border-border bg-card px-4 pt-3 pb-2 text-card-foreground shadow-card sm:px-5',
        className,
      )}
    >
      <header className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {tabs}
      </header>
      <div className="flex min-h-0 flex-1 flex-col pt-2">{children}</div>
      {footer && <footer className="flex items-center justify-end pt-1">{footer}</footer>}
    </section>
  );
}

export function ReportColumns({ label, metric }: { label: string; metric: string }) {
  return (
    <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      <span className="truncate">{label}</span>
      <span>{metric}</span>
    </div>
  );
}

export function DetailsLink({ href }: { href: string }) {
  const { t, labels } = useMessages();

  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Maximize2 className="size-3" />
      {t(labels.details)}
    </Link>
  );
}

export function BreakdownList({
  websiteId,
  type,
  limit = REPORT_ROWS,
  minRows = limit,
}: {
  websiteId: string;
  type: string;
  limit?: number;
  minRows?: number;
}) {
  const { data, isLoading, isFetching } = useWebsiteMetricsQuery(
    websiteId,
    { type, limit },
    {
      // Keep rows on screen while the date range or filters change; only switching
      // dimensions (a different `type`) starts from a skeleton.
      placeholderData: (previous: any, previousQuery: any) =>
        previousQuery?.queryKey?.[1]?.type === type ? previous : undefined,
    },
  );

  const rows = useMemo<BarListRow[]>(() => {
    return percentFilter((data || []) as any[]).map(({ x, y, z, ...rest }) => ({
      label: x,
      count: y,
      percent: z,
      ...rest,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-0.5"
        style={{ minHeight: minRows * (BAR_ROW_HEIGHT + 2) }}
        aria-hidden
      >
        {Array.from({ length: Math.min(minRows, 6) }, (_, index) => (
          <Skeleton
            key={index}
            className="rounded-md"
            style={{ height: BAR_ROW_HEIGHT, width: `${92 - index * 13}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
      <BarList
        rows={rows}
        minRows={minRows}
        renderLabel={row => <MetricLabel type={type} data={row} />}
      />
    </div>
  );
}

export function BreakdownCard({
  title,
  websiteId,
  options,
  limit = REPORT_ROWS,
  value,
  onChange,
  className,
  children,
}: {
  title: string;
  websiteId: string;
  options: BreakdownOption[];
  limit?: number;
  value?: string;
  onChange?: (type: string) => void;
  className?: string;
  children?: ReactNode;
}) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const [internal, setInternal] = useState(options[0]?.type);
  const type = value || internal;
  const option = options.find(item => item.type === type) || options[0];

  return (
    <ReportCard
      title={title}
      className={className}
      tabs={
        <ReportTabs
          label={title}
          value={type}
          options={options}
          onChange={next => (onChange ? onChange(next) : setInternal(next))}
        />
      }
      footer={<DetailsLink href={updateParams({ view: type })} />}
    >
      {children}
      <ReportColumns
        label={option?.column || option?.label}
        metric={option?.metric || t(labels.visitors)}
      />
      <BreakdownList websiteId={websiteId} type={type} limit={limit} />
    </ReportCard>
  );
}
