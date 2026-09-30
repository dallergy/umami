import type { ChartFocus } from '@/app/(main)/websites/[websiteId]/WebsiteChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useDateRange, useMessages } from '@/components/hooks';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
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
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });

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
          label: t(labels.bounceRate),
          value: (Math.min(visits, bounces) / visits) * 100,
          prev: (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          change:
            (Math.min(visits, bounces) / visits) * 100 -
            (Math.min(comparison.visits, comparison.bounces) / comparison.visits) * 100,
          formatValue: n => `${Math.round(+n)}%`,
          reverseColors: true,
        },
        {
          label: t(labels.visitDuration),
          value: totaltime / visits,
          prev: comparison.totaltime / comparison.visits,
          change: totaltime / visits - comparison.totaltime / comparison.visits,
          formatValue: n =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
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
      ]
    : null;

  if (variant === 'strip') {
    return (
      <LoadingPanel
        data={metrics}
        isLoading={isLoading}
        isFetching={isFetching}
        error={getErrorMessage(error)}
        minHeight="72px"
      >
        <div className="flex gap-1 overflow-x-auto">
          {metrics?.map(({ label, value, change, formatValue, reverseColors, chartFocus }) => {
            const selected = chartFocus && chartFocus === focus;
            const className = cn(
              'flex min-w-[7.25rem] flex-1 flex-col items-start rounded-lg px-2.5 py-1.5 text-left',
              chartFocus && 'cursor-pointer hover:bg-muted',
              selected && 'bg-muted ring-1 ring-border',
            );
            const body = (
              <>
                <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
                <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                  {formatValue ? formatValue(value) : value}
                </span>
                {!isAllTime && (
                  <ChangeLabel
                    value={change}
                    title={formatValue ? formatValue(change) : String(change)}
                    reverseColors={reverseColors}
                  >
                    {`${Math.abs(Math.round(relativeChange(value, change)))}%`}
                  </ChangeLabel>
                )}
              </>
            );

            if (!chartFocus) {
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
                onClick={() => onFocusChange?.(chartFocus)}
                className={className}
              >
                {body}
              </button>
            );
          })}
        </div>
      </LoadingPanel>
    );
  }

  return (
    <LoadingPanel
      data={metrics}
      isLoading={isLoading}
      isFetching={isFetching}
      error={getErrorMessage(error)}
      minHeight="136px"
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
