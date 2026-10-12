import { type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { type DateRange } from '@utils/shared/date/dateRange'
import TasksMeta from '@features/bookkeeping/Tasks/Tasks.stories'

import { makeBookkeepingPeriods, makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { PROFIT_AND_LOSS_FIXTURE_START_YEAR } from '@fixtures/profitAndLoss/constants'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { handlers } from '@msw/handlers'

const NOVEMBER: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 10, 1),
  endDate: new Date(FIXTURE_YEAR, 10, 30),
}

const periodsWithoutNovember = makeBookkeepingPeriods(PROFIT_AND_LOSS_FIXTURE_START_YEAR)
  .filter(({ year, month }) => !(year === FIXTURE_YEAR && month === 11))

const meta: typeof TasksMeta = {
  ...TasksMeta,
  title: 'Scratch/Tasks',
  parameters: {
    ...TasksMeta.parameters,
    msw: {
      handlers: [
        getBookkeepingPeriods.mock(periodsWithoutNovember),
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...handlers,
      ],
    },
  },
}

export default meta

export const MonthWithoutPeriod: StoryObj<typeof meta> = {
  parameters: { pinnedDateRange: NOVEMBER },
}
