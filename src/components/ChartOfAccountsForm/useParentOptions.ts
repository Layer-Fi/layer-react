import { useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { BaseSelectOption } from '../../types/general'
import { LedgerBalancesSchemaType } from '../../../src/schemas/generalLedger/ledgerAccount'

export const useParentOptions = (
  data?: LedgerBalancesSchemaType,
): BaseSelectOption[] =>
  useMemo(
    () =>
      flattenAccounts(Array.from(data?.accounts || []))
        .sort((a, b) => (a?.name && b?.name ? a.name.localeCompare(b.name) : 0))
        .map((x) => {
          return {
            label: x.name,
            value: x.accountId,
          }
        }),
    [data?.accounts?.length],
  )
