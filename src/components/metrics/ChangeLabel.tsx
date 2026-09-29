import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function ChangeLabel({
  value,
  reverseColors,
  children,
  title,
}: {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  reverseColors?: boolean;
  showPercentage?: boolean;
  children?: ReactNode;
}) {
  const positive = value >= 0;
  const neutral = value === 0 || Number.isNaN(value);
  const good = reverseColors ? !positive : positive;

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 self-start rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
        neutral && 'bg-muted text-muted-foreground',
        !neutral && good && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        !neutral && !good && 'bg-red-500/10 text-red-700 dark:text-red-300',
      )}
    >
      {!neutral &&
        (positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />)}
      <span>{children || value}</span>
    </span>
  );
}
