import { type ReactNode, useCallback } from 'react'
import { CircleAlert } from 'lucide-react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Pill } from '@ui/Pill/Pill'
import { Span } from '@ui/Typography/Text'

const legacyClassNames = createLegacyClassNames({
  'menu:popover': 'Layer__linked-accounts__options-menu',
  'Layer__UI__DropdownMenu__Menu': ['Layer__hover-menu__list', 'Layer__linked-accounts__options-menu-list'],
  'Layer__UI__DropdownMenu__MenuItem': [
    'Layer__hover-menu__list-item',
    'Layer__hover-menu__list-item-button',
    'Layer__linked-accounts__options-menu-item',
  ],
})

type LinkedAccountPillProps = {
  label: string
  items: ReadonlyArray<{
    action: () => void
    name: string
  }>
  status?: 'error' | 'success'
  icon?: ReactNode
}

export function LinkedAccountPill({
  label,
  items,
  status = 'error',
  icon,
}: LinkedAccountPillProps) {
  const Trigger = useCallback(() => (
    <Pill status={status}>
      {icon ?? <CircleAlert size={14} />}
      {label}
    </Pill>
  ), [icon, label, status])

  const [soleItem] = items
  if (soleItem && items.length === 1) {
    return (
      <Pill status={status} onPress={soleItem.action}>
        {icon ?? <CircleAlert size={14} />}
        {label}
      </Pill>
    )
  }

  return (
    <DropdownMenu ariaLabel={label} slots={{ Trigger }} variant='compact' popoverClassName={legacyClassNames('menu:popover')}>
      <MenuList className={legacyClassNames('Layer__UI__DropdownMenu__Menu')}>
        {items.map(({ action, name }, index) => (
          <MenuItem key={index} onClick={action} className={legacyClassNames('Layer__UI__DropdownMenu__MenuItem')}>
            <Span slot='label' size='sm'>
              {name}
            </Span>
          </MenuItem>
        ))}
      </MenuList>
    </DropdownMenu>
  )
}
