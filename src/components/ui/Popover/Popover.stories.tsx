import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Dialog, DialogTrigger } from 'react-aria-components/Dialog'

import { Button } from '@ui/Button/Button'
import { Popover } from '@ui/Popover/Popover'
import { P } from '@ui/Typography/Text'

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
}

export default meta

type Story = StoryObj<typeof Popover>

const body = (
  <Dialog aria-label='Details' style={{ padding: 16 }}>
    <P>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</P>
  </Dialog>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ padding: 24 }}>
      <DialogTrigger defaultOpen>
        <Button variant='outlined'>Open popover</Button>
        <Popover>{body}</Popover>
      </DialogTrigger>
    </div>
  ),
}
