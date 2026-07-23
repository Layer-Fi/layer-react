import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  type CallBooking,
  CallBookingPurpose,
  CallBookingState,
  CallBookingType,
} from '@schemas/callBooking'
import { BookkeepingStatus } from '@schemas/bookkeepingStatus'
import { BookkeepingOverview } from '@views/BookkeepingOverview/BookkeepingOverview'

import { get as getCallBookings } from '@msw/api/businesses/[business-id]/call-bookings/get'
import { get as getBookkeepingConfiguration } from '@msw/api/businesses/[business-id]/bookkeeping/config/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { makeBookkeepingConfiguration, makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@test-utils/summariesStoryControls'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

const ONBOARDING_CALL_URL = 'https://calendly.com/layerfi/bookkeeping-onboarding'

const onboardingCallCardConfiguration = makeBookkeepingConfiguration({
  onboardingCallCardTitleText: 'Meet your new bookkeeper',
  onboardingCallCardDescriptionText: 'Get set up on the new Jobber Bookkeeping experience, meet your bookkeeper, and review your books.',
  onboardingCallCardCoverageText: 'On this call, we\'ll walk through the upgraded Jobber Bookkeeping experience, review your books, and answer any questions you have.',
})

const scheduledOnboardingCall: CallBooking = {
  id: '00000000-0000-4000-8000-000000000401',
  businessId: '00000000-0000-4000-8000-000000000201',
  externalId: 'calendly-event-1',
  purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
  state: CallBookingState.SCHEDULED,
  callType: CallBookingType.GOOGLE_MEET,
  eventStartAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  eventEndAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
  callLink: new URL('https://meet.google.com/abc-defg-hij'),
  bookkeeperName: 'Alex Bookkeeper',
  bookkeeperEmail: 'alex@layerfi.com',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const onboardingCallCardHandlers = (callBookings: readonly CallBooking[] = []) => [
  getBookkeepingStatus.mock(makeBookkeepingStatus({
    status: BookkeepingStatus.ACTIVE,
    showEmbeddedOnboarding: true,
    onboardingCallUrl: ONBOARDING_CALL_URL,
  })),
  getBookkeepingConfiguration.mock(onboardingCallCardConfiguration),
  getCallBookings.mock(callBookings),
  ...profitAndLossStoryHandlers,
]

type BookkeepingOverviewStoryArgs = SummariesStoryArgs & {
  showTitle: boolean
}

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLoss.summaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

const meta: Meta<BookkeepingOverviewStoryArgs> = {
  title: 'Views/Overview/Bookkeeping',
  component: BookkeepingOverview,
  parameters: {
    msw: {
      handlers: [
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...profitAndLossStoryHandlers,
      ],
    },
    controls: { include: ['showTitle', ...summariesControls.controlNames] },
  },
  decorators: [withOverviewStoryContext],
  args: {
    showTitle: true,
    ...summariesStoryDefaultArgs,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and month picker header',
    },
    ...summariesControls.argTypes,
  },
  render: args => (
    <BookkeepingOverview
      showTitle={args.showTitle}
      stringOverrides={{ profitAndLoss: { summaries: buildSummariesStringOverrides(args) } }}
      slotProps={{ profitAndLoss: { summaries: buildSummariesSlotProps(args) } }}
    />
  ),
}

export default meta

type Story = StoryObj<BookkeepingOverviewStoryArgs>

export const Default: Story = {}

export const OnboardingCallCard: Story = {
  name: 'Onboarding call card (empty)',
  parameters: {
    msw: {
      handlers: onboardingCallCardHandlers(),
    },
  },
}

export const ScheduledOnboardingCallCard: Story = {
  name: 'Onboarding call card (scheduled)',
  parameters: {
    msw: {
      handlers: onboardingCallCardHandlers([scheduledOnboardingCall]),
    },
  },
}
