import { Settings } from 'lucide-react';
import { useMemo } from 'react';
import { Favicon } from '@/components/common/Favicon';
import Link from '@/components/common/Link';
import { useMessages, useNavigation, useWebsiteListChartsQuery } from '@/components/hooks';
import { decodePunycodeDomain, formatLongNumber } from '@/lib/format';
import { WebsiteSparkline } from './WebsiteSparkline';

export function WebsiteCards({
  data = [],
  showActions,
}: {
  data?: { id: string; name: string; domain?: string }[];
  showActions?: boolean;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const websiteIds = useMemo(() => data.map(row => row.id), [data]);
  const chartsQuery = useWebsiteListChartsQuery(websiteIds);
  const charts = chartsQuery.data?.data || {};
  const isChartLoading = chartsQuery.isLoading && !chartsQuery.data;
  const periodLabel = t(labels.lastDays, { x: '7' });

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(website => {
        const chart = charts[website.id];
        const domain = decodePunycodeDomain(website.domain);

        return (
          <li
            key={website.id}
            className="group relative flex flex-col rounded-lg border border-border bg-card p-4 shadow-card transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-pop focus-within:border-border-strong"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-muted-foreground uppercase">
                {website.name?.slice(0, 1)}
                <Favicon
                  domain={website.domain}
                  className="absolute inset-0 m-auto size-4 rounded-sm bg-background"
                />
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={renderUrl(`/websites/${website.id}`, false)}
                  className="block truncate text-sm font-semibold text-foreground outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  title={website.name}
                >
                  {website.name}
                </Link>
                <div className="truncate text-xs text-muted-foreground" title={domain}>
                  {domain}
                </div>
              </div>
              {showActions && (
                <Link
                  href={renderUrl(`/websites/${website.id}/settings`, false)}
                  aria-label={`${t(labels.settings)}: ${website.name}`}
                  className="relative z-10 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Settings className="size-4" />
                </Link>
              )}
            </div>
            <div className="mt-4 h-14">
              <WebsiteSparkline
                values={chart?.values}
                total={chart?.total}
                isLoading={isChartLoading}
                variant="area"
                className="h-14 max-w-none"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-sm">
                <span className="font-semibold text-foreground tabular-nums">
                  {isChartLoading ? '–' : formatLongNumber(chart?.total || 0)}
                </span>{' '}
                <span className="text-muted-foreground">
                  {t(labels.visitors).toLocaleLowerCase()}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{periodLabel}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
