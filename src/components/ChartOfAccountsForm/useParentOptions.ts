import { useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { BaseSelectOption } from '../../types/general'
import { LedgerBalances } from '../../schemas/generalLedger/ledgerAccount'

export const useParentOptions = (
  data?: LedgerBalances,
): BaseSelectOption[] =>
  useMemo(
    () => {
      const flattened = flattenAccounts(data?.accounts || [])
      return flattened
        .map((x) => {
          return {
            label: x.name,
            value: x.id,
          }
        })
        .sort((a, b) => (a?.label && b?.label ? a.label.localeCompare(b.label) : 0))
    },
    [data?.accounts],
  )
