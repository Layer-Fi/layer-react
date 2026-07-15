import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type DateSelectionMode } from '@utils/date/dateRange'
import { type UnifiedReportNavigationVariant, UnifiedReports } from '@components/UnifiedReports/UnifiedReports'

type UnifiedReportsStoryArgs = {
  navigationVariant: UnifiedReportNavigationVariant
  showTitle: boolean
  dateSelectionMode: DateSelectionMode
}

const meta: Meta<UnifiedReportsStoryArgs> = {
  title: 'Components/UnifiedReports',
  component: UnifiedReports,
  parameters: {
    controls: { include: ['navigationVariant', 'showTitle', 'dateSelectionMode'] },
  },
  args: {
    navigationVariant: 'sidebar',
    showTitle: true,
    dateSelectionMode: 'full',
  },
  argTypes: {
    navigationVariant: {
      control: 'radio',
      options: ['sidebar', 'menu'],
      description: 'Desktop shows a sidebar tree; `menu` swaps it for the in-header mega menu.',
    },
    showTitle: {
      control: 'boolean',
      description: 'Toggles the "Reports" view header.',
    },
    dateSelectionMode: {
      control: 'radio',
      options: ['full', 'month', 'year'] satisfies DateSelectionMode[],
      description: 'How report controls read from the global date store.',
    },
  },
}

export default meta

type Story = StoryObj<UnifiedReportsStoryArgs>

export const Default: Story = {}

export const MenuNavigation: Story = {
  args: { navigationVariant: 'menu' },
}
