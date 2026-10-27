// ===== figma-component-docs / inspect.js (read-only) =====
// Run as: lib.js + this file. Checks every token resolves in this file copy and returns
// what you need to write the doc CONFIG: properties, defaults, element names for anatomy markers.

const CONFIG = {
  componentSetId: 'REPLACE_ME', // e.g. '2025:3295' — from the node-id in the Figma URL (2025-3295 -> 2025:3295)
};

await loadTokens();
const cs = await figma.getNodeByIdAsync(CONFIG.componentSetId);
if (!cs || (cs.type !== 'COMPONENT_SET' && cs.type !== 'COMPONENT')) {
  throw new Error('Expected a COMPONENT_SET or COMPONENT, got ' + (cs ? cs.type : 'nothing') + '. Point to the component set, not a variant or instance.');
}
const page = await gotoPageOf(cs);
const variants = cs.type === 'COMPONENT_SET' ? cs.children.filter(c => c.type === 'COMPONENT') : [cs];
const dv = cs.type === 'COMPONENT_SET' ? cs.defaultVariant : cs;

const props = Object.entries(propKeyMap(cs)).map(([name, { type, def }]) => ({
  name, type, options: def.variantOptions, default: def.defaultValue,
}));

// Element names inside the default variant — these are the `node` values for anatomy / slot markers.
function outline(n, d) {
  const o = { name: clean(n.name), type: n.type, size: [Math.round(n.width), Math.round(n.height)] };
  if ('visible' in n && !n.visible) o.hidden = true;
  if ('children' in n && d < 3) o.children = n.children.map(c => outline(c, d + 1));
  return o;
}

const sizeOf = vs => ({
  maxWidth: Math.max(...vs.map(v => Math.round(v.width))),
  maxHeight: Math.max(...vs.map(v => Math.round(v.height))),
});

const existing = page.children
  .filter(n => /documentation|matrix|annotation/i.test(n.name))
  .map(n => ({ id: n.id, name: clean(n.name), type: n.type, x: Math.round(n.x), y: Math.round(n.y) }));

return {
  name: clean(cs.name),
  id: cs.id,
  page: { id: page.id, name: clean(page.name) },
  description: clean(cs.description || '').slice(0, 1200),
  variantCount: variants.length,
  defaultVariant: clean(dv.name),
  props,
  variantSize: sizeOf(variants),
  structure: outline(dv, 0),
  existingDocFrames: existing,
  warnings: _warnings,
};
