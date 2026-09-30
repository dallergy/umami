import { useMessages, useNavigation, useWebsiteNavItems } from '@/components/hooks';
import { ArrowLeft } from '@/components/icons';
import { SidebarLink, SidebarSection } from '@/components/nav/SidebarLink';

export function WebsiteNav({
  websiteId,
  isCollapsed,
  onItemClick,
}: {
  websiteId: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { items, selectedKey } = useWebsiteNavItems(websiteId);

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
