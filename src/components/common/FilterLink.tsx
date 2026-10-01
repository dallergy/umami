import type { HTMLAttributes, ReactNode } from 'react';
import Link from '@/components/common/Link';
import { useMessages, useNavigation } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';
import { cn } from '@/lib/cn';

export interface FilterLinkProps extends HTMLAttributes<HTMLDivElement> {
  type: string;
  value: string;
  label?: string;
  icon?: ReactNode;
  externalUrl?: string;
}

/**
 * A label that applies a dashboard filter when clicked. The external-link affordance is
 * revealed with CSS on hover, so moving the mouse across long lists never re-renders rows.
 */
export function FilterLink({ type, value, label, externalUrl, icon }: FilterLinkProps) {
  const { t, labels } = useMessages();
  const { updateParams, query } = useNavigation();
  const active = query[type] !== undefined;
  const selected = query[type] === value || query[type] === `eq.${value}`;

  return (
    <span
      className={cn(
        'group/filter flex min-w-0 items-center gap-2',
        active && !selected && 'text-muted-foreground',
        selected && 'font-semibold',
      )}
    >
      {icon && (
        <span className="flex shrink-0 items-center justify-center [&_img]:max-h-4">{icon}</span>
      )}
      {value ? (
        <Link
          href={updateParams({ [type]: `eq.${value}` })}
          replace
          data-filter-link=""
          title={label || value}
          className="min-w-0 truncate outline-none hover:underline hover:decoration-border-strong hover:underline-offset-2 focus-visible:underline"
        >
          {label || value}
        </Link>
      ) : (
        <span className="truncate text-muted-foreground">({label || t(labels.unknown)})</span>
      )}
      {externalUrl && (
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={externalUrl}
          className="relative z-10 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/filter:opacity-100 group-hover/row:opacity-100"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </span>
  );
}
