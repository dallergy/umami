'use client';
import { Alert, AlertTitle, Column, type ColumnProps, Loading } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { useMessages } from '@/components/hooks';
import { cn } from '@/lib/cn';

const DEFAULT_WIDTH = '1320px';

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

  return (
    <Column
      {...props}
      width="100%"
      minHeight="100vh"
      paddingBottom="6"
      maxWidth={maxWidth}
      paddingX={{ base: '4', md: '8' }}
      className={cn('mx-auto pt-2', className)}
    >
      {children}
    </Column>
  );
}
