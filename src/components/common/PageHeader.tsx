import type { ReactNode } from 'react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/cn';

export function PageHeader({
  title,
  description,
  label,
  icon,
  showBorder = true,
  titleHref,
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
    <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
  );

  return (
    <header
      className={cn(
        'mb-6 grid items-center gap-4 py-6 md:grid-cols-[minmax(0,1fr)_auto]',
        showBorder && 'border-b border-border',
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        {label}
        <div className="flex min-w-0 items-center gap-3">
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          {title && titleHref ? (
            <Link href={titleHref} className="min-w-0 hover:underline">
              {heading}
            </Link>
          ) : (
            title && heading
          )}
        </div>
        {description ? (
          <p className="max-w-xl truncate text-sm text-muted-foreground" title={description}>
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">{children}</div>
    </header>
  );
}
