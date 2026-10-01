'use client';
import { useShare } from '@/components/hooks';
import { Logo } from '@/components/svg';

const LOGO_SIZE = { sm: 20, md: 24, lg: 32 };

export function ShareBranding({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const share = useShare();
  const logoDomain = share?.whiteLabel?.domainName || 'https://umami.is';
  const logoName = share?.whiteLabel?.displayName || 'umami';
  const logoImage = share?.whiteLabel?.logoUrl;
  const height = LOGO_SIZE[size];

  return (
    <a
      href={logoDomain}
      target="_blank"
      rel="noopener"
      className="flex shrink-0 items-center gap-2 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {logoImage ? (
        <img src={logoImage} alt={logoName} style={{ height }} />
      ) : (
        <Logo style={{ width: height, height }} />
      )}
      <span
        className={
          size === 'sm' ? 'text-sm font-semibold' : 'text-[15px] font-semibold tracking-tight'
        }
      >
        {logoName}
      </span>
    </a>
  );
}
