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
        'inline-flex items-center gap-0.5 self-start text-xs font-semibold tabular-nums',
        neutral && 'font-medium text-muted-foreground',
        !neutral && good && 'text-positive',
        !neutral && !good && 'text-negative',
      )}
    >
      {!neutral && (
        <svg
          viewBox="0 0 10 10"
          aria-hidden
          className={cn('size-2.5 shrink-0', !positive && 'rotate-180')}
        >
          <path d="M5 1.5 9 7.5H1z" fill="currentColor" />
        </svg>
      )}
      <span>{children || value}</span>
    </span>
  );
}
