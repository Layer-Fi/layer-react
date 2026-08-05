import { useMemo } from 'react'

import { type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerBalances'
import { flattenAccounts } from '@features/generalLedger/utils'

type BaseSelectOption = {
  label: string
  value: string | number
}

const isAlphanumeric = (char: string) => /[\p{L}\p{N}]/u.test(char)

const compareSpecialCharsLast = (a: string, b: string): number => {
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    const aSpecial = !isAlphanumeric(a[i])
    const bSpecial = !isAlphanumeric(b[i])
    if (aSpecial !== bSpecial) {
      return aSpecial ? 1 : -1
    }
    const comparison = a[i].localeCompare(b[i])
    if (comparison !== 0) {
      return comparison
    }
  }
  return a.length - b.length
}

export const useParentAccountOptions = (
  data?: LedgerBalancesSchemaType,
): BaseSelectOption[] =>
  useMemo(() => flattenAccounts(data?.accounts || [])
    .sort((a, b) => a?.name && b?.name ? compareSpecialCharsLast(a.name, b.name) : 0)
    .map(x => ({ label: x.name, value: x.accountId })),
  [data?.accounts],
  )
