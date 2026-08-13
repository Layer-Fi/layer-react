import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'

import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { GlobalDateSelection } from '@blocks/DatePickers/DateSelection/GlobalDateSelection'

import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR, FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

const MOBILE_CLASS_NAME = 'Layer__GlobalDateSelection--mobile'
const COMPACT_CLASS_NAME = 'Layer__GlobalDateSelection--compact'
const ROOT_SELECTOR = '.Layer__GlobalDateSelection'

const findRoot = async (canvasElement: HTMLElement) => {
  await waitFor(() => expect(canvasElement.querySelector(ROOT_SELECTOR)).not.toBeNull())

  return canvasElement.querySelector(ROOT_SELECTOR)
}

const meta: Meta<typeof GlobalDateSelection> = {
  title: 'Blocks/DatePickers/GlobalDateSelection (scratch)',
  component: GlobalDateSelection,
  parameters: {
    msw: { handlers: [getBusiness.mock(makeBusiness({ activationAt: new Date(FIXTURE_YEAR - 1, 0, 1) })), ...handlers] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof GlobalDateSelection>

/**
 * The changed state: `--mobile` tracks the measured window size, which is what the releases that
 * shipped it did, and never `isCompact`. Asserted against the live width so it holds at whichever
 * viewport the runner uses.
 */
export const MobileWidthTracksWindowNotCompact: Story = {
  args: { isCompact: false },
  parameters: { chromatic: { viewports: [BREAKPOINTS.MOBILE - 100, 1280] } },
  play: async ({ canvasElement }) => {
    const root = await findRoot(canvasElement)
    const isMobileWidth = canvasElement.ownerDocument.defaultView!.innerWidth < BREAKPOINTS.MOBILE

    await expect(root?.classList.contains(MOBILE_CLASS_NAME)).toBe(isMobileWidth)
    await expect(root?.classList.contains(COMPACT_CLASS_NAME)).toBe(false)
  },
}

/**
 * The baseline: compact emits `--compact`, and `--mobile` still follows the window rather than the
 * prop. Mapping compact onto `--mobile` would have made these two indistinguishable.
 */
export const CompactDoesNotImplyMobile: Story = {
  args: { isCompact: true },
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const root = await findRoot(canvasElement)
    const isMobileWidth = canvasElement.ownerDocument.defaultView!.innerWidth < BREAKPOINTS.MOBILE

    await expect(root?.classList.contains(COMPACT_CLASS_NAME)).toBe(true)
    await expect(root?.classList.contains(MOBILE_CLASS_NAME)).toBe(isMobileWidth)
  },
}
