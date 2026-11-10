import type { Ref, RefCallback } from 'react'

/** One callback ref that sets every ref it is given, such as a component's own ref and the caller's. */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(node)
      if (ref) ref.current = node
      return undefined
    })
    return () =>
      refs.forEach((ref, i) => {
        const cleanup = cleanups[i]
        if (typeof cleanup === 'function') cleanup()
        else if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      })
  }
}
