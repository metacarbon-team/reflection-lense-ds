import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Field } from '../field/field'
import { Checkbox, type CheckboxProps } from './checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Subscribe', checked: false, disabled: false },
  argTypes: {
    checked: { control: 'inline-radio', options: [false, true, 'indeterminate'] },
    state: { control: 'inline-radio', options: ['default', 'hover', 'focus', 'error', 'disabled'] },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: function Render({ checked: initial, ...args }) {
    const [checked, setChecked] = useState<CheckboxProps['checked']>(initial)
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
  },
}

const selections = [
  { label: 'unchecked', checked: false },
  { label: 'checked', checked: true },
  { label: 'indeterminate', checked: 'indeterminate' },
] as const
const states = ['default', 'hover', 'focus', 'error', 'disabled'] as const

/** Every combination of selection and state from the Figma matrix (15). Hover and focus are frozen with state. */
function Matrix() {
  return (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-x-8 gap-y-4">
      <span />
      {selections.map((s) => (
        <span key={s.label} className="text-caption text-neutral-subtle">
          {s.label}
        </span>
      ))}
      {states.map((state) => (
        <div key={state} className="contents">
          <span className="text-caption text-neutral-subtle">{state}</span>
          {selections.map((s) => (
            <Checkbox key={s.label} aria-label={`${s.label}, ${state}`} checked={s.checked} state={state} />
          ))}
        </div>
      ))}
    </div>
  )
}

export const VariantsMatrixLight: Story = {
  name: 'Variants matrix / Light',
  render: () => (
    <div data-mode="light" className="inline-block rounded-xl bg-surface p-8">
      <Matrix />
    </div>
  ),
}

export const VariantsMatrixDark: Story = {
  name: 'Variants matrix / Dark',
  render: () => (
    <div data-mode="dark" className="inline-block rounded-xl bg-surface p-8">
      <Matrix />
    </div>
  ),
}

/** Named by a visible label. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-terms" />
      <label htmlFor="checkbox-terms" className="text-body-small">
        Accept the terms
      </label>
    </div>
  ),
}

/** In a Field the error message marks the checkbox invalid and wires `aria-describedby`. */
export const InvalidInField: Story = {
  render: () => (
    <Field label="Terms" error="Accept the terms to continue.">
      <Checkbox />
    </Field>
  ),
}

const children = [
  { id: 'product', label: 'Product updates', hint: 'New features, once a month' },
  { id: 'digest', label: 'Weekly digest', hint: 'Summary of activity in your workspace' },
  { id: 'security', label: 'Security alerts', hint: 'New sign-ins and password changes' },
  { id: 'billing', label: 'Billing reminders', hint: 'Upcoming payments and failed charges' },
]

/** The parent mirrors its children: all checked, none unchecked, otherwise indeterminate. */
function NotificationGroup({ initial, parent }: { initial: string[]; parent?: CheckboxProps['checked'] }) {
  const [selected, setSelected] = useState(initial)
  const derived = selected.length === children.length ? true : selected.length === 0 ? false : 'indeterminate'
  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)))
  return (
    <div className="w-full max-w-104 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized p-4 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <Checkbox
          id="group-parent"
          checked={parent ?? derived}
          onCheckedChange={(on) => setSelected(on === true ? children.map((c) => c.id) : [])}
        />
        <label htmlFor="group-parent" className="text-label-large flex-1 text-neutral">
          Email notifications
        </label>
        <span className="text-body-small text-neutral-subtle">
          {selected.length} of {children.length} selected
        </span>
      </div>
      <div className="flex flex-col pl-8">
        {children.map((c) => (
          <div key={c.id} className="flex flex-col px-4 py-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`group-${c.id}`}
                checked={selected.includes(c.id)}
                onCheckedChange={(on) => toggle(c.id, on === true)}
              />
              <label htmlFor={`group-${c.id}`} className="text-label-large text-neutral">
                {c.label}
              </label>
            </div>
            <p className="pl-7 text-body-small text-neutral-subtle">{c.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const IndeterminateGroup: Story = {
  render: () => <NotificationGroup initial={['product', 'digest']} />,
}

// ---------------------------------------------------------------------------------------------
// Documentation: mirrors the Figma page "07. Checkbox" (Anatomy, Props, Guidelines).
// ---------------------------------------------------------------------------------------------

const code = 'rounded-xs bg-neutral px-1.5 py-0.5 text-code-small text-neutral'

const props = [
  {
    name: 'checked',
    figma: 'selection',
    values: "false | true | 'indeterminate'",
    initial: 'false',
    text: 'Unchecked, checked or indeterminate. Indeterminate marks a parent whose children are only partly selected. Use defaultChecked for an uncontrolled box.',
  },
  {
    name: 'state',
    figma: 'state',
    values: "'default' | 'hover' | 'focus' | 'error' | 'disabled'",
    initial: "'default'",
    text: 'Interaction feedback. Hover and focus come from the browser; state only freezes them for docs. Focus draws the focus/ring token; error comes from aria-invalid or a Field error and uses the danger tokens; disabled (the disabled prop) blocks the toggle.',
  },
]

const anatomy = [
  { n: 1, name: 'Box', text: '20×20, radius md, stroke and fill follow selection and state.' },
  { n: 2, name: 'Indicator', text: '16×16 check or dash, drawn only when checked or indeterminate.' },
  { n: 3, name: 'Focus ring', text: 'The focus/ring shadow, shown on keyboard focus.' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-neutral-subtle pt-10">
      <h2 className="text-heading-large text-neutral">{title}</h2>
      {children}
    </section>
  )
}

function Specimen({ tone, parent }: { tone: 'do' | 'dont'; parent?: CheckboxProps['checked'] }) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-neutral-subtle bg-card-neutral p-1">
      <span
        className={
          tone === 'do'
            ? 'rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-4 pb-6">
        <NotificationGroup initial={['product', 'digest']} parent={parent} />
      </div>
    </div>
  )
}

export const Documentation: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex max-w-240 flex-col gap-12 text-neutral">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-large">Checkbox Control</h1>
        <p className="text-body text-neutral-subtle">
          A single boolean control with a value (unchecked, checked, indeterminate) and a state.
        </p>
      </header>

      <Section title="Preview">
        <div className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((mode) => (
            <div
              key={mode}
              data-mode={mode}
              className="flex h-48 flex-col items-center justify-center gap-6 rounded-lg border border-neutral-subtle bg-neutral"
            >
              <div className="flex items-center gap-4">
                <Checkbox aria-label="Unchecked" />
                <Checkbox aria-label="Checked" checked />
                <Checkbox aria-label="Indeterminate" checked="indeterminate" />
              </div>
              <div className="flex items-center gap-4">
                <Checkbox aria-label="Checked again" checked />
                <Checkbox aria-label="Error" state="error" />
                <Checkbox aria-label="Disabled" checked disabled />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Anatomy">
        <div className="flex items-start gap-10">
          <div className="flex items-center gap-4 rounded-lg border border-neutral-subtle bg-neutral p-8">
            <Checkbox aria-label="Anatomy example" checked />
          </div>
          <ol className="flex flex-col gap-3">
            {anatomy.map((a) => (
              <li key={a.n} className="flex gap-3">
                <span className="text-code-small flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-emphasized text-neutral-on-emphasized">
                  {a.n}
                </span>
                <span className="text-body">
                  <span className="text-body-medium">{a.name}.</span> {a.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section title="Component properties">
        <p className="text-body text-neutral-subtle">All 15 combinations are in Variants matrix / Light and Dark.</p>
        <div className="overflow-hidden rounded-lg border border-neutral-subtle bg-surface">
          <div className="grid grid-cols-[10rem_8rem_1fr] gap-4 bg-neutral px-4 py-3 text-label text-neutral-subtle">
            <span>Name</span>
            <span>Default</span>
            <span>Description</span>
          </div>
          {props.map((p) => (
            <div key={p.name} className="grid grid-cols-[10rem_8rem_1fr] gap-4 border-t border-neutral-subtle p-4">
              <span className="text-body">
                {p.name}
                <span className="block text-body-small text-neutral-subtle">Figma: {p.figma}</span>
              </span>
              <span>
                <span className={code}>{p.initial}</span>
              </span>
              <span className="flex flex-col gap-2">
                <span className={`${code} self-start`}>{p.values}</span>
                <span className="text-body">{p.text}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Guidelines">
        <div className="flex gap-10">
          <div className="flex w-74 shrink-0 flex-col gap-2">
            <p className="text-label-large">Use indeterminate only for a partly selected group.</p>
            <p className="text-body text-neutral-subtle">
              Indeterminate marks a parent whose children are only partly selected. If all children are selected the
              parent is checked; if none, unchecked.
            </p>
          </div>
          <div className="flex flex-1 gap-3">
            <Specimen tone="do" />
            <Specimen tone="dont" parent />
          </div>
        </div>
      </Section>
    </div>
  ),
}
