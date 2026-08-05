import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossChart, type ProfitAndLossChartProps } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChart'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const meta: Meta<ProfitAndLossChartProps> = {
  title: 'Components/ProfitAndLoss/Chart',
  tags: ['public-api'],
  component: ProfitAndLossChart,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['hideLegend'] },
  },
  decorators: [withProfitAndLossStoryContext()],
  args: {
    hideLegend: false,
  },
  argTypes: {
    hideLegend: {
      control: 'boolean',
      description: 'Hide the revenue/expenses legend rendered inside the chart',
    },
  },
}

export default meta

type Story = StoryObj<ProfitAndLossChartProps>

export const Default: Story = {
  tags: ['docs-screenshot'],
}
