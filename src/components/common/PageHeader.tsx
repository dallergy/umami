import type { ReactNode } from 'react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/cn';

export function PageHeader({
  title,
  description,
  label,
  icon,
  showBorder = false,
  titleHref,
  className,
  children,
}: {
  title: string;
  description?: string;
  label?: ReactNode;
  icon?: ReactNode;
  showBorder?: boolean;
  titleHref?: string;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const heading = (
    <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{title}</h1>
  );

  return (
    <header
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-1',
        showBorder && 'border-b border-border pb-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {label}
        <div className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <span className="flex shrink-0 items-center text-muted-foreground">{icon}</span>
          ) : null}
          {title && titleHref ? (
            <Link href={titleHref} className="min-w-0 hover:underline">
              {heading}
            </Link>
          ) : (
            title && heading
          )}
        </div>
        {description ? (
          <p className="max-w-2xl truncate text-sm text-muted-foreground" title={description}>
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}
