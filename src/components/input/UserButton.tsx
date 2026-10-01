import { useTheme } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useConfig, useLocale, useLoginQuery, useMessages } from '@/components/hooks';
import {
  BookText,
  ExternalLink,
  Globe,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMoon,
} from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { DOCS_URL } from '@/lib/constants';
import { languages } from '@/lib/lang';

export interface UserButtonProps {
  showText?: boolean;
  placement?: 'top' | 'bottom';
  onClose?: () => void;
}

export function UserButton({ showText = true, placement = 'top', onClose }: UserButtonProps) {
  const { user } = useLoginQuery();
  const { cloudMode } = useConfig();
  const { t, labels } = useMessages();
  const { locale, saveLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const handleNavigate = (url: string, target?: string) => {
    onClose?.();

    if (target) {
      window.open(url, target);
    } else if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const handleSelectLocale = (key: string) => {
    saveLocale(key);
    onClose?.();
  };

  const handleSelectTheme = (key: string) => {
    setTheme(key as 'light' | 'dark');
    onClose?.();
  };

  const items = [
    cloudMode && {
      id: 'docs',
      label: t(labels.documentation),
      path: DOCS_URL,
      icon: <BookText />,
      target: '_blank',
      external: true,
    },
    cloudMode && {
      id: 'support',
      label: t(labels.support),
      path: getUrl('/settings/support'),
      icon: <LifeBuoy />,
    },
    !cloudMode &&
      user.isAdmin && {
        id: 'admin',
        label: t(labels.admin),
        path: '/admin',
        icon: <LockKeyhole />,
      },
  ].filter(Boolean) as {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    target?: string;
    external?: boolean;
  }[];

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={user.username}
        style={showText ? { width: '100%' } : undefined}
        className={cn(
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          showText
            ? 'flex h-9 items-center justify-start gap-2 rounded-md px-2 text-sm hover:bg-accent data-[state=open]:bg-accent'
            : 'flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-card hover:ring-2 hover:ring-border data-[state=open]:ring-2 data-[state=open]:ring-border',
        )}
      >
        <Avatar size={showText ? 'sm' : 'default'} aria-hidden="true">
          <AvatarFallback
            className={cn(
              !showText &&
                'bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white',
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {showText && <span className="truncate">{user.username}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={placement}
        align={placement === 'bottom' ? 'end' : 'start'}
        className="w-56"
      >
        <DropdownMenuLabel className="truncate py-2 font-semibold">
          {user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleNavigate(getUrl('/settings'))}>
          <Settings />
          {t(labels.settings)}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 text-[13px] [&_svg:not([class*='text-'])]:text-muted-foreground">
            <Globe className="size-4" />
            {t(labels.language)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
            <DropdownMenuRadioGroup value={locale} onValueChange={handleSelectLocale}>
              {Object.keys(languages).map(key => (
                <DropdownMenuRadioItem key={key} value={key} className="text-[13px]">
                  {languages[key].label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 text-[13px] [&_svg:not([class*='text-'])]:text-muted-foreground">
            <SunMoon className="size-4" />
            {t(labels.theme)}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={handleSelectTheme}>
              <DropdownMenuRadioItem value="light" className="gap-2 text-[13px]">
                <Sun className="size-4 text-muted-foreground" />
                {t(labels.light) || 'Light'}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="gap-2 text-[13px]">
                <Moon className="size-4 text-muted-foreground" />
                {t(labels.dark) || 'Dark'}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {items.map(({ id, path, label, icon, target, external }) => (
          <DropdownMenuItem key={id} onSelect={() => handleNavigate(path, target)}>
            {icon}
            {label}
            {external && <ExternalLink className="ml-auto size-3.5" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleNavigate(getUrl('/logout'))}>
          <LogOut />
          {t(labels.logout)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
