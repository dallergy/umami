import type { ReactNode } from 'react';
import { Empty } from '@/components/common/Empty';
import { formatLongNumber } from '@/lib/format';

export interface BarListRow {
  label: string;
  count: number;
  percent: number;
  [key: string]: unknown;
}

export function BarList({
  rows,
  renderLabel,
}: {
  rows: BarListRow[];
  renderLabel?: (row: BarListRow) => ReactNode;
}) {
  if (!rows.length) {
    return <Empty />;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {rows.map((row, index) => {
        const width = Math.max(0, Math.min(100, row.percent || 0));

        return (
          <div
            key={`${row.label}-${index}`}
            className="relative flex h-8 items-center overflow-hidden rounded-md"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-primary/15"
              style={{ width: `${width}%` }}
            />
            <div className="relative flex min-w-0 flex-1 items-center px-2 text-sm">
              <div className="min-w-0 flex-1 truncate">
                {renderLabel ? renderLabel(row) : row.label}
              </div>
            </div>
            <div className="relative px-2 text-sm font-medium tabular-nums text-foreground">
              {formatLongNumber(row.count)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
