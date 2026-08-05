import { type Meta, type StoryObj } from '@storybook/react-vite'

import type { ComboBoxOption } from '@ui/ComboBox/types'
import { MobileSelectionDrawerList } from '@blocks/MobileSelectionDrawer/MobileSelectionDrawerList'

import { Col, Frame, Gallery } from '@testUtils/storybook/layout/gallery'

const OPTIONS: ComboBoxOption[] = [
  { label: 'Profit and Loss', value: 'pnl' },
  { label: 'Balance Sheet', value: 'balance-sheet' },
  { label: 'Cash Flow', value: 'cash-flow' },
]

const noop = () => {}

const CELL_SIZE = 320

type ListProps = React.ComponentProps<typeof MobileSelectionDrawerList<ComboBoxOption>>

const CELLS: { label: string, props: Partial<ListProps> }[] = [
  { label: 'with selection', props: { selectedValue: OPTIONS[0] } },
  { label: 'without selection', props: { selectedValue: null } },
  { label: 'loading', props: { selectedValue: null, isLoading: true } },
  { label: 'error', props: { selectedValue: null, isError: true } },
  { label: 'empty', props: { selectedValue: null, options: [] } },
]

const meta: Meta<ListProps> = {
  title: 'Blocks/MobileSelectionDrawer/List',
  component: MobileSelectionDrawerList,
  args: {
    ariaLabel: 'Reports',
    options: OPTIONS,
    selectedValue: OPTIONS[0],
    onSelectedValueChange: noop,
  },
}

export default meta

type Story = StoryObj<ListProps>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={CELL_SIZE}>
          <Frame padding={8}>
            <MobileSelectionDrawerList
              ariaLabel='Reports'
              options={OPTIONS}
              selectedValue={OPTIONS[0]}
              onSelectedValueChange={noop}
              {...props}
            />
          </Frame>
        </Col>
      ))}
    </Gallery>
  ),
}
