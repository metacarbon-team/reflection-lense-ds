import { Canvas, Description } from '@storybook/addon-docs/blocks'
import type { ComponentProps } from 'react'

// Shared by the Guidelines section of the Docs pages. Stories only: excluded from the library build.

type StoryRef = ComponentProps<typeof Canvas>['of']

/**
 * One block per rule: the rule text over the full row, then the Do and Don't cards side by side, each in
 * its own frame as in Figma. Every rule is a pair of stories, `[Do, Dont]`; the JSDoc of the Do story is
 * the rule text.
 */
export function GuidelinePairs({ rules }: { rules: readonly (readonly [StoryRef, StoryRef])[] }) {
  return (
    <>
      {rules.map(([Do, Dont], index) => (
        <div key={index} className={`${index === 0 ? '-mt-2!' : 'mt-8!'} [&_p]:mb-0!`}>
          {/* Figma has a caption only over the Do card, so it takes the whole row; the cards sit side by side below. */}
          <Description of={Do} />
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Canvas of={Do} />
            </div>
            <div>
              <Canvas of={Dont} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
