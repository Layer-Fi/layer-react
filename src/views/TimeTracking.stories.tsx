import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { TimeTracking, type TimeTrackingProps } from '@views/TimeTracking'

import { FIXTURE_YEAR, FIXTURE_YEAR_RANGE } from '@fixtures/constants/fixtureYear'
import { catalogServices } from '@fixtures/generated/catalogServices.gen'
import { makeTimeEntry } from '@fixtures/timeEntries/mocks'
import { toTimeEntryService } from '@fixtures/timeEntries/toTimeEntryService'
import { get as getActiveTimeTracker } from '@msw/api/businesses/[business-id]/time-tracking/tracker/active/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

type TimeTrackingStoryArgs = {
  showTitle: boolean
  title: string
  showReportsAction: boolean
} & Pick<TimeTrackingProps, 'onReportsClick' | 'stringOverrides'>

const meta: Meta<TimeTrackingStoryArgs> = {
  title: 'Views/TimeTracking',
  tags: ['public-api'],
  component: TimeTracking,
  parameters: {
    controls: { include: ['showTitle', 'onReportsClick', 'stringOverrides.title'] },
  },
  args: {
    showTitle: true,
    title: '',
    showReportsAction: false,
  },
  argTypes: {
    onReportsClick: { table: { disable: true } },
    stringOverrides: { table: { disable: true } },
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and header row',
    },
    showReportsAction: {
      name: 'onReportsClick',
      control: 'boolean',
      description:
        'The real prop is the `onReportsClick: () => void` callback. Toggle this on to '
        + 'provide it (a Reports item appears in the header menu; clicking it fires the '
        + 'callback — an alert here) or off to omit it.',
      table: {
        category: 'Callbacks',
        type: { summary: '() => void' },
      },
    },
    title: {
      name: 'stringOverrides.title',
      control: 'text',
      description:
        'The real prop is `stringOverrides?: { title?: string }`. Type a value to set '
        + '`stringOverrides.title`, or leave it blank to omit the override and use the default.',
      table: {
        category: 'String overrides',
        type: { summary: '{ title?: string }' },
        defaultValue: { summary: 'Time Tracking' },
      },
    },
  },
  decorators: [
    Story => (
      <PinnedGlobalDateRange dateRange={FIXTURE_YEAR_RANGE}>
        <Story />
      </PinnedGlobalDateRange>
    ),
  ],
  render: ({ showTitle, title, showReportsAction }) => (
    <TimeTracking
      showTitle={showTitle}
      stringOverrides={title ? { title } : undefined}
      onReportsClick={showReportsAction ? () => window.alert('Reports clicked') : undefined}
    />
  ),
}

export default meta

type Story = StoryObj<TimeTrackingStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

// Stories pin "now" to noon on the last day of the fixture year, so a timer started at 10:47
// that morning reads as a stable hour-and-change of elapsed time.
const runningTimer = getActiveTimeTracker.mock(
  makeTimeEntry({
    status: 'ACTIVE',
    description: null,
    memo: null,
    durationMinutes: 0,
    // Has to be a service the catalog endpoint serves, or the banner's selector can't resolve it
    // and falls back to its placeholder.
    service: toTimeEntryService(catalogServices[1]),
    createdAt: new Date(FIXTURE_YEAR, 11, 31, 10, 47, 0),
  }),
)

export const ActiveTimer: Story = {
  tags: ['docs-screenshot'],
  parameters: {
    chromatic: { viewports: [1280] },
    msw: { handlers: [runningTimer, ...handlers] },
  },
}

export const EntryDetail: Story = {
  tags: ['docs-screenshot'],
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Drawers and popovers portal to the body, so what they open isn't inside the canvas.
    const overlay = within(canvasElement.ownerDocument.body)

    const [firstEntry] = await canvas.findAllByRole('button', { name: /View Entry/ })
    await userEvent.click(firstEntry)
    await overlay.findByRole('button', { name: /Save Entry/ }, { timeout: 10_000 })
  },
}

export const ServicesDrawer: Story = {
  tags: ['docs-screenshot'],
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const overlay = within(canvasElement.ownerDocument.body)

    await userEvent.click(
      await canvas.findByRole('button', { name: /Additional time tracking actions/ }),
    )
    await userEvent.click(await overlay.findByRole('menuitem', { name: /Services/ }))
    await overlay.findByRole('heading', { name: /Services/ }, { timeout: 10_000 })
  },
}
