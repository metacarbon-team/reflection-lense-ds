// ===== figma-component-docs / build-doc.js =====
// Run as: lib.js + this file. Builds the documentation frame:
// Header (title + Repo/Storybook cards) → Preview → Anatomy → Slots → Component properties → Guidelines.
// Every section except Header and Component properties is optional: set it to null to skip it.
// Specimen spec used everywhere: { variant: { Prop: 'value' }, props: { 'Display name': value } }
// (variant overrides apply on top of the component's default variant).

const CONFIG = {
  componentSetId: 'REPLACE_ME',
  title: 'REPLACE_ME',
  frameName: null,       // default: `Specs / ${title}`
  position: null,        // { x, y } — default: free space right of the page content
  links: { repo: null, storybook: null }, // URLs, or null to keep the "Open Link →" placeholder

  preview: {
    description: '',
    rows: [[{ variant: {} }]], // each inner array is one centered row of specimens
  },

  anatomy: {
    description: '',
    layouts: [
      // { title: 'With slots', variant: { Size: 'l' }, props: {}, items: [
      //   { node: 'Leading slot', label: 'Leading slot', side: 'top' },
      //   { node: 'Label', label: 'label', side: 'bottom', mandatory: true } ] }
    ],
  },

  slots: null, // { title, comment, variant, props, markers: [{ node, label, side }] }

  properties: {
    matrixFrameName: null, // default: `Variants Matrix / ${title}` (build-matrix's default) — linked from the section description
    order: null,           // optional explicit row order (display names)
    hide: [],              // display names to leave out
    docs: {},              // 'Display name': { description: '...', required: true }
  },

  guidelines: [
    // { title, comment, do: { gap: 8, items: [spec, spec] }, dont: { gap: 8, items: [spec, spec] } }
  ],
};

await loadTokens();
const cs = await figma.getNodeByIdAsync(CONFIG.componentSetId);
if (!cs || (cs.type !== 'COMPONENT_SET' && cs.type !== 'COMPONENT')) throw new Error('build-doc needs a COMPONENT_SET (or COMPONENT) id');
const page = await gotoPageOf(cs);

const root = box('VERTICAL', CONFIG.frameName || `Specs / ${CONFIG.title}`, { fill: 'bgEmphasized', radius: 32 }); // same background as the matrix frame
page.appendChild(root);
root.resize(1472, 100);
root.primaryAxisSizingMode = 'AUTO';
root.clipsContent = true;
const pos = CONFIG.position || freeSpot(page, cs.absoluteBoundingBox.y); // absolute: the set may sit inside a frame
root.x = pos.x; root.y = pos.y;

// ---------- Header ----------
const header = box('VERTICAL', 'Header', { gap: 28, pad: [48, 96] });
add(root, header, 'FILL');
border(header, [0, 0, 1, 0]);
const titleWrap = box('HORIZONTAL', 'Wrapper');
add(header, titleWrap, 'FILL');
add(titleWrap, await txt('title', 'fgNeutral', CONFIG.title, 'Title'));
const cards = box('HORIZONTAL', 'Cards', { gap: 10 });
add(header, cards, 'FILL');
for (const [label, url] of [['Repo', CONFIG.links && CONFIG.links.repo], ['Storybook', CONFIG.links && CONFIG.links.storybook]]) {
  const card = box('VERTICAL', label, { gap: 14, pad: 20, fill: 'surface', radius: 8 });
  border(card);
  add(cards, card, 'FILL');
  add(card, await txt('cardTitle', 'fgNeutral', label, 'Title'));
  const link = await txt('body', 'fgNeutral', 'Open Link →', 'Open Link');
  link.textDecoration = 'UNDERLINE';
  if (url) link.hyperlink = { type: 'URL', value: url };
  add(card, link);
}

// ---------- Section scaffolding ----------
const content = box('VERTICAL', 'Content', { pad: [0, 96, 32, 96] });
add(root, content, 'FILL');
let firstSection = true;

async function section(title, description) {
  if (!firstSection) divider(content);
  firstSection = false;
  const s = box('VERTICAL', '. Section / ' + title, { gap: 32, pad: [64, 0, 0, 0] });
  add(content, s, 'FILL');
  const head = box('VERTICAL', 'Title and description', { gap: 4 });
  add(s, head, 'FILL');
  add(head, await txt('title', 'fgNeutral', title, 'Title'));
  if (description) await para(head, 'body', 'fgSubtle', description, 'Description');
  return { s, head };
}

// 296 px description column + 40 px gap + example area (the reference layout).
function twoCol(parent, name) {
  const row = box('HORIZONTAL', name || 'Main component/variant (2-col)', { gap: 40 });
  add(parent, row, 'FILL');
  const desc = box('VERTICAL', 'Description', { gap: 8 });
  add(row, desc, 296, 'HUG');
  return { row, desc };
}

function panel(name) {
  const p = box('HORIZONTAL', name, { gap: 48, pad: 48, fill: 'surface', radius: 8 });
  border(p);
  return p;
}

// ---------- Preview ----------
if (CONFIG.preview) {
  const { s } = await section('Preview', CONFIG.preview.description);
  // Same specimens side by side in Light and Dark: each panel pins the Theme collection to one mode.
  const stage = box('HORIZONTAL', 'Example Slot', { gap: 12 });
  add(s, stage, 'FILL', 359);
  const themes = MODES.light && MODES.dark ? [['Light', MODES.light], ['Dark', MODES.dark]] : [['Default', null]];
  for (const [label, mode] of themes) {
    const p = box('VERTICAL', 'Preview / ' + label, { gap: 24, fill: 'bgNeutral', radius: 8, align: 'CENTER', cross: 'CENTER' });
    border(p);
    add(stage, p, 'FILL', 'FILL');
    if (mode) p.setExplicitVariableModeForCollection(mode.collection, mode.modeId);
    for (const r of CONFIG.preview.rows) {
      const row = box('HORIZONTAL', 'Row', { gap: 16, cross: 'CENTER' });
      add(p, row);
      for (const spec of r) row.appendChild(specimen(cs, spec));
    }
    if (mode) {
      const tag = await txt('caption', 'fgSubtle', label, 'Theme');
      p.appendChild(tag);
      tag.layoutPositioning = 'ABSOLUTE';
      tag.x = 16; tag.y = 12;
    }
  }
}

// ---------- Anatomy ----------
if (CONFIG.anatomy && CONFIG.anatomy.layouts.length) {
  const { s } = await section('Anatomy');
  const { row, desc } = twoCol(s);
  await para(desc, 'body', 'fgSubtle', CONFIG.anatomy.description, 'Description');
  const ex = panel('Example');
  add(row, ex, 'FILL', 'HUG');
  const pending = [];
  for (const L of CONFIG.anatomy.layouts) {
    const col = box('VERTICAL', L.title, { gap: 16, cross: 'CENTER' });
    add(ex, col, 'FILL');
    add(col, await txt('body', 'fgSubtle', L.title, 'Layout title'));
    const inst = specimen(cs, L);
    const dia = plainFrame('Diagram', Math.max(320, inst.width + 80), inst.height + 152);
    add(col, dia, dia.width);
    dia.appendChild(inst);
    // Ordered list under the diagram; "Mandatory" is emphasised for mandatory items.
    const lines = L.items.map(it => (it.mandatory ? 'Mandatory ' : '') + it.label);
    const list = await txt('body', 'fgSubtle', lines.join('\n'), 'List');
    add(col, list);
    list.setRangeListOptions(0, list.characters.length, { type: 'ORDERED' });
    let at = 0;
    for (const [i, it] of L.items.entries()) {
      if (it.mandatory) {
        await list.setRangeTextStyleIdAsync(at, at + 9, T.label.id);
        list.setRangeFills(at, at + 9, [paint('fgNeutral')]);
      }
      at += lines[i].length + 1;
    }
    pending.push({ dia, inst, items: L.items });
  }
  for (const p of pending) await placeMarkers(p.dia, p.inst, p.items, 'number');
}

// ---------- Slots ----------
if (CONFIG.slots) {
  const { s } = await section('Slots');
  const { row, desc } = twoCol(s);
  await para(desc, 'subtitle', 'fgNeutral', CONFIG.slots.title, 'Subtitle');
  if (CONFIG.slots.comment) await para(desc, 'body', 'fgSubtle', CONFIG.slots.comment, 'Comment');
  const ex = panel('Example');
  ex.counterAxisAlignItems = 'CENTER';
  add(row, ex, 'FILL', 'HUG');
  const inst = specimen(cs, CONFIG.slots);
  const dia = plainFrame('Diagram', 320, inst.height + 136);
  add(ex, dia, 'FILL', dia.height);
  dia.appendChild(inst);
  await placeMarkers(dia, inst, CONFIG.slots.markers, 'pill');
}

// ---------- Component properties ----------
const undocumented = [];
{
  const P = CONFIG.properties || {};
  const { s, head } = await section('Component properties');
  const variantCount = cs.type === 'COMPONENT_SET' ? cs.children.length : 1;
  // A single component (no variants) has no matrix, so no link.
  const matrixName = cs.type === 'COMPONENT_SET' ? (P.matrixFrameName || `Variants Matrix / ${CONFIG.title}`) : null;
  const matrix = matrixName ? page.findChild(n => n.name === matrixName) : null;
  if (matrixName) {
    const lead = `All ${variantCount} combinations live in the `;
    const t = await para(head, 'body', 'fgSubtle', lead + matrixName + ' →', 'Description');
    if (matrix) {
      t.setRangeHyperlink(lead.length, t.characters.length, { type: 'NODE', value: matrix.id });
      t.setRangeTextDecoration(lead.length, t.characters.length, 'UNDERLINE');
      t.setRangeFills(lead.length, t.characters.length, [paint('fgNeutral')]);
    } else _warnings.push('Matrix frame "' + matrixName + '" not found on this page — link left as plain text');
  }

  const km = propKeyMap(cs);
  const rank = { VARIANT: 0, TEXT: 1, BOOLEAN: 2, INSTANCE_SWAP: 3, SLOT: 4 };
  let names = Object.keys(km).filter(n => !(P.hide || []).includes(n)).sort((a, b) => (rank[km[a].type] ?? 9) - (rank[km[b].type] ?? 9));
  if (P.order) names = P.order.filter(n => km[n]).concat(names.filter(n => !P.order.includes(n)));
  const q = v => `'${v}'`;
  const typeOf = ({ type, def }) => ({
    VARIANT: (def.variantOptions || []).map(q).join(' | '),
    TEXT: 'string', BOOLEAN: 'boolean', INSTANCE_SWAP: 'component', SLOT: 'slot',
  }[type] || type.toLowerCase());
  const defaultOf = ({ type, def }) => (type === 'VARIANT' || type === 'TEXT' ? q(def.defaultValue) : type === 'BOOLEAN' ? String(def.defaultValue) : '');

  const W1 = 240, W2 = 160;
  const table = box('VERTICAL', 'Props table', { fill: 'surface', radius: 8 });
  border(table);
  table.clipsContent = true;
  add(s, table, 'FILL');

  const cell = (r, name, w, dir) => {
    const c = box(dir || 'HORIZONTAL', name, { gap: 8 });
    c.resize(w || 100, 1); // an empty hugging frame keeps its last size, so start it small (empty Default cells)
    add(r, c, w || 'FILL', 'HUG');
    return c;
  };
  const code = async chars => {
    const c = box('HORIZONTAL', 'Code', { pad: [2, 6], radius: 4, fill: 'bgSubtle' });
    c.appendChild(await txt('code', 'fgNeutral', chars, 'Value'));
    return c;
  };

  const hr = box('HORIZONTAL', 'Header', { gap: 16, pad: [12, 16], fill: 'bgSubtle' });
  add(table, hr, 'FILL');
  for (const [n, w] of [['Name', W1], ['Default', W2], ['Description', 0]]) cell(hr, n, w).appendChild(await txt('label', 'fgSubtle', n));

  for (const name of names) {
    const info = km[name];
    const doc = (P.docs || {})[name] || {};
    if (!doc.description) undocumented.push(name);
    const r = box('HORIZONTAL', 'Prop / ' + name, { gap: 16, pad: 16 });
    border(r, [1, 0, 0, 0]);
    add(table, r, 'FILL');
    const c1 = cell(r, 'Name', W1);
    c1.counterAxisAlignItems = 'CENTER';
    c1.appendChild(await txt('body', 'fgNeutral', name, 'Name'));
    if (doc.required) {
      const b = box('HORIZONTAL', 'Badge / Required', { pad: [0, 6], radius: 10 });
      stroke(b, 'strokeNeutral');
      b.appendChild(await txt('caption', 'fgNeutral', 'Required'));
      c1.appendChild(b);
    }
    const c2 = cell(r, 'Default', W2);
    const def = doc.default !== undefined ? doc.default : defaultOf(info);
    if (def) c2.appendChild(await code(def));
    const c3 = cell(r, 'Description', 0, 'VERTICAL');
    c3.appendChild(await code(doc.type || typeOf(info)));
    if (doc.description) await para(c3, 'body', 'fgNeutral', doc.description, 'Text');
  }
}

// ---------- Guidelines ----------
if (CONFIG.guidelines && CONFIG.guidelines.length) {
  const { s } = await section('Guidelines');
  for (const g of CONFIG.guidelines) {
    const { row, desc } = twoCol(s, 'Guideline / ' + g.title);
    await para(desc, 'subtitle', 'fgNeutral', g.title, 'Description text');
    if (g.comment) await para(desc, 'body', 'fgSubtle', g.comment, 'Comment text');
    const pair = box('HORIZONTAL', 'Cards', { gap: 12 });
    add(row, pair, 'FILL');
    for (const kind of ['do', 'dont']) {
      const spec = g[kind];
      const isDo = kind === 'do';
      const card = box('HORIZONTAL', isDo ? 'Do' : "Don't", { gap: spec.gap ?? 8, pad: [28, 16, 16, 16], fill: 'bgNeutral', radius: 8, align: 'CENTER', cross: 'CENTER' });
      border(card);
      add(pair, card, 'FILL', spec.height || 183);
      for (const item of spec.items) card.appendChild(specimen(cs, item));
      // Badge pinned to the top edge, outside the flow, so the card holds the specimens directly.
      const badge = box('HORIZONTAL', 'Header', { gap: 2, pad: [2, 8], radius: 4 });
      badge.fills = isDo ? [paint('successBg'), paint('successStroke', 0.24)] : [paint('dangerStroke', 0.24)];
      stroke(badge, isDo ? 'successStroke' : 'dangerStroke', { opacity: 0.24, weights: [0, 0, 1, 0] });
      const bt = await txt('overline', isDo ? 'successFg' : 'dangerFg', isDo ? 'Do' : 'Don’t', isDo ? 'Do badge text' : "Don't badge text");
      bt.textCase = 'UPPER';
      badge.appendChild(bt);
      card.appendChild(badge);
      badge.layoutPositioning = 'ABSOLUTE';
      badge.x = 4; badge.y = 4;
      badge.resize(card.width - 8, 20);
      badge.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
    }
  }
}

return {
  docId: root.id,
  name: root.name,
  size: [Math.round(root.width), Math.round(root.height)],
  position: [Math.round(root.x), Math.round(root.y)],
  undocumentedProps: undocumented,
  warnings: _warnings,
};
