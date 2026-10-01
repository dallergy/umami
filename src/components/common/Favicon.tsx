import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import { useConfig } from '@/components/hooks';
import { FAVICON_URL, GROUPED_DOMAINS } from '@/lib/constants';

function getHostName(url: string) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?([^:/\n?=]+)/im);
  return match && match.length > 1 ? match[1] : null;
}

// A missing favicon should leave a quiet gap, never a broken-image glyph.
function hideOnError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.visibility = 'hidden';
}

export function Favicon({
  domain,
  ...props
}: { domain?: string } & ImgHTMLAttributes<HTMLImageElement>) {
  const config = useConfig();

  if (config?.privateMode) {
    return null;
  }

  const url = config?.faviconUrl || FAVICON_URL;
  const hostName = domain ? getHostName(domain) : null;
  const domainName = GROUPED_DOMAINS[hostName]?.domain || hostName;
  const src = hostName ? url.replace(/\{\{\s*domain\s*}}/, domainName) : null;

  return hostName ? (
    <img
      src={src}
      width={16}
      height={16}
      alt=""
      loading="lazy"
      decoding="async"
      onError={hideOnError}
      {...props}
    />
  ) : null;
}
