import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossChart, type ProfitAndLossChartProps } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChart'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const meta: Meta<ProfitAndLossChartProps> = {
  title: 'Scratch/ProfitAndLoss/ChartSizing',
  component: ProfitAndLossChart,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    chromatic: { viewports: [1280] },
  },
  decorators: [withProfitAndLossStoryContext()],
}

export default meta

type Story = StoryObj<ProfitAndLossChartProps>

export const DefaultSizing: Story = {
  name: 'Default sizing (baseline)',
}

export const CustomSizing: Story = {
  name: 'Custom barSize and lineStrokeWidth',
  args: { barSize: 36, lineStrokeWidth: 4 },
}
