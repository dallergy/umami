'use client';
import { Alert, AlertTitle, Column, type ColumnProps, Loading } from '@umami/react-zen';
import { createContext, type ReactNode, useContext } from 'react';
import { useMessages } from '@/components/hooks';
import { cn } from '@/lib/cn';

const DEFAULT_WIDTH = '1240px';

// Layouts and pages both render PageBody; only the outermost one applies the page container.
const PageBodyContext = createContext(false);

export function PageBody({
  maxWidth = DEFAULT_WIDTH,
  error,
  isLoading,
  children,
  className,
  ...props
}: {
  maxWidth?: string;
  error?: unknown;
  isLoading?: boolean;
  children?: ReactNode;
} & ColumnProps) {
  const { t, messages } = useMessages();
  const isNested = useContext(PageBodyContext);

  if (error) {
    return (
      <Alert variant="danger">
        <AlertTitle>{t(messages.error)}</AlertTitle>
      </Alert>
    );
  }

  if (isLoading) {
    return <Loading placement="absolute" />;
  }

  if (isNested) {
    return (
      <Column {...props} width="100%" className={className}>
        {children}
      </Column>
    );
  }

  return (
    <PageBodyContext.Provider value={true}>
      <Column
        {...props}
        width="100%"
        maxWidth={maxWidth}
        className={cn('mx-auto px-4 pt-4 pb-12 md:px-6 md:pt-5', className)}
      >
        {children}
      </Column>
    </PageBodyContext.Provider>
  );
}
