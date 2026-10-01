import { useEffect, useRef } from 'react';

type ShortcutHandlers = Record<string, ((event: KeyboardEvent) => void) | undefined>;

const IGNORED_TARGETS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"], [role="combobox"], [role="tablist"]';

/**
 * Single-key dashboard shortcuts (e.g. "d" for today). Keys are matched case-insensitively.
 * Shortcuts are ignored while typing, while a menu or dialog has focus, or while a modal is open.
 * The listener is attached once per mount; handlers are read from a ref so callers may pass
 * a fresh object on every render without re-subscribing.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.isComposing || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (target?.closest?.(IGNORED_TARGETS)) {
        return;
      }

      if (document.querySelector('[aria-modal="true"], [data-slot="dialog"]')) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const handler = handlersRef.current[key];

      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
