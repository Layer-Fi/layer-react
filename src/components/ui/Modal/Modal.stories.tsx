import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  args: {
    'isOpen': true,
    'aria-label': 'Example modal',
    'size': 'md',
    'variant': 'center',
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg', 'xl', '2xl'] },
    variant: { control: 'select', options: ['center', 'drawer', 'mobile-drawer', 'mobile-popover'] },
    isDismissable: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Modal>

// Overlay modals fill the viewport, so a single open instance is snapshotted.
// Composed from the Modal subcomponents (title/close, content, actions).
export const Open: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Modal {...args}>
      <ModalTitleWithClose
        heading={<ModalHeading>Confirm action</ModalHeading>}
        description={<Heading level={3} size='xs' variant='subtle' weight='normal'>This cannot be undone.</Heading>}
      />
      <ModalContent>
        <P>This is the settled content of an open modal dialog, composed from the Modal subcomponents.</P>
      </ModalContent>
      <ModalActions>
        <HStack justify='space-between'>
          <Button status='danger' variant='outlined'>Delete</Button>
          <HStack gap='xs'>
            <Button variant='outlined'>Cancel</Button>
            <Button>Confirm</Button>
          </HStack>
        </HStack>
      </ModalActions>
    </Modal>
  ),
}
