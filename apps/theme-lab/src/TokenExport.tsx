import {
  toDtcg,
  toDtcgAllModes,
  type Mode,
  type ShadowParams,
  type Theme,
  type TypeScaleParams,
} from '@reflection/tokens'
import { useMemo, useState } from 'react'
import { figmaPrompt } from './figmaPrompt'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Textarea,
} from '@reflection/react'
import { Segmented } from './ui/lab'

type Format = 'dtcg' | 'figma' | 'settings'
type Scope = 'selected' | 'all'
type Viewport = 'desktop' | 'mobile'
type Core = 'Reflection' | 'Custom'

const FORMATS = [
  { id: 'dtcg', label: 'DTCG tokens' },
  { id: 'figma', label: 'Figma prompt' },
  { id: 'settings', label: 'Generator settings' },
] as const
const NOTES: Record<Format, string> = {
  dtcg: 'DTCG 2025.10 from your current settings: colors, shadows, type scale and text styles, spacing, size, radius and border width. Dimensions in rem (1rem = 16px).',
  figma:
    'A prompt with all modes, the role palette and the Palette → Core → Theme mapping, for the Core theme you pick.',
  settings: 'The seeds and parameters behind this theme, to reproduce it in another session.',
}

const download = (text: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([text + '\n'], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Export dialog: one format at a time, with its options, a preview and the actions in the footer. */
export function ExportDialog(props: {
  open: boolean
  onClose: () => void
  theme: Theme
  shadows: ShadowParams
  typeScale: TypeScaleParams
  settings: string
}) {
  const [format, setFormat] = useState<Format>('dtcg')
  const [scope, setScope] = useState<Scope>('selected')
  const [mode, setMode] = useState<Mode>('light')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [core, setCore] = useState<Core>('Reflection')
  const [message, setMessage] = useState('')
  const { theme, shadows, typeScale } = props

  const text = useMemo(() => {
    if (format === 'settings') return props.settings
    if (format === 'figma') return figmaPrompt(theme, shadows, typeScale, core)
    const tokens =
      scope === 'all'
        ? toDtcgAllModes(theme, { shadows, typeScale })
        : toDtcg(theme[mode], { shadows, typeScale, viewport })
    return JSON.stringify(tokens, null, 2)
  }, [format, scope, mode, viewport, core, theme, shadows, typeScale, props.settings])
  const filename =
    format === 'settings'
      ? 'theme-lab-settings.json'
      : scope === 'all'
        ? 'reflection-all-modes.tokens.json'
        : `reflection-${mode}-${viewport}.tokens.json`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Copied.')
    } catch {
      setMessage('Clipboard unavailable; copy from the field.')
    }
  }
  const pick =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setMessage('')
    }

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>{NOTES[format]}</DialogDescription>
        </DialogHeader>
        <DialogBody className="gap-4">
          <Segmented label="Format" options={FORMATS} value={format} onChange={pick(setFormat)} />
          {format === 'dtcg' && (
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                label="Export scope"
                options={[
                  { id: 'selected', label: 'One mode' },
                  { id: 'all', label: 'All modes' },
                ]}
                value={scope}
                onChange={pick(setScope)}
              />
              {scope === 'selected' && (
                <>
                  <Segmented
                    label="Color mode"
                    options={[
                      { id: 'light', label: 'Light' },
                      { id: 'dark', label: 'Dark' },
                    ]}
                    value={mode}
                    onChange={pick(setMode)}
                  />
                  <Segmented
                    label="Text styles"
                    options={[
                      { id: 'desktop', label: 'Desktop' },
                      { id: 'mobile', label: 'Mobile' },
                    ]}
                    value={viewport}
                    onChange={pick(setViewport)}
                  />
                </>
              )}
            </div>
          )}
          {format === 'figma' && (
            <Segmented
              label="Figma Core theme"
              options={[
                { id: 'Reflection', label: 'Reflection' },
                { id: 'Custom', label: 'Custom' },
              ]}
              value={core}
              onChange={pick(setCore)}
            />
          )}
          <Field label={format === 'figma' ? 'Prompt' : filename}>
            <Textarea readOnly rows={18} value={text} className="text-code-small" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <span className="mr-auto text-caption text-neutral-subtle" role="status">
            {message}
          </span>
          <Button tone="default" variant="outline" size="sm" onClick={() => void copy()}>
            Copy
          </Button>
          {format !== 'figma' && (
            <Button variant="solid" tone="accent" size="sm" onClick={() => download(text, filename)}>
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
