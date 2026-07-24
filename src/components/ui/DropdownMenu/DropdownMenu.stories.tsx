import { type Meta, type StoryObj } from '@storybook/react-vite'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'

const Trigger = (props: React.ComponentProps<typeof Button>) => (
  <Button icon variant='ghost' {...props}><MoreHorizontal size={18} /></Button>
)

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  args: {
    ariaLabel: 'Actions',
    slots: { Trigger },
    children: (
      <MenuList>
        <MenuItem onClick={() => {}}>Edit</MenuItem>
        <MenuItem onClick={() => {}}>Duplicate</MenuItem>
        <MenuItem isDisabled onClick={() => {}}>Archive</MenuItem>
      </MenuList>
    ),
  },
  argTypes: {
    variant: { control: 'select', options: [undefined, 'compact'] },
  },
}

export default meta

type Story = StoryObj<typeof DropdownMenu>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Col = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
    <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    {children}
  </div>
)

// MenuTrigger open state is not settable via props here, so the gallery shows
// closed triggers.
export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24 }}>
      <Col label='default'>
        <DropdownMenu ariaLabel='Default' slots={{ Trigger }}>
          <MenuList>
            <MenuItem onClick={() => {}}>Edit</MenuItem>
            <MenuItem onClick={() => {}}>Duplicate</MenuItem>
          </MenuList>
        </DropdownMenu>
      </Col>
      <Col label='compact'>
        <DropdownMenu ariaLabel='Compact' variant='compact' slots={{ Trigger }}>
          <MenuList>
            <MenuItem onClick={() => {}}>Edit</MenuItem>
            <MenuItem onClick={() => {}}>Duplicate</MenuItem>
          </MenuList>
        </DropdownMenu>
      </Col>
    </div>
  ),
}
