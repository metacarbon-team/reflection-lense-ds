# Worked example: Button

This is the CONFIG that reproduces the approved Button documentation and matrix
(owner-approved reference, page "06. Buttons"). Use it as a model for tone, depth and
structure. Node IDs differ between file copies, so take `componentSetId` from `inspect.js`
or from the URL, never from here.

Button facts the content relies on: variant properties Sentiment (Neutral/Accent/Danger),
Type (Solid/Outline/Ghost), Size (s/m/l), State (default/hover/pressed/focus/disabled);
TEXT `Label`; BOOLEAN `Show leading slot` / `Show trailing slot`; SLOT `Leading slot` / `Trailing slot`.
The default variant's children are named `Leading slot`, `Label`, `Trailing slot`.

## build-matrix.js CONFIG

```js
const CONFIG = {
  componentSetId: '<from inspect>',
  title: 'Button',
  frameName: null,
  columns: 'Size',
  rows: ['State', 'Sentiment', 'Type'],
  position: null,
};
```

## build-doc.js CONFIG

```js
const CONFIG = {
  componentSetId: '<from inspect>',
  title: 'Button',
  frameName: null,
  position: null,
  links: { repo: null, storybook: null },

  preview: {
    description: 'Action trigger with a text label and two optional icon slots. Accent / Solid / s is the default; Sentiment, Type, Size and State are independent.',
    rows: [
      [{ variant: { Sentiment: 'Neutral', Size: 'm' } }, { variant: { Sentiment: 'Accent', Size: 'm' } }, { variant: { Sentiment: 'Danger', Size: 'm' } }],
      [{ variant: { Type: 'Solid', Size: 'm' } }, { variant: { Type: 'Outline', Size: 'm' } }, { variant: { Type: 'Ghost', Size: 'm' } }],
    ],
  },

  anatomy: {
    description: 'The component has two main layouts:\n1. With slots — 1 mandatory and 2 optional elements;\n2. Text only — the mandatory label alone, both slots hidden.\n\nWidth hugs the label and visible slots; height is fixed per size (32 / 40 / 48).',
    layouts: [
      {
        title: 'With slots', variant: { Size: 'l' }, props: {},
        items: [
          { node: 'Leading slot', label: 'Leading slot', side: 'top' },
          { node: 'Label', label: 'label', side: 'bottom', mandatory: true },
          { node: 'Trailing slot', label: 'Trailing slot', side: 'top' },
        ],
      },
      {
        title: 'Text only', variant: { Size: 'l' }, props: { 'Show leading slot': false, 'Show trailing slot': false },
        items: [{ node: 'Label', label: 'label', side: 'top', mandatory: true }],
      },
    ],
  },

  slots: {
    title: 'Leading & trailing slots',
    comment: 'Two independent 16 × 16 slots around the label. Toggle with Show leading slot / Show trailing slot — both are on by default.',
    variant: { Size: 'l' }, props: {},
    markers: [
      { node: 'Leading slot', label: 'Leading slot', side: 'top' },
      { node: 'Trailing slot', label: 'Trailing slot', side: 'bottom' },
    ],
  },

  properties: {
    matrixFrameName: null, // defaults to 'Variants Matrix / Button'
    order: null,
    hide: [],
    docs: {
      Sentiment: { description: 'Communicates intent. Accent marks the primary action, Neutral secondary ones, Danger destructive ones.' },
      Type: { description: 'Visual weight. Solid for the main action in a group; Outline and Ghost for lower emphasis.' },
      Size: { description: 'Height 32 / 40 / 48 px. Padding and label scale with it; keep one size per group.' },
      State: { description: 'Interaction feedback. hover, pressed and focus follow interaction; disabled blocks the action and keeps the label readable.' },
      Label: { description: 'The text of the button. Keep it a short verb phrase.', required: true },
      'Show leading slot': { description: 'Shows the leading slot before the label.' },
      'Show trailing slot': { description: 'Shows the trailing slot after the label.' },
      'Leading slot': { description: 'Content before the label, 16 × 16. An icon by default.' },
      'Trailing slot': { description: 'Content after the label, 16 × 16. An icon by default.' },
    },
  },

  guidelines: [
    {
      title: 'Keep Accent as the one dominant action.',
      comment: 'Accent marks the main action, so it must stand out. Never place two Accent buttons inline — pair Accent with Neutral or Ghost. Best practice: one main action per page.',
      do: { gap: 8, items: [
        { variant: { Sentiment: 'Neutral', Type: 'Outline', Size: 's' }, props: { Label: 'Cancel', 'Show leading slot': false, 'Show trailing slot': false } },
        { variant: { Size: 's' }, props: { Label: 'Save', 'Show leading slot': false, 'Show trailing slot': false } },
      ] },
      dont: { gap: 8, items: [
        { variant: { Size: 's' }, props: { Label: 'Cancel', 'Show leading slot': false, 'Show trailing slot': false } },
        { variant: { Size: 's' }, props: { Label: 'Save', 'Show leading slot': false, 'Show trailing slot': false } },
      ] },
    },
    {
      title: 'Use 8 px gap between buttons in groups.',
      comment: 'Preserve the 8 px gap consistently across button groups.',
      do: { gap: 8, items: [
        { variant: { Size: 's' }, props: { 'Show leading slot': false, 'Show trailing slot': false } },
        { variant: { Size: 's' }, props: { 'Show leading slot': false, 'Show trailing slot': false } },
      ] },
      dont: { gap: 4, items: [
        { variant: { Size: 's' }, props: { 'Show leading slot': false, 'Show trailing slot': false } },
        { variant: { Size: 's' }, props: { 'Show leading slot': false, 'Show trailing slot': false } },
      ] },
    },
  ],
};
```
