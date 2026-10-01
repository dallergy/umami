import type { ReactNode } from 'react';
import { Logo } from '@/components/svg';

export function AuthFrame({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[360px] flex-col items-center gap-6">
      <div className="flex items-center gap-2.5 text-foreground">
        <Logo className="size-8" />
        <span className="text-xl font-semibold tracking-tight">umami</span>
      </div>
      <div className="w-full rounded-xl border border-border bg-card p-6 text-card-foreground shadow-card sm:p-7">
        {(title || description) && (
          <div className="mb-5 flex flex-col gap-1 text-center">
            {title && <h1 className="text-base font-semibold tracking-tight">{title}</h1>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="grid gap-4">{children}</div>
      </div>
    </div>
  );
}
