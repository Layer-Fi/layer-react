import { useMemo } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { type BaseSelectOption } from '@internal-types/general'
import type { OptionConfig } from '@components/ChartOfAccountsForm/constants'
import {
  ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  LEDGER_ACCOUNT_TYPES_CONFIG,
  LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
  NORMALITY_CONFIG,
  REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG,
} from '@components/ChartOfAccountsForm/constants'

const buildOptions = (config: OptionConfig[], t: TFunction): BaseSelectOption[] =>
  config.map(c => ({ value: c.value, label: t(c.i18nKey, c.defaultValue) }))

const buildLedgerAccountTypesOptions = (t: TFunction) =>
  buildOptions(LEDGER_ACCOUNT_TYPES_CONFIG, t)

export const buildNormalityOptions = (t: TFunction): BaseSelectOption[] =>
  NORMALITY_CONFIG.map(c => ({ value: c.value, label: t(c.i18nKey, c.defaultValue) }))

const buildLedgerAccountSubtypesForType = (t: TFunction): Record<string, BaseSelectOption[]> => ({
  ASSET: buildOptions(ASSET_LEDGER_ACCOUNT_SUBTYPES_CONFIG, t),
  LIABILITY: buildOptions(LIABILITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG, t),
  EQUITY: buildOptions(EQUITY_LEDGER_ACCOUNT_SUBTYPES_CONFIG, t),
  REVENUE: buildOptions(REVENUE_LEDGER_ACCOUNT_SUBTYPES_CONFIG, t),
  EXPENSE: buildOptions(EXPENSE_LEDGER_ACCOUNT_SUBTYPES_CONFIG, t),
})

export const useChartOfAccountsFormOptions = () => {
  const { t } = useTranslation()

  const ledgerAccountTypesOptions = useMemo(() => buildLedgerAccountTypesOptions(t), [t])
  const normalityOptions = useMemo(() => buildNormalityOptions(t), [t])
  const ledgerAccountSubtypesForType = useMemo(() => buildLedgerAccountSubtypesForType(t), [t])

  return {
    ledgerAccountTypesOptions,
    normalityOptions,
    ledgerAccountSubtypesForType,
  }
}
