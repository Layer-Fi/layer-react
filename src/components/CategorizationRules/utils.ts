import type { TFunction } from 'i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { BankDirectionFilter } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { translationKey } from '@utils/i18n/translationKey'

export const DIRECTION_CONFIG = [
  { value: BankDirectionFilter.MONEY_IN, ...translationKey('categorizationRules:label.money_in', 'Money In') },
  { value: BankDirectionFilter.MONEY_OUT, ...translationKey('categorizationRules:label.money_out', 'Money Out') },
] as const

export const getCategorizationRuleDirectionLabel = (
  bankDirectionFilter: BankDirectionFilter | null | undefined,
  t: TFunction,
): string => {
  if (!bankDirectionFilter) {
    return t('categorizationRules:label.any_direction', 'Any direction')
  }
  const entry = DIRECTION_CONFIG.find(c => c.value === bankDirectionFilter)
  return entry ? t(entry.i18nKey, entry.defaultValue) : t('categorizationRules:label.any_direction', 'Any direction')
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
    return t('categorizationRules:label.any_amount', 'Any amount')
  }
  if (min != null && max != null) {
    return t('categorizationRules:label.amount_range', '{{min}} – {{max}}', {
      min: formatCurrencyFromCents(min),
      max: formatCurrencyFromCents(max),
    })
  }
  if (min != null) {
    return t('categorizationRules:label.amount_at_least', '≥ {{amount}}', {
      amount: formatCurrencyFromCents(min),
    })
  }
  return t('categorizationRules:label.amount_at_most', '≤ {{amount}}', {
    amount: formatCurrencyFromCents(max as number),
  })
}
