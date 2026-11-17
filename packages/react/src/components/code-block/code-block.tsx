import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { composeRefs } from '../../lib/compose-refs'
import { hasContent } from '../../lib/has-content'
import { CheckIcon, CopyIcon, FileIcon } from '../../lib/icons'
import { Card } from '../card/card'
import { IconButton, type IconButtonProps } from '../icon-button/icon-button'

export type CodeBlockHeaderProps = Omit<ComponentProps<'div'>, 'title' | 'children'> & {
  /** Filename or language label, for example `transport/client.ts` or `tsx`. One line, cut with an ellipsis when it does not fit. */
  title: string
  /** Content before the title, 16 × 16. A file icon when it is not set; swap it for a language or terminal icon, or pass `null` to hide it. */
  leadingSlot?: ReactNode
  /** Header actions at the end. A copy button when it is not set; add a Diff Stat before it for a diff, or pass `null` to hide it. */
  trailingSlot?: ReactNode
  /** The `id` of the title, so the code region can be named by it. `CodeBlock` sets it for you. */
  titleId?: string
}

/**
 * Code Block Header: the title bar of a code block. A leading slot, the title and a trailing slot. It
 * is its own component, and `CodeBlock` renders it from its own `title`, `leadingSlot` and
 * `trailingSlot`.
 */
export function CodeBlockHeader({
  title,
  leadingSlot,
  trailingSlot,
  titleId,
  className,
  ...props
}: CodeBlockHeaderProps) {
  // Not set means the default; `null`, `false` and `''` hide the slot.
  const leading = leadingSlot === undefined ? <FileIcon /> : leadingSlot
  const trailing = trailingSlot === undefined ? <CodeBlockCopyButton /> : trailingSlot
  return (
    <div
      data-slot="code-block-header"
      className={cn('flex items-center gap-2 border-b border-neutral-subtle py-1 pr-2 pl-4', className)}
      {...props}
    >
      {hasContent(leading) && (
        <span
          data-slot="code-block-header-leading-slot"
          className="flex size-4 shrink-0 items-center justify-center text-neutral [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0"
        >
          {leading}
        </span>
      )}
      <span
        id={titleId}
        data-slot="code-block-header-title"
        className="min-w-0 flex-1 truncate text-body-xsmall-medium text-neutral"
      >
        {title}
      </span>
      {hasContent(trailing) && (
        <span data-slot="code-block-header-trailing-slot" className="flex shrink-0 items-center gap-1">
          {trailing}
        </span>
      )}
    </div>
  )
}

export type CodeBlockCopyButtonProps = Omit<
  IconButtonProps,
  'aria-label' | 'children' | 'tone' | 'variant' | 'size'
> & {
  /** Accessible name of the button. */
  'aria-label'?: string
  /** Text announced to screen readers after the code is copied. The icon also turns into a check for two seconds. */
  copiedLabel?: string
}

/**
 * The copy button of a code block, a ghost Icon Button. It copies the code of the block it sits in:
 * every line of code, without line numbers, `+` and `−` signs or hunk headers, one line per row.
 */
export function CodeBlockCopyButton({
  'aria-label': ariaLabel = 'Copy code',
  copiedLabel = 'Copied',
  onClick,
  ref,
  ...props
}: CodeBlockCopyButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  // The button finds its block through its own ref, so a caller's ref is merged, not swapped in.
  const mergedRef = useMemo(() => composeRefs(buttonRef, ref), [ref])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    const block = buttonRef.current?.closest('[data-slot="code-block"]')
    const lines = block?.querySelectorAll('[data-slot="code-line-code"]') ?? []
    const text = Array.from(lines, (line) => line.textContent ?? '').join('\n')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <IconButton
        ref={mergedRef}
        data-slot="code-block-copy-button"
        tone="default"
        variant="ghost"
        size="sm"
        aria-label={ariaLabel}
        onClick={copy}
        {...props}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </IconButton>
      <span data-slot="code-block-copy-status" role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </>
  )
}

export type CodeBlockProps = Omit<ComponentProps<'figure'>, 'title' | 'children' | 'content'> & {
  /** Filename or language label shown in the header, for example `transport/client.ts` or `tsx`. It also names the code region. */
  title: string
  /** Header content before the title, 16 × 16. A file icon when it is not set; pass `null` to hide it, as in a snippet labelled by its language. */
  leadingSlot?: ReactNode
  /** Header actions at the end. A copy button when it is not set; for a diff add a Diff Stat before it. Pass `null` to hide it. */
  trailingSlot?: ReactNode
  /** The `content` slot of Figma, the Card slot below the header. The code: `CodeLine` rows, and `CodeLineHunk` for the `@@` range headers of a diff. */
  content?: ReactNode
}

/**
 * Code Block: read-only code, the way chat and coding tools show it. A header with a title and actions
 * over a list of code lines. It wraps `Card` and runs the header and the lines edge to edge. It is
 * not an editor: for code people edit, use a code editor. A long line scrolls sideways, and the
 * scrolling region takes the keyboard focus. The three variants of Figma (`file`, `code` and `diff`) are compositions: a file
 * snippet (the defaults), a code snippet labelled by its language (`leadingSlot={null}`) and a diff
 * (`CodeLine` rows of type `added` and `removed`, a `CodeLineHunk` and a Diff Stat in `trailingSlot`).
 */
export function CodeBlock({ title, leadingSlot, trailingSlot, content, className, ...props }: CodeBlockProps) {
  const titleId = useId()
  return (
    <Card asChild padding="none" data-slot="code-block" className={cn('gap-0', className)}>
      <figure {...props}>
        <CodeBlockHeader title={title} titleId={titleId} leadingSlot={leadingSlot} trailingSlot={trailingSlot} />
        <div
          data-slot="code-block-body"
          role="group"
          aria-labelledby={titleId}
          tabIndex={0}
          className="overflow-x-auto rounded-b-xl outline-none focus-visible:shadow-focus-ring"
        >
          <div data-slot="code-block-lines" className="w-max min-w-full py-2">
            {content}
          </div>
        </div>
      </figure>
    </Card>
  )
}

/**
 * Tint and text of a line. `highlighted` is a neutral tint for the line the text refers to; `added` and
 * `removed` are the status tints of a diff.
 */
export const codeLineVariants = cva('flex gap-1 px-2 py-0.5 text-code-small', {
  variants: {
    type: {
      default: '',
      highlighted: 'bg-neutral-hover',
      added: 'bg-card-success',
      removed: 'bg-card-danger',
    },
  },
  defaultVariants: { type: 'default' },
})

// What a screen reader hears in place of the tint.
const typeLabel = { default: undefined, highlighted: 'highlighted', added: 'added', removed: 'removed' } as const

export type CodeLineProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `default` is plain code. `highlighted` tints a line the text refers to. `added` and `removed` tint a diff line and show a `+` or `−` sign in the gutter. */
  type?: VariantProps<typeof codeLineVariants>['type']
  /** The line number in the gutter, right-aligned, in subtle text. Not part of the copied code. */
  number?: string | number
  /** The line of code. Keep the indentation with spaces. Syntax colors are text colors on `<span>`s inside it, so recolor the ranges after editing the text. */
  code: ReactNode
  /** Shows the gutter with the line number and the `+` or `−` sign. Turn it on or off for every line of a block, not for some of them. */
  lineNumber?: boolean
}

/** Code Line: one line of code in a `CodeBlock`, with an optional gutter. */
export function CodeLine({ type = 'default', number, code, lineNumber = true, className, ...props }: CodeLineProps) {
  const label = typeLabel[type ?? 'default']
  return (
    <div data-slot="code-line" data-type={type} className={cn(codeLineVariants({ type }), className)} {...props}>
      {lineNumber && (
        <span data-slot="code-line-gutter" aria-hidden="true" className="flex shrink-0 gap-1 select-none">
          <span data-slot="code-line-number" className="w-10 text-right text-neutral-subtle tabular-nums">
            {number}
          </span>
          <span data-slot="code-line-sign" className={cn('w-2', type === 'added' ? 'text-success' : 'text-danger')}>
            {type === 'added' ? '+' : type === 'removed' ? '-' : ''}
          </span>
        </span>
      )}
      {label && <span className="sr-only">{label}: </span>}
      <code data-slot="code-line-code" className="text-code-small whitespace-pre text-neutral">
        {code}
      </code>
    </div>
  )
}

export type CodeLineHunkProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The range header of a diff, for example `@@ -40,7 +40,13 @@ class Client`. */
  code: string
}

/** Code Line Hunk: the `@@` range header of a diff, in subtle text, with no gutter. Not part of the copied code. */
export function CodeLineHunk({ code, className, ...props }: CodeLineHunkProps) {
  return (
    <div data-slot="code-line-hunk" className={cn('flex px-2 py-0.5 text-code-small', className)} {...props}>
      <span data-slot="code-line-hunk-code" className="whitespace-pre text-neutral-subtle">
        {code}
      </span>
    </div>
  )
}
