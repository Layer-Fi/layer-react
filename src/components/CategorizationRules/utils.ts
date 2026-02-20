import { BankDirectionFilter } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

const DIRECTION_LABELS: Record<BankDirectionFilter, string> = {
  [BankDirectionFilter.MONEY_IN]: 'Money In',
  [BankDirectionFilter.MONEY_OUT]: 'Money Out',
}

export const getCategorizationRuleDirectionLabel = (
  bankDirectionFilter: BankDirectionFilter | null | undefined,
) => {
  if (!bankDirectionFilter) {
    return 'Any direction'
  }
  return DIRECTION_LABELS[bankDirectionFilter]
}
