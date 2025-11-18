import { useMemo } from 'react'

import { type BaseSelectOption } from '@internal-types/general'
import { type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { flattenAccounts } from '@hooks/useChartOfAccounts/useChartOfAccounts'

export const useParentOptions = (
  data?: LedgerBalancesSchemaType,
): BaseSelectOption[] =>
  useMemo(
    () =>
      flattenAccounts(data?.accounts || [])
        .sort((a, b) => (a?.name && b?.name ? a.name.localeCompare(b.name) : 0))
        .map((x) => {
          return {
            label: x.name,
            value: x.accountId,
          }
        }),
    [data?.accounts],
  )
