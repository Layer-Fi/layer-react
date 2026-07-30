import { type Meta, type StoryObj } from '@storybook/react-vite'
import { Briefcase, ChevronRight, FileText, MenuIcon, MoreHorizontal, Settings } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const Trigger = (props: React.ComponentProps<typeof Button>) => (
  <Button icon variant='ghost' {...props}><MoreHorizontal size={18} /></Button>
)

const OutlinedTrigger = (props: React.ComponentProps<typeof Button>) => (
  <Button icon variant='outlined' {...props}><MenuIcon size={14} /></Button>
)

const ICON_ITEMS = [
  { key: 'reports', label: 'Reports', Icon: FileText },
  { key: 'services', label: 'Services', Icon: Briefcase },
  { key: 'settings', label: 'Settings', Icon: Settings },
]

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

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 300 } },
  render: () => (
    <Gallery direction='row' gap={240} minBlockSize={300}>
      <Col label='default' align='center'>
        <DropdownMenu ariaLabel='Default' slots={{ Trigger }} defaultOpen>
          <MenuList>
            <MenuItem onClick={() => {}}>Edit</MenuItem>
            <MenuItem onClick={() => {}}>Duplicate</MenuItem>
            <MenuItem isDisabled onClick={() => {}}>Archive</MenuItem>
          </MenuList>
        </DropdownMenu>
      </Col>
      <Col label='compact' align='center'>
        <DropdownMenu ariaLabel='Compact' variant='compact' slots={{ Trigger }} defaultOpen>
          <MenuList>
            <MenuItem onClick={() => {}}>Edit</MenuItem>
            <MenuItem onClick={() => {}}>Duplicate</MenuItem>
            <MenuItem isDisabled onClick={() => {}}>Archive</MenuItem>
          </MenuList>
        </DropdownMenu>
      </Col>
      <Col label='with icons and a dialog width' align='center'>
        <DropdownMenu
          ariaLabel='With icons'
          slots={{ Trigger: OutlinedTrigger }}
          slotProps={{ Dialog: { width: 250 } }}
          defaultOpen
        >
          <MenuList>
            {ICON_ITEMS.map(({ key, label, Icon }) => (
              <MenuItem key={key} onClick={() => {}}>
                <VStack>
                  <Icon size={16} strokeWidth={1.5} />
                </VStack>
                <Span size='sm'>{label}</Span>
                <Spacer />
                <ChevronRight size={12} />
              </MenuItem>
            ))}
          </MenuList>
        </DropdownMenu>
      </Col>
    </Gallery>
  ),
}
