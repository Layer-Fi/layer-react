import { createContext, type PropsWithChildren, useContext } from 'react'
import classNames from 'classnames'
import { type LucideIcon } from 'lucide-react'
import type React from 'react'
import { Dialog } from 'react-aria-components/Dialog'
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger,
  Popover,
} from 'react-aria-components/Menu'
import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './dropdownMenu.scss'

type DropdownMenuContextValue = {
  variant?: 'compact'
}

const DropdownMenuContext = createContext<DropdownMenuContextValue>({})

const useDropdownMenu = () => useContext(DropdownMenuContext)

const DropdownMenuProvider = DropdownMenuContext.Provider

type DropdownMenuProps = PropsWithChildren<{
  className?: string
  /** Extra class for the popover, so one usage can keep a name it shipped under. */
  popoverClassName?: string
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
  defaultOpen?: boolean
}>

export type DropdownMenuItem = {
  key: string
  label: string
  onClick: () => void
  isDisabled?: boolean
  slots?: {
    Icon?: LucideIcon
  }
}

type MenuItemProps = PropsWithChildren<{
  isDisabled?: boolean
  onClick?: () => void
  className?: string
}>

export const MenuItem = ({ children, onClick, isDisabled, className }: MenuItemProps) => {
  const { variant } = useDropdownMenu()
  const dataProps = toDataProperties({ variant })

  return (
    <AriaMenuItem
      onAction={onClick}
      isDisabled={isDisabled}
      className={classNames('Layer__UI__DropdownMenu__MenuItem', className)}
      {...dataProps}
    >
      {children}
    </AriaMenuItem>
  )
}

export const MenuList = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  const { variant } = useDropdownMenu()
  const dataProps = toDataProperties({ variant })

  return (
    <AriaMenu className={classNames('Layer__UI__DropdownMenu__Menu', className)} {...dataProps}>
      {children}
    </AriaMenu>
  )
}

export const DropdownMenu = ({ children, ariaLabel, variant, slots, slotProps, defaultOpen, popoverClassName }: DropdownMenuProps) => {
  const { t } = useTranslation()
  const { Trigger } = slots
  const width = slotProps?.Dialog?.width
  const dataProps = toDataProperties({ variant })

  return (
    <MenuTrigger defaultOpen={defaultOpen}>
      <Trigger aria-label={t('ui:DropdownMenu.label.menu', 'Menu')} />
      <Popover placement='bottom right' className={classNames('Layer__UI__DropdownMenu__Popover Layer__variables', popoverClassName)}>
        <Dialog className='Layer__UI__DropdownMenu__Dialog' aria-label={ariaLabel} style={{ width }} {...dataProps}>
          <DropdownMenuProvider value={{ variant }}>
            {children}
          </DropdownMenuProvider>
        </Dialog>
      </Popover>
    </MenuTrigger>
  )
}
