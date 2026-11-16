import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible/collapsible'

// The header glyph is part of the component, as in Figma, so it is drawn here and not exported.
const RouteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
)

export type ChatBubbleProps = Omit<ComponentProps<'div'>, 'children' | 'content'> & {
  /** The thought text inside the open block, below the header. Any content: text, a list or code. */
  content?: ReactNode
  /** The answer text. Shown in full, never truncated. The answer is hidden when it is not set. */
  message?: ReactNode
  /** The row of actions on the left of the toolbar: ghost icon buttons. The toolbar shows when `actions` or `stats` is set. */
  actions?: ReactNode
  /** The usage stats on the right of the toolbar: an icon and a value each. The toolbar shows when `actions` or `stats` is set. */
  stats?: ReactNode
  /** Whether the reasoning block is open. Use with `onOpenChange` to control it. */
  open?: boolean
  /** Whether the reasoning block is open at first, when it is not controlled. */
  defaultOpen?: boolean
  /** Called when the header opens or closes the reasoning block. */
  onOpenChange?: (open: boolean) => void
}

/**
 * Chat Bubble: an AI reply. A collapsible reasoning block with the thought text, the answer text and
 * a toolbar of actions and usage stats. The block folds to its header; the answer and the toolbar
 * show when they are set. Width fills the parent, height hugs the content.
 */
export function ChatBubble({
  content,
  message,
  actions,
  stats,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  ...props
}: ChatBubbleProps) {
  const hasActions = hasContent(actions)
  const hasStats = hasContent(stats)
  return (
    <div data-slot="chat-bubble" className={cn('flex w-full min-w-0 flex-col gap-3', className)} {...props}>
      <Collapsible
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        className="flex flex-col gap-2 overflow-clip rounded-lg border border-neutral-subtle bg-neutral-subtle p-3"
      >
        <CollapsibleTrigger leadingSlot={<RouteIcon />} className="self-start">
          Thought for 0.8s
        </CollapsibleTrigger>
        <CollapsibleContent data-slot="chat-bubble-content" className="text-body-small text-neutral-subtle">
          {content}
        </CollapsibleContent>
      </Collapsible>
      {hasContent(message) && (
        <div data-slot="chat-bubble-message" className="w-full text-body-small text-neutral">
          {message}
        </div>
      )}
      {(hasActions || hasStats) && (
        <div data-slot="chat-bubble-toolbar" className="flex w-full items-center gap-2">
          {hasActions && (
            <div data-slot="chat-bubble-actions" className="flex items-start gap-1">
              {actions}
            </div>
          )}
          {hasStats && (
            <div
              data-slot="chat-bubble-stats"
              className="ml-auto flex items-center gap-3 text-caption text-neutral-subtle [&_svg]:size-4 [&_svg]:shrink-0"
            >
              {stats}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
