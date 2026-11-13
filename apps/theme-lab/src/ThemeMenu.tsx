// Global theme switcher: pick a saved theme, save changes, save as a new theme, import, rename, delete.

import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  MenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Textarea,
} from '@reflection/react'
import { useRef, useState, type ReactNode } from 'react'
import { parseSettings, type SavedTheme, type ThemeSettings } from './themes'

type Dialog =
  { kind: 'save-as' | 'rename' } | { kind: 'discard'; to: string } | { kind: 'delete' } | { kind: 'import' } | null

const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Hint = ({ children }: { children: ReactNode }) => (
  <span className="pl-3 text-caption text-neutral-subtle">{children}</span>
)

/** A dialog with a title, a description and actions; children go in the body. */
function Confirm(props: {
  open: boolean
  onClose: () => void
  title: string
  description: ReactNode
  actions: ReactNode
  children?: ReactNode
}) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        {props.children && <DialogBody className="gap-4">{props.children}</DialogBody>}
        <DialogFooter>
          <DialogClose asChild>
            <Button tone="default" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          {props.actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ThemeMenu(props: {
  themes: SavedTheme[]
  activeId: string
  modified: boolean
  onSwitch: (id: string) => void
  onSave: () => void
  onSaveAs: (name: string) => void
  onRename: (name: string) => void
  onDelete: () => void
  onImport: (name: string, settings: ThemeSettings) => void
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const [name, setName] = useState('')
  const active = props.themes.find((t) => t.id === props.activeId) ?? props.themes[0]!
  const close = () => setDialog(null)
  const ask = (kind: 'save-as' | 'rename') => {
    setName(kind === 'rename' ? active.name : `${active.name} copy`)
    setDialog({ kind })
  }
  const switchTo = (id: string) => {
    if (id === active.id) return
    if (props.modified) setDialog({ kind: 'discard', to: id })
    else props.onSwitch(id)
  }
  const trimmed = name.trim()
  const submitName = () => {
    if (!trimmed || (dialog?.kind !== 'save-as' && dialog?.kind !== 'rename')) return
    if (dialog.kind === 'save-as') props.onSaveAs(trimmed)
    else props.onRename(trimmed)
    close()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button tone="default" variant="outline" size="sm">
            <span className="text-neutral-subtle">Theme</span> {active.name}
            {props.modified && (
              <>
                <span className="lab-theme-dot" aria-hidden="true" />
                <span className="sr-only">, unsaved changes</span>
              </>
            )}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64">
          <MenuLabel>Themes</MenuLabel>
          <DropdownMenuRadioGroup value={active.id} onValueChange={switchTo}>
            {props.themes.map((t) => (
              <DropdownMenuRadioItem key={t.id} value={t.id}>
                <span className="flex-1">{t.name}</span>
                {t.id === active.id && props.modified ? <Hint>Edited</Hint> : t.builtIn ? <Hint>Built-in</Hint> : null}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={active.builtIn || !props.modified} onSelect={props.onSave}>
            <span className="flex-1">Save changes</span>
            {active.builtIn && <Hint>Read-only</Hint>}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => ask('save-as')}>Save as new theme…</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog({ kind: 'import' })}>Import theme…</DropdownMenuItem>
          <DropdownMenuItem disabled={active.builtIn} onSelect={() => ask('rename')}>
            Rename…
          </DropdownMenuItem>
          <DropdownMenuItem disabled={active.builtIn} onSelect={() => setDialog({ kind: 'delete' })}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Confirm
        open={dialog?.kind === 'save-as' || dialog?.kind === 'rename'}
        onClose={close}
        title={dialog?.kind === 'rename' ? 'Rename theme' : 'Save as new theme'}
        description="Themes are saved in this browser."
        actions={
          <Button variant="solid" tone="accent" size="sm" disabled={!trimmed} onClick={submitName}>
            Save
          </Button>
        }
      >
        <Field label="Name">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitName()}
          />
        </Field>
      </Confirm>

      <ImportThemeDialog
        open={dialog?.kind === 'import'}
        onClose={close}
        warning={props.modified ? `Unsaved changes to ${active.name} will be discarded.` : undefined}
        onImport={(name, settings) => {
          props.onImport(name, settings)
          close()
        }}
      />

      <Confirm
        open={dialog?.kind === 'discard'}
        onClose={close}
        title="Discard changes?"
        description={`Your changes to ${active.name} are not saved. Switching themes discards them.`}
        actions={
          <Button
            variant="solid"
            tone="danger"
            size="sm"
            onClick={() => {
              if (dialog?.kind === 'discard') props.onSwitch(dialog.to)
              close()
            }}
          >
            Discard and switch
          </Button>
        }
      />

      <Confirm
        open={dialog?.kind === 'delete'}
        onClose={close}
        title={`Delete ${active.name}?`}
        description="The theme is removed from this browser. The Lab switches to Reflection."
        actions={
          <Button
            variant="solid"
            tone="danger"
            size="sm"
            onClick={() => {
              props.onDelete()
              close()
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}

/** Paste or open generator settings exported by the Lab; they become a new saved theme. */
function ImportThemeDialog(props: {
  open: boolean
  onClose: () => void
  warning?: string
  onImport: (name: string, settings: ThemeSettings) => void
}) {
  const [name, setName] = useState('Imported theme')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const submit = () => {
    const result = parseSettings(text)
    if ('error' in result) return setError(result.error)
    props.onImport(name.trim() || 'Imported theme', result.settings)
    setName('Imported theme')
    setText('')
    setError('')
  }
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import theme</DialogTitle>
          <DialogDescription>
            Generator settings from Export → Generator settings. Missing parameters take the defaults. The theme is
            saved in this browser.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="gap-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Settings JSON" caption="Paste the JSON or open a .json file." error={error || undefined}>
            <Textarea
              rows={12}
              className="text-code-small"
              value={text}
              placeholder='{ "seeds": { "light": { … }, "dark": { … } }, "params": { … } }'
              onChange={(e) => {
                setText(e.target.value)
                setError('')
              }}
            />
          </Field>
          <div>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setText(await f.text())
                setName(f.name.replace(/\.(tokens\.)?json$/, '').replace(/^theme-lab-settings$/, 'Imported theme'))
                setError('')
                e.target.value = ''
              }}
            />
            <Button tone="default" variant="outline" size="sm" onClick={() => file.current?.click()}>
              Open file…
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          {props.warning && <span className="mr-auto text-caption text-neutral-subtle">{props.warning}</span>}
          <DialogClose asChild>
            <Button tone="default" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="solid" tone="accent" size="sm" disabled={!text.trim()} onClick={submit}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
