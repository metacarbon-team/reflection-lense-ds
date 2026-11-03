import {
  applyPalette,
  curveKeys,
  DEFAULT_CURVE,
  generateCurvePalette,
  cssVarName,
  DEFAULT_PARAMS,
  DEFAULT_SHADOWS,
  DEFAULT_TYPE_SCALE,
  generateRolePalette,
  generateModeShadows,
  generateTheme,
  generateTypeScale,
  SHADOW_LEVELS,
  DEFAULT_SEEDS,
  ROLES,
  STATUS_ROLES,
  toCssVars,
  validateMode,
  type CurveParams,
  type GeneratorParams,
  type Mode,
  type ModeTheme,
  type Role,
  type ShadowParams,
  type Theme,
  type ThemeSeeds,
  type TypeScaleParams,
} from '@reflection/tokens'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { MirrorScreen } from './ui-preview/MirrorScreen'
import { TokenBrowser } from './TokenBrowser'

/** `var(--…)` for a canonical token name. */
const v = (name: string) => `var(${cssVarName(name)})`
const MODES: Mode[] = ['light', 'dark']
const SEED_KEYS = ['bg', 'fg', 'accent'] as const
const TABS = [
  { id: 'ui', label: 'UI preview' },
  { id: 'palette', label: 'Palette swatches' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'ramps', label: 'Ramps' },
  { id: 'tokens', label: 'Tokens' },
] as const
type Tab = (typeof TABS)[number]['id']

/** Role steps is the active path. Keep the curve experiment available for a future revisit. */
const ENABLE_CURVE = false
const RAMP_KINDS = [
  // { id: 'curve', label: 'Curve' }, // Restore together with ENABLE_CURVE when revisiting the prototype.
  { id: 'roles', label: 'Role steps' },
] as const
const CURVE_SOURCES = [
  { id: 'seed', label: 'Seed curves' },
  { id: 'brand', label: 'Brand curves' },
] as const
type RampKind = 'roles' | 'curve'
interface CurveInput {
  seeds: ThemeSeeds
  params: GeneratorParams
  curve: CurveParams
  onCurve: (c: CurveParams) => void
}
/** The mode a palette kind shows, and its palette. */
const paletteFor = (kind: RampKind, mode: Mode, theme: ModeTheme, input: CurveInput) => {
  if (ENABLE_CURVE && kind === 'curve') {
    const keys = curveKeys(input.seeds[mode], input.params)
    return { theme, palette: generateCurvePalette(theme, keys, input.curve) }
  }
  return { theme, palette: generateRolePalette(theme) }
}

/** The palette switch, with the curve source next to it when curves are shown. */
function PaletteControls(props: { input: CurveInput; ramps: RampKind; onRamps: (k: RampKind) => void }) {
  const { curve, onCurve } = props.input
  if (!ENABLE_CURVE) return <span className="lab-muted">Role steps</span>
  return (
    <>
      <Segmented label="Palette" options={RAMP_KINDS} value={props.ramps} onChange={props.onRamps} />
      {props.ramps === 'curve' && (
        <select
          aria-label="Curve source"
          value={curve.source}
          onChange={(e) => onCurve({ ...curve, source: e.target.value as CurveParams['source'] })}
        >
          {CURVE_SOURCES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </>
  )
}

function Segmented<T extends string>(props: {
  label: string
  options: readonly { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="lab-segmented" role="radiogroup" aria-label={props.label}>
      {props.options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={props.value === o.id}
          className={props.value === o.id ? 'lab-segment lab-segment-active' : 'lab-segment'}
          onClick={() => props.onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** A real screen built from the generated tokens, in one mode at a time, resolved through a palette. */
function UiPreview(props: { theme: Theme; input: CurveInput; ramps: RampKind; onRamps: (k: RampKind) => void }) {
  const [mode, setMode] = useState<Mode>('light')
  const { theme: source, palette } = paletteFor(props.ramps, mode, props.theme[mode], props.input)
  const resolved = applyPalette(source, palette)
  const issues = validateMode(resolved, props.input.params).length
  // Mid tones compress the text spacing (ADR 0016): a warning, not a violation.
  const compressed = source.adjustments.filter((a) => a.reason.startsWith('prominence spacing compressed'))
  const least = Math.min(...compressed.map((a) => Number(/(\d+)%/.exec(a.reason)?.[1] ?? 100)))
  const style = { ...toCssVars(resolved) } as CSSProperties
  return (
    <section className="lab-ui-preview">
      <div className="lab-row">
        <Segmented label="Mode" options={MODES.map((m) => ({ id: m, label: m }))} value={mode} onChange={setMode} />
        <PaletteControls input={props.input} ramps={props.ramps} onRamps={props.onRamps} />
        <span className={issues ? 'lab-status lab-status-fail' : 'lab-status'}>
          {issues ? `${issues} rule violations` : 'all rules pass'}
        </span>
        {compressed.length > 0 && (
          <span
            className="lab-status lab-status-warn"
            title={compressed.map((a) => `${a.token}: ${a.reason}`).join('\n')}
          >
            mid tone: text spacing compressed to {least}%
          </span>
        )}
      </div>
      <div className="lab-stage" style={style}>
        <MirrorScreen />
      </div>
    </section>
  )
}

export function App() {
  const [seeds, setSeeds] = useState<ThemeSeeds>(structuredClone(DEFAULT_SEEDS) as ThemeSeeds)
  const [params, setParams] = useState<GeneratorParams>(structuredClone(DEFAULT_PARAMS))
  const [typeScale, setTypeScale] = useState<TypeScaleParams>(structuredClone(DEFAULT_TYPE_SCALE))
  const [shadows, setShadows] = useState<ShadowParams>(structuredClone(DEFAULT_SHADOWS))
  const [tab, setTab] = useState<Tab>('ui')
  const [selectedRamps, setRamps] = useState<RampKind>('roles')
  // Force Role steps even if Fast Refresh preserves the old curve selection in an open lab.
  const ramps: RampKind = ENABLE_CURVE ? selectedRamps : 'roles'
  const [curve, setCurve] = useState<CurveParams>({ ...DEFAULT_CURVE, source: 'brand' })
  const input = { seeds, params, curve, onCurve: setCurve }

  const theme = useMemo(() => generateTheme(seeds, params), [seeds, params])
  // The curve prototype generates its own theme: every color on its family's curve.
  const curveTheme = useMemo(
    () => (ENABLE_CURVE && ramps === 'curve' ? generateTheme(seeds, { ...params, curve }) : null),
    [ramps, seeds, params, curve],
  )
  const shown = curveTheme ?? theme
  const exportTheme = useMemo(
    () => ({
      light: applyPalette(shown.light, generateRolePalette(shown.light)),
      dark: applyPalette(shown.dark, generateRolePalette(shown.dark)),
    }),
    [shown],
  )
  const issues = useMemo(
    () => ({ light: validateMode(theme.light, params), dark: validateMode(theme.dark, params) }),
    [theme, params],
  )

  const reset = () => {
    setSeeds(structuredClone(DEFAULT_SEEDS) as ThemeSeeds)
    setParams(structuredClone(DEFAULT_PARAMS))
    setTypeScale(structuredClone(DEFAULT_TYPE_SCALE))
    setShadows(structuredClone(DEFAULT_SHADOWS))
  }

  return (
    <div className="lab">
      <aside className="lab-controls">
        <header className="lab-title">
          <h1>Theme Lab</h1>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </header>

        {tab === 'shadows' && <ShadowControls params={shadows} onChange={setShadows} />}
        {ENABLE_CURVE && ramps === 'curve' && (tab === 'ui' || tab === 'ramps') && (
          <CurveControls params={curve} onChange={setCurve} />
        )}

        <Section title="Seeds">
          {MODES.map((mode) => (
            <div key={mode} className="lab-seed-group">
              <div className="lab-label">{mode}</div>
              {SEED_KEYS.map((key) => (
                <ColorField
                  key={key}
                  label={key}
                  value={seeds[mode][key]}
                  onChange={(value) => setSeeds((s) => ({ ...s, [mode]: { ...s[mode], [key]: value } }))}
                />
              ))}
            </div>
          ))}
        </Section>

        <Section title="Steps (OKLCH ΔL)">
          <Slider
            label="Screen flare"
            min={0}
            max={0.02}
            step={0.001}
            value={params.flare}
            onChange={(x) => setParams({ ...params, flare: x })}
          />
          <Slider
            label="Layer step"
            min={0.01}
            max={0.08}
            step={0.005}
            value={params.layerStep}
            onChange={(x) => setParams({ ...params, layerStep: x })}
          />
          <Slider
            label="State step"
            min={0.01}
            max={0.08}
            step={0.005}
            value={params.stateStep}
            onChange={(x) => setParams({ ...params, stateStep: x })}
          />
          <Slider
            label="Raised step"
            min={0.005}
            max={0.04}
            step={0.0025}
            value={params.raisedStep}
            onChange={(x) => setParams({ ...params, raisedStep: x })}
          />
          <Slider
            label="Disabled step"
            min={0.005}
            max={0.06}
            step={0.0025}
            value={params.disabledStep}
            onChange={(x) => setParams({ ...params, disabledStep: x })}
          />
          <Slider
            label="Text step"
            min={0.03}
            max={0.16}
            step={0.005}
            value={params.fgStep}
            onChange={(x) => setParams({ ...params, fgStep: x })}
          />
          <Slider
            label="Role text step"
            min={0.03}
            max={0.24}
            step={0.005}
            value={params.roleTextStep}
            onChange={(x) => setParams({ ...params, roleTextStep: x })}
          />
        </Section>

        <Section title="Contrast">
          <Slider
            label="Neutral weight floor"
            min={3}
            max={18}
            step={0.5}
            value={params.neutralWeightFloor}
            onChange={(x) => setParams({ ...params, neutralWeightFloor: x })}
          />
          <Slider
            label="Disabled text"
            min={1.2}
            max={3}
            step={0.1}
            value={params.disabledContrast}
            onChange={(x) => setParams({ ...params, disabledContrast: x })}
          />
        </Section>

        <Section title="Color">
          <Slider
            label="Tint chroma"
            min={0}
            max={0.08}
            step={0.005}
            value={params.tintChroma}
            onChange={(x) => setParams({ ...params, tintChroma: x })}
          />
          <div className="lab-label">Status base colors</div>
          {STATUS_ROLES.map((r) => (
            <ColorField
              key={r}
              label={r}
              value={params.statusSeeds[r]}
              onChange={(x) => setParams({ ...params, statusSeeds: { ...params.statusSeeds, [r]: x } })}
            />
          ))}
        </Section>

        <Section title="Alpha">
          <Slider
            label="Stroke subtle"
            min={0.02}
            max={0.4}
            step={0.01}
            value={params.strokeAlpha.subtle}
            onChange={(x) => setParams({ ...params, strokeAlpha: { ...params.strokeAlpha, subtle: x } })}
          />
          <Slider
            label="Stroke normal"
            min={0.02}
            max={0.5}
            step={0.01}
            value={params.strokeAlpha.normal}
            onChange={(x) => setParams({ ...params, strokeAlpha: { ...params.strokeAlpha, normal: x } })}
          />
          <Slider
            label="Blanket"
            min={0.1}
            max={0.9}
            step={0.01}
            value={params.blanketAlpha}
            onChange={(x) => setParams({ ...params, blanketAlpha: x })}
          />
        </Section>

        <Section title="Type scale">
          <Slider
            label="Base (px)"
            min={12}
            max={20}
            step={1}
            value={typeScale.base}
            onChange={(x) => setTypeScale({ ...typeScale, base: x })}
          />
          <Slider
            label="Ratio desktop"
            min={1.05}
            max={1.5}
            step={0.005}
            value={typeScale.ratio.desktop}
            onChange={(x) => setTypeScale({ ...typeScale, ratio: { ...typeScale.ratio, desktop: x } })}
          />
          <Slider
            label="Ratio mobile"
            min={1.05}
            max={1.5}
            step={0.005}
            value={typeScale.ratio.mobile}
            onChange={(x) => setTypeScale({ ...typeScale, ratio: { ...typeScale.ratio, mobile: x } })}
          />
        </Section>
      </aside>

      <main className="lab-main">
        <div className="lab-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'lab-tab lab-tab-active' : 'lab-tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <span className="lab-tabs-status">
            {MODES.map((mode) => (
              <span key={mode} className={issues[mode].length ? 'lab-status lab-status-fail' : 'lab-status'}>
                {mode}: {issues[mode].length ? `${issues[mode].length} violations` : 'all rules pass'}
              </span>
            ))}
          </span>
        </div>

        {tab === 'ui' ? (
          <UiPreview theme={shown} input={input} ramps={ramps} onRamps={setRamps} />
        ) : tab === 'shadows' ? (
          <ShadowsPreview theme={theme} params={shadows} />
        ) : tab === 'ramps' ? (
          <RampsPreview theme={shown} input={input} ramps={ramps} onRamps={setRamps} />
        ) : tab === 'tokens' ? (
          <TokenBrowser
            theme={exportTheme}
            shadows={shadows}
            typeScale={typeScale}
            settings={JSON.stringify({ seeds, params, typeScale, shadows }, null, 2)}
          />
        ) : (
          <>
            <div className="lab-modes">
              {MODES.map((mode) => (
                <ModePreview key={mode} theme={theme[mode]} issues={issues[mode]} />
              ))}
            </div>
            <TypeScalePreview params={typeScale} />
            <TokenTable light={theme.light} dark={theme.dark} />
          </>
        )}
      </main>
    </div>
  )
}

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

/** Palette ramps of both modes: anchors are token colors, fills are interpolated steps. */
function RampsPreview(props: { theme: Theme; input: CurveInput; ramps: RampKind; onRamps: (k: RampKind) => void }) {
  const { theme } = props
  return (
    <section className="lab-ramps">
      <div className="lab-row">
        <PaletteControls input={props.input} ramps={props.ramps} onRamps={props.onRamps} />
      </div>
      <p className="lab-muted">
        {props.ramps === 'roles'
          ? 'A step means the same role in every family and both modes: from the background end (white in light, black in dark) through surface, the background layers, the emphasized fill and its states, focus and ghost, to subtle text and text. Lightness can jump where a role is out of that order.'
          : props.input.curve.source === 'brand'
            ? 'Prototype: every family has one curve through the colors of its brand ramp (Branding page) and its seed, from white to black. The generator takes the chroma and hue of every color from the curve at the lightness it solves, so every rule still holds; fills are sampled from the curves on a grid fitted to the tokens. Δ is how far a family bends away from the grid.'
            : 'Prototype: every family has one curve through its seed from white to black (chroma falls off towards both ends, hue can rotate). The generator takes the chroma and hue of every color from the curve at the lightness it solves, so every rule still holds; fills are sampled from the curves on a grid fitted to the tokens. Δ is how far a family bends away from the grid.'}{' '}
        A dot marks the steps tokens use (hover for the list). Translucent tokens alias a step plus opacity.
      </p>
      {MODES.map((mode) => {
        const { ramps, grid } = paletteFor(props.ramps, mode, theme[mode], props.input).palette
        return (
          <div key={mode} className="lab-panel lab-ramps-mode">
            <h2>{mode}</h2>
            {grid && (
              <div className="lab-ramp">
                <code className="lab-ramp-name">grid</code>
                <div className="lab-ramp-steps">
                  {grid.map((l, i) => (
                    <div key={i} className="lab-ramp-step lab-ramp-fill">
                      <span className="lab-ramp-swatch" style={{ background: `oklch(${l} 0 0)` }} />
                      <span className="lab-ramp-label">{ramps[0]!.steps[i]!.step}</span>
                      <code className="lab-ramp-hex">L {l.toFixed(3)}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ramps.map((ramp) => (
              <div key={ramp.family} className="lab-ramp">
                <code className="lab-ramp-name">
                  {ramp.family}
                  {ramp.drift !== undefined && <span className="lab-ramp-drift">Δ {ramp.drift.toFixed(3)}</span>}
                </code>
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
                      <span className="lab-ramp-label">{s.step}</span>
                      <code className="lab-ramp-hex">{s.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </section>
  )
}

function CurveControls({ params: p, onChange }: { params: CurveParams; onChange: (p: CurveParams) => void }) {
  return (
    <Section title="Curve (prototype)">
      <Slider
        label="Tint chroma share"
        min={0}
        max={1}
        step={0.05}
        value={p.tint}
        onChange={(x) => onChange({ ...p, tint: x })}
      />
      {p.source === 'seed' && <SeedCurveControls params={p} onChange={onChange} />}
    </Section>
  )
}

/** The shape of a seed curve; brand curves take theirs from the brand ramps. */
function SeedCurveControls({ params: p, onChange }: { params: CurveParams; onChange: (p: CurveParams) => void }) {
  return (
    <>
      <Slider
        label="Chroma falloff to white"
        min={0.3}
        max={3}
        step={0.1}
        value={p.lightPower}
        onChange={(x) => onChange({ ...p, lightPower: x })}
      />
      <Slider
        label="Chroma falloff to black"
        min={0.3}
        max={3}
        step={0.1}
        value={p.darkPower}
        onChange={(x) => onChange({ ...p, darkPower: x })}
      />
      <Slider
        label="Hue shift (°)"
        min={-40}
        max={40}
        step={1}
        value={p.hueShift}
        onChange={(x) => onChange({ ...p, hueShift: x })}
      />
    </>
  )
}

function ShadowControls({ params: p, onChange }: { params: ShadowParams; onChange: (p: ShadowParams) => void }) {
  return (
    <Section title="Shadows">
      <div className="lab-label">Ambient layer</div>
      <Slider
        label="Offset min (px)"
        min={0.5}
        max={4}
        step={0.5}
        value={p.y.min}
        onChange={(x) => onChange({ ...p, y: { ...p.y, min: x } })}
      />
      <Slider
        label="Offset max (px)"
        min={8}
        max={64}
        step={1}
        value={p.y.max}
        onChange={(x) => onChange({ ...p, y: { ...p.y, max: x } })}
      />
      <Slider
        label="Blur ratio"
        min={1}
        max={5}
        step={0.1}
        value={p.blurRatio}
        onChange={(x) => onChange({ ...p, blurRatio: x })}
      />
      <Slider
        label="Blur base (px)"
        min={0}
        max={8}
        step={0.5}
        value={p.blurBase}
        onChange={(x) => onChange({ ...p, blurBase: x })}
      />
      <Slider
        label="Spread ratio"
        min={-1}
        max={0.5}
        step={0.05}
        value={p.spreadRatio}
        onChange={(x) => onChange({ ...p, spreadRatio: x })}
      />
      <Slider
        label="Opacity min"
        min={0}
        max={0.4}
        step={0.01}
        value={p.alpha.min}
        onChange={(x) => onChange({ ...p, alpha: { ...p.alpha, min: x } })}
      />
      <Slider
        label="Opacity max"
        min={0}
        max={0.8}
        step={0.01}
        value={p.alpha.max}
        onChange={(x) => onChange({ ...p, alpha: { ...p.alpha, max: x } })}
      />
      <Slider
        label="Opacity curve"
        min={0.5}
        max={4}
        step={0.1}
        value={p.alphaCurve}
        onChange={(x) => onChange({ ...p, alphaCurve: x })}
      />
      <div className="lab-label">Contact layer</div>
      <Slider
        label="Offset ratio"
        min={0}
        max={0.6}
        step={0.05}
        value={p.contact.yRatio}
        onChange={(x) => onChange({ ...p, contact: { ...p.contact, yRatio: x } })}
      />
      <Slider
        label="Blur ratio"
        min={1}
        max={4}
        step={0.1}
        value={p.contact.blurRatio}
        onChange={(x) => onChange({ ...p, contact: { ...p.contact, blurRatio: x } })}
      />
      <Slider
        label="Opacity min"
        min={0}
        max={0.3}
        step={0.01}
        value={p.contact.alpha.min}
        onChange={(x) => onChange({ ...p, contact: { ...p.contact, alpha: { ...p.contact.alpha, min: x } } })}
      />
      <Slider
        label="Opacity max"
        min={0}
        max={0.3}
        step={0.01}
        value={p.contact.alpha.max}
        onChange={(x) => onChange({ ...p, contact: { ...p.contact, alpha: { ...p.contact.alpha, max: x } } })}
      />
      <div className="lab-label">Hairline (2xs)</div>
      <Slider
        label="Opacity"
        min={0}
        max={0.3}
        step={0.01}
        value={p.hairline}
        onChange={(x) => onChange({ ...p, hairline: x })}
      />
      <div className="lab-label">Color</div>
      <Slider label="Tint" min={0} max={1} step={0.05} value={p.tint} onChange={(x) => onChange({ ...p, tint: x })} />
      <Slider
        label="Dark opacity ×"
        min={1}
        max={4}
        step={0.1}
        value={p.darkAlphaScale}
        onChange={(x) => onChange({ ...p, darkAlphaScale: x })}
      />
    </Section>
  )
}

/** The elevation ramp on generated surfaces, one mode at a time, with Tailwind's ramp for reference. */
function ShadowsPreview({ theme, params }: { theme: Theme; params: ShadowParams }) {
  const [mode, setMode] = useState<Mode>('light')
  const [reference, setReference] = useState(false)
  const [outline, setOutline] = useState<(typeof OUTLINES)[number]>('stroke/neutral')
  const [outlineWidth, setOutlineWidth] = useState(0.5)
  const shadows = generateModeShadows(theme[mode], params)
  const style = { ...toCssVars(theme[mode]), color: v('fg/neutral') } as CSSProperties
  // Edges come from stroke tokens, separately from the shadow.
  const card = (boxShadow: string): CSSProperties => ({
    background: v('bg/neutral/raised'),
    boxShadow,
    border: outline === 'none' ? 'none' : `${outlineWidth}px solid ${v(outline)}`,
  })
  return (
    <section className="lab-ui-preview">
      <div className="lab-row">
        <div className="lab-segmented" role="radiogroup" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={mode === m ? 'lab-segment lab-segment-active' : 'lab-segment'}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="lab-muted">
          <input type="checkbox" checked={reference} onChange={(e) => setReference(e.target.checked)} /> Tailwind
          reference
        </label>
        <label className="lab-muted">
          Outline{' '}
          <select value={outline} onChange={(e) => setOutline(e.target.value as (typeof OUTLINES)[number])}>
            {OUTLINES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>{' '}
          <select value={outlineWidth} onChange={(e) => setOutlineWidth(Number(e.target.value))}>
            {[0.5, 1].map((w) => (
              <option key={w} value={w}>
                {w}px
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="lab-shadow-stage" style={style}>
        {(['surface/neutral', 'bg/neutral/subtle'] as const).map((under) => (
          <div key={under} className="lab-shadow-layer" style={{ background: v(under) }}>
            <code style={{ color: v('fg/neutral/subtle') }}>on {under}</code>
            <div className="lab-shadow-grid">
              {SHADOW_LEVELS.map((level) => {
                const css = shadows.composite[`shadow/${level}`]!
                return (
                  <div key={level} className="lab-shadow-cell">
                    <div className="lab-shadow-card" style={card(css)}>
                      <strong>{level}</strong>
                    </div>
                    {reference && (
                      <div className="lab-shadow-card" style={card(TAILWIND_SHADOWS[level]!)}>
                        <span style={{ color: v('fg/neutral/subtle') }}>tw {level}</span>
                      </div>
                    )}
                    {under === 'surface/neutral' && (
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
    </section>
  )
}

function ModePreview({ theme, issues }: { theme: ModeTheme; issues: ReturnType<typeof validateMode> }) {
  const style = { ...toCssVars(theme), background: v('surface/neutral'), color: v('fg/neutral') } as CSSProperties
  return (
    <section className="lab-mode" style={style}>
      <div className="lab-mode-head">
        <h2>{theme.mode}</h2>
        <span className={issues.length ? 'lab-status lab-status-fail' : 'lab-status'}>
          {issues.length ? `${issues.length} rule violations` : 'All rules pass'}
        </span>
      </div>

      <h3 style={{ color: v('fg/neutral/subtle') }}>Layers</h3>
      <Layer name="surface/neutral" depth={0}>
        <Layer name="bg/neutral/subtle" depth={1}>
          <Layer name="bg/neutral" depth={2} />
        </Layer>
      </Layer>

      <h3 style={{ color: v('fg/neutral/subtle') }}>Roles</h3>
      <div className="lab-roles">
        {ROLES.map((r) => (
          <RoleRow key={r} role={r} />
        ))}
      </div>

      <h3 style={{ color: v('fg/neutral/subtle') }}>Focus, disabled, blanket</h3>
      <div className="lab-row">
        <button
          type="button"
          className="lab-btn"
          style={{ ...fill('neutral', true), outline: `2px solid ${v('focus/accent')}`, outlineOffset: 2 }}
        >
          Focused
        </button>
        <button
          type="button"
          disabled
          className="lab-btn"
          style={{
            background: v('bg/disabled'),
            color: v('fg/disabled'),
            border: `1px solid ${v('stroke/disabled')}`,
          }}
        >
          Disabled
        </button>
        <div className="lab-blanket-demo" style={{ background: v('bg/neutral') }}>
          <span>Content</span>
          <div style={{ position: 'absolute', inset: 0, background: v('blanket/neutral'), borderRadius: 6 }} />
        </div>
      </div>

      {theme.adjustments.length > 0 && (
        <>
          <h3 style={{ color: v('fg/neutral/subtle') }}>Adjustments</h3>
          <ul className="lab-list">
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
          <h3 style={{ color: v('fg/danger') }}>Rule violations</h3>
          <ul className="lab-list">
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

/** CSS custom properties driving the interactive classes in lab.css. */
const fill = (role: Role, emphasized: boolean): CSSProperties => {
  const base = emphasized ? `bg/${role}/emphasized` : role === 'neutral' ? 'bg/neutral/subtle' : `bg/${role}/subtle`
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

function Layer({ name, depth, children }: { name: string; depth: number; children?: ReactNode }) {
  const isSurface = depth === 0
  return (
    <div
      className={isSurface ? 'lab-layer' : 'lab-layer lab-clickable'}
      style={
        isSurface
          ? { border: `1px solid ${v('stroke/neutral/subtle')}` }
          : ({
              '--fill': v(name),
              '--fill-hover': v(`${name}/hover`),
              '--fill-pressed': v(`${name}/pressed`),
              border: `1px solid ${v('stroke/neutral/subtle')}`,
            } as CSSProperties)
      }
    >
      <div className="lab-layer-name">
        <code>{name}</code>
        {!isSurface && <span style={{ color: v('fg/neutral/subtle') }}> · click / hover</span>}
      </div>
      <div className="lab-row">
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
          style={
            {
              '--fill': v('bg/neutral/raised'),
              '--fill-hover': v('bg/neutral/raised/hover'),
              '--fill-pressed': v('bg/neutral/raised/pressed'),
              border: `1px solid ${v('stroke/neutral/emphasized')}`,
            } as CSSProperties
          }
        >
          Raised normal
        </span>
        <span
          className="lab-input lab-fill"
          style={
            {
              '--fill': v('bg/neutral/raised/emphasized'),
              '--fill-hover': v('bg/neutral/raised/emphasized/hover'),
              '--fill-pressed': v('bg/neutral/raised/emphasized/pressed'),
              border: `1px solid ${v('stroke/neutral/emphasized')}`,
            } as CSSProperties
          }
        >
          Raised emphasized
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
      <code className="lab-role-name">{role}</code>
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
        {['subtle', 'normal', 'emphasized'].map((p) => (
          <span
            key={p}
            title={`stroke/${role}${p === 'normal' ? '' : `/${p}`}`}
            className="lab-stroke"
            style={{ borderColor: v(`stroke/${role}${p === 'normal' ? '' : `/${p}`}`) }}
          />
        ))}
      </span>
      <span className="lab-row lab-row-tight">
        <span style={{ color: v(`fg/${role}/subtle`) }}>subtle</span>
        <span style={{ color: v(`fg/${role}`) }}>normal</span>
      </span>
    </div>
  )
}

function TypeScalePreview({ params }: { params: TypeScaleParams }) {
  const scale = generateTypeScale(params)
  return (
    <section className="lab-panel">
      <h2>Type scale</h2>
      <p className="lab-muted">Fonts are not bundled yet, so samples use system fallbacks.</p>
      <table className="lab-table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Desktop</th>
            <th>Mobile</th>
            <th>Sample (desktop)</th>
          </tr>
        </thead>
        <tbody>
          {scale.desktop.map((d, i) => {
            const m = scale.mobile[i]!
            const heading = i >= params.fixed.length + 2
            return (
              <tr key={d.name}>
                <td>
                  <code>font/size/{d.name}</code>
                </td>
                <td>
                  {d.size}/{d.lineHeight}
                </td>
                <td>
                  {m.size}/{m.lineHeight}
                </td>
                <td
                  style={{
                    fontSize: d.size,
                    lineHeight: `${d.lineHeight}px`,
                    fontFamily: heading ? 'Georgia, serif' : 'system-ui, sans-serif',
                  }}
                >
                  Reflection Lense
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function TokenTable({ light, dark }: { light: ModeTheme; dark: ModeTheme }) {
  const names = Object.keys(light.tokens).sort()
  return (
    <details className="lab-panel">
      <summary>
        <h2>Tokens ({names.length})</h2>
      </summary>
      <table className="lab-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Opacity</th>
            <th>Light</th>
            <th>Dark</th>
          </tr>
        </thead>
        <tbody>
          {names.map((n) => (
            <tr key={n}>
              <td>
                <code>{n}</code>
              </td>
              <td>{light.tokens[n]!.opacity}</td>
              <td>
                <Chip hex={light.tokens[n]!.value} />
              </td>
              <td>
                <Chip hex={dark.tokens[n]?.value ?? ''} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="lab-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value)
  const [last, setLast] = useState(value)
  if (value !== last) {
    setLast(value)
    setDraft(value)
  }
  return (
    <label className="lab-field">
      <span>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        className="lab-hex"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toLowerCase())
        }}
      />
    </label>
  )
}

function Slider(props: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="lab-field lab-slider">
      <span>{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <output>{props.value}</output>
    </label>
  )
}
