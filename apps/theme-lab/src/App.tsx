import {
  validateTypeScale,
  type GeneratorParams,
  type ShadowParams,
  type ThemeSeeds,
  type TypeScaleParams,
} from '@reflection/tokens'
import { memo, useCallback, useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { generate } from './generated'
import { ColorControls, ShadowControls } from './Customize'
import * as previews from './previews'
import * as catalog from './TokenBrowser'
import { ExportDialog } from './TokenExport'
import { TypeRolesPreview, TypeStepsEditor } from './TypeScaleEditor'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@reflection/react'
import { Drawer, Status } from './ui/lab'
import { ThemeMenu } from './ThemeMenu'
import {
  BUILT_IN_THEMES,
  loadActiveId,
  loadSavedThemes,
  newThemeId,
  normalize,
  sameSettings,
  storeActiveId,
  storeSavedThemes,
  type SavedTheme,
  type ThemeSettings,
} from './themes'

// Heavy tabs render from the deferred values only: memo keeps them still while inputs update.
const ColorTab = memo(previews.ColorTab)
const ShadowsTab = memo(previews.ShadowsTab)
const DimensionsTab = memo(previews.DimensionsTab)
const PreviewTab = memo(previews.PreviewTab)
const TokenBrowser = memo(catalog.TokenBrowser)
const { MODES } = previews

/** One tab per token domain, the live preview and the token catalog. Export is a global action. */
const TABS = [
  { id: 'color', label: 'Color' },
  { id: 'type', label: 'Type' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'preview', label: 'Preview' },
  { id: 'tokens', label: 'Tokens' },
] as const
type Tab = (typeof TABS)[number]['id']
/** Tabs whose tokens are generated from parameters; the others have nothing to customize. */
const CUSTOMIZE: Partial<Record<Tab, string>> = {
  color: 'Customize color',
  preview: 'Customize color',
  type: 'Customize type scale',
  shadows: 'Customize shadows',
}

const SlidersIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4h7M13 4h1M2 12h2M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function App() {
  const [themes, setThemes] = useState<SavedTheme[]>(() => [...BUILT_IN_THEMES, ...loadSavedThemes()])
  const [activeId, setActiveId] = useState(() => {
    const id = loadActiveId()
    return themes.some((t) => t.id === id) ? id : BUILT_IN_THEMES[0]!.id
  })
  const active = themes.find((t) => t.id === activeId) ?? themes[0]!
  const initial = normalize(active.settings)
  const [seeds, setSeeds] = useState<ThemeSeeds>(initial.seeds)
  const [params, setParams] = useState<GeneratorParams>(initial.params)
  const [typeScale, setTypeScale] = useState<TypeScaleParams>(initial.typeScale)
  const [shadows, setShadows] = useState<ShadowParams>(initial.shadows)
  const current: ThemeSettings = useMemo(
    () => ({ seeds, params, typeScale, shadows }),
    [seeds, params, typeScale, shadows],
  )
  const modified = !sameSettings(current, normalize(active.settings))
  const [tab, setTab] = useState<Tab>('color')
  const [customizing, setCustomizing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const close = useCallback(() => setCustomizing(false), [])
  const closeExport = useCallback(() => setExporting(false), [])

  // Inputs update at once; the generator and previews follow a deferred copy, so dragging a color
  // picker or slider stays smooth and intermediate values are skipped.
  const deferred = useDeferredValue(current)
  const generated = useMemo(() => generate(deferred.seeds, deferred.params), [deferred.seeds, deferred.params])
  const violations =
    MODES.reduce((n, mode) => n + generated.issues[mode].length, 0) + validateTypeScale(deferred.typeScale).length

  const apply = (settings: ThemeSettings) => {
    const s = normalize(settings)
    setSeeds(s.seeds)
    setParams(s.params)
    setTypeScale(s.typeScale)
    setShadows(s.shadows)
  }
  /** Reset returns to the active theme as saved. */
  const reset = () => apply(active.settings)
  const commit = (next: SavedTheme[], id: string) => {
    setThemes(next)
    setActiveId(id)
    storeSavedThemes(next)
    storeActiveId(id)
  }
  const switchTheme = (id: string) => {
    const theme = themes.find((t) => t.id === id)
    if (!theme) return
    apply(theme.settings)
    setActiveId(id)
    storeActiveId(id)
  }
  const saveChanges = () =>
    commit(
      themes.map((t) => (t.id === active.id ? { ...t, settings: structuredClone(current) } : t)),
      active.id,
    )
  const saveAs = (name: string) => {
    const id = newThemeId()
    commit([...themes, { id, name, settings: structuredClone(current) }], id)
  }
  const importTheme = (name: string, settings: ThemeSettings) => {
    const id = newThemeId()
    apply(settings)
    commit([...themes, { id, name, settings }], id)
  }
  const rename = (name: string) =>
    commit(
      themes.map((t) => (t.id === active.id ? { ...t, name } : t)),
      active.id,
    )
  const remove = () => {
    const next = themes.filter((t) => t.id !== active.id)
    apply(BUILT_IN_THEMES[0]!.settings)
    commit(next, BUILT_IN_THEMES[0]!.id)
  }
  const title = CUSTOMIZE[tab]
  const open = customizing && title !== undefined

  let content: ReactNode
  if (tab === 'color') content = <ColorTab generated={generated} />
  else if (tab === 'type') content = <TypeRolesPreview value={typeScale} onChange={setTypeScale} />
  else if (tab === 'shadows') content = <ShadowsTab theme={generated.theme} params={deferred.shadows} />
  else if (tab === 'dimensions') content = <DimensionsTab />
  else if (tab === 'preview') content = <PreviewTab generated={generated} />
  else content = <TokenBrowser theme={generated.resolved} shadows={deferred.shadows} typeScale={deferred.typeScale} />

  return (
    <Tabs value={tab} onValueChange={(t) => setTab(t as Tab)} className="lab block">
      <header className="lab-header">
        <h1 className="text-heading-small whitespace-nowrap">Theme Lab</h1>
        <div className="lab-header-theme">
          <ThemeMenu
            themes={themes}
            activeId={active.id}
            modified={modified}
            onSwitch={switchTheme}
            onSave={saveChanges}
            onSaveAs={saveAs}
            onRename={rename}
            onDelete={remove}
            onImport={importTheme}
          />
        </div>
        <TabsList aria-label="Sections" className="self-stretch">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="h-full">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="lab-header-actions">
          <Status tone={violations ? 'danger' : 'success'} count={violations}>
            {violations ? 'rule violations' : 'All rules pass'}
          </Status>
          <Button asChild variant="ghost" size="sm">
            <a href="/storybook/">Docs</a>
          </Button>
          <Button variant="ghost" size="sm" disabled={!modified} onClick={reset}>
            Reset
          </Button>
          <Button size="sm" aria-haspopup="dialog" onClick={() => setExporting(true)}>
            <DownloadIcon />
            Export
          </Button>
          <Button
            variant="solid"
            size="sm"
            disabled={title === undefined}
            aria-expanded={open}
            onClick={() => setCustomizing((c) => !c)}
          >
            <SlidersIcon />
            Customize
          </Button>
        </div>
      </header>

      <TabsContent value={tab} asChild>
        <main className="lab-main" data-drawer={open ? '' : undefined}>
          {content}
        </main>
      </TabsContent>

      <Drawer open={open} title={title ?? ''} onClose={close}>
        {(tab === 'color' || tab === 'preview') && (
          <ColorControls seeds={seeds} onSeeds={setSeeds} params={params} onParams={setParams} />
        )}
        {tab === 'type' && <TypeStepsEditor value={typeScale} onChange={setTypeScale} />}
        {tab === 'shadows' && <ShadowControls params={shadows} onChange={setShadows} />}
      </Drawer>

      <ExportDialog
        open={exporting}
        onClose={closeExport}
        theme={generated.resolved}
        shadows={shadows}
        typeScale={typeScale}
        settings={JSON.stringify(current, null, 2)}
      />
    </Tabs>
  )
}
