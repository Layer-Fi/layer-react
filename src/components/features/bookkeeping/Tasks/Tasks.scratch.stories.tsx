import { type Meta, type StoryObj } from '@storybook/react-vite'
import { screen, userEvent, within } from 'storybook/test'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { type DateRange } from '@utils/shared/date/dateRange'
import { BREAKPOINTS } from '@utils/shared/size/screenSizeBreakpoints'
import { Tasks } from '@features/bookkeeping/Tasks/Tasks'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

// October holds the account-mask ask, which carries a subtitle and page intro/description in its fixture.
const OCTOBER: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 9, 1),
  endDate: new Date(FIXTURE_YEAR, 9, 31),
}

const MOBILE = { chromatic: { viewports: [BREAKPOINTS.MOBILE - 1] } }

const openTakeover = async (canvasElement: HTMLElement) => {
  await userEvent.click(await within(canvasElement).findByText('New account transfer'))
  await screen.findByRole('heading', { name: 'New account transfer' })
}

const meta: Meta<typeof Tasks> = {
  title: 'Scratch/Tasks subtitles and page paragraphs',
  component: Tasks,
  parameters: {
    msw: { handlers: [getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })), ...handlers] },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={OCTOBER}>
        <div style={{ display: 'grid', paddingBlock: '2rem', paddingInline: '1rem' }}>
          <div style={{ display: 'grid', minInlineSize: '20rem', maxInlineSize: '48rem' }}>
            <Story />
          </div>
        </div>
      </PinnedGlobalDateRange>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Tasks>

/** Desktop list: subtitle in the row, then intro, transactions, description, and the question inside the expanded task. */
export const DesktopAccountMask: Story = {
  parameters: { chromatic: { viewports: [1280] } },
}

/** Mobile takeover: subtitle under the title, intro, transactions, description, question. */
export const MobileTakeoverAccountMask: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
  },
}

/** The "Task N of M" drawer over the takeover, with subtitles on its rows. */
export const MobileTakeoverTaskList: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
    await userEvent.click(screen.getByRole('button', { name: /^Task \d+ of/ }))
    await screen.findByText('Open')
  },
}

/** The connect page after picking "Another account my business owns": the intro changes with the page. */
export const MobileTakeoverConnectPage: Story = {
  parameters: MOBILE,
  args: { mobile: true },
  play: async ({ canvasElement }) => {
    await openTakeover(canvasElement)
    await userEvent.click(screen.getByRole('radio', { name: 'Another account my business owns' }))
    await screen.findByRole('button', { name: 'Connect account' })
  },
}
