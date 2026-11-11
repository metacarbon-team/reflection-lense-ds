import tokens from '@reflection/theme/tokens.json'

// Shared by the Foundations pages. Stories only: excluded from the library build.
// Token names come from the committed DTCG export; colors render through their CSS variables, so the
// tables follow the Mode toolbar.

type Group = { [key: string]: unknown }
const isGroup = (v: unknown): v is Group => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Canonical token names of a group, `$root` read as the parent path. */
function names(group: Group, prefix: string[] = []): string[] {
  return Object.entries(group).flatMap(([key, value]) => {
    if (!isGroup(value)) return []
    if ('$value' in value) return [(key === '$root' ? prefix : [...prefix, key]).join('/')]
    return names(value, [...prefix, key])
  })
}

const LIGHT = names((tokens as Group).light as Group).filter((n) => !n.startsWith('shadow/') && n !== 'focus/ring')

const cssVar = (name: string) => `--${name.replaceAll('/', '-')}`

/** The Tailwind utility of a color token, as the theme build names it. */
export function utilityOf(name: string): string | null {
  const [scope, ...rest] = name.split('/')
  const tail = rest.join('-')
  switch (scope) {
    case 'surface':
      return `bg-${name.replaceAll('/', '-')}`
    case 'bg':
      return `bg-${tail}`
    case 'form':
    case 'card':
    case 'ghost':
      return `bg-${name.replaceAll('/', '-')}`
    case 'fg':
      return `text-${tail}`
    case 'stroke':
      return `border-${tail}`
    default:
      return null
  }
}

function Sample({ name }: { name: string }) {
  const color = `var(${cssVar(name)})`
  const scope = name.split('/')[0]
  if (scope === 'fg')
    return (
      <span className="text-label" style={{ color }}>
        Aa
      </span>
    )
  if (scope === 'stroke') return <span className="block size-6 rounded-sm border-2" style={{ borderColor: color }} />
  return <span className="block size-6 rounded-sm border border-neutral-subtle" style={{ background: color }} />
}

/** Every color token whose name starts with one of `prefixes`: sample, name, CSS variable, utility. */
export function ColorTokens({ prefixes }: { prefixes: string[] }) {
  const rows = LIGHT.filter((n) => prefixes.some((p) => n === p || n.startsWith(`${p}/`)))
  return (
    <table className="not-prose w-full text-body-small">
      <thead>
        <tr className="text-left text-neutral-subtle">
          <th className="w-10 py-1" />
          <th className="py-1">Token</th>
          <th className="py-1">CSS variable</th>
          <th className="py-1">Utility</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((name) => (
          <tr key={name} className="border-t border-neutral-subtle">
            <td className="py-1.5">
              <Sample name={name} />
            </td>
            <td className="py-1.5 text-code-small">{name}</td>
            <td className="py-1.5 text-code-small">{cssVar(name)}</td>
            <td className="py-1.5 text-code-small">{utilityOf(name) ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const PALETTE = (tokens as Group).palette as Record<'light' | 'dark', Record<string, Group>>

/** The role palette of one mode: a row of steps per family, each a swatch of its `--palette-*` variable. */
export function Palette({ mode }: { mode: 'light' | 'dark' }) {
  const families = Object.entries(PALETTE[mode])
  return (
    <div className="flex flex-col gap-2">
      {families.map(([family, steps]) => (
        <div key={family} className="grid grid-cols-[6rem_1fr] items-center gap-3">
          <span className="text-code-small text-neutral-subtle">{family}</span>
          <div className="flex">
            {Object.keys(steps).map((step) => (
              <span
                key={step}
                title={`palette/${mode}/${family}/${step}`}
                className="h-8 flex-1 first:rounded-l-sm last:rounded-r-sm"
                style={{ background: `var(--palette-${mode}-${family}-${step})` }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[6rem_1fr] gap-3 text-code-small text-neutral-subtle">
        <span />
        <div className="flex justify-between">
          {Object.keys(Object.values(PALETTE[mode])[0] ?? {}).map((step) => (
            <span key={step} className="flex-1 text-center">
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
