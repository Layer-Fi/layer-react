import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { type BusinessTask, BusinessTaskStatus, TaskUserResponseType } from '@schemas/features/bookkeeping/businessTask'
import { type DateRange } from '@utils/shared/date/dateRange'
import { Tasks } from '@features/bookkeeping/Tasks/Tasks'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'
import { PinnedGlobalDateRange } from '@testUtils/storybook/decorators/PinnedGlobalDateRange'

const NOVEMBER: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 10, 1),
  endDate: new Date(FIXTURE_YEAR, 10, 30),
}

const makeTask = (userResponseType: TaskUserResponseType): BusinessTask => ({
  id: '00000000-0000-4000-8000-000000000001',
  status: BusinessTaskStatus.Todo,
  title: 'Upload your November bank statement',
  question: 'Please upload the statement covering November so we can reconcile the account.',
  userResponse: null,
  userResponseType,
  documents: null,
})

const makePeriodWithTask = (userResponseType: TaskUserResponseType): readonly BookkeepingPeriod[] => [{
  id: '00000000-0000-4000-8000-0000000000ff',
  month: 11,
  year: FIXTURE_YEAR,
  status: BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER,
  tasks: [makeTask(userResponseType)],
}]

const withPeriodHandlers = (userResponseType: TaskUserResponseType) => ({
  msw: {
    handlers: [
      getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
      getBookkeepingPeriods.mock(makePeriodWithTask(userResponseType)),
      ...handlers,
    ],
  },
  pinnedDateRange: NOVEMBER,
})

const meta: Meta<typeof Tasks> = {
  title: 'Scratch/TasksListItem',
  component: Tasks,
  decorators: [
    (Story, { parameters }: { parameters: { pinnedDateRange?: DateRange } }) => (
      <PinnedGlobalDateRange dateRange={parameters.pinnedDateRange ?? NOVEMBER}>
        <Story />
      </PinnedGlobalDateRange>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Tasks>

export const UploadDocumentTask: Story = {
  parameters: withPeriodHandlers(TaskUserResponseType.UploadDocument),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(await canvas.findByText(/Drag and drop files, or/)).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText('Optional description')).toBeInTheDocument()
  },
}

export const FreeResponseTask: Story = {
  parameters: withPeriodHandlers(TaskUserResponseType.FreeResponse),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(await canvas.findByRole('button', { name: 'Save' })).toBeInTheDocument()
    await expect(canvas.queryByText(/Drag and drop files, or/)).not.toBeInTheDocument()
  },
}
