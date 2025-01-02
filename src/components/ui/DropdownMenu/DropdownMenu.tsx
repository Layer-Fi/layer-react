import React from 'react'
import { Menu, MenuItem as AriaMenuItem, Button, MenuTrigger, Popover, Separator as AriaSeparator, Header, Dialog } from 'react-aria-components'
import CogIcon from '../../../icons/Cog'
import { Text, TextSize, TextWeight } from '../../Typography'

type DropdownMenuProps = {
  children: React.ReactNode[]
  ariaLabel?: string
}

type MenuItemProps = {
  children: React.ReactNode
  onClick?: () => void
}

type ActionableItemProps = {
  leftIcon?: React.ReactNode
  children: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: () => void
}

export const Heading = ({ children }: { children: React.ReactNode }) => {
  return (
    <Header>
      <Text size={TextSize.sm} weight={TextWeight.bold} className='Layer__dropdown-menu__actionable-item__heading'>
        {children}
      </Text>
    </Header>
  )
}

export const Separator = () => {
  return (
    <AriaSeparator className='Layer__dropdown-menu__separator' />
  )
}

export const ActionableItem = ({ leftIcon, children, rightIcon, onClick }: ActionableItemProps) => {
  return (
    <AriaMenuItem onAction={onClick} className='Layer__dropdown-menu__actionable-item'>
      {leftIcon && (
        <div className='Layer__dropdown-menu__actionable-item__left-icon'>
          {leftIcon}
        </div>
      )}
      <Text size={TextSize.sm} className='Layer__dropdown-menu__actionable-item__text'>
        {children}
      </Text>
      {rightIcon && (
        <div className='Layer__dropdown-menu__actionable-item__right-icon'>
          {rightIcon}
        </div>
      )}
    </AriaMenuItem>
  )
}

export const MenuList = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
  return (
    <Menu>
      {children}
    </Menu>
  )
}

export const MenuItem = ({ children, onClick }: MenuItemProps) => {
  return (
    <AriaMenuItem onAction={onClick}>{children}</AriaMenuItem>
  )
}

export const DropdownMenu = ({ children, ariaLabel }: DropdownMenuProps) => {
  return (
    <MenuTrigger>
      <Button aria-label='Menu' className='Layer__btn Layer__dropdown-btn'><CogIcon /></Button>
      <Popover placement='bottom right' className='Layer__dropdown-menu__popover Layer__variables'>
        <Dialog className='Layer__dropdown-menu__menu' aria-label={ariaLabel}>
          {children}
        </Dialog>
      </Popover>
    </MenuTrigger>
  )
}
