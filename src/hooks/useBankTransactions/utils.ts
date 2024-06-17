import { BankTransaction } from '../../types'
import { AccountItem, NumericRangeFilter } from './types'

export const applyAmountFilter = (
  data?: BankTransaction[],
  filter?: NumericRangeFilter,
) => {
  return data?.filter(x => {
    if (
      (filter?.min || filter?.min === 0) &&
      (filter?.max || filter?.max === 0)
    ) {
      return x.amount >= filter.min * 100 && x.amount <= filter.max * 100
    }

    if (filter?.min || filter?.min === 0) {
      return x.amount >= filter.min * 100
    }

    if (filter?.max || filter?.max === 0) {
      return x.amount <= filter.max * 100
    }
  })
}

export const collectAccounts = (transactions?: BankTransaction[]) => {
  const accounts: AccountItem[] = []
  if (!transactions) {
    return accounts
  }

  transactions.forEach(x => {
    if (!accounts.find(y => y.id === x.source_account_id)) {
      accounts.push({
        id: x.source_account_id,
        name: x.account_name || '',
      })
    }
  })

  return accounts.sort((a, b) => a.name.localeCompare(b.name))
}