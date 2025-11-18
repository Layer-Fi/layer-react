import { type ReactNode, useCallback } from 'react'
import { ChevronRight, MenuIcon } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dataTableHeaderMenu.scss'

export interface DataTableHeaderMenuItem {
  key: string
  onClick: () => void
  icon: ReactNode
  label: string
}

interface DataTableHeaderMenuProps {
  ariaLabel: string
  items: DataTableHeaderMenuItem[]
  isDisabled?: boolean
  slots?: {
    Icon?: React.FC
  }
}

interface DataTableHeaderMenuItemProps {
  item: DataTableHeaderMenuItem
}

const DataTableHeaderMenuItemComponent = ({
  item,
}: DataTableHeaderMenuItemProps) => {
  return (
    <MenuItem key={item.key} onClick={item.onClick}>
      <VStack className='Layer__DataTableHeaderMenu__Icon'>
        {item.icon}
      </VStack>
      <Span size='sm'>{item.label}</Span>
      <Spacer />
      <ChevronRight size={12} />
    </MenuItem>
  )
}

export const DataTableHeaderMenu = ({ ariaLabel, items, isDisabled, slots }: DataTableHeaderMenuProps) => {
  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined' isDisabled={isDisabled}>
        {slots?.Icon ? <slots.Icon /> : <MenuIcon size={14} />}
      </Button>
    )
  }, [isDisabled, slots])

  return (
    <DropdownMenu
      ariaLabel={ariaLabel}
      slots={{ Trigger }}
      slotProps={{ Dialog: { width: 250 } }}
    >
      <MenuList>
        {items.map(item => (
          <DataTableHeaderMenuItemComponent key={item.key} item={item} />
        ))}
      </MenuList>
    </DropdownMenu>
  )
}
