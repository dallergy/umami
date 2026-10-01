import { isSameDay } from 'date-fns';
import { type ReactNode, useCallback, useMemo } from 'react';
import type { ChartAnnotation } from '@/components/charts/ChartAnnotationMarkers';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import {
  useDateParameters,
  useDateRange,
  useMessages,
  useNavigation,
  useTimezone,
  useWebsiteAnnotationsQuery,
} from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { TrafficChart, type TrafficSeries } from '@/components/metrics/TrafficChart';
import { Skeleton } from '@/components/ui/skeleton';
import { type AnnotationRange, getAnnotationDateRangeValue } from '@/lib/annotations';
import { cn } from '@/lib/cn';
import { DATE_FUNCTIONS, getDateRangeValue } from '@/lib/date';

export type ChartFocus = 'visitors' | 'views';

export function WebsiteChart({
  websiteId,
  compareMode,
  showAnnotations,
  onAnnotationMoreClick,
  legendActions,
  focus,
  chartHeight = '280px',
  showLegend = true,
}: {
  websiteId: string;
  compareMode?: boolean;
  showAnnotations?: boolean;
  onAnnotationMoreClick?: (range: AnnotationRange) => void;
  legendActions?: ReactNode;
  focus?: ChartFocus;
  chartHeight?: string;
  showLegend?: boolean;
}) {
  const { t, labels } = useMessages();
  const { timezone, localFromUtc, localToUtc } = useTimezone();
  const { dateRange, dateCompare } = useDateRange({ timezone: timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { startAt, endAt } = useDateParameters();
  const { router, updateParams } = useNavigation();
  const { data: annotationData } = useWebsiteAnnotationsQuery(
    websiteId,
    { startAt, endAt, pageSize: 1000 },
    { enabled: !!showAnnotations && !!websiteId },
  );
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });
  const canDrillIntoAnnotation =
    unit !== 'hour' && unit !== 'minute' && !isSameDay(startDate, endDate);
  const compareLabel =
    dateCompare?.compare === 'yoy' ? t(labels.previousYear) : t(labels.previousPeriod);

  const series = useMemo<TrafficSeries[]>(() => {
    if (!data) {
      return [];
    }

    const { pageviews = [], sessions = [], compare } = data as any;

    const withCompareDates = (current: any[], previous?: any[]) =>
      previous
        ? current.map(({ x }, i) => ({ x, y: previous[i]?.y, d: previous[i]?.x }))
        : undefined;

    const visitors: TrafficSeries = {
      id: 'visitors',
      label: t(labels.visitors),
      data: sessions,
      compareData: withCompareDates(sessions, compare?.sessions),
      compareLabel,
    };

    const views: TrafficSeries = {
      id: 'views',
      label: t(labels.views),
      data: pageviews,
      compareData: withCompareDates(pageviews, compare?.pageviews),
      compareLabel,
    };

    if (focus === 'views') {
      return [views];
    }

    if (focus === 'visitors') {
      return [visitors];
    }

    return [visitors, views];
  }, [data, focus, compareLabel, t, labels]);

  const annotations = useMemo<ChartAnnotation[]>(() => {
    const isSubDayUnit = unit === 'hour' || unit === 'minute';

    return (annotationData?.data || [])
      .filter(({ allDay }) => !isSubDayUnit || allDay === false)
      .map(({ id, date, note, allDay }) => {
        const annotationDate = localFromUtc(new Date(date));

        return {
          id,
          date: annotationDate,
          markerDate: DATE_FUNCTIONS[unit].start(annotationDate),
          label: note,
          allDay,
          isClickable: canDrillIntoAnnotation,
          isGroupClickable: unit === 'month',
        };
      });
  }, [annotationData, timezone, unit, canDrillIntoAnnotation]);

  const handleAnnotationClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const [annotation] = annotations;
      const hasOneDate = annotations.every(item => isSameDay(item.date, annotation.date));

      if (hasOneDate) {
        router.push(
          updateParams({
            date: getAnnotationDateRangeValue(annotation.date, annotation.allDay !== false),
            offset: undefined,
          }),
        );
        return;
      }

      const markerDate = annotation.markerDate || annotation.date;
      const startDate = DATE_FUNCTIONS.month.start(markerDate);
      const endDate = DATE_FUNCTIONS.month.end(markerDate);

      router.push(
        updateParams({
          date: `range:${startDate.getTime()}:${endDate.getTime()}`,
          offset: undefined,
        }),
      );
    },
    [router, updateParams],
  );

  const handleAnnotationMoreClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const markerDate = annotations[0].markerDate || annotations[0].date;
      const { start, end } = DATE_FUNCTIONS[unit];

      onAnnotationMoreClick?.({
        startAt: +localToUtc(start(markerDate)),
        endAt: +localToUtc(end(markerDate)),
      });
    },
    [localToUtc, onAnnotationMoreClick, unit],
  );

  // Clicking a day (or month) in the graph zooms the whole dashboard into that period.
  const handleBucketClick = useCallback(
    (start: Date, end: Date) => {
      router.push(
        updateParams({ date: getDateRangeValue(start, end), offset: undefined, unit: undefined }),
      );
    },
    [router, updateParams],
  );

  const showHeader = showLegend && (series.length > 1 || compareMode || legendActions);

  return (
    <div className="flex flex-col gap-2">
      {showHeader && (
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {series.length > 1 &&
              series.map((item, index) => (
                <span key={item.id} className="flex items-center gap-1.5">
                  <span
                    className={cn('size-2 rounded-full bg-primary', index > 0 && 'opacity-45')}
                  />
                  {item.label}
                </span>
              ))}
            {compareMode && (
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-3 border-t-[1.5px] border-dashed border-current" />
                {compareLabel}
              </span>
            )}
          </div>
          {legendActions && <div className="ml-auto flex items-center gap-1">{legendActions}</div>}
        </div>
      )}
      {error ? (
        <ErrorMessage />
      ) : isLoading || !data ? (
        <Skeleton className="w-full rounded-md" style={{ height: chartHeight }} />
      ) : (
        <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
          <TrafficChart
            key={value}
            series={series}
            unit={unit}
            minDate={startDate}
            maxDate={endDate}
            height={chartHeight}
            annotations={annotations}
            onAnnotationClick={handleAnnotationClick}
            onAnnotationMoreClick={onAnnotationMoreClick ? handleAnnotationMoreClick : undefined}
            onBucketClick={handleBucketClick}
          />
        </div>
      )}
    </div>
  );
}
