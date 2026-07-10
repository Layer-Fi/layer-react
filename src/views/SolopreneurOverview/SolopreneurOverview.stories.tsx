import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SolopreneurOverview } from '@views/SolopreneurOverview/SolopreneurOverview'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

const solopreneurStoryHandlers = [
  getAccountingConfiguration.mock(makeAccountingConfiguration({
    enableTaxEstimates: true,
    enableMileageTracking: true,
  })),
  ...profitAndLossStoryHandlers,
]

const meta: Meta<typeof SolopreneurOverview> = {
  title: 'Views/Overview/Solopreneur',
  component: SolopreneurOverview,
  parameters: {
    msw: { handlers: solopreneurStoryHandlers },
    controls: { include: [] },
  },
  decorators: [withOverviewStoryContext],
}

export default meta

type Story = StoryObj<typeof SolopreneurOverview>

export const Default: Story = {}
