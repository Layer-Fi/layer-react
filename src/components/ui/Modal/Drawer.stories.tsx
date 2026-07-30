import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P, Span } from '@ui/Typography/Text'

const ROWS = ['Profit and Loss', 'Balance Sheet', 'Cash Flow']

const Body = () => (
  <>
    <ModalTitleWithClose heading={<ModalHeading>Select a report</ModalHeading>} />
    <ModalContent>
      <VStack gap='sm'>
        <P>Settled drawer content, composed from the Modal subcomponents.</P>
        {ROWS.map(row => <Span key={row} size='sm'>{row}</Span>)}
      </VStack>
    </ModalContent>
    <ModalActions>
      <HStack justify='space-between' gap='xs'>
        <Button variant='outlined'>Cancel</Button>
        <Button>Apply</Button>
      </HStack>
    </ModalActions>
  </>
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
    <Drawer {...args} variant='drawer'>
      <Body />
    </Drawer>
  ),
}

// The mobile drawer slides up from the bottom, so capture it at a mobile width.
export const Mobile: Story = {
  parameters: { chromatic: { viewports: [499] } },
  args: { fixedHeight: true },
  render: args => (
    <Drawer {...args} variant='mobile-drawer'>
      <Body />
    </Drawer>
  ),
}
