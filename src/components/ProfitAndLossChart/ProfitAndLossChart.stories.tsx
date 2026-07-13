import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossChart, type ProfitAndLossChartProps } from '@components/ProfitAndLossChart/ProfitAndLossChart'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/withProfitAndLossStoryContext'

const meta: Meta<ProfitAndLossChartProps> = {
  title: 'Components/ProfitAndLoss/Chart',
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

export const Default: Story = {}
