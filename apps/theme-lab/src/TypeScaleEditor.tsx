import {
  textStyles,
  validateTypeScale,
  VIEWPORTS,
  type TypeScaleParams,
  type TypeStep,
  type Viewport,
} from '@reflection/tokens'
import { Input } from '@reflection/react'
import { Choice, Panel, Section } from './ui/lab'

/** rem → px, the value Figma shows. */
const px = (rem: number) => `${Math.round(rem * 16 * 100) / 100}px`
const FAMILY = { sans: 'var(--font-family-sans)', serif: 'var(--font-family-serif)', mono: 'var(--font-family-mono)' }

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
    <Section title="Steps · rem">
      <div className="lab-type-steps">
        <div className="lab-type-step text-label-small text-neutral-subtle" aria-hidden="true">
          <span>Step</span>
          <span>Size</span>
          <span>Line height</span>
        </div>
        {value.steps.map((s, i) => (
          <div className="lab-type-step" key={s.name}>
            <code className="text-code-small">{s.name}</code>
            <label>
              <Input
                type="number"
                inputClassName="text-code-small"
                aria-label={`${s.name} size in rem`}
                min={0.625}
                step={0.0625}
                value={s.size}
                onChange={(e) => set(i, { size: Number(e.target.value) })}
              />
              <span className="text-caption text-neutral-subtle">{px(s.size)}</span>
            </label>
            <label>
              <Input
                type="number"
                inputClassName="text-code-small"
                aria-label={`${s.name} line height in rem`}
                min={0.625}
                step={0.25}
                value={s.lineHeight}
                onChange={(e) => set(i, { lineHeight: Number(e.target.value) })}
              />
              <span className="text-caption text-neutral-subtle">{px(s.lineHeight)}</span>
            </label>
          </div>
        ))}
      </div>
      {issues.length > 0 && (
        <ul className="lab-type-issues text-caption" role="alert">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </Section>
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
  const steps = value.steps.map((s) => ({ value: s.name, label: s.name }))
  const tracking = Object.entries(value.tracking).map(([name, em]) => ({ value: name, label: `${name} · ${em}em` }))
  const setRole = (i: number, patch: Partial<TypeScaleParams['roles'][number]>) =>
    onChange({ ...value, roles: value.roles.map((r, j) => (j === i ? { ...r, ...patch } : r)) })
  const setStep = (i: number, viewport: Viewport, step: string) =>
    setRole(i, { step: { ...value.roles[i]!.step, [viewport]: step } })
  return (
    <Panel
      title="Text roles"
      description="Each role takes a step per viewport and a tracking step (ADR 0030, 0031). Samples use the bundled NaN Serf fonts; NaN Serf B picks its optical size from the font size."
    >
      {!valid && (
        <p className="text-body-small text-danger" role="alert">
          Fix the type scale steps to preview the roles.
        </p>
      )}
      <table className="lab-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Desktop</th>
            <th>Mobile</th>
            <th>Tracking</th>
            <th>Sample · desktop</th>
          </tr>
        </thead>
        <tbody>
          {value.roles.map((role, i) => {
            const style = styles?.desktop.find((s) => s.name === role.name)
            return (
              <tr key={role.name}>
                <td>
                  <code>{role.name}</code>
                  <div className="text-caption text-neutral-subtle">
                    {role.family} · {[role.weight, ...Object.values(role.weights ?? {})].join(', ')}
                  </div>
                </td>
                {VIEWPORTS.map((viewport) => {
                  const s = styles?.[viewport].find((st) => st.name === role.name)
                  return (
                    <td key={viewport}>
                      <div className="lab-type-cell">
                        <Choice
                          aria-label={`${role.name} ${viewport} step`}
                          value={role.step[viewport]}
                          options={steps}
                          onChange={(step) => setStep(i, viewport, step)}
                        />
                        {s && (
                          <span className="text-caption text-neutral-subtle">
                            {px(s.step.size)} / {px(s.step.lineHeight)}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
                <td>
                  <Choice
                    aria-label={`${role.name} tracking`}
                    value={role.tracking ?? 'normal'}
                    options={tracking}
                    onChange={(t) => setRole(i, { tracking: t })}
                  />
                </td>
                <td
                  style={
                    style && {
                      fontSize: `${style.step.size}rem`,
                      lineHeight: `${style.step.lineHeight}rem`,
                      fontWeight: style.weight,
                      letterSpacing: `${style.tracking.em}em`,
                      fontFamily: FAMILY[style.family],
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
    </Panel>
  )
}
