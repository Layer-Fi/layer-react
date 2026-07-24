import { type Meta, type StoryObj } from '@storybook/react-vite'
import { MenuTrigger, Popover } from 'react-aria-components/Menu'

import { Button } from '@ui/Button/Button'
import { Menu, MenuItem } from '@ui/Menu/Menu'

const meta: Meta<typeof Menu> = {
  title: 'UI/Menu',
  component: Menu,
}

export default meta

type Story = StoryObj<typeof Menu>

const items = ['Rename', 'Move', 'Delete']

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <MenuTrigger>
      <Button variant='outlined'>Open menu</Button>
      <Popover>
        <Menu>
          {items.map(item => <MenuItem key={item} textValue={item}>{item}</MenuItem>)}
        </Menu>
      </Popover>
    </MenuTrigger>
  ),
}

// defaultOpen renders the settled open state for the snapshot.
export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ padding: 24 }}>
      <MenuTrigger defaultOpen>
        <Button variant='outlined'>Open menu</Button>
        <Popover>
          <Menu>
            {items.map(item => <MenuItem key={item} textValue={item}>{item}</MenuItem>)}
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  ),
}
