import { useId, useMemo } from 'react';
import { useMessages } from '@/components/hooks';
import { cn } from '@/lib/cn';

const WIDTH = 120;
const HEIGHT = 32;

/**
 * A tiny SVG area chart. Plain SVG keeps list pages cheap: no canvas, no chart
 * instance and no resize observers per row.
 */
export function WebsiteSparkline({
  values = [],
  total = 0,
  isLoading = false,
  variant = 'line',
  className,
}: {
  values?: number[];
  total?: number;
  isLoading?: boolean;
  variant?: 'line' | 'area';
  className?: string;
}) {
  const { t, labels } = useMessages();
  // React ids contain characters that are awkward inside url(#…) references.
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tooltipLabel = `${total.toLocaleString()} ${t(labels.visitors).toLocaleLowerCase()}`;

  const { line, area } = useMemo(() => {
    if (!values.length) {
      return { line: '', area: '' };
    }

    const max = Math.max(...values, 1);
    const padding = 2;
    const points = values.map((value, index) => {
      const x = values.length === 1 ? WIDTH / 2 : (index / (values.length - 1)) * WIDTH;
      const y = HEIGHT - padding - (value / max) * (HEIGHT - padding * 2);

      return [x, y];
    });

    const path = points
      .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ');

    return { line: path, area: `${path} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` };
  }, [values]);

  if (isLoading) {
    return (
      <div className={cn('h-6 w-full max-w-22 animate-pulse rounded-full bg-muted', className)} />
    );
  }

  return (
    <div className={cn('w-full', variant === 'line' && 'max-w-22', className)} title={tooltipLabel}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={tooltipLabel}
        className="block h-full min-h-6 overflow-visible text-[var(--chart-line)]"
      >
        {variant === 'area' && (
          <>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
          </>
        )}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
