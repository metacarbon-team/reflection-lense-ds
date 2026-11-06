import type { ReactNode } from 'react'

// Building blocks for the "Documentation" stories: a titled section, and a guideline with its Do and Don't
// specimens. They only lay out the page; the specimens themselves are built from the real components.

/** A titled block of a documentation page. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8 border-t border-neutral-subtle pt-10">
      <h2 className="text-heading-large text-neutral">{title}</h2>
      {children}
    </section>
  )
}

/** One card of a guideline: a Do or a Don't badge over a live example. */
export function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex min-w-80 flex-1 flex-col gap-5 rounded-lg border border-neutral-subtle bg-card-neutral p-1">
      <span
        className={
          tone === 'do'
            ? 'rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-6 pb-7">{children}</div>
    </div>
  )
}

/** A rule with its explanation on the left and the Do and Don't examples next to it. */
export function Guideline({
  rule,
  comment,
  doExample,
  dontExample,
}: {
  rule: string
  comment: string
  doExample: ReactNode
  dontExample: ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-10">
      <div className="flex w-74 shrink-0 flex-col gap-2">
        <p className="text-label-large text-neutral">{rule}</p>
        <p className="text-body text-neutral-subtle">{comment}</p>
      </div>
      <div className="flex min-w-80 flex-1 flex-wrap gap-3">
        <Specimen tone="do">{doExample}</Specimen>
        <Specimen tone="dont">{dontExample}</Specimen>
      </div>
    </div>
  )
}
