import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Modal } from '@ui/Modal/Modal'
import { HStack, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

const Content = (
  <div style={{ padding: 24 }}>
    <VStack gap='md'>
      <P weight='bold' size='lg'>Confirm action</P>
      <P>This is the settled content of an open modal dialog.</P>
      <HStack gap='sm' justify='end'>
        <Button variant='outlined'>Cancel</Button>
        <Button>Confirm</Button>
      </HStack>
    </VStack>
  </div>
)

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  args: {
    'isOpen': true,
    'aria-label': 'Example modal',
    'size': 'md',
    'variant': 'center',
    'children': Content,
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg', 'xl', '2xl'] },
    variant: { control: 'select', options: ['center', 'drawer', 'mobile-drawer', 'mobile-popover'] },
    isDismissable: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Modal>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

// Overlay modals fill the viewport, so a single open instance is snapshotted
// rather than a stacked grid of sizes/variants.
export const Open: Story = {
  parameters: { chromatic: { viewports: [1280] } },
}
