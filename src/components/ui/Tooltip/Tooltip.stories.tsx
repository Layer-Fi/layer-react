import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={{ padding: 80 }}>
      <Tooltip>
        <TooltipTrigger>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 120, padding: 80 }}>
      <Tooltip>
        <TooltipTrigger>
          <Button>Closed</Button>
        </TooltipTrigger>
        <TooltipContent>Hidden until hover</TooltipContent>
      </Tooltip>
      <Tooltip isInitiallyOpen>
        <TooltipTrigger>
          <Button>Open</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip shown open</TooltipContent>
      </Tooltip>
    </div>
  ),
}
