import { useMemo, useState } from 'react'
import { figmaPrompt } from './figmaPrompt'
import {
  toDtcg,
  toDtcgAllModes,
  type Mode,
  type Theme,
  type ShadowParams,
  type TypeScaleParams,
} from '@reflection/tokens'

export function TokenExport(props: { theme: Theme; shadows: ShadowParams; typeScale: TypeScaleParams }) {
  const [allModes, setAllModes] = useState(false)
  const [mode, setMode] = useState<Mode>('light')
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [message, setMessage] = useState('')
  const [targetTheme, setTargetTheme] = useState<'Reflection' | 'Custom'>('Reflection')
  const prompt = useMemo(
    () => figmaPrompt(props.theme, props.shadows, props.typeScale, targetTheme),
    [props.theme, props.shadows, props.typeScale, targetTheme],
  )
  const json = useMemo(
    () =>
      JSON.stringify(
        allModes
          ? toDtcgAllModes(props.theme, { shadows: props.shadows, typeScale: props.typeScale })
          : toDtcg(props.theme[mode], { shadows: props.shadows, typeScale: props.typeScale, viewport }),
        null,
        2,
      ),
    [props.theme, props.shadows, props.typeScale, mode, viewport, allModes],
  )
  const filename = allModes ? 'reflection-all-modes.tokens.json' : `reflection-${mode}-${viewport}.tokens.json`
  const download = () => {
    const url = URL.createObjectURL(new Blob([json + '\n'], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setMessage('JSON copied.')
    } catch {
      setMessage('Clipboard unavailable. Download the file or copy the preview below.')
    }
  }
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setMessage('Figma prompt copied with all modes and palette mappings.')
    } catch {
      setMessage('Clipboard unavailable. Copy the Figma prompt preview below.')
    }
  }
  return (
    <div className="lab-token-export">
      <p className="lab-muted">DTCG 2025.10 · Colors, shadows and type scale from your current settings.</p>
      <label className="lab-export-choice">
        Export scope
        <select
          value={allModes ? 'all' : 'selected'}
          onChange={(e) => {
            setAllModes(e.target.value === 'all')
            setMessage('')
          }}
        >
          <option value="selected">Selected modes</option>
          <option value="all">All modes</option>
        </select>
      </label>
      {allModes ? (
        <p className="lab-muted">
          Includes Light + Dark colors and shadows, Desktop + Mobile type scales, and shared font families.
        </p>
      ) : (
        <>
          <label className="lab-export-choice">
            Color mode
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as Mode)
                setMessage('')
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="lab-export-choice">
            Type scale
            <select
              value={viewport}
              onChange={(e) => {
                setViewport(e.target.value as 'desktop' | 'mobile')
                setMessage('')
              }}
            >
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>
        </>
      )}
      <div className="lab-export-actions">
        <button type="button" onClick={download}>
          {allModes ? 'Download all modes' : 'Download JSON'}
        </button>
        <button type="button" onClick={() => void copy()}>
          {allModes ? 'Copy all modes' : 'Copy JSON'}
        </button>
      </div>
      <span role="status">{message}</span>
      <details>
        <summary>Preview JSON</summary>
        <textarea className="lab-export" aria-label="DTCG token JSON" readOnly rows={12} value={json} />
      </details>
      <label className="lab-export-choice">
        Figma Core theme
        <select
          value={targetTheme}
          onChange={(e) => {
            setTargetTheme(e.target.value as 'Reflection' | 'Custom')
            setMessage('')
          }}
        >
          <option value="Reflection">Reflection</option>
          <option value="Custom">Custom</option>
        </select>
      </label>
      <button type="button" onClick={() => void copyPrompt()}>
        Copy Figma prompt
      </button>
      <p className="lab-muted">
        Always includes all modes and Palette → Core → Theme mapping instructions for the selected Core theme.
      </p>
      <details>
        <summary>Preview Figma prompt</summary>
        <textarea className="lab-export" aria-label="Figma handoff prompt" readOnly rows={12} value={prompt} />
      </details>
      <p className="lab-muted">Spacing, size and radius exports are not available yet.</p>
    </div>
  )
}
