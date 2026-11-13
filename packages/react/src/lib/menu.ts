// Shared by every dropdown surface (Select Menu, Dropdown Menu).

import { cva } from 'class-variance-authority'
import { createContext } from 'react'

/** Which menu primitive the current surface is built on, so shared atoms render the matching part. */
export const MenuSurfaceContext = createContext<'menu' | 'select'>('menu')

/**
 * Item md, the row of every dropdown: 4px above and below, 12px at the sides, label text, so 28px
 * for one line; ghost hover when highlighted (pointer or keyboard). `keepOpenHighlight` also keeps
 * the row highlighted while its submenu is open.
 */
export const menuItemVariants = cva(
  [
    'relative flex cursor-default items-center gap-2 rounded-md px-3 py-1 text-label text-neutral outline-none select-none',
    'data-highlighted:bg-ghost-neutral-hover',
    'data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
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

/** The thin line between groups of rows, shared by the Select Menu and the Dropdown Menu. */
export const menuSeparatorClass = 'mx-1 my-1 border-t border-neutral-subtle'
