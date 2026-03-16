import type { TFunction } from 'i18next'

import { BankDirectionFilter } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { translationKey } from '@utils/i18n/translationKey'

export const DIRECTION_CONFIG = [
  { value: BankDirectionFilter.MONEY_IN, ...translationKey('categorizationRules.moneyIn', 'Money In') },
  { value: BankDirectionFilter.MONEY_OUT, ...translationKey('categorizationRules.moneyOut', 'Money Out') },
] as const

export const getCategorizationRuleDirectionLabel = (
  bankDirectionFilter: BankDirectionFilter | null | undefined,
  t: TFunction,
): string => {
  if (!bankDirectionFilter) {
    return t('categorizationRules.anyDirection', 'Any direction')
  }
  const entry = DIRECTION_CONFIG.find(c => c.value === bankDirectionFilter)
  return entry ? t(entry.i18nKey, entry.defaultValue) : t('categorizationRules.anyDirection', 'Any direction')
}
