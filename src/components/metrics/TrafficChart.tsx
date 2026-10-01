import { useTheme } from '@umami/react-zen';
import type { Plugin, ScriptableContext, TooltipModel } from 'chart.js';
import { colord } from 'colord';
import { isAfter, parse } from 'date-fns';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Chart, type ChartProps } from '@/components/charts/Chart';
import { useLocale } from '@/components/hooks';
import { cn } from '@/lib/cn';
import { getThemeColors } from '@/lib/colors';
import {
  DATE_FORMATS,
  DATE_FUNCTIONS,
  formatDate,
  generateTimeSeries,
  parseBackendDate,
} from '@/lib/date';
import { formatLongNumber } from '@/lib/format';

const MemoChart = memo(Chart);

export interface TrafficSeries {
  id: string;
  label: string;
  data: { x: string; y: number }[];
  compareData?: { x: string; y: number }[];
  compareLabel?: string;
  formatValue?: (n: number) => string;
}

export interface TrafficChartProps
  extends Omit<ChartProps, 'chartData' | 'chartOptions' | 'type' | 'onClick'> {
  series: TrafficSeries[];
  unit: string;
  minDate: Date;
  maxDate: Date;
  height?: string;
  onBucketClick?: (start: Date, end: Date) => void;
}

const TICK_FORMATS = {
  minute: 'p',
  hour: 'p',
  day: 'MMM d',
  week: 'MMM d',
  month: 'MMM',
  year: 'yyyy',
};

const TITLE_FORMATS = {
  minute: 'p',
  hour: 'EEE, MMM d · p',
  day: 'EEE, MMM d',
  week: 'MMM d',
  month: 'MMMM yyyy',
  year: 'yyyy',
};

interface HoverState {
  index: number;
  x: number;
  flip: boolean;
}

function parseBucket(label: string, unit: string) {
  return parse(label, DATE_FORMATS[unit], new Date());
}

/**
 * Creates (and caches) a vertical gradient for an area fill. Gradients are only
 * rebuilt when the chart area changes size, not on every animation frame.
 */
function createAreaFill(color: string, strength: number) {
  let cache: { top: number; bottom: number; gradient: CanvasGradient } | null = null;
  const solid = colord(color);

  return (context: ScriptableContext<'line'>) => {
    const { chart } = context;
    const area = chart.chartArea;

    if (!area) {
      return 'transparent';
    }

    if (!cache || cache.top !== area.top || cache.bottom !== area.bottom) {
      const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
      gradient.addColorStop(0, solid.alpha(strength).toRgbString());
      gradient.addColorStop(1, solid.alpha(0).toRgbString());
      cache = { top: area.top, bottom: area.bottom, gradient };
    }

    return cache.gradient;
  };
}

function createCrosshairPlugin(getColor: () => string): Plugin {
  return {
    id: 'trafficCrosshair',
    afterDatasetsDraw(chart) {
      const active = chart.tooltip?.getActiveElements?.();

      if (!active?.length) {
        return;
      }

      const { ctx, chartArea } = chart;
      const x = active[0].element.x;

      ctx.save();
      ctx.strokeStyle = getColor();
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
}

function TrafficChartComponent({
  series,
  unit,
  minDate,
  maxDate,
  height = '260px',
  onBucketClick,
  ...props
}: TrafficChartProps) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const [hover, setHover] = useState<HoverState | null>(null);
  const lineColorRef = useRef(colors.chart.line);
  lineColorRef.current = colors.chart.text;

  // Plugins are read once when the Chart.js instance is created, so they read colors from a ref.
  const plugins = useMemo(() => [createCrosshairPlugin(() => lineColorRef.current)], []);

  const buckets = useMemo(() => {
    const now = new Date();
    const prepared = series.map(item => {
      const values = generateTimeSeries(item.data, minDate, maxDate, unit, locale);
      const compare = item.compareData
        ? generateTimeSeries(item.compareData, minDate, maxDate, unit, locale)
        : null;

      return { ...item, values, compare };
    });

    const starts = (prepared[0]?.values || []).map(({ x }) => parseBucket(x, unit));
    // ISO timestamps keep category labels unique and let annotation markers find their bucket.
    const labels = starts.map(date => date.toISOString());
    // Buckets that start in the future are not drawn; the one containing "now" is incomplete.
    const lastIndex = starts.reduce((last, date, index) => (isAfter(date, now) ? last : index), -1);
    const isPartial = lastIndex >= 0 && isAfter(DATE_FUNCTIONS[unit].end(starts[lastIndex]), now);

    return { prepared, labels, starts, lastIndex, isPartial };
  }, [series, minDate, maxDate, unit, locale]);

  const chartData = useMemo(() => {
    const { prepared, labels, lastIndex, isPartial } = buckets;
    const primary = colors.theme.primary;
    const secondary = colord(primary).desaturate(0.35).lighten(0.12).toHex();
    const single = labels.length <= 2;

    const toPoints = (values: { y: number | null; d?: string }[]) =>
      values.map(({ y, d }, index) => ({
        x: labels[index],
        d,
        y: index > lastIndex ? null : (y ?? 0),
      }));

    // Gaps inside the comparison period are real zeroes; a missing tail means the
    // comparison period is shorter, so the line simply ends instead of diving to zero.
    const toComparePoints = (values: { y: number | null; d?: string }[]) => {
      const last = values.reduce((acc, { y }, index) => (y === null ? acc : index), -1);

      return values.map(({ y, d }, index) => ({
        x: labels[index],
        d,
        y: index > last ? null : (y ?? 0),
      }));
    };

    const dashPartial = (ctx: any) =>
      isPartial && ctx.p1DataIndex === lastIndex ? [4, 4] : undefined;

    const datasets = prepared.flatMap((item, index) => {
      const color = index === 0 ? primary : secondary;
      const main = {
        type: 'line',
        label: item.label,
        data: toPoints(item.values),
        borderColor: color,
        backgroundColor: createAreaFill(color, index === 0 ? 0.2 : 0.08),
        fill: 'origin',
        borderWidth: 2,
        tension: 0.3,
        cubicInterpolationMode: 'monotone',
        pointRadius: single ? 3 : 0,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: theme === 'dark' ? '#14171e' : '#ffffff',
        pointHoverBorderWidth: 2,
        segment: { borderDash: dashPartial },
        order: index + 1,
      };

      if (!item.compare) {
        return [main];
      }

      return [
        main,
        {
          type: 'line',
          label: item.compareLabel || item.label,
          data: toComparePoints(item.compare),
          borderColor: colors.theme.compare,
          backgroundColor: 'transparent',
          fill: false,
          borderWidth: 1.5,
          borderDash: [5, 4],
          tension: 0.3,
          cubicInterpolationMode: 'monotone',
          pointRadius: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: colors.theme.compare,
          pointHoverBorderWidth: 0,
          order: 10 + index,
        },
      ];
    });

    return { labels, datasets };
  }, [buckets, colors, theme]);

  const handleTooltip = useCallback(
    ({ chart, tooltip }: { chart: any; tooltip: TooltipModel<'line'> }) => {
      if (!tooltip.opacity || !tooltip.dataPoints?.length) {
        setHover(prev => (prev ? null : prev));
        return;
      }

      const index = tooltip.dataPoints[0].dataIndex;
      const x = tooltip.caretX;
      const flip = x > chart.width * 0.62;

      setHover(prev =>
        prev?.index === index && prev?.flip === flip && Math.abs(prev.x - x) < 1
          ? prev
          : { index, x, flip },
      );
    },
    [],
  );

  const handleClick = useCallback(
    (_event: unknown, elements: { index: number }[]) => {
      const index = elements?.[0]?.index;
      const start = buckets.starts[index];

      if (!onBucketClick || index === undefined || !start || index > buckets.lastIndex) {
        return;
      }

      onBucketClick(DATE_FUNCTIONS[unit].start(start), DATE_FUNCTIONS[unit].end(start));
    },
    [buckets, onBucketClick, unit],
  );

  const canDrill = !!onBucketClick && (unit === 'day' || unit === 'month');

  const chartOptions: any = useMemo(
    () => ({
      layout: { padding: { top: 8, right: 4 } },
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      onClick: canDrill ? handleClick : undefined,
      onHover: (event: any, elements: any[]) => {
        const target = event?.native?.target as HTMLElement | undefined;

        if (target) {
          target.style.cursor = canDrill && elements.length ? 'pointer' : 'default';
        }
      },
      scales: {
        x: {
          type: 'category',
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: colors.chart.text,
            autoSkip: true,
            autoSkipPadding: 24,
            maxRotation: 0,
            font: { size: 11 },
            padding: 6,
            callback: (_value: unknown, index: number) => {
              const start = buckets.starts[index];
              return start ? formatDate(start, TICK_FORMATS[unit], locale) : '';
            },
          },
        },
        y: {
          type: 'linear',
          min: 0,
          beginAtZero: true,
          grace: '8%',
          border: { display: false },
          grid: { color: colors.chart.line, drawTicks: false },
          ticks: {
            color: colors.chart.text,
            maxTicksLimit: 5,
            padding: 10,
            font: { size: 11 },
            callback: (value: number) => formatLongNumber(value),
            precision: 0,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, mode: 'index', intersect: false, external: handleTooltip },
      },
    }),
    [buckets, canDrill, colors, handleClick, handleTooltip, locale, unit],
  );

  const tooltip = hover ? (
    <TrafficTooltip
      hover={hover}
      unit={unit}
      locale={locale}
      start={buckets.starts[hover.index]}
      partial={buckets.isPartial && hover.index === buckets.lastIndex}
      rows={buckets.prepared.map((item, index) => ({
        label: item.label,
        color: index === 0 ? colors.theme.primary : undefined,
        value: hover.index <= buckets.lastIndex ? (item.values[hover.index]?.y ?? 0) : null,
        compareLabel: item.compareLabel,
        compareValue: item.compare ? (item.compare[hover.index]?.y ?? 0) : undefined,
        compareDate: item.compare?.[hover.index]?.d,
        formatValue: item.formatValue,
      }))}
    />
  ) : null;

  return (
    <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
      <MemoChart
        {...props}
        type="line"
        height={height}
        chartData={chartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
        showLegend={false}
        plugins={plugins}
      />
      {tooltip}
    </div>
  );
}

function TrafficTooltip({
  hover,
  unit,
  locale,
  start,
  partial,
  rows,
}: {
  hover: HoverState;
  unit: string;
  locale: string;
  start?: Date;
  partial?: boolean;
  rows: {
    label: string;
    color?: string;
    value: number | null;
    compareLabel?: string;
    compareValue?: number;
    compareDate?: string;
    formatValue?: (n: number) => string;
  }[];
}) {
  const format = (row: (typeof rows)[number], n: number) =>
    row.formatValue ? row.formatValue(n) : n.toLocaleString(locale);

  return (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute top-1 z-10 w-max min-w-44 max-w-64 rounded-lg border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-pop',
        'animate-in fade-in-0 duration-100',
      )}
      style={{
        left: hover.x,
        transform: hover.flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
      }}
    >
      {start && (
        <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {formatDate(start, TITLE_FORMATS[unit] || 'PP', locale)}
          {partial && <span className="rounded bg-muted px-1 py-px text-[10px]">…</span>}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {rows.map(row => {
          const hasCompare = row.compareValue !== undefined;
          const change =
            hasCompare && row.value !== null && row.compareValue > 0
              ? ((row.value - row.compareValue) / row.compareValue) * 100
              : null;

          return (
            <div key={row.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[13px]">
                  <span
                    className="size-2 rounded-full bg-primary"
                    style={row.color ? { backgroundColor: row.color } : { opacity: 0.55 }}
                  />
                  {row.label}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-semibold tabular-nums">
                  {row.value === null ? '—' : format(row, row.value)}
                  {change !== null && Number.isFinite(change) && (
                    <span
                      className={cn(
                        'text-[11px] font-medium',
                        change >= 0 ? 'text-positive' : 'text-negative',
                      )}
                    >
                      {change >= 0 ? '↑' : '↓'}
                      {Math.abs(Math.round(change))}%
                    </span>
                  )}
                </span>
              </div>
              {hasCompare && (
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0 w-2 border-t border-dashed border-current" />
                    {row.compareDate
                      ? formatDate(
                          parseBackendDate(row.compareDate),
                          TITLE_FORMATS[unit] || 'PP',
                          locale,
                        )
                      : row.compareLabel}
                  </span>
                  <span className="tabular-nums">{format(row, row.compareValue)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TrafficChart = memo(TrafficChartComponent);
