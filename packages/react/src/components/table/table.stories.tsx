import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps, ReactNode } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { ChevronRightIcon, DotsIcon } from '../../lib/icons'
import { Checkbox } from '../checkbox'
import { IconButton } from '../icon-button'
import { Tag } from '../tag'
import { Table, TableBody, TableCell, TableHeader, TableHeaderRow, TableRow } from './table'

const FileIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2Z" />
    <path d="M9 2v4h4" />
  </svg>
)

type PlaygroundArgs = ComponentProps<typeof Table> & {
  /** State of the second row. `hover` freezes the hover fill. */
  rowState: ComponentProps<typeof TableRow>['state']
  /** Shows a subtitle under the first cell of every row. */
  subtitle: boolean
  /** Shows an icon before the label in every text cell. */
  leadingSlot: boolean
  /** Shows an icon after the label in every text cell. */
  trailingSlot: boolean
  /** Adds a last column of `button` cells. It is a cell type of its own, not a slot. */
  buttonColumn: boolean
}

const people = [
  { name: 'Billing service', code: 'billing-api', owner: 'Ana Petrova', updated: '2 hours ago' },
  { name: 'Auth gateway', code: 'auth-service', owner: 'Liam Chen', updated: 'Yesterday' },
  { name: 'Search index', code: 'search-cluster', owner: 'Sara Okafor', updated: '3 days ago' },
  { name: 'Mail relay', code: 'smtp-relay', owner: 'Noah Weber', updated: 'Last week' },
]

const meta = {
  title: 'Components/Table',
  component: Table,
  subcomponents: { TableHeaderRow, TableBody, TableRow, TableHeader, TableCell },
  args: {
    'aria-label': 'Services',
    rowState: 'default',
    subtitle: true,
    leadingSlot: false,
    trailingSlot: false,
    buttonColumn: false,
  },
  argTypes: {
    // Playground-only controls: they set up the example and are not props of Table.
    rowState: {
      control: 'inline-radio',
      options: ['default', 'hover'],
      description: 'State of the second row. `hover` freezes the hover fill.',
      table: { category: 'Playground', type: { summary: "'default' | 'hover'" } },
    },
    subtitle: {
      control: 'boolean',
      description: 'Shows a subtitle under the first cell of every row.',
      table: { category: 'Playground' },
    },
    leadingSlot: {
      control: 'boolean',
      description: 'Shows an icon before the label in every text cell.',
      table: { category: 'Playground' },
    },
    trailingSlot: {
      control: 'boolean',
      description: 'Shows an icon after the label in every text cell.',
      table: { category: 'Playground' },
    },
    buttonColumn: {
      control: 'boolean',
      description: 'Adds a last column of `button` cells. It is a cell type of its own, not a slot.',
      table: { category: 'Playground' },
    },
  },
  parameters: { docs: { page: DocsPage } },
  render: ({ rowState, subtitle, leadingSlot, trailingSlot, buttonColumn, ...args }) => (
    <div className="w-160">
      <Table {...args}>
        <TableHeaderRow>
          <TableHeader label="Name" />
          <TableHeader label="Role" />
          <TableHeader label="Owner" />
          <TableHeader label="Updated" />
          {buttonColumn && <TableHeader label={<span className="sr-only">Actions</span>} className="w-10" />}
        </TableHeaderRow>
        <TableBody>
          {people.map((person, index) => (
            <TableRow key={person.name} state={index === 1 ? rowState : 'default'}>
              <TableCell
                label={person.name}
                subtitle={subtitle ? person.code : undefined}
                leadingSlot={leadingSlot ? <FileIcon /> : undefined}
                trailingSlot={trailingSlot ? <DotsIcon /> : undefined}
              />
              <TableCell type="tag">
                <Tag size="md">Admin</Tag>
                <Tag size="md" tone="info">
                  Editor
                </Tag>
              </TableCell>
              <TableCell
                label={person.owner}
                leadingSlot={leadingSlot ? <FileIcon /> : undefined}
                trailingSlot={trailingSlot ? <DotsIcon /> : undefined}
              />
              <TableCell
                label={person.updated}
                leadingSlot={leadingSlot ? <FileIcon /> : undefined}
                trailingSlot={trailingSlot ? <DotsIcon /> : undefined}
              />
              {buttonColumn && (
                <TableCell type="button">
                  <IconButton aria-label={`Open ${person.name}`} tone="default" variant="ghost" size="sm">
                    <ChevronRightIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
} satisfies Meta<PlaygroundArgs>

export default meta
type Story = StoryObj<typeof meta>

/** A table of four columns. The controls set the subtitle and the slots of the text cells, add a column of button cells, and freeze the hover fill of the second row. */
export const Playground: Story = {}

type CellArgs = Pick<ComponentProps<typeof TableCell>, 'type' | 'state' | 'label' | 'subtitle'> & {
  /** Shows an icon before the label. `text` type only. */
  leadingSlot: boolean
  /** Shows an icon after the label. `text` type only. */
  trailingSlot: boolean
  // Playground controls that the meta passes on; hidden for this story.
  'aria-label'?: never
  rowState?: never
}

/**
 * One cell on its own, like the Figma component: pick the `type` (`text`, `tag`, `checkbox`, `button`) and the
 * `state`. For `text`, the controls also set the label, the subtitle and the slots; the other types
 * show their component in the content slot.
 */
export const Cell: StoryObj<CellArgs> = {
  args: { type: 'text', state: 'default', label: 'Cell', subtitle: '', leadingSlot: false, trailingSlot: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'tag', 'checkbox', 'button'] },
    state: { control: 'inline-radio', options: ['default', 'hover'] },
    label: { control: 'text', description: 'Cell text. `text` type only.' },
    subtitle: { control: 'text', description: 'Second line under the label. `text` type only.' },
    leadingSlot: { control: 'boolean' },
    trailingSlot: { control: 'boolean' },
    // Controls of the Playground that mean nothing for a single cell.
    'aria-label': { table: { disable: true } },
    rowState: { table: { disable: true } },
  },
  parameters: { docs: { source: { type: 'code' } } },
  render: ({ type = 'text', state, label, subtitle, leadingSlot, trailingSlot }) => (
    <Bare name={`Table Cell ${type}`} hug={type === 'checkbox' || type === 'button'}>
      <TableCell
        type={type}
        state={state}
        label={label}
        subtitle={subtitle || undefined}
        leadingSlot={leadingSlot ? <FileIcon /> : undefined}
        trailingSlot={trailingSlot ? <ChevronRightIcon /> : undefined}
      >
        {type === 'tag' && (
          <>
            <Tag size="md">Admin</Tag>
            <Tag size="md" tone="info">
              Editor
            </Tag>
          </>
        )}
        {type === 'checkbox' && <Checkbox aria-label="Select row" />}
        {type === 'button' && (
          <IconButton aria-label="Open row" tone="default" variant="ghost" size="sm">
            <ChevronRightIcon />
          </IconButton>
        )}
      </TableCell>
    </Bare>
  ),
}

const states = ['default', 'hover'] as const

/** One cell of each pattern in a bare table, so the cell is shown on its own. */
function Bare({
  name,
  hug = false,
  head,
  children,
}: {
  name: string
  hug?: boolean
  head?: ReactNode
  children?: ReactNode
}) {
  return (
    <table aria-label={name} className={hug ? 'border-collapse' : 'w-52 table-fixed border-collapse'}>
      {head}
      <tbody>{children ? <tr>{children}</tr> : null}</tbody>
    </table>
  )
}

const rowLabels = [
  'Table Header',
  'Table Cell / text',
  'Table Cell / tag',
  'Table Cell / checkbox',
  'Table Cell / button',
]

/** Every cell pattern in `default` and `hover`, as in the Figma matrix, then a whole table. Hover is frozen with `state`. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-fit flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h3 className="text-label text-neutral">Cells</h3>
        <div className="grid grid-cols-[max-content_repeat(2,16rem)] items-center gap-x-8 gap-y-4">
          <span />
          {states.map((state) => (
            <span key={state} className="text-label-small text-neutral-subtle">
              {state}
            </span>
          ))}
          {rowLabels.map((rowLabel, row) => (
            <div key={rowLabel} className="contents">
              <span className="justify-self-end text-label-small text-neutral-subtle">{rowLabel}</span>
              {states.map((state) => (
                <div key={state}>
                  {row === 0 && (
                    <Bare
                      name={`Table Header, ${state}`}
                      head={
                        <TableHeaderRow className="bg-transparent">
                          <TableHeader label="Header" state={state} />
                        </TableHeaderRow>
                      }
                    />
                  )}
                  {row === 1 && (
                    <Bare name={`Table Cell text, ${state}`}>
                      <TableCell label="Cell" state={state} />
                    </Bare>
                  )}
                  {row === 2 && (
                    <Bare name={`Table Cell tag, ${state}`}>
                      <TableCell type="tag" state={state}>
                        <Tag size="md">Admin</Tag>
                        <Tag size="md" tone="info">
                          Editor
                        </Tag>
                      </TableCell>
                    </Bare>
                  )}
                  {row === 3 && (
                    <Bare name={`Table Cell checkbox, ${state}`} hug>
                      <TableCell type="checkbox" state={state}>
                        <Checkbox aria-label="Select row" />
                      </TableCell>
                    </Bare>
                  )}
                  {row === 4 && (
                    <Bare name={`Table Cell button, ${state}`} hug>
                      <TableCell type="button" state={state}>
                        <IconButton aria-label="Open row" tone="default" variant="ghost" size="sm">
                          <ChevronRightIcon />
                        </IconButton>
                      </TableCell>
                    </Bare>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h3 className="text-label text-neutral">Table</h3>
        <Table aria-label="Services, all cell types">
          <TableHeaderRow>
            <TableHeader label="Name" />
            <TableHeader label="Role" />
            <TableHeader label="Owner" />
            <TableHeader label="Updated" />
            <TableHeader label={<span className="sr-only">Actions</span>} className="w-10" />
          </TableHeaderRow>
          <TableBody>
            {people.map((person, index) => (
              <TableRow key={person.name} state={index === 1 ? 'hover' : 'default'}>
                <TableCell label={person.name} subtitle={person.code} />
                <TableCell type="tag">
                  <Tag size="md">Admin</Tag>
                  <Tag size="md" tone="info">
                    Editor
                  </Tag>
                </TableCell>
                <TableCell label={person.owner} />
                <TableCell label={person.updated} />
                <TableCell type="button">
                  <IconButton aria-label={`Open ${person.name}`} tone="default" variant="ghost" size="sm">
                    <ChevronRightIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  ),
}

/** `leadingSlot` and `trailingSlot` sit inside a text cell or a header, around the label, and hold an icon, a checkbox, a tag or an avatar. They show only when set. The tag, checkbox and button cells have no slots. */
export const Slots: Story = {
  render: () => (
    <div className="w-160">
      <Table aria-label="Files">
        <TableHeaderRow>
          <TableHeader label="File" leadingSlot={<FileIcon />} />
          <TableHeader label="Owner" />
          <TableHeader label="Updated" trailingSlot={<DotsIcon />} />
        </TableHeaderRow>
        <TableBody>
          <TableRow>
            <TableCell label="Budget plan 2025" subtitle="budget.xlsx" leadingSlot={<FileIcon />} />
            <TableCell label="Ana Petrova" />
            <TableCell label="2 hours ago" trailingSlot={<DotsIcon />} />
          </TableRow>
          <TableRow>
            <TableCell label="Roadmap" subtitle="roadmap.pdf" leadingSlot={<FileIcon />} />
            <TableCell label="Liam Chen" />
            <TableCell label="Yesterday" trailingSlot={<DotsIcon />} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
}

/** A selectable table: a checkbox column on the left and an action column on the right. Name every checkbox and icon button. */
export const WithSelection: Story = {
  render: () => (
    <div className="w-160">
      <Table aria-label="Services, selectable">
        <TableHeaderRow>
          <TableHeader label={<Checkbox aria-label="Select all rows" />} className="w-11" />
          <TableHeader label="Name" />
          <TableHeader label="Owner" />
          <TableHeader label={<span className="sr-only">Actions</span>} className="w-10" />
        </TableHeaderRow>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.name}>
              <TableCell type="checkbox">
                <Checkbox aria-label={`Select ${person.name}`} />
              </TableCell>
              <TableCell label={person.name} subtitle={person.code} />
              <TableCell label={person.owner} />
              <TableCell type="button">
                <IconButton aria-label={`Open ${person.name}`} tone="default" variant="ghost" size="sm">
                  <ChevronRightIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

/** A long label keeps its column width and ends with an ellipsis. */
export const LongText: Story = {
  render: () => (
    <div className="w-120">
      <Table aria-label="Long labels">
        <TableHeaderRow>
          <TableHeader label="Name" />
          <TableHeader label="Owner" />
        </TableHeaderRow>
        <TableBody>
          <TableRow>
            <TableCell
              label="Customer onboarding checklist for the enterprise plan"
              subtitle="A subtitle that does not fit in the column is cut as well"
            />
            <TableCell label="Ana Petrova" />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
}

const head = ['Name', 'Role', 'Owner', 'Updated']
const billing = ['Billing', 'Admin', 'Ana P.', 'Today']
const auth = ['Auth', 'Editor', 'Liam C.', 'Mon']
const search = ['Search', 'Viewer', 'Sara O.', 'Fri']
const mail = ['Mail', 'Admin', 'Noah W.', 'Oct 28']
const rows = [billing, auth, search, mail]

function Mistake({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-center text-caption text-danger">{children}</p>
}

/** The four-column sample of the guidelines. Widths go on the headers; `bodyClassName` and `data` change the rest. */
function Sample({
  name,
  widths = [],
  bodyClassName,
  data = rows,
}: {
  name: string
  widths?: string[]
  bodyClassName?: string
  data?: string[][]
}) {
  return (
    <Table aria-label={name}>
      <TableHeaderRow>
        {head.map((label, column) => (
          <TableHeader key={label} label={label} className={widths[column]} />
        ))}
      </TableHeaderRow>
      <TableBody className={bodyClassName}>
        {data.map((cells) => (
          <TableRow key={cells[0]}>
            {cells.map((label, column) => (
              <TableCell key={column} label={label} />
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * **Match header and cell widths**  
 * Header and cells of one column share a width, so the labels line up.
 */
export const GuidelineMatchHeaderAndCellWidthsDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full max-w-md">
        <Sample name="Do, match header and cell widths" />
      </div>
    </Specimen>
  ),
}

export const GuidelineMatchHeaderAndCellWidthsDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      {/* The header and the body are two tables with their own column widths, so the labels do not line up. */}
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-neutral-subtle bg-neutral-subtle">
        <table aria-label="Don’t, header" className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-20" />
            <col className="w-32" />
            <col className="w-24" />
            <col />
          </colgroup>
          <TableHeaderRow>
            {head.map((label) => (
              <TableHeader key={label} label={label} />
            ))}
          </TableHeaderRow>
        </table>
        <table aria-label="Don’t, body" className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-32" />
            <col />
          </colgroup>
          <TableBody>
            {rows.map((cells) => (
              <TableRow key={cells[0]}>
                {cells.map((label, column) => (
                  <TableCell key={column} label={label} />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </Specimen>
  ),
}

const longRows = [['Customer onboarding checklist', 'Admin', 'Ana P.', 'Today'], auth, search, mail]

/**
 * **Let long labels truncate**  
 * Keep the column width and let the label end with an ellipsis. Do not widen a column to fit one long value.
 */
export const GuidelineLetLongLabelsTruncateDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full max-w-md">
        <Sample name="Do, let long labels truncate" data={longRows} />
      </div>
    </Specimen>
  ),
}

export const GuidelineLetLongLabelsTruncateDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full max-w-md">
        <Sample name="Don’t, let long labels truncate" widths={['w-60', 'w-10', 'w-10', 'w-10']} data={longRows} />
      </div>
    </Specimen>
  ),
}

/**
 * **Remove the border under the last row**  
 * The table already has its own border. The cells of the last row have no bottom border, so the two lines do not double up.
 */
export const GuidelineRemoveTheBorderUnderTheLastRowDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full max-w-md">
        <Sample name="Do, remove the border under the last row" />
      </div>
    </Specimen>
  ),
}

export const GuidelineRemoveTheBorderUnderTheLastRowDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full max-w-md">
        <Sample name="Don’t, remove the border under the last row" bodyClassName="[&>tr:last-child>td]:border-b" />
        <Mistake>Border doubles at the bottom edge</Mistake>
      </div>
    </Specimen>
  ),
}

/**
 * **Keep the same number of columns**  
 * The header and every row hold the same number of cells. A row with fewer cells shifts its values under the wrong column.
 */
export const GuidelineKeepTheSameNumberOfColumnsDo: Story = {
  name: 'Guideline 4 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full max-w-md">
        <Sample name="Do, keep the same number of columns" />
      </div>
    </Specimen>
  ),
}

export const GuidelineKeepTheSameNumberOfColumnsDont: Story = {
  name: 'Guideline 4 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full max-w-md">
        <Sample
          name="Don’t, keep the same number of columns"
          data={[billing, ['Auth', 'Liam C.', 'Mon'], search, ['Mail', 'Noah W.', 'Oct 28']]}
        />
        <Mistake>The row is missing a cell</Mistake>
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  const rules = [
    [GuidelineMatchHeaderAndCellWidthsDo, GuidelineMatchHeaderAndCellWidthsDont],
    [GuidelineLetLongLabelsTruncateDo, GuidelineLetLongLabelsTruncateDont],
    [GuidelineRemoveTheBorderUnderTheLastRowDo, GuidelineRemoveTheBorderUnderTheLastRowDont],
    [GuidelineKeepTheSameNumberOfColumnsDo, GuidelineKeepTheSameNumberOfColumnsDont],
  ] as const
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs rules={rules} />
    </>
  )
}
