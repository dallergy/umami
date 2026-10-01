import type { ReactNode } from 'react';
import { Empty } from '@/components/common/Empty';
import { cn } from '@/lib/cn';
import { formatLongNumber } from '@/lib/format';

export interface BarListRow {
  label: string;
  count: number;
  percent: number;
  [key: string]: unknown;
}

export const BAR_ROW_HEIGHT = 32;

export function BarList({
  rows,
  renderLabel,
  formatCount = formatLongNumber,
  minRows,
}: {
  rows: BarListRow[];
  renderLabel?: (row: BarListRow) => ReactNode;
  formatCount?: (n: number) => string;
  /** Reserve space for this many rows so cards keep a steady height while data changes. */
  minRows?: number;
}) {
  const style = minRows ? { minHeight: minRows * (BAR_ROW_HEIGHT + 2) } : undefined;

  if (!rows.length) {
    return (
      <div className="flex" style={style}>
        <Empty />
      </div>
    );
  }

  // Bars are scaled to the top row, which keeps small differences readable.
  const max = rows.reduce((value, row) => Math.max(value, row.count || 0), 0) || 1;

  return (
    <ul className="flex flex-col gap-0.5" style={style}>
      {rows.map((row, index) => {
        const width = Math.max(0, Math.min(100, ((row.count || 0) / max) * 100));

        return (
          <li
            key={`${row.label}-${index}`}
            className="group/row relative flex items-center rounded-md text-[13px]"
            style={{ height: BAR_ROW_HEIGHT }}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-md bg-bar transition-[width,background-color] duration-300 ease-out group-hover/row:bg-bar-hover"
              style={{ width: `${width}%` }}
            />
            <span
              className={cn(
                'relative flex min-w-0 flex-1 items-center px-2 text-foreground',
                // Let the filter link cover the whole row so the bar itself is clickable.
                '[&_[data-filter-link]]:after:absolute [&_[data-filter-link]]:after:inset-0 [&_[data-filter-link]]:after:content-[""]',
              )}
            >
              {renderLabel ? renderLabel(row) : row.label}
            </span>
            <span className="relative hidden w-12 shrink-0 text-right text-xs text-muted-foreground tabular-nums opacity-0 transition-opacity group-hover/row:opacity-100 sm:block">
              {Number.isFinite(row.percent) ? `${Math.round(row.percent)}%` : ''}
            </span>
            <span
              className="relative w-16 shrink-0 pr-2 text-right font-medium text-foreground tabular-nums"
              title={row.count?.toLocaleString()}
            >
              {formatCount(row.count)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
