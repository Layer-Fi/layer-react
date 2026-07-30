import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

const ROWS = ['Profit and Loss', 'Balance Sheet', 'Cash Flow']

const Header = () => (
  <ModalTitleWithClose heading={<ModalHeading>Select a report</ModalHeading>} />
)

// The dialog sets padding: 0 for both drawer variants, so the call site supplies it, as
// TimeTrackingServicesDrawer does. ModalActions is deliberately not used: its 3xl top
// margin is meant to push actions down in a centred modal.
const Body = () => (
  <VStack gap='md' pbs='md' pbe='lg' pi='md'>
    <P>Settled drawer content, padded the way the feature drawers pad theirs.</P>
    {ROWS.map(row => <Span key={row} size='sm'>{row}</Span>)}
    <HStack justify='space-between' gap='xs'>
      <Button variant='outlined'>Cancel</Button>
      <Button>Apply</Button>
    </HStack>
  </VStack>
)

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  args: {
    'isOpen': true,
    'aria-label': 'Example drawer',
    'size': 'md',
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg', 'xl', '2xl'] },
    isDismissable: { control: 'boolean' },
    fixedHeight: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Drawer>

// A drawer is an overlay that fills the viewport, so each variant needs its own snapshot
// rather than sharing a gallery.
export const Regular: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Drawer {...args} variant='drawer' slots={{ Header }}>
      <Body />
    </Drawer>
  ),
}

// The mobile drawer slides up from the bottom, so capture it at a mobile width.
export const Mobile: Story = {
  parameters: { chromatic: { viewports: [499] } },
  args: { fixedHeight: true },
  render: args => (
    <Drawer {...args} variant='mobile-drawer' slots={{ Header }}>
      <Body />
    </Drawer>
  ),
}
