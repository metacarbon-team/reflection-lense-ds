// Theme Lab pieces that are not design-system components (there is no Figma counterpart): composed
// from @reflection/react and theme utilities.

import {
  Badge,
  Card,
  cn,
  IconButton,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  tabsListVariants,
  tabsTriggerVariants,
} from '@reflection/react'
import { useEffect, useId, useState, type ReactNode } from 'react'

/** A titled group of controls in the Customize drawer. */
export function Section(props: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-overline text-neutral-subtle">{props.title}</h3>
      {props.children}
    </section>
  )
}

/** A card with a title, an optional description and actions, then the content. */
export function Panel(props: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <Card className={props.className}>
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 className="text-label-large">{props.title}</h2>
          {props.description && <p className="text-caption text-neutral-subtle">{props.description}</p>}
        </div>
        {props.actions && <div className="flex flex-wrap items-center gap-3">{props.actions}</div>}
      </div>
      {props.children}
    </Card>
  )
}

/** Rule check result: a count or a dot with its meaning. */
export function Status(props: {
  tone: 'success' | 'warning' | 'danger'
  count?: number
  title?: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption" title={props.title}>
      {props.count ? <Badge tone={props.tone}>{props.count}</Badge> : <Badge tone={props.tone} dot />}
      {props.children}
    </span>
  )
}

/** A choice between a few options that switch a view in place: pill tabs with radio semantics. */
export function Segmented<T extends string>(props: {
  label: string
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={props.label} className={tabsListVariants({ variant: 'pill' })}>
      {props.options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={props.value === o.id}
          data-state={props.value === o.id ? 'active' : 'inactive'}
          className={tabsTriggerVariants({ variant: 'pill', size: 'sm' })}
          onClick={() => props.onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Select with an options list; values may be numbers. */
export function Choice<T extends string | number>(props: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  'aria-label': string
  className?: string
}) {
  return (
    <Select
      value={String(props.value)}
      onValueChange={(v) => {
        const option = props.options.find((o) => String(o.value) === v)
        if (option) props.onChange(option.value)
      }}
    >
      <SelectTrigger aria-label={props['aria-label']} className={cn('w-auto', props.className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A labelled range with its value. */
export function Slider(props: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid grid-cols-[minmax(0,1fr)_--spacing(12)] items-center gap-x-3 gap-y-1">
      <span className="col-span-full text-label-small">{props.label}</span>
      <input
        type="range"
        className="lab-range w-full"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <output className="justify-self-end text-code-small text-neutral-subtle tabular-nums">{props.value}</output>
    </label>
  )
}

/** Swatch plus hex; the hex applies once it is a full #rrggbb. */
export function ColorInput(props: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId()
  const [draft, setDraft] = useState(props.value)
  const [last, setLast] = useState(props.value)
  if (props.value !== last) {
    // The value changed from outside (reset, another field): show it.
    setLast(props.value)
    setDraft(props.value)
  }
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-label">
        {props.label}
      </label>
      <div className="grid grid-cols-[--spacing(8)_minmax(0,1fr)] items-center gap-2">
        <input
          type="color"
          className="lab-swatch"
          aria-label={`${props.label} color`}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
        <Input
          id={id}
          inputClassName="text-code-small"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) props.onChange(e.target.value.toLowerCase())
          }}
        />
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/** A side sheet with the Dialog anatomy, below the header. Non-modal, so the preview stays live; Escape closes it. */
export function Drawer(props: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { open, onClose } = props
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={props.title}
      className="fixed top-16 right-2 bottom-2 z-10 grid w-90 grid-rows-[auto_minmax(0,1fr)] rounded-xl border border-neutral bg-card-neutral-subtle text-neutral shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-neutral-subtle py-3 pr-3 pl-5">
        <h2 className="text-heading-small">{props.title}</h2>
        <IconButton aria-label="Close" variant="ghost" size="sm" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="grid content-start gap-6 overflow-y-auto p-5">{props.children}</div>
    </aside>
  )
}
