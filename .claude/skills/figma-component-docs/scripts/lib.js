// ===== figma-component-docs / lib.js =====
// Paste this file first, then the script you are running (inspect / build-matrix / build-doc),
// as ONE use_figma `code` string. use_figma has no imports, so concatenation is the only way to share code.
//
// Tokens are resolved by NAME, because every copy of the design-system file has different
// style/variable IDs. If a name is missing, loadTokens() throws with the full list, so you can
// fix the mapping here instead of silently falling back to raw colors.

const TEXT_STYLE_NAMES = {
  title: 'Agent Harness/Heading/Large',
  cardTitle: 'Agent Harness/Heading/Small',
  body: 'Agent Harness/Body/Deafault/Default', // "Deafault" is the real (misspelled) style name
  subtitle: 'Agent Harness/Label/Large',
  label: 'Agent Harness/Label/Default',
  labelSmall: 'Agent Harness/Label/Small',
  caption: 'Agent Harness/Caption/Default',
  overline: 'Agent Harness/Caption/Overline',
  code: 'Agent Harness/Code/Small',
};

const COLOR_NAMES = {
  bgNeutral: 'bg/neutral/neutral',
  bgSubtle: 'bg/neutral/subtle',
  bgEmphasized: 'bg/neutral/emphasized/emphasized',
  surface: 'surface/neutral',
  fgNeutral: 'fg/neutral/neutral',
  fgSubtle: 'fg/neutral/subtle',
  strokeSubtle: 'stroke/neutral/subtle',
  strokeNeutral: 'stroke/neutral/neutral',
  infoBg: 'bg/info/subtle',
  infoStroke: 'stroke/info/emphasized',
  markerText: 'fg/accent/on-emphasized', // what the reference doc uses on info markers
  successBg: 'bg/success/subtle',
  successStroke: 'stroke/success/success',
  successFg: 'fg/success/success',
  dangerStroke: 'stroke/danger/danger',
  dangerFg: 'fg/danger/danger',
};

// Subtle borders in the reference doc are stroke/neutral/subtle at 16 % paint opacity.
const BORDER_OPACITY = 0.16;

// Variable collection and mode names used to render the Preview in both themes.
const THEME = { collection: 'Theme', light: 'Light', dark: 'Dark' };

const T = {}; // resolved text styles
const C = {}; // resolved color variables
const MODES = {}; // { light: { collection, modeId }, dark: { ... } }, empty if the file has no such collection
const _warnings = [];

async function loadTokens() {
  const missing = [];
  const styles = new Map((await figma.getLocalTextStylesAsync()).map(s => [s.name, s]));
  for (const [k, n] of Object.entries(TEXT_STYLE_NAMES)) {
    if (styles.has(n)) T[k] = styles.get(n);
    else missing.push('text style "' + n + '"');
  }
  const vars = new Map();
  for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) {
    if (vars.has(v.name)) _warnings.push('duplicate color variable name ' + v.name + ' (first one used)');
    else vars.set(v.name, v);
  }
  for (const [k, n] of Object.entries(COLOR_NAMES)) {
    if (vars.has(n)) C[k] = vars.get(n);
    else missing.push('color variable "' + n + '"');
  }
  if (missing.length) throw new Error('Missing tokens in this file: ' + missing.join('; '));
  const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === THEME.collection);
  for (const k of ['light', 'dark']) {
    const m = theme && theme.modes.find(x => x.name === THEME[k]);
    if (m) MODES[k] = { collection: theme, modeId: m.modeId };
  }
  if (!MODES.light || !MODES.dark) _warnings.push('Variable collection "' + THEME.collection + '" with Light/Dark modes not found: Preview shows the default theme only');
  const fonts = new Map([['Inter|Regular', { family: 'Inter', style: 'Regular' }]]);
  for (const s of Object.values(T)) fonts.set(s.fontName.family + '|' + s.fontName.style, s.fontName);
  await Promise.all([...fonts.values()].map(f => figma.loadFontAsync(f)));
}

async function gotoPageOf(node) {
  let p = node;
  while (p && p.type !== 'PAGE') p = p.parent;
  await figma.setCurrentPageAsync(p);
  return p;
}

// Free space to the right of everything on the page, so new frames never land on (0,0) or on top of content.
function freeSpot(page, y) {
  let maxX = 0;
  for (const n of page.children) maxX = Math.max(maxX, n.x + n.width);
  return { x: Math.round(maxX + 200), y: Math.round(y) };
}

const clean = s => String(s).replace(/[\uD800-\uDFFF]/g, ''); // lone surrogates break the JSON response

// ---- paint / stroke ----
function paint(key, opacity = 1) {
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity }, 'color', C[key]);
}

function stroke(node, key, o = {}) {
  node.strokes = [paint(key, o.opacity === undefined ? 1 : o.opacity)];
  if (node.type === 'LINE') node.strokeWeight = 1;
  else {
    node.strokeAlign = 'INSIDE';
    if (o.weights) [node.strokeTopWeight, node.strokeRightWeight, node.strokeBottomWeight, node.strokeLeftWeight] = o.weights;
    else node.strokeWeight = 1;
  }
  if (o.dash) node.dashPattern = o.dash;
}

const border = (node, weights) => stroke(node, 'strokeSubtle', { opacity: BORDER_OPACITY, weights });

// ---- layout ----
// box('VERTICAL', 'Name', { gap, pad: n | [t, r, b, l], fill, radius, align, cross })
function box(dir, name, o = {}) {
  const f = figma.createAutoLayout(dir, { name, itemSpacing: o.gap || 0 });
  // Never clip by default: wrappers hold instances whose shadows, focus rings and overflow must stay visible.
  // Only the doc root and the props table opt in, by setting clipsContent = true themselves.
  f.clipsContent = false;
  f.fills = o.fill ? [paint(o.fill, o.fillOpacity === undefined ? 1 : o.fillOpacity)] : [];
  if (o.pad !== undefined) {
    const [t, r = t, b = t, l = r] = [].concat(o.pad);
    f.paddingTop = t; f.paddingRight = r; f.paddingBottom = b; f.paddingLeft = l;
  }
  if (o.radius) f.cornerRadius = o.radius;
  if (o.align) f.primaryAxisAlignItems = o.align;
  if (o.cross) f.counterAxisAlignItems = o.cross;
  return f;
}

// Append, then size. w/h: 'FILL' | 'HUG' | 'FIXED' | number (fixed size). Sizing must come after appendChild.
function add(parent, child, w, h) {
  parent.appendChild(child);
  if (typeof w === 'number') { child.resize(w, child.height); child.layoutSizingHorizontal = 'FIXED'; }
  else if (w) child.layoutSizingHorizontal = w;
  if (typeof h === 'number') { child.resize(child.width, h); child.layoutSizingVertical = 'FIXED'; }
  else if (h) child.layoutSizingVertical = h;
  return child;
}

function plainFrame(name, w, h) {
  const f = figma.createFrame();
  f.name = name; f.fills = []; f.clipsContent = false;
  f.resize(w, h);
  return f;
}

// ---- text ----
async function txt(style, color, chars, name) {
  const t = figma.createText();
  await t.setTextStyleIdAsync(T[style].id);
  t.fills = [paint(color)];
  t.characters = chars;
  t.name = name || clean(chars).slice(0, 40);
  return t;
}

// Wrapping paragraph that fills its auto-layout parent.
async function para(parent, style, color, chars, name) {
  const t = await txt(style, color, chars, name);
  add(parent, t, 'FILL');
  t.textAutoResize = 'HEIGHT';
  return t;
}

// ---- component helpers ----
// Display name ("Show leading slot") -> { key: "Show leading slot#2246:0", type, def }. First key wins for duplicates.
function propKeyMap(cs) {
  const m = {};
  for (const [k, d] of Object.entries(cs.componentPropertyDefinitions)) {
    const n = k.split('#')[0];
    if (!(n in m)) m[n] = { key: k, type: d.type, def: d };
  }
  return m;
}

function tryVariant(cs, overrides = {}) {
  if (cs.type === 'COMPONENT') return cs;
  const want = Object.assign({}, cs.defaultVariant.variantProperties, overrides);
  return cs.children.find(c => c.type === 'COMPONENT' && Object.entries(want).every(([k, v]) => c.variantProperties[k] === v)) || null;
}

function findVariant(cs, overrides) {
  const v = tryVariant(cs, overrides);
  if (!v) throw new Error('No variant matches ' + JSON.stringify(overrides));
  return v;
}

// spec: { variant: { Size: 'l' }, props: { 'Show leading slot': false, Label: 'Save' } }
function specimen(cs, spec = {}) {
  const inst = findVariant(cs, spec.variant).createInstance();
  if (spec.props && Object.keys(spec.props).length) {
    const km = propKeyMap(cs);
    const set = {};
    for (const [n, val] of Object.entries(spec.props)) {
      if (!km[n]) throw new Error('Unknown component property "' + n + '". Known: ' + Object.keys(km).join(', '));
      set[km[n].key] = val;
    }
    inst.setProperties(set);
  }
  return inst;
}

// ---- annotation markers ----
// kind: 'mandatory' | 'optional' (numbered dot) | 'pill' (text label). side: 'top' | 'bottom'.
async function marker(parent, name, cx, anchorY, label, side, kind) {
  const len = 40;
  const strong = kind !== 'optional';
  const m = plainFrame('Marker: ' + name, 24, 24);
  const dot = box('HORIZONTAL', 'Dot', { fill: strong ? 'infoBg' : 'bgSubtle', align: 'CENTER', cross: 'CENTER' });
  stroke(dot, strong ? 'infoStroke' : 'strokeSubtle');
  dot.appendChild(await txt(kind === 'pill' ? 'caption' : 'overline', strong ? 'markerText' : 'fgNeutral', label));
  if (kind === 'pill') { dot.paddingLeft = dot.paddingRight = 8; dot.paddingTop = dot.paddingBottom = 2; dot.cornerRadius = 10; }
  else { dot.primaryAxisSizingMode = 'FIXED'; dot.counterAxisSizingMode = 'FIXED'; dot.resize(24, 24); dot.cornerRadius = 12; }
  const w = Math.max(24, dot.width), h = dot.height + len;
  m.resize(w, h);
  const line = figma.createRectangle();
  line.name = 'Line'; line.resize(1, len); line.fills = [paint('strokeNeutral')];
  m.appendChild(line); m.appendChild(dot);
  line.x = Math.round(w / 2) - 0.5; dot.x = (w - dot.width) / 2;
  if (side === 'bottom') { line.y = 0; dot.y = len; } else { dot.y = 0; line.y = dot.height; }
  parent.appendChild(m);
  m.x = cx - w / 2; m.y = side === 'bottom' ? anchorY : anchorY - h;
  return m;
}

// Centers `inst` in the plain frame `dia` and points a marker at each named element inside it.
// Call this only after every sibling of `dia` is appended, otherwise auto-layout can still resize `dia`.
async function placeMarkers(dia, inst, items, mode) {
  inst.x = Math.round((dia.width - inst.width) / 2);
  inst.y = Math.round((dia.height - inst.height) / 2);
  const box0 = dia.absoluteBoundingBox;
  const ids = [];
  for (const [i, it] of items.entries()) {
    const el = inst.name === it.node ? inst : inst.findOne(n => n.name === it.node);
    if (!el) throw new Error('No element "' + it.node + '" inside ' + inst.name + '. Children: ' + inst.children.map(c => c.name).join(', '));
    const b = el.absoluteBoundingBox;
    const cx = b.x - box0.x + b.width / 2;
    const side = it.side === 'bottom' ? 'bottom' : 'top';
    const anchor = side === 'bottom' ? inst.y + inst.height : inst.y;
    const kind = mode === 'pill' ? 'pill' : (it.mandatory ? 'mandatory' : 'optional');
    const m = await marker(dia, it.node, cx, anchor, mode === 'pill' ? it.label : String(i + 1), side, kind);
    ids.push(m.id);
  }
  return ids;
}

// Dashed separator between doc sections.
function divider(parent) {
  const f = box('HORIZONTAL', 'Divider', { pad: [64, 4, 0, 4] });
  add(parent, f, 'FILL');
  const l = figma.createLine();
  l.name = 'Line';
  stroke(l, 'strokeSubtle', { opacity: BORDER_OPACITY, dash: [4, 4] });
  f.appendChild(l);
  l.layoutSizingHorizontal = 'FILL';
  return f;
}
// ===== end lib.js =====
