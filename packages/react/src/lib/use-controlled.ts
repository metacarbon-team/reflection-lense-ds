import { useCallback, useState } from 'react'

/**
 * State that is either controlled or uncontrolled, as in Radix: a value other than `undefined` makes
 * it controlled. `null` is a value, so a controlled empty date is `null`.
 */
export function useControlled<T>(controlled: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState(initial)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : inner
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInner(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [value, set] as const
}
