import { useEffect, useRef } from "react";

/**
 * Auto-clears a transient message (validation error, API error) after a
 * short delay — the standard pattern for inline form errors, so a mistake
 * from a minute ago doesn't sit on screen forever.
 *
 * The timer restarts only when `value` changes, not on every render, so an
 * inline arrow passed as `onDismiss` won't keep resetting the clock.
 */
export function useAutoDismiss(value: unknown, onDismiss: () => void, delayMs: number = 3000) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => onDismissRef.current(), delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
