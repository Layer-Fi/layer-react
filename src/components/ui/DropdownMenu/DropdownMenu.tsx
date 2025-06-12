import React, { PropsWithChildren } from 'react'
import { Menu, MenuItem as AriaMenuItem, MenuTrigger, Popover, Separator as AriaSeparator, Header, Dialog } from 'react-aria-components'
import { Text, TextSize, TextWeight } from '../../Typography'

type DropdownMenuProps = PropsWithChildren<{
  className?: string
  ariaLabel?: string
  slots: {
    Trigger: React.FC
  }
  slotProps?: {
    Dialog?: {
      width?: number | string
    }
  }
}>

type MenuItemProps = PropsWithChildren<{
  isDisabled?: boolean
  onClick?: () => void
}>

export const Heading = ({ children }: PropsWithChildren) => (
  <Header>
    <Text size={TextSize.sm} weight={TextWeight.bold} className='Layer__dropdown-menu__menu-item__heading'>
      {children}
    </Text>
  </Header>
)

export const Separator = () => (
  <AriaSeparator className='Layer__dropdown-menu__separator Layer__variables' />
)

export const MenuItem = ({ children, onClick, isDisabled }: MenuItemProps) => (
  <AriaMenuItem onAction={onClick} isDisabled={isDisabled} className='Layer__dropdown-menu__menu-item'>
    {children}
  </AriaMenuItem>
)

export const MenuList = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => (
  <Menu className='Layer__dropdown-menu__menu-list'>
    {children}
  </Menu>
)

export const DropdownMenu = ({ children, ariaLabel, slots, slotProps }: DropdownMenuProps) => {
  const { Trigger } = slots
  const width = slotProps?.Dialog?.width

  return (
    <MenuTrigger>
      <Trigger aria-label='Menu' />
      <Popover placement='bottom right' className='Layer__dropdown-menu__popover Layer__variables'>
        <Dialog className='Layer__dropdown-menu__menu' aria-label={ariaLabel} style={{ width }}>
          {children}
        </Dialog>
      </Popover>
    </MenuTrigger>
  )
}
