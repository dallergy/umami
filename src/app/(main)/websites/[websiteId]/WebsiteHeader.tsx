import { Favicon } from '@/components/common/Favicon';
import Link from '@/components/common/Link';
import { useNavigation, useWebsite } from '@/components/hooks';
import { decodePunycodeDomain } from '@/lib/format';

/** Compact site identity (favicon, name, domain) for headers outside the main app shell. */
export function WebsiteHeader({
  allowLink = true,
}: {
  showActions?: boolean;
  allowLink?: boolean;
}) {
  const website = useWebsite();
  const { renderUrl } = useNavigation();

  if (!website) {
    return null;
  }

  const name = <span className="truncate text-sm font-semibold">{website.name}</span>;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Favicon domain={website.domain} className="size-4 shrink-0 rounded-sm" />
      {allowLink ? (
        <Link
          href={renderUrl(`/websites/${website.id}`, false)}
          className="min-w-0 hover:underline"
        >
          {name}
        </Link>
      ) : (
        name
      )}
      {website.domain && website.domain !== website.name && (
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          {decodePunycodeDomain(website.domain)}
        </span>
      )}
    </div>
  );
}
