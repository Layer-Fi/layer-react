import { useCallback } from 'react'
import { ChevronRight, MenuIcon } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, type DropdownMenuItem, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Spacer, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dataTableHeaderMenu.scss'

interface DataTableHeaderMenuProps {
  ariaLabel: string
  items: DropdownMenuItem[]
  isDisabled?: boolean
  isPending?: boolean
  slots?: {
    Icon?: React.FC
  }
}

interface DataTableHeaderMenuItemProps {
  item: DropdownMenuItem
}

const DataTableHeaderMenuItemComponent = ({
  item,
}: DataTableHeaderMenuItemProps) => {
  const { Icon } = item.slots ?? {}
  return (
    <MenuItem key={item.key} onClick={item.onClick}>
      {Icon && (
        <VStack className='Layer__DataTableHeaderMenu__Icon'>
          <Icon size={16} strokeWidth={1.5} />
        </VStack>
      )}
      <Span size='sm'>{item.label}</Span>
      <Spacer />
      <ChevronRight size={12} />
    </MenuItem>
  )
}

export const DataTableHeaderMenu = ({ ariaLabel, items, isDisabled, isPending, slots }: DataTableHeaderMenuProps) => {
  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined' isDisabled={isDisabled} isPending={isPending}>
        {slots?.Icon ? <slots.Icon /> : <MenuIcon size={14} />}
      </Button>
    )
  }, [isDisabled, isPending, slots])

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
