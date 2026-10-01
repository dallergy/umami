import { addHours, format, startOfDay } from 'date-fns';
import { type MouseEvent, useMemo, useRef, useState } from 'react';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useLocale, useMessages, useWeeklyTrafficQuery } from '@/components/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { getDayOfWeekAsDate } from '@/lib/date';

interface HoverCell {
  day: number;
  hour: number;
  left: number;
  top: number;
}

/**
 * Visitors by weekday and hour as a compact 7 × 24 heatmap. A single delegated
 * mouse handler drives one tooltip, instead of one tooltip instance per cell.
 */
export function WeeklyTraffic({ websiteId }: { websiteId: string }) {
  const { data, isLoading, error } = useWeeklyTrafficQuery(websiteId);
  const { dateLocale } = useLocale();
  const { labels, t } = useMessages();
  const [hover, setHover] = useState<HoverCell | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { weekStartsOn } = dateLocale.options;

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const index = ((weekStartsOn ?? 0) + i) % 7;
        const date = getDayOfWeekAsDate(index);

        return {
          index,
          short: format(date, 'EEE', { locale: dateLocale }),
          long: format(date, 'EEEE', { locale: dateLocale }),
        };
      }),
    [weekStartsOn, dateLocale],
  );

  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) =>
        format(addHours(startOfDay(new Date()), i), 'haaa', { locale: dateLocale }),
      ),
    [dateLocale],
  );

  const { max, peak } = useMemo(() => {
    let best = { day: -1, hour: -1, count: 0 };

    (data as number[][] | undefined)?.forEach((hoursOfDay, day) => {
      hoursOfDay.forEach((count, hour) => {
        if (count > best.count) {
          best = { day, hour, count };
        }
      });
    });

    return { max: best.count || 1, peak: best.count > 0 ? best : null };
  }, [data]);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]');
    const grid = gridRef.current;

    if (!cell || !grid) {
      setHover(prev => (prev ? null : prev));
      return;
    }

    const day = Number(cell.dataset.day);
    const hour = Number(cell.dataset.hour);

    if (hover?.day === day && hover?.hour === hour) {
      return;
    }

    const gridRect = grid.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();

    setHover({
      day,
      hour,
      left: rect.left - gridRect.left + rect.width / 2,
      top: rect.top - gridRect.top,
    });
  };

  if (error) {
    return <ErrorMessage />;
  }

  if (isLoading || !data) {
    return <Skeleton className="h-[220px] w-full rounded-md" />;
  }

  const hoverCount = hover ? data[hover.day]?.[hover.hour] || 0 : 0;
  const hoverDay = hover ? days.find(({ index }) => index === hover.day) : null;
  const peakDay = peak ? days.find(({ index }) => index === peak.day) : null;
  const cellColor = (level: number) =>
    `color-mix(in srgb, var(--chart-line) ${Math.round(level * 100)}%, var(--muted))`;

  return (
    <div className="relative select-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {peak && peakDay && (
            <>
              {t(labels.peak)}:{' '}
              <span className="font-medium text-foreground">
                {peakDay.long} {hours[peak.hour]}
              </span>{' '}
              · {peak.count.toLocaleString()} {t(labels.visitors).toLocaleLowerCase()}
            </>
          )}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          0
          {[0.06, 0.3, 0.55, 0.8, 1].map(level => (
            <span
              key={level}
              className="size-2.5 rounded-[2px]"
              style={{ backgroundColor: cellColor(level) }}
            />
          ))}
          {max.toLocaleString()}
        </span>
      </div>
      <div
        ref={gridRef}
        className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <div className="grid grid-rows-7 gap-[3px]">
          {days.map(({ index, short }) => (
            <div
              key={index}
              className="flex h-6 items-center text-[11px] leading-none text-muted-foreground"
            >
              {short}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-[3px]">
          {days.map(({ index }) => (
            <div key={index} className="grid grid-cols-24 gap-[3px]">
              {(data[index] || []).map((count: number, hour: number) => {
                const level = count > 0 ? 0.12 + (count / max) * 0.88 : 0.06;

                return (
                  <div
                    key={hour}
                    data-cell=""
                    data-day={index}
                    data-hour={hour}
                    className={cn(
                      'h-6 rounded-[3px]',
                      hover?.day === index &&
                        hover?.hour === hour &&
                        'outline-2 outline-offset-1 outline-foreground/50',
                    )}
                    style={{ backgroundColor: cellColor(level) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {hover && hoverDay && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-pop"
            style={{ left: hover.left, top: hover.top - 6 }}
          >
            <span className="font-medium">
              {hoverDay.long} {hours[hover.hour]}
            </span>
            <span className="text-muted-foreground">
              {' '}
              · {hoverCount.toLocaleString()} {t(labels.visitors).toLocaleLowerCase()}
            </span>
          </div>
        )}
      </div>
      <div className="mt-1.5 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2">
        <span />
        <div className="grid grid-cols-24 gap-[3px] text-[10px] leading-none text-muted-foreground">
          {hours.map((label, hour) => (
            <span key={label} className="overflow-visible whitespace-nowrap">
              {hour % 3 === 0 ? label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
