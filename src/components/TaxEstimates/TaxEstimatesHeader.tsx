import { useMemo } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, Stack } from '@ui/Stack/Stack'
import { ResponsiveDetailHeader } from '@components/ResponsiveDetailView/ResponsiveDetailHeader'
import { FullYearProjectionComboBox } from '@components/TaxEstimates/FullYearProjectionComboBox/FullYearProjectionComboBox'

import './taxEstimatesHeader.scss'

export enum TaxEstimatesHeaderType {
  Overview = 'overview',
  Estimates = 'estimates',
  Payments = 'payments',
}

export type TaxEstimatesHeaderProps = {
  type: TaxEstimatesHeaderType
}

type TaxEstimatesHeaderConfig = {
  title: string
  description: string
}

const createTaxEstimatesHeaderConfig = ({
  t,
  projectedCondition,
  formattedYear,
}: {
  t: TFunction
  projectedCondition: 'default' | 'projected'
  formattedYear: string
}): Record<TaxEstimatesHeaderType, TaxEstimatesHeaderConfig> => ({
  [TaxEstimatesHeaderType.Overview]: {
    title: tConditional(t, 'taxEstimates:label.taxable_income_for_year', {
      condition: projectedCondition,
      cases: {
        default: 'Taxable income for {{year}}',
        projected: 'Projected taxable income for {{year}}',
      },
      contexts: {
        projected: 'projected',
      },
      year: formattedYear,
    }),
    description: tConditional(t, 'taxEstimates:label.taxable_income_estimate_to_date_for_year', {
      condition: projectedCondition,
      cases: {
        default: 'Taxable income estimate to date for year {{year}}',
        projected: 'Taxable income projection for year {{year}}',
      },
      contexts: {
        projected: 'projected',
      },
      year: formattedYear,
    }),
  },
  [TaxEstimatesHeaderType.Estimates]: {
    title: tConditional(t, 'taxEstimates:label.business_income_taxes', {
      condition: projectedCondition,
      cases: {
        default: 'Business Income Taxes',
        projected: 'Projected Business Income Taxes',
      },
      contexts: {
        projected: 'projected',
      },
    }),
    description: t('taxEstimates:label.calculated_from_categorized_transactions', 'Calculated based on your categorized transactions and tracked mileage'),
  },
  [TaxEstimatesHeaderType.Payments]: {
    title: tConditional(t, 'taxEstimates:label.tax_payments', {
      condition: projectedCondition,
      cases: {
        default: 'Tax Payments',
        projected: 'Projected Tax Payments',
      },
      contexts: {
        projected: 'projected',
      },
      year: formattedYear,
    }),
    description: tConditional(t, 'taxEstimates:label.federal_state_tax_payments', {
      condition: projectedCondition,
      cases: {
        default: 'Federal and state tax payments for the selected tax year',
        projected: 'Projected federal and state tax payments for the selected tax year',
      },
      contexts: {
        projected: 'projected',
      },
      year: formattedYear,
    }),
  },
})

const useTaxEstimatesHeader = ({ type }: TaxEstimatesHeaderProps): TaxEstimatesHeaderConfig => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const formattedYear = formatDate(new Date(year, 0, 1), DateFormat.Year)

  const headerConfig = useMemo(
    () => createTaxEstimatesHeaderConfig({ t, projectedCondition, formattedYear }),
    [t, projectedCondition, formattedYear],
  )

  return headerConfig[type]
}

export const TaxEstimatesHeader = ({ type }: TaxEstimatesHeaderProps) => {
  const { isMobile } = useSizeClass()
  const { title, description } = useTaxEstimatesHeader({ type })

  return (
    <Stack className='Layer__TaxEstimatesHeader' direction={isMobile ? 'column' : 'row'} gap='md' justify='space-between' align='start' fluid pie={isMobile ? undefined : 'lg'}>
      <ResponsiveDetailHeader title={title} description={description} />
      <HStack justify={isMobile ? 'start' : 'end'} className='Layer__TaxEstimatesHeader__ComboBoxContainer'>
        <FullYearProjectionComboBox />
      </HStack>
    </Stack>
  )
}
