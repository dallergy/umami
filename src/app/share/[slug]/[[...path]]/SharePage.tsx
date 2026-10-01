'use client';
import { Column, useTheme } from '@umami/react-zen';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BoardViewPage } from '@/app/(main)/boards/[boardId]/BoardViewPage';
import { LinkPage } from '@/app/(main)/links/[linkId]/LinkPage';
import { PixelPage } from '@/app/(main)/pixels/[pixelId]/PixelPage';
import { AttributionPage } from '@/app/(main)/websites/[websiteId]/(reports)/attribution/AttributionPage';
import { BreakdownPage } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/BreakdownPage';
import { FunnelsPage } from '@/app/(main)/websites/[websiteId]/(reports)/funnels/FunnelsPage';
import { GoalsPage } from '@/app/(main)/websites/[websiteId]/(reports)/goals/GoalsPage';
import { JourneysPage } from '@/app/(main)/websites/[websiteId]/(reports)/journeys/JourneysPage';
import { PerformancePage } from '@/app/(main)/websites/[websiteId]/(reports)/performance/PerformancePage';
import { RetentionPage } from '@/app/(main)/websites/[websiteId]/(reports)/retention/RetentionPage';
import { RevenuePage } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/RevenuePage';
import { UTMPage } from '@/app/(main)/websites/[websiteId]/(reports)/utm/UTMPage';
import { ComparePage } from '@/app/(main)/websites/[websiteId]/compare/ComparePage';
import { EventsPage } from '@/app/(main)/websites/[websiteId]/events/EventsPage';
import { RealtimePage } from '@/app/(main)/websites/[websiteId]/realtime/RealtimePage';
import { SessionsPage } from '@/app/(main)/websites/[websiteId]/sessions/SessionsPage';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { useShare } from '@/components/hooks';
import { BreadcrumbSlash } from '@/components/nav/BreadcrumbSlash';
import { ENTITY_TYPE } from '@/lib/constants';
import { getShareTheme } from '@/lib/share';
import { ShareBranding } from './ShareBranding';
import { ShareFooter } from './ShareFooter';
import { ShareNav } from './ShareNav';

const PAGE_COMPONENTS: Record<string, React.ComponentType<{ websiteId: string }>> = {
  '': WebsitePage,
  overview: WebsitePage,
  events: EventsPage,
  sessions: SessionsPage,
  realtime: RealtimePage,
  performance: PerformancePage,
  compare: ComparePage,
  breakdown: BreakdownPage,
  goals: GoalsPage,
  funnels: FunnelsPage,
  journeys: JourneysPage,
  retention: RetentionPage,
  utm: UTMPage,
  revenue: RevenuePage,
  attribution: AttributionPage,
};

function getSharePath(pathname: string) {
  const segments = pathname.split('/');
  const firstSegment = segments[3];

  // If first segment looks like a domain name, skip it
  if (firstSegment?.includes('.')) {
    return segments[4];
  }

  return firstSegment;
}

export function SharePage() {
  const share = useShare();
  const { initTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const path = getSharePath(pathname);
  const { slug, websiteId, boardId, pixelId, linkId, parameters = {}, shareType } = share;
  const shareTheme = getShareTheme(parameters);

  useEffect(() => {
    initTheme(shareTheme, 'system');

    return () => {
      initTheme(undefined, 'system');
    };
  }, [shareTheme, initTheme]);

  // Check if the requested path is allowed
  const pageKey = path || '';
  const isAllowed = pageKey === '' || parameters[pageKey] === true;

  const entityPage =
    shareType === ENTITY_TYPE.board && boardId ? (
      <BoardViewPage boardId={boardId} showActions={false} />
    ) : shareType === ENTITY_TYPE.pixel && pixelId ? (
      <PixelPage pixelId={pixelId} showHeaderActions={false} />
    ) : shareType === ENTITY_TYPE.link && linkId ? (
      <LinkPage linkId={linkId} showHeaderActions={false} />
    ) : null;

  useEffect(() => {
    if (!isAllowed) {
      router.replace(`/share/${slug}`);
    }
  }, [isAllowed, slug, router]);

  if (entityPage) {
    return (
      <Column>
        {entityPage}
        <ShareFooter />
      </Column>
    );
  }

  if (!isAllowed) {
    return null;
  }

  const PageComponent = PAGE_COMPONENTS[pageKey] || WebsitePage;

  return (
    <WebsiteProvider websiteId={websiteId}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-1 px-4 md:px-6">
            <ShareBranding />
            <BreadcrumbSlash />
            <WebsiteHeader showActions={false} allowLink={false} />
          </div>
          <div className="mx-auto w-full max-w-[1240px] px-4 md:px-6">
            <ShareNav />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-clip">
          <PageBody>
            <PageComponent websiteId={websiteId} />
          </PageBody>
        </main>
        <ShareFooter />
      </div>
    </WebsiteProvider>
  );
}
