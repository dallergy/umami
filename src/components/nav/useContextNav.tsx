import { useLoginQuery, useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import type { NavTabEntry } from './NavTabs';
import { getNavContext, type NavContext } from './navContext';

export interface ContextNav {
  context: NavContext;
  items: NavTabEntry[];
  selectedId?: string;
  settingsHref?: string;
  settingsActive?: boolean;
}

function useWebsiteTabs(websiteId: string) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const { items, selectedKey, renderPath } = useWebsiteNavItems(websiteId);
  const [traffic, ...groups] = items;
  const settingsHref = renderPath('/settings');

  const toTab = ({ id, label, path, icon }: (typeof traffic.items)[number]) => ({
    id,
    label,
    icon,
    href: path,
  });

  const entries: NavTabEntry[] = [
    ...traffic.items.map(toTab),
    ...groups.map(group => ({
      id: group.label,
      label: group.label,
      items: group.items.map(toTab),
    })),
  ];

  return {
    items: entries,
    selectedId: selectedKey,
    settingsHref,
    settingsActive: pathname.endsWith('/settings'),
    settingsLabel: t(labels.settings),
  };
}

function useSettingsTabs() {
  const { t, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();

  const items = [
    { id: 'preferences', label: t(labels.preferences), href: renderUrl('/settings/preferences') },
    { id: 'profile', label: t(labels.profile), href: renderUrl('/settings/profile') },
    { id: 'teams', label: t(labels.teams), href: renderUrl('/settings/teams') },
    { id: 'security', label: t(labels.security), href: renderUrl('/settings/security') },
    { id: 'api-keys', label: t(labels.apiKeys), href: renderUrl('/settings/api-keys') },
  ];

  return {
    items,
    selectedId: items.find(({ href }) => pathname.includes(href.split('?')[0]))?.id,
  };
}

function useAdminTabs() {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();

  const items = [
    { id: 'users', label: t(labels.users), href: '/admin/users' },
    { id: 'websites', label: t(labels.websites), href: '/admin/websites' },
    { id: 'teams', label: t(labels.teams), href: '/admin/teams' },
    { id: 'security', label: t(labels.security), href: '/admin/security' },
  ];

  return {
    items,
    selectedId: items.find(({ href }) => pathname.startsWith(href))?.id,
  };
}

function useMainTabs() {
  const { t, labels } = useMessages();
  const { renderUrl, pathname, teamId } = useNavigation();

  const items = [
    { id: 'websites', label: t(labels.websites), href: renderUrl('/websites', false) },
    ...(!teamId
      ? [{ id: 'dashboard', label: t(labels.dashboard), href: renderUrl('/dashboard', false) }]
      : []),
    { id: 'boards', label: t(labels.boards), href: renderUrl('/boards', false) },
    { id: 'links', label: t(labels.links), href: renderUrl('/links', false) },
    { id: 'pixels', label: t(labels.pixels), href: renderUrl('/pixels', false) },
  ];

  return {
    items,
    selectedId: items.find(({ href }) => pathname.startsWith(href))?.id,
  };
}

export function useContextNav(): ContextNav {
  const { pathname, websiteId } = useNavigation();
  const { user } = useLoginQuery();
  const context = getNavContext(pathname, websiteId);

  // Hooks are called unconditionally; only the active context's tabs are used.
  const website = useWebsiteTabs(websiteId);
  const settings = useSettingsTabs();
  const admin = useAdminTabs();
  const main = useMainTabs();

  switch (context) {
    case 'website':
      return {
        context,
        items: website.items,
        selectedId: website.selectedId,
        settingsHref: website.settingsHref,
        settingsActive: website.settingsActive,
      };
    case 'settings':
      return { context, ...settings };
    case 'admin':
      return { context, ...(user?.isAdmin ? admin : { items: [] }) };
    default:
      return { context, ...main };
  }
}
