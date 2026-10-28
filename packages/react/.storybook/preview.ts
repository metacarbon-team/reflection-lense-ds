import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
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
  tags: ['autodocs'],
}

export default preview
