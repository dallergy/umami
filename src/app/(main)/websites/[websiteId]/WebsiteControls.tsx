import { Favicon } from '@/components/common/Favicon';
import { useNavigation, useShare, useSticky, useWebsite } from '@/components/hooks';
import { ExportButton } from '@/components/input/ExportButton';
import { FilterBar } from '@/components/input/FilterBar';
import { MonthFilter } from '@/components/input/MonthFilter';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { WebsiteFilterButton } from '@/components/input/WebsiteFilterButton';
import { ActiveUsers } from '@/components/metrics/ActiveUsers';
import { cn } from '@/lib/cn';
import { allowShareFilter } from '@/lib/share';

export function WebsiteControls({
  websiteId,
  allowFilter = true,
  allowBounceFilter = false,
  allowDateFilter = true,
  allowMonthFilter,
  allowDownload = false,
  allowCompare = false,
  compareMode = 'always',
  showActiveUsers = true,
}: {
  websiteId?: string;
  allowFilter?: boolean;
  allowBounceFilter?: boolean;
  allowDateFilter?: boolean;
  allowMonthFilter?: boolean;
  allowDownload?: boolean;
  allowCompare?: boolean;
  compareMode?: 'always' | 'toggle';
  showActiveUsers?: boolean;
}) {
  const share = useShare();
  const website = useWebsite();
  const { renderUrl, pathname } = useNavigation();
  const { ref, isSticky } = useSticky({ enabled: true });
  const showFilter = allowFilter && allowShareFilter(share?.parameters);
  const isWebsitePage = !!websiteId && website?.id === websiteId;
  const isRealtime = pathname?.endsWith('/realtime');
  const realtimeHref =
    isWebsitePage && !share && !isRealtime
      ? renderUrl(`/websites/${websiteId}/realtime`, false)
      : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        // Pulls up over the page's top padding so the bar sits 16px under the tabs, then sticks.
        'sticky -top-px z-30 -mx-4 -mt-4 mb-4 px-4 pt-[calc(1rem+1px)] pb-3 md:-mx-6 md:-mt-5 md:px-6',
        // When stuck, a full-bleed backdrop spans the viewport behind the controls.
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:border-b before:opacity-0 before:transition-opacity before:duration-200 before:content-['']",
        isSticky &&
          'before:border-border before:bg-background/85 before:opacity-100 before:shadow-[0_1px_2px_rgb(15_23_42/0.04)] before:backdrop-blur-md',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          {isSticky && isWebsitePage && (
            <span className="hidden max-w-48 items-center gap-2 text-sm font-semibold sm:flex">
              <Favicon domain={website.domain} className="size-4 shrink-0 rounded-sm" />
              <span className="truncate">{website.name}</span>
            </span>
          )}
          {isWebsitePage && showActiveUsers && !isRealtime && (
            <ActiveUsers websiteId={websiteId} href={realtimeHref} allowLink={!!realtimeHref} />
          )}
          {showFilter && (
            <WebsiteFilterButton websiteId={websiteId} allowBounceFilter={allowBounceFilter} />
          )}
          {showFilter && <FilterBar websiteId={websiteId} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allowDateFilter && (
            <WebsiteDateFilter
              websiteId={websiteId}
              allowCompare={allowCompare}
              compareMode={compareMode}
              realtimeHref={realtimeHref}
              shortcuts
            />
          )}
          {allowDownload && <ExportButton websiteId={websiteId} />}
          {allowMonthFilter && <MonthFilter />}
        </div>
      </div>
    </div>
  );
}
