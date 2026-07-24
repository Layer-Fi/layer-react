import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 80, padding: 80 }}>
      <Tooltip>
        <TooltipTrigger>
          <Button variant='outlined'>Closed</Button>
        </TooltipTrigger>
        <TooltipContent>Hidden until hover</TooltipContent>
      </Tooltip>
      <Tooltip isInitiallyOpen>
        <TooltipTrigger>
          <Button variant='outlined'>Open</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip shown open</TooltipContent>
      </Tooltip>
    </div>
  ),
}
