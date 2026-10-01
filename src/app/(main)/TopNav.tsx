'use client';
import { useMessages, useNavigation } from '@/components/hooks';
import { BoardSelect } from '@/components/input/BoardSelect';
import { LinkSelect } from '@/components/input/LinkSelect';
import { PixelSelect } from '@/components/input/PixelSelect';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { BreadcrumbSlash } from '@/components/nav/BreadcrumbSlash';
import { getNavContext } from '@/components/nav/navContext';

const crumbButtonProps = {
  className: 'h-8 min-h-8 rounded-md px-1.5 text-sm font-medium shadow-none',
  style: { minWidth: 0, maxWidth: 240 },
};

export function TopNav() {
  const { websiteId, linkId, pixelId, boardId, teamId, router, renderUrl, pathname } =
    useNavigation();
  const { t, labels } = useMessages();
  const context = getNavContext(pathname || '', websiteId);

  const navigateToEntity = (basePath: string, value: string | number | null) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    router.push(renderUrl(`${basePath}/${value}`, false));
  };

  if (context === 'settings' || context === 'admin') {
    return (
      <div className="flex min-w-0 items-center gap-1">
        <span className="truncate px-1.5 text-sm font-medium">
          {context === 'settings' ? t(labels.settings) : t(labels.admin)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <TeamsButton />
      {(websiteId || linkId || pixelId || boardId) && (
        <>
          <BreadcrumbSlash />
          {websiteId && (
            <WebsiteSelect
              websiteId={websiteId}
              teamId={teamId}
              onChange={value => navigateToEntity('/websites', value)}
              buttonProps={crumbButtonProps}
            />
          )}
          {linkId && (
            <LinkSelect
              linkId={linkId}
              teamId={teamId}
              onChange={value => navigateToEntity('/links', value)}
              buttonProps={crumbButtonProps}
            />
          )}
          {pixelId && (
            <PixelSelect
              pixelId={pixelId}
              teamId={teamId}
              onChange={value => navigateToEntity('/pixels', value)}
              buttonProps={crumbButtonProps}
            />
          )}
          {boardId && (
            <BoardSelect
              boardId={boardId}
              teamId={teamId}
              onChange={value => navigateToEntity('/boards', value)}
              buttonProps={crumbButtonProps}
            />
          )}
        </>
      )}
    </div>
  );
}
