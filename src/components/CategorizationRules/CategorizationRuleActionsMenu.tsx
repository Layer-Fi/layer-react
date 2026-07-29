import { useCallback } from 'react'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { Span } from '@ui/Typography/Text'

type CategorizationRuleActionsMenuProps = {
  rule: CategorizationRule
  onEditPress: (rule: CategorizationRule) => void
  onDeletePress: (rule: CategorizationRule) => void
}

export const CategorizationRuleActionsMenu = ({
  rule,
  onEditPress,
  onDeletePress,
}: CategorizationRuleActionsMenuProps) => {
  const { t } = useTranslation()

  const Trigger = useCallback(() => (
    <Button icon variant='ghost' inset aria-label={t('common:label.more_options', 'More options')}>
      <EllipsisVertical size={16} />
    </Button>
  ), [t])

  return (
    <DropdownMenu
      ariaLabel={t('categorizationRules:label.rule_actions', 'Rule actions')}
      slots={{ Trigger }}
      variant='compact'
    >
      <MenuList>
        <MenuItem onClick={() => onEditPress(rule)}>
          <Pencil size={14} />
          <Span size='sm'>{t('categorizationRules:action.edit_rule', 'Edit Rule')}</Span>
        </MenuItem>
        <MenuItem onClick={() => onDeletePress(rule)}>
          <Trash2 size={14} />
          <Span size='sm'>{t('categorizationRules:action.delete_rule', 'Delete Rule')}</Span>
        </MenuItem>
      </MenuList>
    </DropdownMenu>
  )
}
