import { CircleAlert } from 'lucide-react'

import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Pill } from '@ui/Pill/Pill'
import { Span } from '@ui/Typography/Text'

type LinkedAccountPillProps = {
  label: string
  items: ReadonlyArray<{
    action: () => void
    name: string
  }>
}

export function LinkedAccountPill({ label, items }: LinkedAccountPillProps) {
  return (
    <DropdownMenu
      ariaLabel={label}
      slots={{
        Trigger: () => (
          <Pill status='error'>
            <CircleAlert size={14} />
            {label}
          </Pill>
        ),
      }}
    >
      <MenuList>
        {items.map(({ action, name }, index) => (
          <MenuItem key={index} onClick={action}>
            <Span slot='label' size='sm'>
              {name}
            </Span>
          </MenuItem>
        ))}
      </MenuList>
    </DropdownMenu>
  )
}
