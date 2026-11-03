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
import { TokenExport } from './TokenExport'

type Row = { name: string; category: string; values: [DtcgToken, DtcgToken]; typography: boolean; shared: boolean }
const CATEGORIES: Record<string, string> = {
  surface: 'Surface',
  bg: 'Background',
  fg: 'Foreground',
  stroke: 'Stroke',
  focus: 'Focus',
  blanket: 'Blanket',
  ghost: 'Ghost',
  shadow: 'Shadows',
  'shadow-color': 'Shadow colors',
  'font/size': 'Font size',
  'font/line-height': 'Line height',
  'font/family': 'Font family',
}

function flatten(group: DtcgGroup, prefix = ''): Record<string, DtcgToken> {
  return Object.fromEntries(
    Object.entries(group).flatMap(([key, value]) => {
      const path = key === '$root' ? prefix : [prefix, key].filter(Boolean).join('/')
      return '$value' in value ? [[path, value as DtcgToken]] : Object.entries(flatten(value as DtcgGroup, path))
    }),
  )
}

type ColorValue = { components: [number, number, number]; alpha: number }
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
  return String(token.$value)
}

function Value({ token }: { token: DtcgToken }) {
  const value = displayValue(token)
  return (
    <span className="lab-token-value">
      {token.$type === 'color' && (
        <span className="lab-token-checker" aria-hidden="true">
          <span style={{ background: value }} />
        </span>
      )}
      <code>{value}</code>
    </span>
  )
}

export function TokenBrowser(props: {
  theme: Theme
  shadows: ShadowParams
  typeScale: TypeScaleParams
  settings: string
}) {
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
      const typography = name.startsWith('font/')
      const category = typography
        ? name.split('/').slice(0, 2).join('/')
        : name.startsWith('shadow/') && token.$type === 'color'
          ? 'shadow-color'
          : name.split('/')[0]!
      return {
        name,
        category,
        typography,
        shared: category === 'font/family',
        values: [token, (typography ? mobile : dark)[name]!],
      }
    })
  }, [props.theme, props.shadows, props.typeScale])
  const filtered = rows.filter(
    (row) =>
      (category === 'all' || row.category === category) &&
      `${row.name} ${row.values.map(displayValue).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section className="lab-token-browser" aria-label="Token catalog">
      <div className="lab-token-intro">
        <div>
          <h2>Tokens</h2>
          <p>All {rows.length} implemented tokens, grouped by category. Values update with your settings.</p>
          <p className="lab-muted">
            Compare Light / Dark colors and shadows, Desktop / Mobile type scales, and shared font families.
          </p>
        </div>
        <details className="lab-panel lab-token-export-panel">
          <summary>Export tokens · DTCG JSON</summary>
          <TokenExport theme={props.theme} shadows={props.shadows} typeScale={props.typeScale} />
          <details>
            <summary>Generator settings</summary>
            <textarea
              className="lab-export"
              aria-label="Generator settings JSON"
              readOnly
              rows={8}
              value={props.settings}
            />
          </details>
        </details>
      </div>
      <div className="lab-token-filters">
        <label>
          Search tokens
          <input type="search" placeholder="Name or value…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Color modes
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="all">Light + Dark</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Type viewports
          <select value={viewport} onChange={(e) => setViewport(e.target.value)}>
            <option value="all">Desktop + Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </label>
      </div>
      <p className="lab-muted" role="status">
        {filtered.length} of {rows.length} tokens
      </p>
      {!filtered.length && <p>No tokens match your search. Try another name or category.</p>}
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
          <section className="lab-panel lab-token-category" key={key} aria-label={`${label} tokens`}>
            <h2>
              {label} <span className="lab-muted">{group.length}</span>
            </h2>
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
                      <th scope="row">
                        <code>{row.name}</code>
                      </th>
                      {columns.map((i) => (
                        <td key={i}>
                          <Value token={row.values[i]!} />
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
    </section>
  )
}
