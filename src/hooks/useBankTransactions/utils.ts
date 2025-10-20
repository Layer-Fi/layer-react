import { filterVisibility } from '../../components/BankTransactions/utils'
import { BankTransaction, DisplayState } from '../../types/bank_transactions'
import { AccountItem, NumericRangeFilter } from './types'

export const collectAccounts = (transactions?: BankTransaction[]) => {
  const accounts: AccountItem[] = []
  if (!transactions) {
    return accounts
  }

  transactions.forEach((x) => {
    if (!accounts.find(y => y.id === x.source_account_id)) {
      accounts.push({
        id: x.source_account_id,
        name: x.account_name || '',
      })
    }
  })

  return accounts.sort((a, b) => a.name.localeCompare(b.name))
}

export const uniqAccountsList = (arr: AccountItem[], track = new Set()) =>
  arr.filter(({ id }) => (track.has(id) ? false : track.add(id)))

export const applyAmountFilter = (
  data?: BankTransaction[],
  filter?: NumericRangeFilter,
) => {
  return data?.filter((x) => {
    if (
      (filter?.min || filter?.min === 0)
      && (filter?.max || filter?.max === 0)
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

export const applyAccountFilter = (
  data?: BankTransaction[],
  filter?: string[],
) => data?.filter(x => filter && filter.includes(x.source_account_id))

export const applyCategorizationStatusFilter = (
  data?: BankTransaction[],
  filter?: DisplayState,
) => {
  if (!filter) {
    return data
  }

  return data?.filter(
    tx =>
      filterVisibility(filter, tx)
      || filter === DisplayState.all
      || (filter === DisplayState.review && tx.recently_categorized)
      || (filter === DisplayState.categorized && tx.recently_categorized),
  )
}
