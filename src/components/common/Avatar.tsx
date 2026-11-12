import { lorelei } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { useMemo } from 'react';
import { getColor, getPastel } from '@/lib/colors';

const lib = lorelei;

export function Avatar({ seed, size = 128, ...props }: { seed: string; size?: number }) {
  const backgroundColor = getPastel(getColor(seed), 4);

  // Keyed on the seed so a reused element (e.g. a virtualized list row) shows the new avatar.
  const avatar = useMemo(() => {
    return createAvatar(lib, {
      ...props,
      seed,
      size,
      backgroundColor: [backgroundColor],
    }).toDataUri();
  }, [seed, size, backgroundColor]);

  return <img src={avatar} alt="Avatar" style={{ borderRadius: '100%', width: size }} />;
}
