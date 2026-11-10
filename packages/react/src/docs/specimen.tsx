import type { ReactNode } from 'react'

// Shared by the Guidelines section of the Docs pages. Stories only: excluded from the library build.

/** A Do or Don't badge attached to the top of the card, as in Figma, over the example. */
export function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <span
        className={
          tone === 'do'
            ? 'm-1 rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'm-1 rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-6 pb-6">{children}</div>
    </div>
  )
}
