import { Check, ChevronsUpDown, Settings2 } from 'lucide-react';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem } from '@/lib/storage';

function Initial({ name, team }: { name?: string; team?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold uppercase',
        team
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {name?.slice(0, 1) || '?'}
    </span>
  );
}

export function TeamsButton() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { teamId, router } = useNavigation();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const label = teamId ? team?.name : user.username;

  const cloudMode = !!process.env.cloudMode;

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const handleNavigate = (url: string) => {
    if (cloudMode) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const handleSelectUser = () => {
    removeItem(LAST_TEAM_CONFIG);

    if (cloudMode) {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group inline-flex h-8 max-w-[180px] min-w-0 items-center gap-2 rounded-md px-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent">
        <Initial name={label} team={!!teamId} />
        <span className="hidden truncate sm:block">{label}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t(labels.myAccount)}
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleSelectUser}>
          <Initial name={user.username} />
          <span className="flex-1 truncate">{user.username}</span>
          {!teamId && <Check className="size-4 text-primary" />}
        </DropdownMenuItem>
        {user?.teams?.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              {t(labels.teams)}
            </DropdownMenuLabel>
            {user.teams.map(({ id, name }) => (
              <DropdownMenuItem key={id} onSelect={() => handleNavigate(getUrl(`/teams/${id}`))}>
                <Initial name={name} team />
                <span className="flex-1 truncate">{name}</span>
                {id === teamId && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleNavigate(getUrl('/settings/teams'))}>
          <Settings2 />
          {t(labels.manageTeams)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
