import type { Preview } from '@storybook/react-vite'
import './preview.css'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Tokens', 'Color', 'Typography', 'Dimensions', 'Elevation and focus'],
          'Guides',
          ['Component conventions', 'Composing components', 'Known issues'],
          'Components',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'error' fails the a11y panel check on violations; switch to 'todo' to only report.
      test: 'error',
    },
  },
  // Color mode of the theme: `data-mode` on the root, so portals (dialogs, menus) follow it too.
  globalTypes: {
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { mode: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.mode = context.globals.mode === 'dark' ? 'dark' : 'light'
      return Story()
    },
  ],
  tags: ['autodocs'],
}

export default preview
