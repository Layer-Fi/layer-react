import { createContext, type PropsWithChildren, useContext } from 'react'
import type React from 'react'
import { Dialog, Menu as AriaMenu, MenuItem as AriaMenuItem, MenuTrigger, Popover } from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './dropdownMenu.scss'

type DropdownMenuContextValue = {
  variant?: 'compact'
}

const DropdownMenuContext = createContext<DropdownMenuContextValue>({})

const useDropdownMenu = () => useContext(DropdownMenuContext)

const DropdownMenuProvider = DropdownMenuContext.Provider

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
  variant?: 'compact'
}>

type MenuItemProps = PropsWithChildren<{
  isDisabled?: boolean
  onClick?: () => void
}>

export const MenuItem = ({ children, onClick, isDisabled }: MenuItemProps) => {
  const { variant } = useDropdownMenu()
  const dataProps = toDataProperties({ variant })

  return (
    <AriaMenuItem
      onAction={onClick}
      isDisabled={isDisabled}
      className='Layer__UI__DropdownMenu__MenuItem'
      {...dataProps}
    >
      {children}
    </AriaMenuItem>
  )
}

export const MenuList = ({ children }: PropsWithChildren) => {
  const { variant } = useDropdownMenu()
  const dataProps = toDataProperties({ variant })

  return (
    <AriaMenu className='Layer__UI__DropdownMenu__Menu' {...dataProps}>
      {children}
    </AriaMenu>
  )
}

export const DropdownMenu = ({ children, ariaLabel, variant, slots, slotProps }: DropdownMenuProps) => {
  const { Trigger } = slots
  const width = slotProps?.Dialog?.width
  const dataProps = toDataProperties({ variant })

  return (
    <MenuTrigger>
      <Trigger aria-label='Menu' />
      <Popover placement='bottom right' className='Layer__UI__DropdownMenu__Popover Layer__variables'>
        <Dialog className='Layer__UI__DropdownMenu__Dialog' aria-label={ariaLabel} style={{ width }} {...dataProps}>
          <DropdownMenuProvider value={{ variant }}>
            {children}
          </DropdownMenuProvider>
        </Dialog>
      </Popover>
    </MenuTrigger>
  )
}
