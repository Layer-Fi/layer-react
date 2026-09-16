import type { TFunction } from 'i18next'

import type { CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import { BankDirectionFilter } from '@schemas/features/categorization/categorizationRuleFilters'
import { translationKey } from '@utils/shared/i18n/translationKey'

export const DIRECTION_CONFIG = [
  { value: BankDirectionFilter.MONEY_IN, ...translationKey('categorization:utils.label.money_in', 'Money In') },
  { value: BankDirectionFilter.MONEY_OUT, ...translationKey('categorization:utils.label.money_out', 'Money Out') },
] as const

export const getCategorizationRuleDirectionLabel = (
  bankDirectionFilter: BankDirectionFilter | null | undefined,
  t: TFunction,
): string => {
  if (!bankDirectionFilter) {
    return t('categorization:utils.label.any_direction', 'Any direction')
  }
  const entry = DIRECTION_CONFIG.find(c => c.value === bankDirectionFilter)
  return entry ? t(entry.i18nKey, entry.defaultValue) : t('categorization:utils.label.any_direction', 'Any direction')
}

export const getCategorizationRuleCounterpartyLabel = (rule: CategorizationRule): string | undefined => {
  return rule.counterpartyFilter?.name ?? rule.readableTransactionDescriptionFilter ?? undefined
}

export const getCategorizationRuleAmountLabel = (
  rule: Pick<CategorizationRule, 'amountMinFilter' | 'amountMaxFilter'>,
  formatCurrencyFromCents: (cents: number) => string,
  t: TFunction,
): string => {
  const { amountMinFilter: min, amountMaxFilter: max } = rule
  if (min == null && max == null) {
    return t('categorization:utils.label.any_amount', 'Any amount')
  }
  if (min != null && max != null) {
    return `${formatCurrencyFromCents(min)} – ${formatCurrencyFromCents(max)}`
  }
  if (min != null) {
    return `≥ ${formatCurrencyFromCents(min)}`
  }
  return `≤ ${formatCurrencyFromCents(max as number)}`
}
