import { useEffect, type RefObject } from 'react'

/**
 * Calls `onReset` after the form around the control is reset. `form.reset()` restores the default value
 * without a change event, so a control that tracks whether it holds text (filled look, clear button)
 * uses this to follow. The `reset` event fires before the values are restored, so `onReset` runs in the
 * next task, when the control already holds its restored value. Not a microtask: after a click on a reset
 * button, microtasks run between the event and the restore. Pass a stable function, such as one wrapped
 * once in `useCallback`.
 */
export function useFormReset(ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>, onReset: () => void) {
  useEffect(() => {
    const form = ref.current?.form
    if (!form) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const handle = () => {
      clearTimeout(timer)
      timer = setTimeout(onReset)
    }
    form.addEventListener('reset', handle)
    return () => {
      form.removeEventListener('reset', handle)
      clearTimeout(timer)
    }
  }, [ref, onReset])
}
