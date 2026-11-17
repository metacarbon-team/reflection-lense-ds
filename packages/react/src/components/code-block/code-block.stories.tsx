import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { DiffStat } from '../diff-stat/diff-stat'
import { CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeLine, CodeLineHunk } from './code-block'

// Syntax colors are text colors on spans inside `code`, as in Figma.
const kw = (text: string) => <span className="text-info">{text}</span>
const fn = (text: string) => <span className="text-accent-subtle">{text}</span>
const num = (text: string) => <span className="text-warning">{text}</span>

const lines: ReactNode[] = [
  <>
    {kw('export')} {kw('async')} {kw('function')} {fn('retry')}(fn, opts) {'{'}
  </>,
  <>
    {'  '}
    {kw('for')} ({kw('let')} i = {num('0')}; i &lt; opts.attempts; i++) {'{'}
  </>,
  <>
    {'    '}
    {kw('try')} {'{'} {kw('return')} {kw('await')} {fn('fn')}(); {'}'}
  </>,
  <>
    {'    '}
    {kw('catch')} {'{'} {kw('await')} {fn('sleep')}({fn('delay')}(i, opts)); {'}'}
  </>,
  <>{'  }'}</>,
  <>{'}'}</>,
]

type LineOptions = { lineNumber?: boolean; highlight?: readonly number[] }

/** The six lines of the example, numbered from 1. `highlight` lists the (1-based) lines to tint. */
const codeLines = ({ lineNumber = true, highlight = [] }: LineOptions = {}) =>
  lines.map((code, index) => (
    <CodeLine
      key={index}
      number={index + 1}
      code={code}
      lineNumber={lineNumber}
      type={highlight.includes(index + 1) ? 'highlighted' : 'default'}
    />
  ))

const diffLines = [
  <CodeLine key="1" number={1} code={lines[0]} />,
  <CodeLine key="2" number={2} type="added" code={lines[1]} />,
  <CodeLine key="3" number={3} type="added" code={lines[2]} />,
  <CodeLine key="4" number={4} type="removed" code={lines[3]} />,
  <CodeLine key="5" number={5} code={lines[4]} />,
  <CodeLine key="6" number={6} code={lines[5]} />,
]

const diffStat = <DiffStat added={18} removed={6} role="group" aria-label="18 lines added, 6 lines removed" />

const meta = {
  title: 'Components/Code Block',
  component: CodeBlock,
  subcomponents: { CodeBlockHeader, CodeBlockCopyButton, CodeLine, CodeLineHunk },
  args: {
    title: 'transport/client.ts',
    leadingSlot: true,
    trailingSlot: true,
  },
  argTypes: {
    // The Figma switches `?leadingSlot` and `?trailingSlot`: on leaves the default slot (a file icon, a
    // copy button), off passes `null` and hides it. The props themselves take any `ReactNode`.
    leadingSlot: {
      control: 'boolean',
      description:
        'Header content before the title, 16 × 16. The control is the `?leadingSlot` switch of Figma: on keeps the default file icon, off passes `null`. In code pass any icon.',
    },
    trailingSlot: {
      control: 'boolean',
      description:
        'Header actions at the end. The control is the `?trailingSlot` switch of Figma: on keeps the default copy button, off passes `null`. In code pass your own actions.',
    },
    content: { control: false },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

type PlaygroundArgs = {
  /** The `variant` property of Figma. The component has no such prop: the variants are built from the parts. */
  variant: 'file' | 'code' | 'diff'
  title: string
  /** The `?leadingSlot` switch. Off in the `code` variant, as in Figma. */
  leadingSlot: boolean
  /** The `?trailingSlot` switch. */
  trailingSlot: boolean
}

/**
 * One code block with the properties of the Figma component. `variant` picks `file`, `code` or `diff`
 * and builds the parts for it; `title` and the two slot switches work as in Figma.
 */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { variant: 'file', title: 'transport/client.ts', leadingSlot: true, trailingSlot: true },
  argTypes: {
    variant: { control: 'inline-radio', options: ['file', 'code', 'diff'] },
    title: { control: 'text' },
    leadingSlot: { control: 'boolean' },
    trailingSlot: { control: 'boolean' },
  },
  render: ({ variant, title, leadingSlot, trailingSlot }) => {
    const diff = variant === 'diff'
    return (
      <div className="w-120">
        <CodeBlock
          title={title}
          leadingSlot={leadingSlot && variant !== 'code' ? undefined : null}
          trailingSlot={
            !trailingSlot ? null : diff ? (
              <>
                {diffStat}
                <CodeBlockCopyButton />
              </>
            ) : undefined
          }
          content={
            diff ? (
              <>
                <CodeLineHunk code="@@ -40,7 +40,13 @@ class Client" />
                {diffLines}
              </>
            ) : (
              codeLines()
            )
          }
        />
      </div>
    )
  },
}

/**
 * The three variants of Figma. A file snippet has a file icon, a filename and a copy button. A code
 * snippet is labelled by its language and has no icon (`leadingSlot={null}`). A diff adds a Diff Stat
 * before the copy button, a hunk header and added and removed lines.
 */
export const Variants: Story = {
  render: () => (
    <div className="grid w-120 gap-6">
      <div className="grid gap-2">
        <span className="text-caption text-neutral-subtle">file</span>
        <CodeBlock title="transport/client.ts" content={codeLines()} />
      </div>
      <div className="grid gap-2">
        <span className="text-caption text-neutral-subtle">code</span>
        <CodeBlock title="tsx" leadingSlot={null} content={codeLines()} />
      </div>
      <div className="grid gap-2">
        <span className="text-caption text-neutral-subtle">diff</span>
        <CodeBlock
          title="transport/client.ts"
          trailingSlot={
            <>
              {diffStat}
              <CodeBlockCopyButton />
            </>
          }
          content={
            <>
              <CodeLineHunk code="@@ -40,7 +40,13 @@ class Client" />
              {diffLines}
            </>
          }
        />
      </div>
    </div>
  ),
}

/** The four types of a line, each with and without the gutter. */
export const Lines: Story = {
  render: () => (
    <div className="grid w-120 grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2">
      {(['default', 'highlighted', 'added', 'removed'] as const).flatMap((type) => [
        <span key={`${type}-name`} className="text-caption text-neutral-subtle">
          {type}
        </span>,
        <div key={type} className="grid gap-1">
          <CodeLine type={type} number={1} code="return retry(write(req), opts);" />
          <CodeLine type={type} lineNumber={false} code="return retry(write(req), opts);" />
        </div>,
      ])}
    </div>
  ),
}

/** The header is its own component: a leading slot, the title and a trailing slot. Pass `null` to hide a slot. */
export const Header: Story = {
  render: () => (
    <div className="grid w-120 gap-4">
      <CodeBlockHeader title="transport/client.ts" />
      <CodeBlockHeader title="tsx" leadingSlot={null} />
      <CodeBlockHeader title="transport/client.ts" trailingSlot={null} />
      <CodeBlockHeader title="transport/client.ts" leadingSlot={null} trailingSlot={null} />
    </div>
  ),
}

/** The gutter is off for the whole block: the code starts at the left edge. */
export const WithoutLineNumbers: Story = {
  render: () => (
    <div className="w-120">
      <CodeBlock title="transport/client.ts" content={codeLines({ lineNumber: false })} />
    </div>
  ),
}

/** A long line does not wrap: the code scrolls sideways, and the region takes the keyboard focus. The tint of a line spans the whole scroll width. */
export const LongLine: Story = {
  render: () => (
    <div className="w-120">
      <CodeBlock
        title="transport/client.ts"
        content={
          <>
            <CodeLine
              number={1}
              code="export const endpoint = 'https://api.example.com/v2/transport/client/retry?attempts=5&delay=250&jitter=true';"
            />
            <CodeLine number={2} type="highlighted" code="export const timeout = 30_000;" />
            <CodeLine number={3} code="export const retries = 5;" />
          </>
        }
      />
    </div>
  ),
}

/** The title is cut with an ellipsis when it does not fit; the copy button stays at the edge. */
export const LongTitle: Story = {
  render: () => (
    <div className="w-80">
      <CodeBlock
        title="packages/transport/src/internal/retry/exponential-backoff-with-jitter.ts"
        content={codeLines().slice(0, 2)}
      />
    </div>
  ),
}

/** A diff with the real copy button: it copies the code without numbers, signs and the hunk header. */
export const Diff: Story = {
  render: () => (
    <div className="w-120">
      <CodeBlock
        title="transport/client.ts"
        trailingSlot={
          <>
            {diffStat}
            <CodeBlockCopyButton />
          </>
        }
        content={
          <>
            <CodeLineHunk code="@@ -40,7 +40,13 @@ class Client" />
            {diffLines}
          </>
        }
      />
    </div>
  ),
}

/** Pass your own icon to `leadingSlot` for a language or a terminal. Keep it 16 × 16. */
export const CustomSlots: Story = {
  render: () => (
    <div className="w-120">
      <CodeBlock
        title="Terminal"
        leadingSlot={
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path d="M3 4.5l3.5 3.5L3 11.5M8 12h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        content={
          <>
            <CodeLine number={1} code="pnpm add @reflection/react" />
          </>
        }
      />
    </div>
  ),
}

/**
 * **Highlight only the lines the text refers to**
 * Highlighting works by contrast. One or two tinted lines point the reader at the change; tint most of
 * the block and nothing stands out.
 */
export const GuidelineHighlightOnlyTheLinesTheTextRefersToDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full">
        <CodeBlock title="transport/retry.ts" content={codeLines({ highlight: [3] })} />
      </div>
    </Specimen>
  ),
}

export const GuidelineHighlightOnlyTheLinesTheTextRefersToDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full">
        <CodeBlock title="transport/retry.ts" content={codeLines({ highlight: [1, 2, 3, 4] })} />
      </div>
    </Specimen>
  ),
}

/**
 * **Keep line numbers on or off for the whole block**
 * The gutter sets where the code starts. Hiding numbers on some lines shifts them left and breaks the
 * reading edge. Turn `lineNumber` off on every line or none.
 */
export const GuidelineKeepLineNumbersOnOrOffForTheWholeBlockDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full">
        <CodeBlock title="transport/retry.ts" content={codeLines()} />
      </div>
    </Specimen>
  ),
}

export const GuidelineKeepLineNumbersOnOrOffForTheWholeBlockDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full">
        <CodeBlock
          title="transport/retry.ts"
          content={lines.map((code, index) => (
            <CodeLine key={index} number={index + 1} code={code} lineNumber={index !== 2 && index !== 3} />
          ))}
        />
      </div>
    </Specimen>
  ),
}

/**
 * **Give the block a title that says what the code is**
 * A filename or a command tells people where the code lives before they copy it. A generic label such
 * as Code says nothing the block does not already show.
 */
export const GuidelineGiveTheBlockATitleThatSaysWhatTheCodeIsDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full">
        <CodeBlock title="transport/retry.ts" content={codeLines()} />
      </div>
    </Specimen>
  ),
}

export const GuidelineGiveTheBlockATitleThatSaysWhatTheCodeIsDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full">
        <CodeBlock title="Code" content={codeLines()} />
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  const rules = [
    [GuidelineHighlightOnlyTheLinesTheTextRefersToDo, GuidelineHighlightOnlyTheLinesTheTextRefersToDont],
    [GuidelineKeepLineNumbersOnOrOffForTheWholeBlockDo, GuidelineKeepLineNumbersOnOrOffForTheWholeBlockDont],
    [GuidelineGiveTheBlockATitleThatSaysWhatTheCodeIsDo, GuidelineGiveTheBlockATitleThatSaysWhatTheCodeIsDont],
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
