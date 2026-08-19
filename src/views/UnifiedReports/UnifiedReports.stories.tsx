import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { type UnifiedReportsDefaultState } from '@internal-types/features/unifiedReports/defaultState'
import { type UnifiedReportNavigationVariant } from '@internal-types/features/unifiedReports/navigationVariant'
import { type DateSelectionMode } from '@utils/shared/date/dateRange'
import { UnifiedReports } from '@views/UnifiedReports/UnifiedReports'

type UnifiedReportsStoryArgs = {
  navigationVariant: UnifiedReportNavigationVariant
  showTitle: boolean
  dateSelectionMode: DateSelectionMode
  defaultState?: UnifiedReportsDefaultState
}

const meta: Meta<UnifiedReportsStoryArgs> = {
  title: 'Components/UnifiedReports',
  tags: ['public-api'],
  component: UnifiedReports,
  parameters: {
    controls: { include: ['navigationVariant', 'showTitle', 'dateSelectionMode', 'defaultState'] },
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
    defaultState: {
      control: false,
      description: 'Initial landing state (e.g. `{ reportKey: "BALANCE_SHEET" }`), applied when the report configuration first loads. See the `DeepLinkedReport` story.',
    },
  },
}

export default meta

type Story = StoryObj<UnifiedReportsStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

export const MenuNavigation: Story = {
  args: { navigationVariant: 'menu' },
}

export const DeepLinkedReport: Story = {
  args: { defaultState: { reportKey: 'BALANCE_SHEET' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByRole('heading', { name: 'Balance Sheet' }, { timeout: 10_000 })
  },
}

export const MegaMenuOpen: Story = {
  args: { navigationVariant: 'menu' },
  tags: ['docs-screenshot'],
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The mega menu renders in a popover portaled to the body, outside the canvas.
    const overlay = within(canvasElement.ownerDocument.body)

    await userEvent.click(await canvas.findByRole('button', { name: /Switch report/ }))
    await overlay.findByText('Cash Flow Statement', undefined, { timeout: 10_000 })
  },
}
