import { NavMenu } from '@/components/common/NavMenu';
import { useMessages, useNavigation } from '@/components/hooks';
import { ArrowLeft, Globe, ShieldCheck, User, Users } from '@/components/icons';
import { SidebarLink } from '@/components/nav/SidebarLink';

export function AdminNav({ onItemClick }: { onItemClick?: () => void }) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl } = useNavigation();

  const items = [
    {
      label: t(labels.manage),
      items: [
        {
          id: 'users',
          label: t(labels.users),
          path: '/admin/users',
          icon: <User />,
        },
        {
          id: 'websites',
          label: t(labels.websites),
          path: '/admin/websites',
          icon: <Globe />,
        },
        {
          id: 'teams',
          label: t(labels.teams),
          path: '/admin/teams',
          icon: <Users />,
        },
        {
          id: 'security',
          label: t(labels.security),
          path: '/admin/security',
          icon: <ShieldCheck />,
        },
      ],
    },
  ];

  const selectedKey = items
    .flatMap(e => e.items)
    ?.find(({ path }) => path && pathname.startsWith(path))?.id;

  return (
    <div className="flex flex-col gap-1">
      <SidebarLink
        href={renderUrl('/websites', false)}
        label={t(labels.back)}
        icon={<ArrowLeft />}
        onClick={onItemClick}
      />
      <NavMenu
        items={items}
        selectedKey={selectedKey}
        allowMinimize={false}
        onItemClick={onItemClick}
      />
    </div>
  );
}
