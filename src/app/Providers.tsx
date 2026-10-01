'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, ZenProvider } from '@umami/react-zen';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useLocale } from '@/components/hooks';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createMessageFallback } from '@/lib/message-fallback';
import enUS from '../../public/intl/messages/en-US.json';
import 'chartjs-adapter-date-fns';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

// Untranslated keys fall back to English instead of rendering raw message ids.
const getMessageFallback = createMessageFallback(enUS);

function MessagesProvider({ children }) {
  const { locale, messages, dir } = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale, dir]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      onError={() => null}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}

export function Providers({ children }) {
  return (
    <ZenProvider palette="zinc">
      <TooltipProvider>
        <RouterProvider>
          <MessagesProvider>
            <QueryClientProvider client={client}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </QueryClientProvider>
          </MessagesProvider>
        </RouterProvider>
      </TooltipProvider>
    </ZenProvider>
  );
}
