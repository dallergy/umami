import type { ReactNode } from 'react';
import { Logo } from '@/components/svg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthFrame({
  title = 'umami',
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-sm gap-5 border-border py-8 shadow-sm">
      <CardHeader className="items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary shadow-xs">
          <Logo className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}
