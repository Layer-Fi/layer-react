import { useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { ChartWithBalances } from '../../types/chart_of_accounts'
import { BaseSelectOption } from '../../types/general'

export const useParentOptions = (
  data?: ChartWithBalances,
): BaseSelectOption[] =>
  useMemo(
    () =>
      flattenAccounts(data?.accounts || [])
        .sort((a, b) => (a?.name && b?.name ? a.name.localeCompare(b.name) : 0))
        .map(x => {
          return {
            label: x.name,
            value: x.id,
          }
        }),
    [data?.accounts?.length],
  )
