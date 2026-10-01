import { useMessages, useNavigation, useShare } from '@/components/hooks';
import { AlignEndHorizontal, Clock, Eye, Sheet, Tag, User } from '@/components/icons';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { ThemeToggle } from '@/components/input/ThemeToggle';
import { type NavTabEntry, NavTabs } from '@/components/nav/NavTabs';
import { Funnel, Gauge, Lightning, Magnet, Money, Network, Path, Target } from '@/components/svg';
import { allowShareFilter, excludeShareFilterParam, getShareTheme } from '@/lib/share';
import { buildPath } from '@/lib/url';

export function ShareNav(_props: {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onItemClick?: () => void;
}) {
  const share = useShare();
  const { t, labels } = useMessages();
  const { pathname, query } = useNavigation();
  const { slug, parameters } = share;
  const allowFilter = allowShareFilter(parameters);
  const shareTheme = getShareTheme(parameters);

  const renderPath = (path: string) =>
    buildPath(`/share/${slug}${path}`, {
      ...Object.fromEntries(
        Object.entries(query).filter(([key]) => {
          return allowFilter || !excludeShareFilterParam(key);
        }),
      ),
      event: undefined,
      compare: undefined,
      theme: undefined,
      view: undefined,
      unit: undefined,
      excludeBounce: undefined,
    });

  const allItems = [
    {
      section: 'traffic',
      label: t(labels.traffic),
      items: [
        { id: 'overview', label: t(labels.overview), icon: <Eye />, path: renderPath('') },
        { id: 'events', label: t(labels.events), icon: <Lightning />, path: renderPath('/events') },
        {
          id: 'sessions',
          label: t(labels.sessions),
          icon: <User />,
          path: renderPath('/sessions'),
        },
        {
          id: 'realtime',
          label: t(labels.realtime),
          icon: <Clock />,
          path: renderPath('/realtime'),
        },
        {
          id: 'performance',
          label: t(labels.performance),
          icon: <Gauge />,
          path: renderPath('/performance'),
        },
        {
          id: 'compare',
          label: t(labels.compare),
          icon: <AlignEndHorizontal />,
          path: renderPath('/compare'),
        },
        {
          id: 'breakdown',
          label: t(labels.breakdown),
          icon: <Sheet />,
          path: renderPath('/breakdown'),
        },
      ],
    },
    {
      section: 'behavior',
      label: t(labels.behavior),
      items: [
        { id: 'goals', label: t(labels.goals), icon: <Target />, path: renderPath('/goals') },
        { id: 'funnels', label: t(labels.funnels), icon: <Funnel />, path: renderPath('/funnels') },
        {
          id: 'journeys',
          label: t(labels.journeys),
          icon: <Path />,
          path: renderPath('/journeys'),
        },
        {
          id: 'retention',
          label: t(labels.retention),
          icon: <Magnet />,
          path: renderPath('/retention'),
        },
      ],
    },
    {
      section: 'growth',
      label: t(labels.growth),
      items: [
        { id: 'utm', label: t(labels.utm), icon: <Tag />, path: renderPath('/utm') },
        { id: 'revenue', label: t(labels.revenue), icon: <Money />, path: renderPath('/revenue') },
        {
          id: 'attribution',
          label: t(labels.attribution),
          icon: <Network />,
          path: renderPath('/attribution'),
        },
      ],
    },
  ];

  // Filter items based on parameters
  const items = allItems
    .map(section => ({
      id: section.section,
      label: section.label,
      items: section.items.filter(item => parameters[item.id] === true),
    }))
    .filter(section => section.items.length > 0);

  const overview = {
    id: 'overview',
    label: t(labels.overview),
    href: renderPath(''),
  };

  const flatItems = items.flatMap(e => e.items);
  // The bare share URL is the overview, which is always available.
  const selectedKey =
    flatItems.find(({ path }) => path && pathname.endsWith(path.split('?')[0]))?.id || 'overview';

  const toTab = ({ id, label, path }: { id: string; label: string; path: string }) => ({
    id,
    label,
    href: path,
  });

  const [traffic, ...groups] = items;
  const tabs: NavTabEntry[] = [
    ...(traffic?.id === 'traffic'
      ? traffic.items.map(toTab)
      : [overview, ...(traffic ? [{ ...traffic, items: traffic.items.map(toTab) }] : [])]),
    ...groups.map(group => ({ ...group, items: group.items.map(toTab) })),
  ];

  if (!tabs.some(tab => tab.id === 'overview')) {
    tabs.unshift(overview);
  }

  return (
    <NavTabs
      label={t(labels.navigation)}
      items={tabs}
      selectedId={selectedKey}
      end={
        <div className="flex items-center gap-1">
          {!shareTheme && <ThemeToggle />}
          <LanguageButton />
          <PreferencesButton />
        </div>
      }
    />
  );
}
