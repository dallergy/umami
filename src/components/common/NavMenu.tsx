import { SidebarLink, SidebarSection } from '@/components/nav/SidebarLink';

interface NavMenuData {
  id: string;
  label: string;
  icon?: any;
  path: string;
}

interface NavMenuItems {
  label?: string;
  items: NavMenuData[];
}

export interface NavMenuProps {
  items: NavMenuItems[];
  title?: string;
  selectedKey?: string;
  allowMinimize?: boolean;
  onItemClick?: () => void;
}

export function NavMenu({ items = [], title, selectedKey, onItemClick }: NavMenuProps) {
  return (
    <div className="flex flex-col gap-1">
      {title ? <div className="px-2 py-2 text-sm font-semibold tracking-tight">{title}</div> : null}
      {items?.map(({ label, items: sectionItems }, index) => {
        if (!label) {
          return null;
        }

        return (
          <SidebarSection key={`${label}${index}`} label={label}>
            {sectionItems?.map(({ id, label: itemLabel, icon, path }) => (
              <SidebarLink
                key={id}
                href={path}
                label={itemLabel}
                icon={icon}
                selected={selectedKey === id}
                onClick={onItemClick}
              />
            ))}
          </SidebarSection>
        );
      })}
    </div>
  );
}
