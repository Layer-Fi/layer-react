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

// Strip Java-style `\Q...\E` literal-quote markers from a regex-based
// transaction_description_filter so it reads as plain text. Only strips when
// the whole filter is a single `\Q...\E` block — anything more elaborate falls
// through unchanged so we don't silently hide unquoted regex parts.
export const parseTransactionDescriptionFilter = (filter: string): string => {
  return filter.match(/^\\Q(.*)\\E$/)?.[1] ?? filter
}

export const getCategorizationRuleCounterpartyLabel = (rule: CategorizationRule): string | undefined => {
  if (rule.counterpartyFilter?.name) return rule.counterpartyFilter.name
  if (rule.transactionDescriptionFilter) return parseTransactionDescriptionFilter(rule.transactionDescriptionFilter)
  return undefined
}
