import { CornerDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { NestedCategorization } from '@schemas/categorization'
import { getResolvedCategoryName } from '@utils/categories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CategorizationRuleActionsMenu } from '@components/CategorizationRules/CategorizationRuleActionsMenu'
import { getCategorizationRuleAmountLabel, getCategorizationRuleCounterpartyLabel, getCategorizationRuleDirectionLabel } from '@components/CategorizationRules/utils'

import './categorizationRuleMobileListItem.scss'

const CONDITION_SEPARATOR = ' · '

type CategorizationRuleMobileListItemProps = {
  rule: CategorizationRule
  onEditPress: (rule: CategorizationRule) => void
  onDeletePress: (rule: CategorizationRule) => void
}

export const CategorizationRuleMobileListItem = ({
  rule,
  onEditPress,
  onDeletePress,
}: CategorizationRuleMobileListItemProps) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const conditions = [
    getCategorizationRuleDirectionLabel(rule.bankDirectionFilter, t),
    ...(rule.amountMinFilter != null || rule.amountMaxFilter != null
      ? [getCategorizationRuleAmountLabel(rule, formatCurrencyFromCents, t)]
      : []),
  ].join(CONDITION_SEPARATOR)

  return (
    <HStack fluid justify='space-between' align='start' gap='sm' className='Layer__CategorizationRuleMobileListItem'>
      <VStack gap='3xs' className='Layer__CategorizationRuleMobileListItem__Conditions'>
        <Span weight='bold' ellipsis>{getCategorizationRuleCounterpartyLabel(rule)}</Span>
        <Span size='sm' variant='subtle' ellipsis>{conditions}</Span>
      </VStack>
      <CategorizationRuleActionsMenu
        rule={rule}
        onEditPress={onEditPress}
        onDeletePress={onDeletePress}
      />
    </HStack>
  )
}

type CategorizationRuleMobileListItemFooterProps = {
  rule: CategorizationRule
  options: NestedCategorization[]
}

export const CategorizationRuleMobileListItemFooter = ({
  rule,
  options,
}: CategorizationRuleMobileListItemFooterProps) => {
  const { t } = useTranslation()
  const categoryName = rule.category ? getResolvedCategoryName(rule.category, options) : undefined

  return (
    <HStack align='center' gap='2xs' className='Layer__CategorizationRuleMobileListItem__Outcome'>
      <CornerDownRight size={14} className='Layer__CategorizationRuleMobileListItem__Outcome__Icon' />
      <Span weight='bold' size='sm' ellipsis>
        {categoryName ?? t('categorizationRules:label.suggests_category', 'Suggests a category')}
      </Span>
    </HStack>
  )
}
