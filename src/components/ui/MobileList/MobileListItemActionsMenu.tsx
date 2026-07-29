import { useCallback } from 'react'
import { EllipsisVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, type DropdownMenuItem, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'

export type MobileListItemActionsMenuConfig<TData> = {
  ariaLabel: string
  getActions: (item: TData) => ReadonlyArray<DropdownMenuItem>
}

type MobileListItemActionsMenuProps = {
  ariaLabel: string
  actions: ReadonlyArray<DropdownMenuItem>
}

export const MobileListItemActionsMenu = ({ ariaLabel, actions }: MobileListItemActionsMenuProps) => {
  const { t } = useTranslation()

  const Trigger = useCallback(() => (
    <Button icon inset variant='ghost' aria-label={t('common:label.more_options', 'More options')}>
      <EllipsisVertical size={18} />
    </Button>
  ), [t])

  return (
    <DropdownMenu ariaLabel={ariaLabel} slots={{ Trigger }} variant='compact'>
      <MenuList>
        {actions.map(({ key, label, onClick, isDisabled, slots }) => (
          <MenuItem key={key} onClick={onClick} isDisabled={isDisabled}>
            {slots?.Icon && <slots.Icon size={14} />}
            <Span size='sm'>{label}</Span>
          </MenuItem>
        ))}
      </MenuList>
    </DropdownMenu>
  )
}
