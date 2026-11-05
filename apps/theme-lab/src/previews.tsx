// Tab contents: previews built from the edited tokens. Toolbars use @reflection/react on the default
// theme; everything inside a preview uses the generated theme only.

import {
  BORDER_WIDTHS,
  CONTAINER_SIZES,
  cssVarName,
  generateModeShadows,
  RADII,
  REM_BASE,
  ROLES,
  SHADOW_LEVELS,
  SPACING_STEPS,
  tintOf,
  toCssVars,
  type Issue,
  type Mode,
  type ModeTheme,
  type Role,
  type ShadowParams,
  type Theme,
} from '@reflection/tokens'
import { Switch } from '@reflection/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { MirrorScreen } from './ui-preview/MirrorScreen'
import type { Generated } from './generated'
import { Choice, Panel, Segmented, Status } from './ui/lab'

/** `var(--…)` for a canonical token name. */
const v = (name: string) => `var(${cssVarName(name)})`
export const MODES: Mode[] = ['light', 'dark']
const MODE_OPTIONS = MODES.map((m) => ({ id: m, label: m === 'light' ? 'Light' : 'Dark' }))

// ---- Color -------------------------------------------------------------------------------------

export function ColorTab({ generated }: { generated: Generated }) {
  return (
    <>
      <div className="lab-modes">
        {MODES.map((mode) => (
          <ModePreview key={mode} theme={generated.theme[mode]} issues={generated.issues[mode]} />
        ))}
      </div>
      <RampsPreview palettes={generated.palettes} />
    </>
  )
}

function ModePreview({ theme, issues }: { theme: ModeTheme; issues: Issue[] }) {
  const style = { ...toCssVars(theme), background: v('surface'), color: v('fg/neutral') } as CSSProperties
  return (
    <section className="lab-mode" style={style}>
      <div className="lab-mode-head">
        <h2 className="text-heading-small">{theme.mode}</h2>
        <Status tone={issues.length ? 'danger' : 'success'} count={issues.length}>
          {issues.length ? 'rule violations' : 'All rules pass'}
        </Status>
      </div>

      <h3 className="text-overline" style={{ color: v('fg/neutral/subtle') }}>
        Layers
      </h3>
      <Layer name="surface" depth={0}>
        <Layer name="bg/neutral/subtle" depth={1}>
          <Layer name="bg/neutral" depth={2} />
        </Layer>
      </Layer>

      <h3 className="text-overline" style={{ color: v('fg/neutral/subtle') }}>
        Roles
      </h3>
      <div className="lab-roles">
        {ROLES.map((r) => (
          <RoleRow key={r} role={r} />
        ))}
      </div>

      <h3 className="text-overline" style={{ color: v('fg/neutral/subtle') }}>
        Focus, disabled, backdrop
      </h3>
      <div className="lab-row">
        <button
          type="button"
          className="lab-btn lab-fill"
          style={{
            ...fill('neutral', true),
            boxShadow: `0 0 0 1px ${v('focus/accent')}, 0 0 0 4px ${v('focus/accent/subtle')}`,
          }}
        >
          Focused
        </button>
        <button
          type="button"
          disabled
          className="lab-btn"
          style={{ background: v('bg/disabled'), color: v('fg/disabled'), border: `1px solid ${v('stroke/disabled')}` }}
        >
          Disabled
        </button>
        <div className="lab-backdrop-demo" style={{ background: v('bg/neutral') }}>
          <span>Content</span>
          <div style={{ position: 'absolute', inset: 0, background: v('surface/backdrop'), borderRadius: 6 }} />
        </div>
      </div>

      {theme.adjustments.length > 0 && (
        <>
          <h3 className="text-overline" style={{ color: v('fg/neutral/subtle') }}>
            Adjustments
          </h3>
          <ul className="lab-list text-caption">
            {theme.adjustments.map((a, i) => (
              <li key={i}>
                <code>{a.token}</code> — {a.reason} <Chip hex={a.from} /> → <Chip hex={a.to} />
              </li>
            ))}
          </ul>
        </>
      )}
      {issues.length > 0 && (
        <>
          <h3 className="text-overline" style={{ color: v('fg/danger') }}>
            Rule violations
          </h3>
          <ul className="lab-list text-caption">
            {issues.slice(0, 30).map((x, i) => (
              <li key={i}>
                {x.rule}: <code>{x.token}</code>{' '}
                {x.against && (
                  <>
                    vs <code>{x.against}</code>
                  </>
                )}{' '}
                — {x.actual} / {x.required}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/** CSS custom properties driving the interactive preview classes in lab.css. */
const fill = (role: Role, emphasized: boolean): CSSProperties => {
  const base = emphasized ? `bg/${role}/emphasized` : role === 'neutral' ? 'bg/neutral/subtle' : tintOf(role)
  return {
    '--fill': v(base),
    '--fill-hover': v(`${base}/hover`),
    '--fill-pressed': v(`${base}/pressed`),
    color: emphasized ? v(`fg/${role}/on-emphasized`) : v(`fg/${role}`),
  } as CSSProperties
}
const ghost = (role: Role): CSSProperties =>
  ({
    '--ghost-hover': v(`ghost/${role}/hover`),
    '--ghost-pressed': v(`ghost/${role}/pressed`),
    color: v(`fg/${role}`),
  }) as CSSProperties
const fillVars = (name: string): CSSProperties =>
  ({ '--fill': v(name), '--fill-hover': v(`${name}/hover`), '--fill-pressed': v(`${name}/pressed`) }) as CSSProperties

function Layer({ name, depth, children }: { name: string; depth: number; children?: ReactNode }) {
  const isSurface = depth === 0
  const border = `1px solid ${v('stroke/neutral/subtle')}`
  return (
    <div
      className={isSurface ? 'lab-layer' : 'lab-layer lab-clickable'}
      style={isSurface ? { border } : { ...fillVars(name), border }}
    >
      <div className="text-caption">
        <code>{name}</code>
        {!isSurface && <span style={{ color: v('fg/neutral/subtle') }}> · click / hover</span>}
      </div>
      <div className="lab-row text-body-small">
        <span style={{ color: v('fg/neutral/subtle') }}>Subtle text</span>
        <span>Normal text</span>
        <span style={{ fontWeight: 600 }}>Bold text</span>
      </div>
      <div className="lab-row">
        <button type="button" className="lab-btn lab-ghost" style={ghost('neutral')}>
          Ghost
        </button>
        <span
          className="lab-input lab-fill"
          style={{ ...fillVars('form/neutral'), border: `1px solid ${v('stroke/neutral/emphasized')}` }}
        >
          Form
        </span>
        <span
          className="lab-input lab-fill"
          style={{ ...fillVars('card/neutral/emphasized'), border: `1px solid ${v('stroke/neutral/emphasized')}` }}
        >
          Card emphasized
        </span>
        <button type="button" className="lab-btn lab-fill" style={fill('neutral', true)}>
          Neutral solid
        </button>
      </div>
      {children}
    </div>
  )
}

function RoleRow({ role }: { role: Role }) {
  return (
    <div className="lab-role">
      <code className="lab-role-name text-code-small">{role}</code>
      <button type="button" className="lab-btn lab-fill" style={fill(role, true)}>
        Solid
      </button>
      <button type="button" className="lab-btn lab-fill" style={fill(role, false)}>
        Tinted
      </button>
      <button type="button" className="lab-btn lab-ghost" style={ghost(role)}>
        Ghost
      </button>
      <span className="lab-swatches">
        {['subtle', 'normal', 'emphasized'].map((p) => {
          const name = `stroke/${role}${p === 'normal' ? '' : `/${p}`}`
          return <span key={p} title={name} className="lab-stroke" style={{ borderColor: v(name) }} />
        })}
      </span>
      <span className="lab-row lab-row-tight text-caption">
        <span style={{ color: v(`fg/${role}/subtle`) }}>subtle</span>
        <span style={{ color: v(`fg/${role}`) }}>normal</span>
      </span>
    </div>
  )
}

function Chip({ hex }: { hex: string }) {
  return (
    <span className="lab-chip">
      <span className="lab-chip-swatch" style={{ background: hex }} />
      <code>{hex}</code>
    </span>
  )
}

/** Role palette ramps of both modes: anchors carry the number of tokens on them. */
function RampsPreview({ palettes }: { palettes: Generated['palettes'] }) {
  return (
    <Panel
      title="Palette ramps"
      description="A step means the same role in every family and both modes. A dot marks the steps tokens use (hover for the list); translucent tokens alias a step plus opacity."
    >
      {MODES.map((mode) => (
        <div key={mode} className="lab-ramps-mode">
          <h3 className="text-overline text-neutral-subtle">{mode}</h3>
          {palettes[mode].ramps.map((ramp) => (
            <div key={ramp.family} className="lab-ramp">
              <code className="lab-ramp-name text-code-small">{ramp.family}</code>
              <div className="lab-ramp-steps">
                {ramp.steps.map((s) => (
                  <div
                    key={s.step}
                    className={`lab-ramp-step lab-ramp-${s.kind}`}
                    title={s.tokens.length ? s.tokens.join('\n') : s.kind}
                  >
                    <span className="lab-ramp-swatch" style={{ background: s.value }}>
                      {s.tokens.length > 0 && <span className="lab-ramp-dot">{s.tokens.length}</span>}
                    </span>
                    <span className="lab-ramp-label text-label-small">{s.step}</span>
                    <code className="lab-ramp-hex text-neutral-subtle">{s.value}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </Panel>
  )
}

// ---- Shadows -----------------------------------------------------------------------------------

/** Tailwind v4 defaults, for side-by-side reference. */
const TAILWIND_SHADOWS: Record<string, string> = {
  '2xs': '0 1px rgb(0 0 0 / 0.05)',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}
const OUTLINES = ['none', 'stroke/neutral/subtle', 'stroke/neutral', 'stroke/neutral/emphasized'] as const

export function ShadowsTab({ theme, params }: { theme: Theme; params: ShadowParams }) {
  const [mode, setMode] = useState<Mode>('light')
  const [reference, setReference] = useState(false)
  const [outline, setOutline] = useState<(typeof OUTLINES)[number]>('stroke/neutral')
  const [outlineWidth, setOutlineWidth] = useState(0.5)
  const referenceId = useId()
  const shadows = generateModeShadows(theme[mode], params)
  const style = { ...toCssVars(theme[mode]), color: v('fg/neutral') } as CSSProperties
  const card = (boxShadow: string): CSSProperties => ({
    background: v('card/neutral/emphasized'),
    boxShadow,
    border: outline === 'none' ? 'none' : `${outlineWidth}px solid ${v(outline)}`,
  })
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <Choice
          aria-label="Outline"
          value={outline}
          options={OUTLINES.map((o) => ({ value: o, label: `Outline: ${o}` }))}
          onChange={setOutline}
        />
        <Choice
          aria-label="Outline width"
          value={outlineWidth}
          options={[0.5, 1].map((w) => ({ value: w, label: `${w}px` }))}
          onChange={setOutlineWidth}
        />
        <span className="inline-flex items-center gap-2">
          <Switch id={referenceId} checked={reference} onCheckedChange={setReference} />
          <label htmlFor={referenceId} className="text-body-small">
            Tailwind reference
          </label>
        </span>
      </div>
      <div className="lab-shadow-stage" style={style}>
        {(['surface', 'bg/neutral/subtle'] as const).map((under) => (
          <div key={under} className="lab-shadow-layer" style={{ background: v(under) }}>
            <code className="text-code-small" style={{ color: v('fg/neutral/subtle') }}>
              on {under}
            </code>
            <div className="lab-shadow-grid">
              {SHADOW_LEVELS.map((level) => {
                const css = shadows.composite[`shadow/${level}`]!
                return (
                  <div key={level} className="lab-shadow-cell">
                    <div className="lab-shadow-card text-label" style={card(css)}>
                      {level}
                    </div>
                    {reference && (
                      <div className="lab-shadow-card text-caption" style={card(TAILWIND_SHADOWS[level]!)}>
                        <span style={{ color: v('fg/neutral/subtle') }}>tw {level}</span>
                      </div>
                    )}
                    {under === 'surface' && (
                      <code className="lab-shadow-css" style={{ color: v('fg/neutral/subtle') }}>
                        {css.replaceAll(', 0', ',\n0')}
                      </code>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ---- Dimensions --------------------------------------------------------------------------------

const px = (rem: number) => `${rem * REM_BASE}px`

/** Spacing, size, radius and border width (ADR 0029). Static data: nothing here is tuned. */
export function DimensionsTab() {
  const spacing = SPACING_STEPS.filter((s): s is Exclude<typeof s, 'px'> => s !== 'px')
  return (
    <div className="lab-dimensions">
      <Panel title="Spacing" description="n × 0.25rem. size/<n> mirrors every step.">
        <table className="lab-table">
          <tbody>
            {spacing.map((s) => (
              <tr key={s}>
                <td>
                  <code>spacing/{String(s).replace('.', '-')}</code>
                </td>
                <td className="text-neutral-subtle">
                  {s * 0.25}rem · {px(s * 0.25)}
                </td>
                <td>
                  <span className="lab-dim-bar" style={{ width: `${s * 0.25}rem` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <div className="lab-dimensions-side">
        <Panel title="Radius">
          <div className="lab-dim-radii">
            {[
              ...Object.entries(RADII).map(([name, value]) => [name, `${value}rem`, px(value)]),
              ['full', '9999px', '9999px'],
            ].map(([name, css, label]) => (
              <div key={name} className="lab-dim-radius">
                <span style={{ borderRadius: css }} />
                <code className="text-code-small">radius/{name}</code>
                <span className="text-caption text-neutral-subtle">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Border width">
          <div className="lab-dim-radii">
            {BORDER_WIDTHS.map((w) => (
              <div key={w} className="lab-dim-radius">
                <span style={{ borderWidth: w, borderRadius: 'var(--radius-md)' }} />
                <code className="text-code-small">border/width/{w}</code>
                <span className="text-caption text-neutral-subtle">{w}px</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Containers" description="size/3xs … size/7xl, Tailwind's --container-*.">
          <table className="lab-table">
            <tbody>
              {Object.entries(CONTAINER_SIZES).map(([name, value]) => (
                <tr key={name}>
                  <td>
                    <code>size/{name}</code>
                  </td>
                  <td className="text-neutral-subtle">
                    {value}rem · {px(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  )
}

// ---- Preview -----------------------------------------------------------------------------------

/** A real screen built from the generated tokens, one mode at a time. */
export function PreviewTab({ generated }: { generated: Generated }) {
  const [mode, setMode] = useState<Mode>('light')
  const resolved = generated.resolved[mode]
  const issues = generated.issues[mode].length
  // Mid tones compress the text spacing (ADR 0016): a warning, not a violation.
  const compressed = generated.theme[mode].adjustments.filter((a) =>
    a.reason.startsWith('prominence spacing compressed'),
  )
  const least = Math.min(...compressed.map((a) => Number(/(\d+)%/.exec(a.reason)?.[1] ?? 100)))
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <Status tone={issues ? 'danger' : 'success'} count={issues}>
          {issues ? 'rule violations' : 'All rules pass'}
        </Status>
        {compressed.length > 0 && (
          <Status tone="warning" title={compressed.map((a) => `${a.token}: ${a.reason}`).join('\n')}>
            Mid tone: text spacing compressed to {least}%
          </Status>
        )}
      </div>
      <div className="lab-stage" style={toCssVars(resolved) as CSSProperties}>
        <MirrorScreen />
      </div>
    </>
  )
}
