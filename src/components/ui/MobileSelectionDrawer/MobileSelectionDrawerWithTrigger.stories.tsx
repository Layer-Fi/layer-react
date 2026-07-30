import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CalendarDays } from 'lucide-react'
import { userEvent, within } from 'storybook/test'

import type { ComboBoxOption } from '@ui/ComboBox/types'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const OPTIONS: ComboBoxOption[] = [
  { label: 'Profit and Loss', value: 'pnl' },
  { label: 'Balance Sheet', value: 'balance-sheet' },
  { label: 'Cash Flow', value: 'cash-flow' },
]

const noop = () => {}

const CELL_SIZE = 320

type TriggerProps = React.ComponentProps<typeof MobileSelectionDrawerWithTrigger<ComboBoxOption>>

const BASE: TriggerProps = {
  ariaLabel: 'Reports',
  heading: 'Select a report',
  options: OPTIONS,
  selectedValue: OPTIONS[0],
  onSelectedValueChange: noop,
}

const CELLS: { label: string, props: Partial<TriggerProps> }[] = [
  { label: 'with selection', props: {} },
  { label: 'placeholder', props: { selectedValue: null } },
  { label: 'disabled', props: { isDisabled: true } },
  { label: 'custom trigger icon', props: { slotProps: { Trigger: { icon: <CalendarDays size={16} /> } } } },
  {
    label: 'custom trigger value',
    props: { slotProps: { Trigger: { value: selected => `Report: ${selected?.label ?? 'none'}` } } },
  },
]

const meta: Meta<TriggerProps> = {
  title: 'UI/MobileSelectionDrawerWithTrigger',
  component: MobileSelectionDrawerWithTrigger,
  args: BASE,
  argTypes: {
    isDisabled: { control: 'boolean' },
    isSearchable: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<TriggerProps>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={CELL_SIZE}>
          <MobileSelectionDrawerWithTrigger {...BASE} {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

// The drawer's open state lives inside the component, so it has to be clicked open; a
// single trigger keeps the query unambiguous.
export const DrawerOpen: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 500 } },
  render: () => (
    <Gallery minBlockSize={520}>
      <Col label='drawer open, searchable' inlineSize={CELL_SIZE}>
        <MobileSelectionDrawerWithTrigger {...BASE} isSearchable />
      </Col>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  },
}
