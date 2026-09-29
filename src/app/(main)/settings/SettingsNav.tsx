import { useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, KeyRound, Settings2, ShieldCheck, UserCircle, Users } from '@/components/icons';
import { SidebarLink, SidebarSection } from '@/components/nav/SidebarLink';

export function SettingsNav({
  isCollapsed,
  onItemClick,
}: {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl, pathname } = useNavigation();

  const items = [
    {
      label: t(labels.settings),
      items: [
        {
          id: 'preferences',
          label: t(labels.preferences),
          path: renderUrl('/settings/preferences'),
          icon: <Settings2 />,
        },
        {
          id: 'profile',
          label: t(labels.profile),
          path: renderUrl('/settings/profile'),
          icon: <UserCircle />,
        },
        {
          id: 'teams',
          label: t(labels.teams),
          path: renderUrl('/settings/teams'),
          icon: <Users />,
        },
        {
          id: 'security',
          label: t(labels.security),
          path: renderUrl('/settings/security'),
          icon: <ShieldCheck />,
        },
        {
          id: 'api-keys',
          label: t(labels.apiKeys),
          path: renderUrl('/settings/api-keys'),
          icon: <KeyRound />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    .find(({ path }) => path && pathname.includes(path.split('?')[0]))?.id;

  return (
    <div className="flex flex-col gap-1">
      <SidebarLink
        href={renderUrl('/websites', false)}
        label={t(labels.back)}
        icon={<ArrowLeft />}
        collapsed={isCollapsed}
        onClick={onItemClick}
      />
      {items.map(({ label: sectionLabel, items: sectionItems }, index) => (
        <SidebarSection
          key={`${sectionLabel}${index}`}
          label={isCollapsed ? undefined : sectionLabel}
        >
          {sectionItems.map(({ id, path, label, icon }) => (
            <SidebarLink
              key={id}
              href={path}
              label={label}
              icon={icon}
              selected={selectedKey === id}
              collapsed={isCollapsed}
              onClick={onItemClick}
            />
          ))}
        </SidebarSection>
      ))}
    </div>
  );
}
