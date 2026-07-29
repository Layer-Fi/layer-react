import { useCallback } from 'react'
import { EllipsisVertical, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'

export type MobileListItemAction = {
  key: string
  label: string
  icon: LucideIcon
  onClick: () => void
  isDisabled?: boolean
}

type MobileListItemActionsMenuProps = {
  ariaLabel: string
  actions: ReadonlyArray<MobileListItemAction>
}

export const MobileListItemActionsMenu = ({ ariaLabel, actions }: MobileListItemActionsMenuProps) => {
  const { t } = useTranslation()

  const Trigger = useCallback(() => (
    <Button icon variant='ghost' aria-label={t('common:label.more_options', 'More options')}>
      <EllipsisVertical size={18} />
    </Button>
  ), [t])

  return (
    <DropdownMenu ariaLabel={ariaLabel} slots={{ Trigger }} variant='compact'>
      <MenuList>
        {actions.map(({ key, label, icon: Icon, onClick, isDisabled }) => (
          <MenuItem key={key} onClick={onClick} isDisabled={isDisabled}>
            <Icon size={16} />
            <Span size='md'>{label}</Span>
          </MenuItem>
        ))}
      </MenuList>
    </DropdownMenu>
  )
}
