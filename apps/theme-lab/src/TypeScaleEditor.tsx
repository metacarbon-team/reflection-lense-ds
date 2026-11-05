import {
  textStyles,
  validateTypeScale,
  VIEWPORTS,
  type TypeScaleParams,
  type TypeStep,
  type Viewport,
} from '@reflection/tokens'

/** rem → px, the value Figma shows. */
const px = (rem: number) => `${Math.round(rem * 16 * 100) / 100}px`
const FAMILY_FALLBACK = { sans: 'system-ui, sans-serif', serif: 'Georgia, serif', mono: 'ui-monospace, monospace' }

/** Steps of the scale in rem (ADR 0030): size and line height, px shown as the Figma value. */
export function TypeStepsEditor({
  value,
  onChange,
}: {
  value: TypeScaleParams
  onChange: (p: TypeScaleParams) => void
}) {
  const issues = validateTypeScale(value)
  const set = (i: number, patch: Partial<TypeStep>) =>
    onChange({ ...value, steps: value.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  return (
    <div className="lab-type-steps">
      <div className="lab-type-step lab-muted" aria-hidden="true">
        <span>Step</span>
        <span>Size, rem</span>
        <span>Line, rem</span>
      </div>
      {value.steps.map((s, i) => (
        <div className="lab-type-step" key={s.name}>
          <code>{s.name}</code>
          <label>
            <input
              type="number"
              aria-label={`${s.name} size in rem`}
              min={0.625}
              step={0.0625}
              value={s.size}
              onChange={(e) => set(i, { size: Number(e.target.value) })}
            />
            <span className="lab-muted">{px(s.size)}</span>
          </label>
          <label>
            <input
              type="number"
              aria-label={`${s.name} line height in rem`}
              min={0.625}
              step={0.25}
              value={s.lineHeight}
              onChange={(e) => set(i, { lineHeight: Number(e.target.value) })}
            />
            <span className="lab-muted">{px(s.lineHeight)}</span>
          </label>
        </div>
      ))}
      {issues.length > 0 && (
        <ul className="lab-type-issues" role="alert">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Text roles: the step each role takes per viewport, with a sample of every composite style. */
export function TypeRolesPreview({
  value,
  onChange,
}: {
  value: TypeScaleParams
  onChange: (p: TypeScaleParams) => void
}) {
  const valid = validateTypeScale(value).length === 0
  const styles = valid ? { desktop: textStyles(value, 'desktop'), mobile: textStyles(value, 'mobile') } : null
  const setStep = (i: number, viewport: Viewport, step: string) =>
    onChange({
      ...value,
      roles: value.roles.map((r, j) => (j === i ? { ...r, step: { ...r.step, [viewport]: step } } : r)),
    })
  const setTracking = (i: number, tracking: string) =>
    onChange({ ...value, roles: value.roles.map((r, j) => (j === i ? { ...r, tracking } : r)) })
  return (
    <section className="lab-panel">
      <h2>Text roles</h2>
      <p className="lab-muted">
        Each role takes a step per viewport (ADR 0030). Fonts are not bundled yet, so samples use system fallbacks.
      </p>
      {!valid && <p role="alert">Fix the type scale steps to preview the roles.</p>}
      <table className="lab-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Desktop</th>
            <th>Mobile</th>
            <th>Sample (desktop)</th>
          </tr>
        </thead>
        <tbody>
          {value.roles.map((role, i) => {
            const style = styles?.desktop.find((s) => s.name === role.name)
            return (
              <tr key={role.name}>
                <td>
                  <code>{role.name}</code>
                  <div className="lab-muted">
                    {role.family} · {[role.weight, ...Object.values(role.weights ?? {})].join(', ')}
                  </div>
                  <select
                    aria-label={`${role.name} tracking`}
                    value={role.tracking ?? 'normal'}
                    onChange={(e) => setTracking(i, e.target.value)}
                  >
                    {Object.entries(value.tracking).map(([name, em]) => (
                      <option key={name} value={name}>
                        tracking {name} ({em}em)
                      </option>
                    ))}
                  </select>
                </td>
                {VIEWPORTS.map((viewport) => {
                  const s = styles?.[viewport].find((st) => st.name === role.name)
                  return (
                    <td key={viewport}>
                      <select
                        aria-label={`${role.name} ${viewport} step`}
                        value={role.step[viewport]}
                        onChange={(e) => setStep(i, viewport, e.target.value)}
                      >
                        {value.steps.map((step) => (
                          <option key={step.name} value={step.name}>
                            {step.name}
                          </option>
                        ))}
                      </select>
                      {s && (
                        <span className="lab-muted">
                          {' '}
                          {px(s.step.size)}/{px(s.step.lineHeight)}
                        </span>
                      )}
                    </td>
                  )
                })}
                <td
                  style={
                    style && {
                      fontSize: `${style.step.size}rem`,
                      lineHeight: `${style.step.lineHeight}rem`,
                      fontWeight: style.weight,
                      letterSpacing: `${style.tracking.em}em`,
                      fontFamily: FAMILY_FALLBACK[style.family],
                      textDecoration: style.decoration,
                      textTransform: style.textCase,
                    }
                  }
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
