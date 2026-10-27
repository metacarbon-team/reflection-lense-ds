// ===== figma-component-docs / build-matrix.js =====
// Run as: lib.js + this file. Builds the "Variants Matrix / <Name>" frame: every variant laid out with
// one variant property as columns and the others as nested row groups (outermost group first).

const CONFIG = {
  componentSetId: 'REPLACE_ME',
  title: 'REPLACE_ME',            // e.g. 'Button'
  frameName: null,                // default: `Variants Matrix / ${title}`
  columns: 'Size',                // variant property shown as columns (usually the one that changes width)
  rows: ['State', 'Sentiment', 'Type'], // remaining variant properties, outermost group first
  position: null,                 // { x, y } — default: free space right of the page content
};

await loadTokens();
const cs = await figma.getNodeByIdAsync(CONFIG.componentSetId);
if (!cs || cs.type !== 'COMPONENT_SET') throw new Error('build-matrix needs a COMPONENT_SET id');
const page = await gotoPageOf(cs);
const defs = cs.componentPropertyDefinitions;
const opts = name => {
  const d = defs[name];
  if (!d || d.type !== 'VARIANT') throw new Error('"' + name + '" is not a variant property. Variant properties: ' + Object.keys(defs).filter(k => defs[k].type === 'VARIANT').join(', '));
  return d.variantOptions;
};
const allVariantProps = Object.keys(defs).filter(k => defs[k].type === 'VARIANT');
const used = [CONFIG.columns, ...CONFIG.rows];
const unused = allVariantProps.filter(p => !used.includes(p));
if (unused.length) _warnings.push('Not in the matrix (kept at default): ' + unused.join(', '));
const cols = opts(CONFIG.columns);
CONFIG.rows.forEach(opts);

const variants = cs.children.filter(c => c.type === 'COMPONENT');
const maxW = Math.max(...variants.map(v => v.width));
const maxH = Math.max(...variants.map(v => v.height));
const LW = CONFIG.rows.map(() => 112);
const labelSpace = LW.reduce((a, b) => a + b, 0);
const cellH = Math.max(64, Math.ceil(maxH + 40));
const GRID_DASH = [10, 5]; // every specimen cell is outlined with a dashed rule, forming one continuous grid
const width = Math.max(1280, Math.ceil(128 + labelSpace + cols.length * Math.max(maxW + 32, 160)));

const root = box('VERTICAL', CONFIG.frameName || `Variants Matrix / ${CONFIG.title}`, { gap: 32, pad: [48, 64], fill: 'bgEmphasized', radius: 32 });
page.appendChild(root);
root.resize(width, 100);
root.primaryAxisSizingMode = 'AUTO';
const pos = CONFIG.position || freeSpot(page, cs.absoluteBoundingBox.y); // absolute: the set may sit inside a frame
root.x = pos.x; root.y = pos.y;

// Header
const header = box('VERTICAL', 'Documentation header', { gap: 16 });
add(root, header, 'FILL');
stroke(header, 'strokeSubtle', { weights: [0, 0, 1, 0] });
const titleRow = box('HORIZONTAL', 'Title and count', { align: 'SPACE_BETWEEN', cross: 'CENTER' });
add(header, titleRow, 'FILL');
add(titleRow, await txt('title', 'fgNeutral', CONFIG.title, 'Family title'));

const grid = box('VERTICAL', 'Variant grid', { gap: 24 });
add(root, grid, 'FILL');

// Column headers: bracketed group name over the column labels
const colHead = box('VERTICAL', 'Column headers', { gap: 12 });
add(grid, colHead, 'FILL');
const grouping = box('HORIZONTAL', CONFIG.columns + ' grouping');
add(colHead, grouping, 'FILL');
add(grouping, plainFrame('Row label space', labelSpace, 28), labelSpace);
const colTitle = box('VERTICAL', CONFIG.columns + ' heading', { gap: 8, cross: 'CENTER' });
add(grouping, colTitle, 'FILL');
const colTitleText = await txt('overline', 'fgSubtle', CONFIG.columns, 'Property');
colTitleText.textCase = 'UPPER';
add(colTitle, colTitleText);
const bracket = plainFrame(CONFIG.columns + ' bracket', 100, 8);
stroke(bracket, 'strokeNeutral', { weights: [1, 1, 0, 1] });
add(colTitle, bracket, 'FILL', 8);

const propHead = box('HORIZONTAL', 'Property headers', { cross: 'CENTER' });
add(colHead, propHead, 'FILL');
for (const [i, p] of CONFIG.rows.entries()) {
  // right-aligned over the row labels below (group labels end 30 px before the bracket edge, leaf labels 12 px)
  const h = box('HORIZONTAL', p + ' heading', { pad: [0, i === CONFIG.rows.length - 1 ? 12 : 30, 0, 0], align: 'MAX' });
  add(propHead, h, LW[i]);
  add(h, await txt('labelSmall', 'fgSubtle', p, 'Property'));
}
for (const c of cols) {
  const h = box('HORIZONTAL', CONFIG.columns + ' column', { align: 'CENTER' });
  add(propHead, h, 'FILL');
  add(h, await txt('label', 'fgNeutral', c, CONFIG.columns));
}

// Row groups. Layout follows the reference matrix: no rules between groups, a "[" bracket per
// group label, right-aligned leaf labels, and a dashed grid drawn by the cells themselves
// (each cell: right + bottom; first column adds left, first row adds top).
let count = 0;
let rowIndex = 0;
async function level(parent, i, fixed) {
  const prop = CONFIG.rows[i];
  const last = i === CONFIG.rows.length - 1;
  for (const val of opts(prop)) {
    const f = Object.assign({}, fixed, { [prop]: val });
    if (last) {
      const row = box('HORIZONTAL', prop + ' row', { cross: 'CENTER' });
      add(parent, row, 'FILL');
      const lab = box('HORIZONTAL', prop + ' label', { pad: [0, 12, 0, 0], align: 'MAX', cross: 'CENTER' });
      add(row, lab, LW[i], 'FILL');
      add(lab, await txt('labelSmall', 'fgSubtle', val, prop));
      for (const [ci, c] of cols.entries()) {
        const cell = box('HORIZONTAL', 'Specimen cell', { align: 'CENTER', cross: 'CENTER' });
        stroke(cell, 'strokeNeutral', { weights: [rowIndex === 0 ? 1 : 0, 1, 1, ci === 0 ? 1 : 0], dash: GRID_DASH });
        add(row, cell, 'FILL', cellH);
        const v = tryVariant(cs, Object.assign({}, f, { [CONFIG.columns]: c }));
        if (v) { const inst = v.createInstance(); inst.name = CONFIG.title + ' specimen'; cell.appendChild(inst); count++; }
      }
      rowIndex++;
    } else {
      // Group: label + "[" bracket spanning the group, inset 10 px so neighbouring brackets don't touch
      const g = box('HORIZONTAL', prop + ' group');
      add(parent, g, 'FILL');
      const lab = box('HORIZONTAL', prop + ' label', { gap: 8, pad: [10, 8, 10, 0], align: 'MAX', cross: 'CENTER' });
      add(g, lab, LW[i], 'FILL');
      add(lab, await txt('label', 'fgNeutral', val, prop));
      const br = plainFrame(prop + ' bracket', 14, 100);
      stroke(br, 'strokeNeutral', { weights: [1, 0, 1, 1] });
      add(lab, br, 14, 'FILL');
      const inner = box('VERTICAL', CONFIG.rows[i + 1] + (i + 1 === CONFIG.rows.length - 1 ? ' rows' : ' groups'));
      add(g, inner, 'FILL');
      await level(inner, i + 1, f);
    }
  }
}
// Groups sit in their own gap-0 container: the grid's 24 px gap belongs only under the column headers.
const rowsWrap = box('VERTICAL', 'Rows');
add(grid, rowsWrap, 'FILL');
await level(rowsWrap, 0, {});

return { matrixId: root.id, name: root.name, instances: count, variants: variants.length, size: [Math.round(root.width), Math.round(root.height)], warnings: _warnings };
