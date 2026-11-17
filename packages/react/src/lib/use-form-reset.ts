import { useEffect, type RefObject } from 'react'

/**
 * Calls `onReset` when the form around the control is reset. `form.reset()` clears the value without a
 * change event, so a control that tracks whether it holds text (filled look, clear button) uses this to
 * follow. Pass a stable function, such as a state setter wrapped once.
 */
export function useFormReset(ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>, onReset: () => void) {
  useEffect(() => {
    const form = ref.current?.form
    if (!form) return
    form.addEventListener('reset', onReset)
    return () => form.removeEventListener('reset', onReset)
  }, [ref, onReset])
}
