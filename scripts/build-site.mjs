// Assembles the deployed site from built outputs: Theme Lab at `/`, Storybook at `/storybook/`.
// Run through `pnpm build:site`, which builds both first.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = join(root, 'site')
const parts = [
  { from: join(root, 'apps/theme-lab/dist'), to: site },
  { from: join(root, 'packages/react/storybook-static'), to: join(site, 'storybook') },
]

for (const { from } of parts) {
  if (!existsSync(from)) {
    console.error(`Missing ${relative(root, from)}: build it first (pnpm build:site).`)
    process.exit(1)
  }
}

rmSync(site, { recursive: true, force: true })
for (const { from, to } of parts) {
  cpSync(from, to, { recursive: true })
  console.log(`${relative(root, from)} -> ${relative(root, to) || '.'}`)
}
