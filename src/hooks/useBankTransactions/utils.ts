import { parseISO } from 'date-fns'
import { BankTransaction, DateRange, Direction } from '../../types'
import { AccountItem, NumericRangeFilter } from './types'

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

export const applyAccountFilter = (
  data?: BankTransaction[],
  filter?: string[],
) =>  data?.filter(x => filter && filter.includes(x.source_account_id))

export const applyDirectionFilter = (
  data?: BankTransaction[],
  filter?: Direction[],
) => {
  if (!filter) {
    return data
  }
  const normalizedFilter = filter.map(x => x.toLowerCase())

  return data?.filter(x => normalizedFilter.includes(x.direction?.toLowerCase()))
}

export const applyCategorizationStatusFilter = (
  data?: BankTransaction[],
  filter?: string[],
) => {
  if (!filter) {
    return data
  }
  const normalizedFilter = filter.map(x => x.toLowerCase())

  return data?.filter(x => normalizedFilter.includes(x.categorization_status?.toLowerCase()))
}

export const appplyDateRangeFilter = (
  data?: BankTransaction[],
  filter?: Partial<DateRange>,
) => {
  return data?.filter(x => {
    const txDate = parseISO(x.date)
    if (filter?.startDate && filter?.endDate) {
      return txDate >= filter.startDate && txDate <= filter.endDate
    }

    if (filter?.startDate) {
      return txDate >= filter.startDate
    }

    if (filter?.endDate) {
      return txDate <= filter.endDate
    }
  })
}