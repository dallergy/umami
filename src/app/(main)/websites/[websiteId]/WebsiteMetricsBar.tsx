import type { ChartFocus } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useMessages } from '@/components/hooks';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { formatLongNumber, formatShortTime } from '@/lib/format';

export function WebsiteMetricsBar({
  websiteId,
  compareMode,
  variant = 'cards',
  focus,
  onFocusChange,
}: {
  websiteId: string;
  showChange?: boolean;
  compareMode?: boolean;
  variant?: 'cards' | 'strip';
  focus?: ChartFocus;
  onFocusChange?: (focus: ChartFocus) => void;
}) {
  const { isAllTime, dateCompare } = useDateRange();
  const { t, labels, getErrorMessage } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery(
    {
      websiteId,
      compare: compareMode ? dateCompare?.compare : undefined,
    },
    // Keep the last numbers on screen while a new range loads instead of flashing a
    // skeleton, but never show another website's numbers.
    {
      placeholderData: (previous: any, previousQuery: any) =>
        previousQuery?.queryKey?.[1]?.websiteId === websiteId ? previous : undefined,
    } as any,
  );

  const { pageviews, visitors, visits, bounces, totaltime, comparison } = data || {};

  const metrics = data
    ? [
        {
          value: visitors,
          label: t(labels.visitors),
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
          chartFocus: 'visitors' as const,
        },
        {
          value: visits,
          label: t(labels.visits),
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          value: pageviews,
          label: t(labels.views),
          change: pageviews - comparison.pageviews,
          formatValue: formatLongNumber,
          chartFocus: 'views' as const,
        },
        {
          label: t(labels.viewsPerVisit),
          value: visits ? pageviews / visits : 0,
          prev: comparison.visits ? comparison.pageviews / comparison.visits : 0,
          change:
            (visits ? pageviews / visits : 0) -
            (comparison.visits ? comparison.pageviews / comparison.visits : 0),
          formatValue: n => (Number.isFinite(+n) ? (+n).toFixed(2) : '0'),
        },
        {
          label: t(labels.bounceRate),
          value: visits ? (Math.min(visits, bounces) / visits) * 100 : 0,
          prev: comparison.visits
            ? (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100
            : 0,
          change:
            (visits ? (Math.min(visits, bounces) / visits) * 100 : 0) -
            (comparison.visits
              ? (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100
              : 0),
          formatValue: n => `${Math.round(+n)}%`,
          reverseColors: true,
        },
        {
          label: t(labels.visitDuration),
          value: visits ? totaltime / visits : 0,
          prev: comparison.visits ? comparison.totaltime / comparison.visits : 0,
          change:
            (visits ? totaltime / visits : 0) -
            (comparison.visits ? comparison.totaltime / comparison.visits : 0),
          formatValue: n =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
      ]
    : null;

  if (variant === 'strip') {
    if (error) {
      return <ErrorMessage />;
    }

    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
          isFetching && !isLoading && 'opacity-70 transition-opacity',
        )}
      >
        {(metrics || Array.from({ length: 6 }, () => null)).map((metric, index) => {
          if (!metric) {
            return (
              <div key={index} className="flex flex-col gap-2 px-4 py-4 sm:px-5" aria-hidden>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            );
          }

          const { label, value, change, formatValue, reverseColors, chartFocus } = metric;
          const selected = !!chartFocus && chartFocus === focus;
          const pct = relativeChange(value, change);
          const body = (
            <>
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase',
                  selected ? 'text-primary dark:text-indigo-300' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className="text-[22px] leading-8 font-bold tracking-tight text-foreground tabular-nums"
                  title={String(value)}
                >
                  {formatValue ? formatValue(value) : value}
                </span>
                {!isAllTime && (
                  <Change
                    value={pct}
                    reverse={reverseColors}
                    title={formatValue ? formatValue(change) : String(change)}
                  />
                )}
              </span>
              {selected && (
                <span
                  aria-hidden
                  className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary sm:inset-x-5"
                />
              )}
            </>
          );
          const className = cn(
            'relative flex min-w-0 flex-col items-start gap-0.5 px-4 py-4 text-left outline-none sm:px-5',
            'border-border [&:not(:first-child)]:lg:border-l',
          );

          if (!chartFocus || !onFocusChange) {
            return (
              <div key={label} className={className}>
                {body}
              </div>
            );
          }

          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => onFocusChange(chartFocus)}
              className={cn(
                className,
                'cursor-pointer transition-colors hover:bg-accent/60 focus-visible:bg-accent/60',
                'first:rounded-tl-lg',
              )}
            >
              {body}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <LoadingPanel
      data={metrics}
      isLoading={isLoading}
      isFetching={isFetching}
      error={getErrorMessage(error)}
      minHeight="112px"
    >
      <MetricsBar>
        {metrics?.map(({ label, value, prev, change, formatValue, reverseColors }) => {
          return (
            <MetricCard
              key={label}
              value={value}
              previousValue={prev}
              label={label}
              change={change}
              formatValue={formatValue}
              reverseColors={reverseColors}
              showChange={!isAllTime}
            />
          );
        })}
      </MetricsBar>
    </LoadingPanel>
  );
}

function Change({ value, reverse, title }: { value: number; reverse?: boolean; title?: string }) {
  const rounded = Math.round(value);

  if (!Number.isFinite(value) || rounded === 0) {
    return (
      <span className="text-xs font-medium text-muted-foreground tabular-nums" title={title}>
        0%
      </span>
    );
  }

  const good = reverse ? rounded < 0 : rounded > 0;

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
        good ? 'text-positive' : 'text-negative',
      )}
    >
      <svg viewBox="0 0 10 10" className={cn('size-2.5', rounded < 0 && 'rotate-180')} aria-hidden>
        <path d="M5 1.5 9 7.5H1z" fill="currentColor" />
      </svg>
      {Math.abs(rounded)}%
    </span>
  );
}

function relativeChange(value: number, change: number) {
  const previous = value - change;

  if (!Number.isFinite(value) || !Number.isFinite(change)) {
    return 0;
  }

  if (previous === 0) {
    return value === 0 ? 0 : 100;
  }

  return (change / previous) * 100;
}
