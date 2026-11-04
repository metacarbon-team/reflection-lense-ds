// Token usage audit for a Figma file. Read-only: it never writes to the file.
// Run through the Figma MCP `use_figma` tool: replace __PAGE_IDS__ with an array of page ids
// (['2024:3305', ...]) or [] for every page, and keep the rest as it is. Rules: references/rules.md.

const PAGE_IDS = __PAGE_IDS__
/** The collection components bind to; everything else (Palette, Core) is a primitive. */
const SEMANTIC_COLLECTION = 'Theme'
const MAX_EXAMPLES = 4

const local = await figma.variables.getLocalVariablesAsync('COLOR')
const byId = new Map(local.map((v) => [v.id, v]))
const collections = new Map((await figma.variables.getLocalVariableCollectionsAsync()).map((c) => [c.id, c.name]))
const semanticId = [...collections].find(([, name]) => name === SEMANTIC_COLLECTION)?.[0]
const effectStyles = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.id, s.name]))

// Figma repeats a group's last segment for its base token (bg/neutral/neutral); the grammar drops it.
const grammar = (name) => {
  const p = name.split('/')
  return p.length > 2 && p[p.length - 1] === p[p.length - 2] ? p.slice(0, -1).join('/') : name
}
const tokenOf = (id) => {
  const v = byId.get(id)
  if (!v) return { id, missing: true }
  return { id, name: grammar(v.name), semantic: v.variableCollectionId === semanticId, hidden: v.hiddenFromPublishing, collection: collections.get(v.variableCollectionId), variable: v }
}
const scopeOf = (name) => name.split('/')[0]
const roleOf = (name) => name.split('/')[1]
const isDisabled = (name) => /^(bg|fg|stroke)\/disabled$/.test(name)
const isEmphasizedBg = (name) => /^bg\/[a-z]+\/emphasized(\/hover|\/pressed)?$/.test(name)

// ---- colour math (WCAG 2) -------------------------------------------------------------------
const lin = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const over = (top, bottom) => ({ r: top.c.r * top.a + bottom.r * (1 - top.a), g: top.c.g * top.a + bottom.g * (1 - top.a), b: top.c.b * top.a + bottom.b * (1 - top.a) })
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')

/**
 * A visible solid paint as rendered on this node: colour, alpha and token (resolved in the node's mode).
 * Figma renders `paint.opacity`. While it equals the variable's alpha it stays linked and follows the
 * mode; once it differs it is a fixed value. So `a` is the paint opacity; `tokenAlpha` is what the
 * token says, and A6a reports where the two differ.
 */
const paintOf = (node, p) => {
  if (!p || p.type !== 'SOLID' || p.visible === false) return null
  let c = p.color
  const a = p.opacity ?? 1
  let tokenAlpha = null
  const id = p.boundVariables?.color?.id
  const token = id ? tokenOf(id) : null
  if (token?.variable) {
    try {
      const r = token.variable.resolveForConsumer(node).value
      if (r && 'r' in r) { c = { r: r.r, g: r.g, b: r.b }; tokenAlpha = r.a ?? 1 }
    } catch (e) {}
  }
  return { c, a, tokenAlpha, token, paint: p }
}
/** Raw paints this faint are hit areas or placeholders, not colours. */
const INVISIBLE = 0.01
const fillsOf = (node) => (Array.isArray(node.fills) ? node.fills : [])

/** What is behind a node: ancestor fills composited until an opaque one (white if none). */
const backgroundOf = (node) => {
  const layers = []
  for (let p = node.parent; p && p.type !== 'PAGE'; p = p.parent) {
    if (p.visible === false) continue
    const paints = fillsOf(p).map((f) => paintOf(p, f)).filter(Boolean).reverse()
    for (const f of paints) {
      layers.push(f)
      if (f.a >= 0.999) {
        let c = f.c
        for (let i = layers.length - 2; i >= 0; i--) c = over(layers[i], c)
        return { c, token: layers.find((l) => l.token)?.token ?? null, opaque: f.token }
      }
    }
  }
  let c = { r: 1, g: 1, b: 1 }
  for (let i = layers.length - 1; i >= 0; i--) c = over(layers[i], c)
  return { c, token: layers.find((l) => l.token)?.token ?? null, opaque: null }
}

// ---- reporting -------------------------------------------------------------------------------
const TITLES = {
  'A1 raw-color': 'Raw colour where a token should be',
  'A2 missing-variable': 'Bound to a deleted or library variable',
  'A3 deprecated-or-primitive': 'Bound to a hidden (deprecated) token or a primitive',
  'A5 role-mismatch': 'Token scope does not match the layer',
  'A6a paint-opacity': 'Paint opacity on top of a token',
  'A6b layer-opacity': 'Layer opacity below 100%',
  'B7 pairing': 'Text and fill pairing',
  'B8 states': 'Variant states',
  'B9 form-ghost': 'Form or ghost misuse',
  'C10 text-contrast': 'Text contrast',
  'C11 non-text-contrast': 'Non-text contrast (icons, graphics, boundaries)',
  'C12 shadows': 'Shadows outside shadow/* styles',
}
const findings = new Map()
const sourceId = (node) => (node.id.startsWith('I') ? node.id.split(';').pop() : node.id)
const contextOf = (node) => {
  for (let p = node; p && p.type !== 'PAGE'; p = p.parent) {
    if (p.type === 'COMPONENT') return p.parent?.type === 'COMPONENT_SET' ? `${p.parent.name} › ${p.name}` : p.name
  }
  let top = node
  while (top.parent && top.parent.type !== 'PAGE') top = top.parent
  return top.name
}
let pageName = ''
const report = (rule, severity, node, detail, suggestion) => {
  const key = `${rule}|${severity}|${detail}`
  const f = findings.get(key) ?? { rule, severity, detail, suggestion, sources: new Set(), examples: [] }
  const src = `${pageName}:${sourceId(node)}`
  if (!f.sources.has(src)) {
    f.sources.add(src)
    if (f.examples.length < MAX_EXAMPLES) f.examples.push(`${pageName} · ${contextOf(node)} · ${node.name} (${node.id})`)
  }
  findings.set(key, f)
}

// ---- per-node rules --------------------------------------------------------------------------
const insideIcon = (node) => {
  for (let p = node.parent; p && p.type !== 'PAGE'; p = p.parent)
    if (p.type === 'INSTANCE' && /icon/i.test(p.name + ' ' + (p.mainComponent?.parent?.name ?? p.mainComponent?.name ?? ''))) return true
  return false
}
/** Inside a disabled variant, or an instance of one. WCAG exempts inactive components from contrast. */
const inDisabled = (node) => {
  for (let p = node; p && p.type !== 'PAGE'; p = p.parent) {
    const name = p.type === 'COMPONENT' ? p.name : p.type === 'INSTANCE' ? p.mainComponent?.name ?? '' : ''
    if (/(^|,\s*)state=disabled(,|$)/i.test(name)) return true
  }
  return false
}
const hasChildren = (node) => 'children' in node && node.children.length > 0
const isVector = (node) => ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'POLYGON', 'ELLIPSE'].includes(node.type)

const checkNode = (node) => {
  // A6b — layer opacity.
  if ('opacity' in node && node.opacity < 0.999) {
    const kinds = hasChildren(node) ? [...new Set(node.findAll((n) => n.type === 'TEXT' || isVector(n)).map((n) => (n.type === 'TEXT' ? 'text' : 'icon/graphic')))] : [node.type === 'TEXT' ? 'text' : 'shape']
    report('A6b layer-opacity', 'warning', node, `layer at ${Math.round(node.opacity * 100)}% (${kinds.join(', ') || 'no content'})`, 'take transparency from a token colour; keep only for animation frames or images')
  }

  for (const key of ['fills', 'strokes']) {
    const paints = node[key]
    if (!Array.isArray(paints)) continue
    for (const p of paints) {
      if (p.visible === false || p.type !== 'SOLID') continue
      const id = p.boundVariables?.color?.id
      if (!id) {
        if ((p.opacity ?? 1) > INVISIBLE && !insideIcon(node)) report('A1 raw-color', 'warning', node, `${key} ${hex(p.color)}`, 'bind a semantic token')
        continue
      }
      const t = tokenOf(id)
      if (t.missing) { report('A2 missing-variable', 'error', node, `${key} → ${id}`, 'rebind to a current semantic token'); continue }
      if (t.hidden && t.semantic) report('A3 deprecated-or-primitive', 'error', node, `${key} → deprecated ${t.name}`, 'rebind to its replacement (see the variable description)')
      if (!t.semantic) report('A3 deprecated-or-primitive', 'error', node, `${key} → ${t.collection} ${t.name}`, 'components bind semantic tokens, not primitives')
      const tokenAlpha = paintOf(node, p)?.tokenAlpha
      if (tokenAlpha != null && Math.abs((p.opacity ?? 1) - tokenAlpha) > 0.005)
        report('A6a paint-opacity', 'error', node, `${key} ${t.name} renders at ${Math.round((p.opacity ?? 1) * 100)}%, token alpha ${Math.round(tokenAlpha * 100)}%`, 'bind a paint built at the token alpha (rebinding the same token keeps the wrong opacity)')

      const scope = scopeOf(t.name)
      if (key === 'fills') {
        if (node.type === 'TEXT') {
          if (scope !== 'fg') report('A5 role-mismatch', 'error', node, `text filled with ${t.name}`, 'text takes fg/* tokens')
        } else if (scope === 'fg') {
          if (insideIcon(node) || (isVector(node) && !hasChildren(node))) {
            // Icons and vector graphics: fine, contrast checked in C11.
          } else if (hasChildren(node)) {
            report('A5 role-mismatch', 'warning', node, `container filled with ${t.name}`, `likely bg/${roleOf(t.name)}/emphasized`)
          } else {
            report('A5 role-mismatch', 'warning', node, `graphic element filled with ${t.name}`, 'allowed for indicators, dots, bars; validated at 3:1 (C11)')
          }
        } else if (scope === 'stroke' && Math.min(node.width ?? 99, node.height ?? 99) > 2) {
          report('A5 role-mismatch', 'warning', node, `fill ${t.name} on a ${Math.round(node.width)}×${Math.round(node.height)} layer`, 'stroke tokens fill dividers only; use bg/* for areas')
        }
      } else if (['bg', 'surface', 'ghost'].includes(scope)) {
        report('A5 role-mismatch', 'warning', node, `stroke ${t.name}`, 'boundaries take stroke/* tokens')
      }

      // B9 — form field on a tinted role background (ADR 0026).
      if (key === 'fills' && t.name.startsWith('form/neutral')) {
        const bg = backgroundOf(node).opaque
        if (bg && /^(bg\/(accent|success|warning|danger|info)|card\/(success|warning|danger|info))/.test(bg.name)) report('B9 form-ghost', 'warning', node, `form/neutral on ${bg.name}`, 'form fields belong on neutral layers')
      }
    }
  }

  // C12 — shadows.
  if (Array.isArray(node.effects) && node.effects.some((e) => e.visible !== false && (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'))) {
    const style = typeof node.effectStyleId === 'string' && node.effectStyleId ? effectStyles.get(node.effectStyleId) : null
    if (!style) report('C12 shadows', 'warning', node, 'shadow without an effect style', 'apply a shadow/* style')
    else if (!/(^|\/)(shadow|focus)(\/|$)/i.test(style)) report('C12 shadows', 'warning', node, `effect style "${style}"`, 'use shadow/* (or a focus style)')
  }
}

// Text: pairing and contrast.
const checkText = (node) => {
  if (typeof node.fills === 'symbol' || node.characters.trim() === '') return
  const f = fillsOf(node).map((p) => paintOf(node, p)).filter(Boolean)[0]
  if (!f) return
  const bg = backgroundOf(node)
  const name = f.token?.name
  if (name) {
    const bgName = bg.opaque?.name
    if (name.endsWith('/on-emphasized') && bgName && !(isEmphasizedBg(bgName) && roleOf(bgName) === roleOf(name)))
      report('B7 pairing', 'error', node, `${name} on ${bgName}`, `on-emphasized text belongs on bg/${roleOf(name)}/emphasized`)
    if (bgName && isEmphasizedBg(bgName) && !name.endsWith('/on-emphasized') && !isDisabled(name))
      report('B7 pairing', 'error', node, `${name} on ${bgName}`, `use fg/${roleOf(bgName)}/on-emphasized`)
  }
  if (name === 'fg/disabled' || inDisabled(node)) return
  const ratio = contrast(over({ c: f.c, a: f.a * (node.opacity ?? 1) }, bg.c), bg.c)
  const size = typeof node.fontSize === 'number' ? node.fontSize : 14
  const need = size >= 24 ? 3 : 4.5
  if (ratio < need - 0.01)
    report('C10 text-contrast', 'error', node, `${name ?? hex(f.c)} on ${bg.token?.name ?? hex(bg.c)}: below ${need}:1`, 'pick the token the generator pairs with this background')
}

// Non-text: icons, fg graphics and emphasized boundaries at 3:1.
const checkNonText = (node) => {
  if (inDisabled(node)) return
  const fg = fillsOf(node).map((p) => paintOf(node, p)).find((f) => f?.token && scopeOf(f.token.name) === 'fg' && !isDisabled(f.token.name))
  if (fg && !hasChildren(node) && node.type !== 'TEXT') {
    const bg = backgroundOf(node)
    if (contrast(over(fg, bg.c), bg.c) < 2.99) report('C11 non-text-contrast', 'error', node, `${fg.token.name} on ${bg.token?.name ?? hex(bg.c)}: below 3:1`, 'icons and meaningful graphics need 3:1')
  }
  const stroke = (Array.isArray(node.strokes) ? node.strokes : []).map((p) => paintOf(node, p)).find((s) => s?.token && /^stroke\/[a-z]+\/emphasized$/.test(s.token.name))
  if (stroke) {
    const bg = backgroundOf(node)
    if (contrast(over(stroke, bg.c), bg.c) < 2.99) report('C11 non-text-contrast', 'error', node, `${stroke.token.name} on ${bg.token?.name ?? hex(bg.c)}: below 3:1`, 'control boundaries need 3:1')
  }
}

// Component sets: state variants.
const props = (name) => Object.fromEntries(name.split(',').map((s) => s.trim().split('=')).filter((kv) => kv.length === 2))
/** A variant's own visible fill; null when the control is transparent (ghost or outline). */
const rootFill = (c) => fillsOf(c).find((p) => p.visible !== false && p.type === 'SOLID' && (p.opacity ?? 1) > INVISIBLE) ?? null
const hasStroke = (n) => (Array.isArray(n.strokes) ? n.strokes : []).some((p) => p.visible !== false && (p.opacity ?? 1) > INVISIBLE)
/** A boundary on the variant itself or on a direct shape child (a "Ring" layer drawn over it). */
const hasBoundary = (c) => hasStroke(c) || c.children.some((n) => n.visible !== false && ['RECTANGLE', 'FRAME', 'INSTANCE'].includes(n.type) && hasStroke(n))
const rootToken = (c) => {
  const p = rootFill(c)
  if (!p) return null
  return p.boundVariables?.color ? (tokenOf(p.boundVariables.color.id).name ?? 'missing') : 'raw'
}
const checkStates = (set) => {
  const variants = set.children.filter((c) => c.type === 'COMPONENT')
  const stateKey = Object.keys(props(variants[0]?.name ?? '')).find((k) => /^state$/i.test(k))
  if (!stateKey) return
  const others = (c) => JSON.stringify(Object.entries(props(c.name)).filter(([k]) => k !== stateKey).sort())
  for (const c of variants) {
    const state = props(c.name)[stateKey]?.toLowerCase()
    const def = variants.find((d) => others(d) === others(c) && /^(default|rest|enabled)$/i.test(props(d.name)[stateKey] ?? ''))
    const base = def ? rootToken(def) : undefined
    // Ghost: no fill and no boundary at rest. Outline: no fill, but a boundary. Both are transparent
    // controls, so hover and pressed take ghost/*; only a ghost keeps no fill when disabled.
    const ghost = base === null && !hasBoundary(def)
    if (state === 'hover' || state === 'pressed') {
      const got = rootToken(c)
      if (base === null) {
        if (got && !got.startsWith('ghost/'))
          report('B8 states', 'error', c, `${ghost ? 'ghost' : 'outline'} control uses ${got} on ${state}`, `ghost/<role>/${state} keeps the surface beneath visible`)
      } else if (base && base !== 'raw' && got && got !== `${base.replace(/\/(hover|pressed)$/, '')}/${state}`) {
        report('B8 states', 'warning', c, `${state} uses ${got}, default uses ${base}`, `expected ${base}/${state}`)
      }
    }
    if (state === 'disabled') {
      const bad = new Set()
      const visit = (n) => {
        for (const key of ['fills', 'strokes']) for (const p of Array.isArray(n[key]) ? n[key] : []) {
          if (p.visible === false || p.type !== 'SOLID' || !p.boundVariables?.color) continue
          const t = tokenOf(p.boundVariables.color.id)
          if (!t.name || isDisabled(t.name) || /^(focus|shadow)\//.test(t.name)) continue
          bad.add(`${key === 'fills' ? 'fill' : 'stroke'} ${t.name}`)
        }
        if ('children' in n) n.children.forEach(visit)
      }
      visit(c)
      if (bad.size) report('B8 states', 'error', c, `disabled uses ${[...bad].join(', ')}`, 'disabled takes bg/disabled + fg/disabled + stroke/disabled')
      if (ghost && rootFill(c)) report('B8 states', 'warning', c, 'ghost control has a fill when disabled', 'ghost disabled keeps no fill')
    }
    if (state === 'focus') {
      // ADR 0025: one focus indicator, the focus/ring effect style.
      const uses = (n) => typeof n.effectStyleId === 'string' && effectStyles.get(n.effectStyleId) === 'focus/ring'
      if (!uses(c) && !c.findOne((n) => uses(n))) report('B8 states', 'warning', c, 'focus variant without the focus/ring effect style', 'apply focus/ring; do not recolor strokes for focus')
    }
  }
}

// ---- walk ------------------------------------------------------------------------------------
const pages = PAGE_IDS.length ? await Promise.all(PAGE_IDS.map((id) => figma.getNodeByIdAsync(id))) : figma.root.children
let nodes = 0
for (const page of pages) {
  await page.loadAsync()
  pageName = page.name
  // Only components and their instances are audited; documentation chrome around them (headers,
  // spec lines, frames) belongs to the documentation skill. It still counts as their background.
  const walk = (node, inComponent) => {
    if (node.visible === false) return
    const audited = inComponent || ['COMPONENT_SET', 'COMPONENT', 'INSTANCE'].includes(node.type)
    if (audited) {
      nodes++
      checkNode(node)
      if (node.type === 'TEXT') checkText(node)
      else checkNonText(node)
      if (node.type === 'COMPONENT_SET') checkStates(node)
    }
    if ('children' in node) node.children.forEach((n) => walk(n, audited))
  }
  page.children.forEach((n) => walk(n, false))
}

const rules = Object.keys(TITLES)
  .map((rule) => {
    const items = [...findings.values()].filter((f) => f.rule === rule).sort((a, b) => b.sources.size - a.sources.size)
    return {
      rule,
      title: TITLES[rule],
      errors: items.filter((f) => f.severity === 'error').reduce((s, f) => s + f.sources.size, 0),
      warnings: items.filter((f) => f.severity === 'warning').reduce((s, f) => s + f.sources.size, 0),
      items: items.slice(0, 12).map((f) => ({ severity: f.severity, detail: f.detail, count: f.sources.size, suggestion: f.suggestion, examples: f.examples })),
      more: Math.max(0, items.length - 12),
    }
  })
  .filter((r) => r.errors || r.warnings)
return {
  pages: pages.map((p) => p.name),
  nodes,
  errors: rules.reduce((s, r) => s + r.errors, 0),
  warnings: rules.reduce((s, r) => s + r.warnings, 0),
  rules,
}
