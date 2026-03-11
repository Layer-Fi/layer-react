import i18next from 'i18next'

import { BankDirectionFilter } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

const DIRECTION_LABELS: Record<BankDirectionFilter, string> = {
  [BankDirectionFilter.MONEY_IN]: i18next.t('moneyIn', 'Money In'),
  [BankDirectionFilter.MONEY_OUT]: i18next.t('moneyOut', 'Money Out'),
}

export const getCategorizationRuleDirectionLabel = (
  bankDirectionFilter: BankDirectionFilter | null | undefined,
) => {
  if (!bankDirectionFilter) {
    return i18next.t('anyDirection', 'Any direction')
  }
  return DIRECTION_LABELS[bankDirectionFilter]
}
