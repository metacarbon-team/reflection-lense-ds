import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import { composeRefs } from './compose-refs'

// Portalled content (Dialog, Dropdown Menu, Select, Popover, Date Picker, Tooltip) renders in `<body>`,
// outside the subtree that sets a local `data-mode`. The root of each such component records its trigger;
// the portalled element renders with the mode of the trigger's closest `data-mode` (Tooltip with the
// opposite) and follows it when it changes. Without a trigger, such as a dialog opened from state, it
// takes the mode of `<html>`. The mode is a rendered attribute, not one set after mount, so the content
// never shows a frame in the wrong mode (Radix reads the styles on mount, and a dialog transitions colors).

type Mode = 'light' | 'dark'

const ModeAnchorContext = createContext<RefObject<HTMLElement | null> | null>(null)

/** Wraps the root of a portalled component: holds the element whose mode the content takes. */
export function ModeAnchor({ children }: { children: ReactNode }) {
  const anchor = useRef<HTMLElement | null>(null)
  return <ModeAnchorContext value={anchor}>{children}</ModeAnchorContext>
}

/** The trigger's ref: records it as the mode anchor. The caller's own ref is kept. */
export function useModeAnchorRef<T extends HTMLElement>(ref?: Ref<T>) {
  const anchor = useContext(ModeAnchorContext) as RefObject<T | null> | null
  return useMemo(() => composeRefs(anchor ?? undefined, ref), [anchor, ref])
}

/** The mode at `anchor`: its closest `data-mode`, or `<html>`'s, light when none is set; swapped with `swap`. */
export function modeAt(anchor: Element | null, swap = false): Mode {
  const holder = anchor?.closest<HTMLElement>('[data-mode]') ?? document.documentElement
  const mode: Mode = holder.dataset.mode === 'dark' ? 'dark' : 'light'
  return swap ? (mode === 'dark' ? 'light' : 'dark') : mode
}

/** Calls `onChange` on every `data-mode` change in the document: an ancestor can gain or lose one too. */
export function subscribeModes(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'], subtree: true })
  return () => observer.disconnect()
}

const current = (anchor: RefObject<HTMLElement | null> | null) => anchor?.current ?? null

/**
 * The mode for the portalled element of the component around it, for its `data-mode`: the trigger's mode,
 * or the opposite with `swap`. Re-renders when it changes.
 */
export function usePortalMode(swap = false): Mode | undefined {
  const anchor = useContext(ModeAnchorContext)
  return useSyncExternalStore(
    subscribeModes,
    () => modeAt(current(anchor), swap),
    () => undefined,
  )
}
