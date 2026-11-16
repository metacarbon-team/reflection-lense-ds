import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleTriggerProps } from '../collapsible'

/**
 * Timeline Step: one step of an agent run. A collapsible header over a panel with a vertical divider
 * beside the details. Closed shows the header alone; open reveals the content. Built on the Radix
 * Collapsible: `open`, `defaultOpen`, `onOpenChange` and `disabled` work as in Radix. Put a
 * `TimelineStepTrigger` and a `TimelineStepContent` inside. Stack steps in a vertical flex with a 4 px
 * gap (`gap-1`); each step keeps its own state.
 */
export const TimelineStep = ({ className, ...props }: ComponentProps<typeof Collapsible>) => (
  <Collapsible data-slot="timeline-step" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
)

export type TimelineStepTriggerProps = Omit<CollapsibleTriggerProps, 'state'>

/**
 * The step header: a label, an optional `leadingSlot` and a chevron that is always there. It points
 * down when the step is closed and up when it is open. Radix sets `aria-expanded` and `aria-controls`.
 * The label is the `children`.
 */
export const TimelineStepTrigger = (props: TimelineStepTriggerProps) => <CollapsibleTrigger {...props} />

/**
 * The `content` slot: the details of the step beside the vertical divider, shown when the step is open.
 * Item rows for short results or a code block for terminal output; the slot fills the width, so its
 * content should fill it too. The divider stays beside the slot and grows with it.
 */
export const TimelineStepContent = ({ className, children, ...props }: ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent data-slot="timeline-step-content" className={cn('flex gap-3 pl-2', className)} {...props}>
    <span
      aria-hidden="true"
      data-slot="timeline-step-divider"
      className="w-px shrink-0 self-stretch border-l border-neutral-subtle"
    />
    <div className="flex min-w-0 flex-1 flex-col items-stretch overflow-clip">{children}</div>
  </CollapsibleContent>
)
