// Shared by every dropdown surface (Select Menu, Dropdown Menu).

import { cva } from 'class-variance-authority'
import { createContext, useState, type KeyboardEventHandler, type PointerEventHandler } from 'react'

/** Which menu primitive the current surface is built on, so shared atoms render the matching part. */
export const MenuSurfaceContext = createContext<'menu' | 'select'>('menu')

/**
 * Item md, the row of every dropdown: 6px above and below, 12px at the sides, label text, so 32px
 * for one line; ghost hover when highlighted (pointer or keyboard), plus the focus ring when the keyboard
 * moved the highlight there (`data-keyboard` on the surface, see `useKeyboardHighlight`).
 * `keepOpenHighlight` also keeps the row highlighted while its submenu is open.
 */
export const menuItemVariants = cva(
  [
    'relative flex cursor-default items-center gap-2 rounded-md px-3 py-1.5 text-label text-neutral outline-none select-none',
    'data-highlighted:bg-ghost-neutral-hover group-data-keyboard/menu:data-highlighted:shadow-focus-ring',
    'data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      keepOpenHighlight: {
        true: 'data-[state=open]:bg-ghost-neutral-hover',
        false: '',
      },
    },
    defaultVariants: { keepOpenHighlight: false },
  },
)

/** Class of a menu surface: the group its rows read `data-keyboard` from. */
export const menuSurfaceGroupClass = 'group/menu'

/**
 * Keyboard highlight for a menu surface (Dropdown Menu content and submenu, Select content). Radix focuses
 * the row under the pointer too, and the browser can count that as `:focus-visible`, so the surface tracks
 * the input itself: `data-keyboard` is set while the last input inside it was a key and cleared by a pointer
 * move. A menu opened from a key (its trigger focus-visible) starts in keyboard mode. The caller's own
 * handlers still run.
 */
export function useKeyboardHighlight<E extends HTMLElement>({
  onKeyDown,
  onPointerMove,
}: {
  onKeyDown?: KeyboardEventHandler<E>
  onPointerMove?: PointerEventHandler<E>
}) {
  const [keyboard, setKeyboard] = useState(
    () => typeof document !== 'undefined' && document.activeElement?.matches(':focus-visible') === true,
  )
  return {
    'data-keyboard': keyboard || undefined,
    onKeyDown: ((event) => {
      setKeyboard(true)
      onKeyDown?.(event)
    }) satisfies KeyboardEventHandler<E>,
    onPointerMove: ((event) => {
      setKeyboard(false)
      onPointerMove?.(event)
    }) satisfies PointerEventHandler<E>,
  }
}

/** The thin line between groups of rows, shared by the Select Menu and the Dropdown Menu. */
export const menuSeparatorClass = 'mx-1 my-1 border-t border-neutral-subtle'
