'use client';
import type { ReactNode } from 'react';
import { PageBody } from '@/components/common/PageBody';

export function SettingsLayout({ children }: { children: ReactNode }) {
  return <PageBody>{children}</PageBody>;
}
