import React, { useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { ChartOfAccounts } from '../../types'
import { BaseSelectOption } from '../../types/general'

export const useParentOptions = (data?: ChartOfAccounts): BaseSelectOption[] =>
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
