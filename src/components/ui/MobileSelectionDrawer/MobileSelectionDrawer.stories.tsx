import { type Meta, type StoryObj } from '@storybook/react-vite'

import type { ComboBoxOption } from '@ui/ComboBox/types'
import { MobileSelectionDrawerList } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerList'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { Span } from '@ui/Typography/Text'

const OPTIONS: ComboBoxOption[] = [
  { label: 'Profit and Loss', value: 'pnl' },
  { label: 'Balance Sheet', value: 'balance-sheet' },
  { label: 'Cash Flow', value: 'cash-flow' },
]

const noop = () => {}

const meta: Meta<typeof MobileSelectionDrawerList> = {
  title: 'UI/MobileSelectionDrawer',
  component: MobileSelectionDrawerList,
}

export default meta

type Story = StoryObj<typeof MobileSelectionDrawerList>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <MobileSelectionDrawerList
        ariaLabel='Reports'
        options={OPTIONS}
        selectedValue={OPTIONS[0]}
        onSelectedValueChange={noop}
      />
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
        <Span size='sm' weight='bold'>List with selection</Span>
        <MobileSelectionDrawerList
          ariaLabel='Reports'
          options={OPTIONS}
          selectedValue={OPTIONS[0]}
          onSelectedValueChange={noop}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
        <Span size='sm' weight='bold'>Trigger</Span>
        <MobileSelectionDrawerWithTrigger
          ariaLabel='Reports'
          heading='Select a report'
          options={OPTIONS}
          selectedValue={OPTIONS[0]}
          onSelectedValueChange={noop}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
        <Span size='sm' weight='bold'>Trigger placeholder</Span>
        <MobileSelectionDrawerWithTrigger
          ariaLabel='Reports'
          heading='Select a report'
          options={OPTIONS}
          selectedValue={null}
          onSelectedValueChange={noop}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
        <Span size='sm' weight='bold'>Trigger disabled</Span>
        <MobileSelectionDrawerWithTrigger
          ariaLabel='Reports'
          heading='Select a report'
          options={OPTIONS}
          selectedValue={OPTIONS[0]}
          onSelectedValueChange={noop}
          isDisabled
        />
      </div>
    </div>
  ),
}
