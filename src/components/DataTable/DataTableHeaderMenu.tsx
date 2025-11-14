import { Button } from '@ui/Button/Button'
import { ReactNode, useCallback } from 'react'
import { MenuIcon, ChevronRight } from 'lucide-react'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'
import { Spacer, VStack } from '@ui/Stack/Stack'

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
}

interface DataTableHeaderMenuItemProps {
  item: DataTableHeaderMenuItem
}

const DataTableHeaderMenuItemComponent = ({
  item,
}: DataTableHeaderMenuItemProps) => {
  return (
    <MenuItem key={item.key} onClick={item.onClick}>
      <VStack className='Layer__data-table__header-menu__icon'>
        {item.icon}
      </VStack>
      <Span size='sm'>{item.label}</Span>
      <Spacer />
      <ChevronRight size={12} />
    </MenuItem>
  )
}

export const DataTableHeaderMenu = ({ ariaLabel, items, isDisabled }: DataTableHeaderMenuProps) => {
  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined' isDisabled={isDisabled}>
        <MenuIcon size={14} />
      </Button>
    )
  }, [isDisabled])

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

