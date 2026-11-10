import { useMemo, useState } from 'react'
import {
  toDtcg,
  rgbaToHex,
  type DtcgGroup,
  type DtcgToken,
  type Theme,
  type ShadowParams,
  type TypeScaleParams,
} from '@reflection/tokens'
import { Input } from '@reflection/react'
import { Choice, Panel, Segmented } from './ui/lab'

/** A value as shown: the resolved token, and the palette step it aliases (ADR 0034). */
type Cell = { token: DtcgToken; alias?: string }
type Row = { name: string; category: string; values: [Cell, Cell]; typography: boolean; shared: boolean }
const CATEGORIES: Record<string, string> = {
  palette: 'Palette',
  surface: 'Surface',
  bg: 'Background',
  form: 'Form',
  card: 'Card',
  fg: 'Foreground',
  stroke: 'Stroke',
  focus: 'Focus',
  ghost: 'Ghost',
  shadow: 'Shadows',
  'shadow-color': 'Shadow colors',
  'font/size': 'Font size',
  'font/line-height': 'Line height',
  'font/family': 'Font family',
  typography: 'Text styles',
  spacing: 'Spacing',
  size: 'Size',
  radius: 'Radius',
  border: 'Border width',
}
/** Groups that are the same in every mode and viewport (ADR 0029, ADR 0030). */
const SHARED = /^(font|spacing|size|radius|border)\//

function flatten(group: DtcgGroup, prefix = ''): Record<string, DtcgToken> {
  return Object.fromEntries(
    Object.entries(group).flatMap(([key, value]) => {
      const path = key === '$root' ? prefix : [prefix, key].filter(Boolean).join('/')
      return '$value' in value ? [[path, value as DtcgToken]] : Object.entries(flatten(value as DtcgGroup, path))
    }),
  )
}

type ColorValue = { components: [number, number, number]; alpha: number }

/**
 * Resolves a color through the palette of the same file: an alias `{palette.accent.650}`, or a
 * translucent color whose components point at a step by `$ref`.
 */
function cell(token: DtcgToken, doc: Record<string, DtcgToken>): Cell {
  if (token.$type !== 'color') return { token }
  const value = token.$value as string | { components: unknown; alpha: number }
  if (typeof value === 'string') {
    const key = value.slice(1, -1).replaceAll('.', '/')
    return { token: doc[key]!, alias: key.replace(/^palette\//, '') }
  }
  const pointer = (value.components as { $ref?: string }).$ref
  if (!pointer) return { token }
  const key = pointer.slice(2).split('/$value/')[0]!
  const step = doc[key]!.$value as ColorValue
  return {
    token: { ...token, $value: { ...step, alpha: value.alpha } },
    alias: `${key.replace(/^palette\//, '')} · ${Math.round(value.alpha * 10000) / 100}%`,
  }
}
const hex = (value: ColorValue) => {
  const [r, g, b] = value.components
  return rgbaToHex({ r, g, b, a: value.alpha })
}
function displayValue(token: DtcgToken): string {
  if (token.$type === 'color') return hex(token.$value as ColorValue)
  if (token.$type === 'dimension') {
    const value = token.$value as { value: number; unit: string }
    return `${value.value}${value.unit}`
  }
  if (token.$type === 'shadow') {
    const layers = token.$value as {
      color: ColorValue
      offsetX: { value: number }
      offsetY: { value: number }
      blur: { value: number }
      spread: { value: number }
    }[]
    return layers
      .map((l) => `${l.offsetX.value}px ${l.offsetY.value}px ${l.blur.value}px ${l.spread.value}px ${hex(l.color)}`)
      .join(', ')
  }
  if (token.$type === 'typography') {
    const value = token.$value as { fontSize: string; fontWeight: number; fontFamily: string }
    return `${value.fontSize} · ${value.fontWeight} · ${value.fontFamily}`
  }
  return String(token.$value)
}

const cellText = (c: Cell) => [c.alias, displayValue(c.token)].filter(Boolean).join(' ')

function Value({ cell: { token, alias } }: { cell: Cell }) {
  const value = displayValue(token)
  return (
    <span className="lab-token-value">
      {token.$type === 'color' && (
        <span className="lab-token-checker" aria-hidden="true">
          <span style={{ background: value }} />
        </span>
      )}
      <code>{value}</code>
      {alias && <code className="text-neutral-subtle">{alias}</code>}
    </span>
  )
}

export function TokenBrowser(props: { theme: Theme; shadows: ShadowParams; typeScale: TypeScaleParams }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [mode, setMode] = useState('all')
  const [viewport, setViewport] = useState('all')
  const rows = useMemo(() => {
    const options = { shadows: props.shadows, typeScale: props.typeScale }
    const light = flatten(toDtcg(props.theme.light, options))
    const dark = flatten(toDtcg(props.theme.dark, options))
    const mobile = flatten(toDtcg(props.theme.light, { ...options, viewport: 'mobile' }))
    return Object.entries(light).map(([name, token]): Row => {
      const typography = name.startsWith('typography/')
      const category = name.startsWith('font/')
        ? name.split('/').slice(0, 2).join('/')
        : name.startsWith('shadow/') && token.$type === 'color'
          ? 'shadow-color'
          : name.split('/')[0]!
      return {
        name,
        category,
        typography,
        shared: SHARED.test(name),
        values: [cell(token, light), cell((typography ? mobile : dark)[name]!, typography ? mobile : dark)],
      }
    })
  }, [props.theme, props.shadows, props.typeScale])
  const filtered = rows.filter(
    (row) =>
      (category === 'all' || row.category === category) &&
      `${row.name} ${row.values.map(cellText).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const categories = [
    { value: 'all', label: 'All categories' },
    ...Object.entries(CATEGORIES).map(([value, label]) => ({ value, label })),
  ]
  return (
    <section className="lab-token-browser" aria-label="Token catalog">
      <Panel
        title="Token catalog"
        description={`All ${rows.length} implemented tokens, grouped by category. The type scale, font families and dimensions are shared by every mode.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="lab-token-search">
            <Input
              type="search"
              aria-label="Search tokens"
              placeholder="Search by name or value"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Choice aria-label="Category" value={category} options={categories} onChange={setCategory} />
          <Segmented
            label="Color modes"
            options={[
              { id: 'all', label: 'Light + Dark' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Segmented
            label="Type viewports"
            options={[
              { id: 'all', label: 'Desktop + Mobile' },
              { id: 'desktop', label: 'Desktop' },
              { id: 'mobile', label: 'Mobile' },
            ]}
            value={viewport}
            onChange={setViewport}
          />
          <span className="text-caption text-neutral-subtle" role="status">
            {filtered.length} of {rows.length} tokens
          </span>
        </div>
        {!filtered.length && (
          <p className="text-body-small">No tokens match your search. Try another name or category.</p>
        )}
        {Object.entries(CATEGORIES).map(([key, label]) => {
          const group = filtered.filter((row) => row.category === key)
          if (!group.length) return null
          const { typography, shared } = group[0]!
          const selection = typography ? viewport : mode
          const labels = typography ? ['Desktop', 'Mobile'] : ['Light', 'Dark']
          const columns = shared
            ? [0]
            : selection === 'all'
              ? [0, 1]
              : selection === 'light' || selection === 'desktop'
                ? [0]
                : [1]
          return (
            <section className="lab-token-category" key={key} aria-label={`${label} tokens`}>
              <h3 className="text-overline text-neutral-subtle">
                {label} · {group.length}
              </h3>
              <div className="lab-token-table-wrap">
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      {columns.map((i) => (
                        <th scope="col" key={i}>
                          {shared ? 'All modes' : labels[i]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((row) => (
                      <tr key={row.name}>
                        <td>
                          <code>{row.name}</code>
                        </td>
                        {columns.map((i) => (
                          <td key={i}>
                            <Value cell={row.values[i]!} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}
      </Panel>
    </section>
  )
}
