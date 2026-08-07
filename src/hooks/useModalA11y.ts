import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared modal accessibility behavior: closes on Escape, traps Tab focus within
 * the dialog, moves focus into the dialog on open, and restores it to whatever
 * had focus before the dialog opened when it closes.
 *
 * Attach the returned ref to the dialog's outer panel element (the one with
 * role="dialog").
 *
 * Pass `active` for modals that stay mounted and toggle visibility internally
 * (e.g. `if (!isOpen) return null` after other hooks) rather than being
 * conditionally rendered by their parent — the effect needs to re-run when
 * `active` flips to true, since mount-only (empty deps) won't fire again.
 */
export function useModalA11y<T extends HTMLElement>(onClose: () => void, active: boolean = true) {
  const dialogRef = useRef<T | null>(null);

  // Keep the latest onClose in a ref so the keydown listener (registered once
  // per `active` toggle, not per render) never calls a stale closure — matters
  // for modals whose close behavior changes based on internal state.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;

    const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables && focusables.length > 0) {
      focusables[0].focus();
    } else {
      node?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && node) {
        const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [active]);

  return dialogRef;
}
