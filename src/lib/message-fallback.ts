/**
 * Builds a next-intl `getMessageFallback` that resolves untranslated ids from a source
 * catalog (English), so missing translations never render as raw message ids.
 */
export function createMessageFallback(source: Record<string, any>) {
  return ({ namespace, key }: { namespace?: string; key?: string }) => {
    // Callers sometimes pass an undefined key (e.g. a label for a missing view); never throw.
    const id = [namespace, key].filter(part => typeof part === 'string' && part).join('.');

    if (!id) {
      return '';
    }

    const value = id.split('.').reduce<any>((node, part) => node?.[part], source);

    return typeof value === 'string' ? value : id;
  };
}
