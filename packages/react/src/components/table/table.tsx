import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'

// A slot hugs its content; an icon is 16 × 16.
const slotClass = 'flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0'

// Hover fills come from the browser; `state="hover"` freezes them for docs and tests.
const hoverFill = {
  default: '',
  hover: 'bg-ghost-neutral-hover',
}

/**
 * Table: tabular data in a bordered, rounded frame. Built from native table elements, so a screen reader
 * gets the table, row and column roles for free. Compose it as `Table` › `TableHeaderRow` ›
 * `TableHeader` and `Table` › `TableBody` › `TableRow` › `TableCell`. The layout is fixed: every column
 * takes an equal share, the cells of a column share the width of its header, and a long label ends with an
 * ellipsis instead of widening the column. Set a width on a `TableHeader` (`w-10`) to size its column. Name
 * the table with `aria-label`.
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="w-full overflow-hidden rounded-lg border border-neutral-subtle bg-neutral-subtle"
    >
      <table data-slot="table" className={cn('w-full table-fixed border-collapse', className)} {...props} />
    </div>
  )
}

/** The header of the table: one row of `TableHeader` cells on the neutral surface. Renders a `thead` with its `tr`. */
export function TableHeaderRow({ className, children, ...props }: ComponentProps<'thead'>) {
  return (
    <thead data-slot="table-header-row" className={cn('bg-neutral', className)} {...props}>
      <tr>{children}</tr>
    </thead>
  )
}

/** The body of the table: the `TableRow`s. The last row has no bottom border, because the table has its own. */
export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('[&>tr:last-child>td]:border-b-0', className)} {...props} />
}

const tableRowVariants = cva('hover:bg-ghost-neutral-hover', {
  variants: { state: hoverFill },
  defaultVariants: { state: 'default' },
})

export type TableRowProps = ComponentProps<'tr'> & {
  /** Freezes `hover` for docs and tests. In `default` the browser decides: hover fills the whole row. */
  state?: VariantProps<typeof tableRowVariants>['state']
}

/** One row of the body. Keep the same number of cells in every row and in the header. */
export function TableRow({ className, state, ...props }: TableRowProps) {
  return <tr data-slot="table-row" className={cn(tableRowVariants({ state }), className)} {...props} />
}

const tableHeaderVariants = cva(
  'border-b border-neutral-subtle px-3 py-2 text-left align-middle text-label-small font-normal text-neutral-subtle hover:bg-ghost-neutral-hover',
  {
    variants: { state: hoverFill },
    defaultVariants: { state: 'default' },
  },
)

export type TableHeaderProps = Omit<ComponentProps<'th'>, 'children'> & {
  /** The column title. One line, cut with an ellipsis when it does not fit. For a column with no visible title, pass visually hidden text such as `<span className="sr-only">Actions</span>`, so the column still has a name. */
  label?: ReactNode
  /** Content before the title, usually a small icon. Shown only when set. */
  leadingSlot?: ReactNode
  /** Content after the title, such as a sort icon. Shown only when set. */
  trailingSlot?: ReactNode
  /** Freezes `hover` for docs and tests. In `default` the browser decides. */
  state?: VariantProps<typeof tableHeaderVariants>['state']
}

/** The title of a column: smaller and quieter than a cell. A `th` for its column, so each cell below is read with it. */
export function TableHeader({
  className,
  label,
  leadingSlot,
  trailingSlot,
  state,
  scope = 'col',
  ...props
}: TableHeaderProps) {
  return (
    <th data-slot="table-header" scope={scope} className={cn(tableHeaderVariants({ state }), className)} {...props}>
      <div className="flex items-center gap-2">
        {hasContent(leadingSlot) && (
          <span data-slot="table-header-leading-slot" className={slotClass}>
            {leadingSlot}
          </span>
        )}
        <span data-slot="table-header-label" className="min-w-0 flex-1 truncate">
          {label}
        </span>
        {hasContent(trailingSlot) && (
          <span data-slot="table-header-trailing-slot" className={slotClass}>
            {trailingSlot}
          </span>
        )}
      </div>
    </th>
  )
}

// `type` sets the padding: a button cell is tight so that its 32 px button fills the row height.
const tableCellVariants = cva('h-8 border-b border-neutral-subtle align-middle text-body-xsmall text-neutral', {
  variants: {
    type: {
      text: 'px-3 py-1.5',
      tag: 'px-3 py-1.5',
      checkbox: 'px-3 py-1.5',
      button: 'px-1 py-0',
    },
    state: hoverFill,
  },
  defaultVariants: { type: 'text', state: 'default' },
})

export type TableCellProps = Omit<ComponentProps<'td'>, 'children'> & {
  /** The cell pattern. `text` shows a label with an optional subtitle; `tag`, `checkbox` and `button` show their component, passed as `children`. */
  type?: VariantProps<typeof tableCellVariants>['type']
  /** Freezes `hover` for docs and tests. In `default` the browser decides: hover fills the row, so set it on the row. */
  state?: VariantProps<typeof tableCellVariants>['state']
  /** Cell text. Fills the column width and is cut with an ellipsis when it does not fit. `text` type only. */
  label?: ReactNode
  /** A second line under the label, in a quieter color. `text` type only. */
  subtitle?: ReactNode
  /** Content before the label, such as an icon, a checkbox or an avatar. Shown only when set. `text` type only. */
  leadingSlot?: ReactNode
  /** Content after the label, such as an icon. Shown only when set. `text` type only. */
  trailingSlot?: ReactNode
  /** The content of the `tag`, `checkbox` and `button` types: a `Tag`, a `Checkbox` or an `IconButton`. Any content that fits a cell will do. Give a checkbox and an icon button an `aria-label`. */
  children?: ReactNode
}

/** One cell of a row. Fills its column, so a new column means one more cell in the header and in every row. */
export function TableCell({
  className,
  type = 'text',
  state,
  label,
  subtitle,
  leadingSlot,
  trailingSlot,
  children,
  ...props
}: TableCellProps) {
  return (
    <td data-slot="table-cell" className={cn(tableCellVariants({ type, state }), className)} {...props}>
      {type === 'text' ? (
        <div className="flex items-center gap-2">
          {hasContent(leadingSlot) && (
            <span data-slot="table-cell-leading-slot" className={slotClass}>
              {leadingSlot}
            </span>
          )}
          <span data-slot="table-cell-text" className="flex min-w-0 flex-1 flex-col">
            <span data-slot="table-cell-label" className="truncate">
              {label}
            </span>
            {hasContent(subtitle) && (
              <span data-slot="table-cell-subtitle" className="truncate text-neutral-subtle">
                {subtitle}
              </span>
            )}
          </span>
          {hasContent(trailingSlot) && (
            <span data-slot="table-cell-trailing-slot" className={slotClass}>
              {trailingSlot}
            </span>
          )}
        </div>
      ) : (
        <div data-slot="table-cell-content" className="flex items-center gap-1 overflow-clip">
          {children}
        </div>
      )}
    </td>
  )
}
