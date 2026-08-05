import { CornerDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import type { NestedCategorization } from '@schemas/features/categorization/nestedCategorization'
import { getResolvedCategoryName } from '@utils/features/categorization/categories'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { BadgeVariant } from '@ui/Badge/Badge'
import { Span } from '@ui/Typography/Text'
import { MobileListItemContent } from '@blocks/MobileList/MobileListItemContent'
import { MobileListItemStatusFooter } from '@blocks/MobileList/MobileListItemStatusFooter'
import { getCategorizationRuleAmountLabel, getCategorizationRuleCounterpartyLabel, getCategorizationRuleDirectionLabel } from '@features/categorization/utils'

export const CategorizationRuleMobileListItem = ({ rule }: { rule: CategorizationRule }) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const conditions = [
    getCategorizationRuleDirectionLabel(rule.bankDirectionFilter, t),
    ...(rule.amountMinFilter != null || rule.amountMaxFilter != null
      ? [getCategorizationRuleAmountLabel(rule, formatCurrencyFromCents, t)]
      : []),
  ].join(' · ')

  return (
    <MobileListItemContent title={getCategorizationRuleCounterpartyLabel(rule) ?? ''}>
      <Span size='sm' variant='subtle' ellipsis>{conditions}</Span>
    </MobileListItemContent>
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
    <MobileListItemStatusFooter
      variant={BadgeVariant.NEUTRAL}
      text={categoryName ?? t('categorization:CategorizationRulesMobileList.label.suggests_category', 'Suggests a category')}
      slots={{ Icon: CornerDownRight }}
    />
  )
}
