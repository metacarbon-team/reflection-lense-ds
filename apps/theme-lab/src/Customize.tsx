// Controls shown in the Customize drawer, one set per tab.

import { STATUS_ROLES, type GeneratorParams, type ShadowParams, type ThemeSeeds } from '@reflection/tokens'
import { ColorInput, Section, Slider } from './ui/lab'

const MODES = ['light', 'dark'] as const
const SEED_KEYS = ['bg', 'fg', 'accent'] as const

export function ColorControls(props: {
  seeds: ThemeSeeds
  onSeeds: (s: ThemeSeeds) => void
  params: GeneratorParams
  onParams: (p: GeneratorParams) => void
}) {
  const { seeds, params: p, onParams } = props
  const set = (patch: Partial<GeneratorParams>) => onParams({ ...p, ...patch })
  return (
    <>
      {MODES.map((mode) => (
        <Section key={mode} title={`Seeds · ${mode}`}>
          {SEED_KEYS.map((key) => (
            <ColorInput
              key={key}
              label={key}
              value={seeds[mode][key]}
              onChange={(value) => props.onSeeds({ ...seeds, [mode]: { ...seeds[mode], [key]: value } })}
            />
          ))}
        </Section>
      ))}

      <Section title="Steps · OKLCH ΔL">
        <Slider
          label="Screen flare"
          min={0}
          max={0.02}
          step={0.001}
          value={p.flare}
          onChange={(x) => set({ flare: x })}
        />
        <Slider
          label="Layer step"
          min={0.01}
          max={0.08}
          step={0.005}
          value={p.layerStep}
          onChange={(x) => set({ layerStep: x })}
        />
        <Slider
          label="State step"
          min={0.01}
          max={0.08}
          step={0.005}
          value={p.stateStep}
          onChange={(x) => set({ stateStep: x })}
        />
        <Slider
          label="Form step"
          min={0.005}
          max={0.04}
          step={0.0025}
          value={p.formStep}
          onChange={(x) => set({ formStep: x })}
        />
        <Slider
          label="Disabled step"
          min={0.005}
          max={0.06}
          step={0.0025}
          value={p.disabledStep}
          onChange={(x) => set({ disabledStep: x })}
        />
        <Slider
          label="Text step"
          min={0.03}
          max={0.16}
          step={0.005}
          value={p.fgStep}
          onChange={(x) => set({ fgStep: x })}
        />
        <Slider
          label="Role text step"
          min={0.03}
          max={0.24}
          step={0.005}
          value={p.roleTextStep}
          onChange={(x) => set({ roleTextStep: x })}
        />
      </Section>

      <Section title="Contrast">
        <Slider
          label="Neutral weight floor"
          min={3}
          max={18}
          step={0.5}
          value={p.neutralWeightFloor}
          onChange={(x) => set({ neutralWeightFloor: x })}
        />
        <Slider
          label="Disabled text"
          min={1.2}
          max={3}
          step={0.1}
          value={p.disabledContrast}
          onChange={(x) => set({ disabledContrast: x })}
        />
      </Section>

      <Section title="Status">
        {STATUS_ROLES.map((r) => (
          <ColorInput
            key={r}
            label={r}
            value={p.statusSeeds[r]}
            onChange={(x) => set({ statusSeeds: { ...p.statusSeeds, [r]: x } })}
          />
        ))}
        <Slider
          label="Tint chroma"
          min={0}
          max={0.08}
          step={0.005}
          value={p.tintChroma}
          onChange={(x) => set({ tintChroma: x })}
        />
      </Section>

      <Section title="Alpha">
        <Slider
          label="Stroke subtle"
          min={0.02}
          max={0.4}
          step={0.01}
          value={p.strokeAlpha.subtle}
          onChange={(x) => set({ strokeAlpha: { ...p.strokeAlpha, subtle: x } })}
        />
        <Slider
          label="Stroke normal"
          min={0.02}
          max={0.5}
          step={0.01}
          value={p.strokeAlpha.normal}
          onChange={(x) => set({ strokeAlpha: { ...p.strokeAlpha, normal: x } })}
        />
        <Slider
          label="Backdrop"
          min={0.1}
          max={0.9}
          step={0.01}
          value={p.backdropAlpha}
          onChange={(x) => set({ backdropAlpha: x })}
        />
        <Slider
          label="Focus halo"
          min={0.05}
          max={0.6}
          step={0.01}
          value={p.focusHaloAlpha}
          onChange={(x) => set({ focusHaloAlpha: x })}
        />
      </Section>
    </>
  )
}

export function ShadowControls({ params: p, onChange }: { params: ShadowParams; onChange: (p: ShadowParams) => void }) {
  return (
    <>
      <Section title="Ambient layer">
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
      </Section>
      <Section title="Contact layer">
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
      </Section>
      <Section title="Hairline · 2xs">
        <Slider
          label="Opacity"
          min={0}
          max={0.3}
          step={0.01}
          value={p.hairline}
          onChange={(x) => onChange({ ...p, hairline: x })}
        />
      </Section>
      <Section title="Color">
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
    </>
  )
}
