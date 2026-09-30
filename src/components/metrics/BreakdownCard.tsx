'use client';
import { type ReactNode, useMemo, useState } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { Panel } from '@/components/common/Panel';
import { useMessages, useNavigation, useWebsiteMetricsQuery } from '@/components/hooks';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { percentFilter } from '@/lib/filters';
import { BarList, type BarListRow } from './BarList';

export interface BreakdownOption {
  type: string;
  label: string;
}

export function DimensionSwitch({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: BreakdownOption[];
  onChange: (type: string) => void;
  label: string;
}) {
  if (options.length < 2) {
    return null;
  }

  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList aria-label={label} className="h-7">
        {options.map(option => (
          <TabsTrigger key={option.type} value={option.type} className="h-6 px-2 text-xs">
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function BreakdownList({
  websiteId,
  type,
  limit = 8,
}: {
  websiteId: string;
  type: string;
  limit?: number;
}) {
  const { data, isLoading, isFetching } = useWebsiteMetricsQuery(
    websiteId,
    { type, limit },
    { placeholderData: undefined },
  );

  const rows = useMemo<BarListRow[]>(() => {
    return percentFilter((data || []) as any[]).map(({ x, y, z, ...rest }) => ({
      label: x,
      count: y,
      percent: z,
      ...rest,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1" aria-hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(isFetching && 'opacity-60')}>
      <BarList rows={rows} renderLabel={row => <MetricLabel type={type} data={row} />} />
    </div>
  );
}

export function BreakdownCard({
  title,
  websiteId,
  options,
  limit = 8,
  value,
  onChange,
  children,
}: {
  title: string;
  websiteId: string;
  options: BreakdownOption[];
  limit?: number;
  value?: string;
  onChange?: (type: string) => void;
  children?: ReactNode;
}) {
  const { t, labels } = useMessages();
  const { updateParams } = useNavigation();
  const [internal, setInternal] = useState(options[0]?.type);
  const type = value || internal;

  return (
    <Panel paddingY="3" paddingX="4" className="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <DimensionSwitch
          label={title}
          value={type}
          options={options}
          onChange={next => (onChange ? onChange(next) : setInternal(next))}
        />
      </div>
      {children}
      <BreakdownList websiteId={websiteId} type={type} limit={limit} />
      <div className="flex justify-end">
        <LinkButton href={updateParams({ view: type })} variant="quiet">
          <span className="text-xs text-muted-foreground">{t(labels.more)}</span>
        </LinkButton>
      </div>
    </Panel>
  );
}
