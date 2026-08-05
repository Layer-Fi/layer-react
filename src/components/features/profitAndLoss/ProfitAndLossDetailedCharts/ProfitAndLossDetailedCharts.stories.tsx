import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossDetailedCharts } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

type ProfitAndLossDetailedChartsStoryArgs = {
  scope: 'revenue' | 'expenses'
  hideHeader: boolean
  showDatePicker: boolean
}

const meta: Meta<ProfitAndLossDetailedChartsStoryArgs> = {
  title: 'Components/ProfitAndLoss/DetailedCharts',
  tags: ['public-api'],
  component: ProfitAndLossDetailedCharts,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['scope', 'hideHeader', 'showDatePicker'] },
  },
  decorators: [withProfitAndLossStoryContext()],
  args: {
    scope: 'expenses',
    hideHeader: false,
    showDatePicker: false,
  },
  argTypes: {
    scope: {
      control: 'radio',
      options: ['expenses', 'revenue'],
      description: 'Which side of the P&L to break down',
    },
    hideHeader: {
      control: 'boolean',
      description: 'Hide the header row above the chart',
    },
    showDatePicker: {
      control: 'boolean',
      description: 'Show the month picker in the header',
    },
  },
  render: ({ scope, hideHeader, showDatePicker }) => (
    <ProfitAndLossDetailedCharts
      scope={scope}
      hideClose
      hideHeader={hideHeader}
      showDatePicker={showDatePicker}
    />
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossDetailedChartsStoryArgs>

export const Expenses: Story = {}

export const Revenue: Story = {
  tags: ['docs-screenshot'],
  args: { scope: 'revenue' },
}
