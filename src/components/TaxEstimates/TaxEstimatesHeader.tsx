import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { type Spacing } from '@ui/sharedUITypes'
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

type TaxEstimatesHeaderHookResponse = {
  title: string
  description: string
}

const useTaxEstimatesHeaderHook = ({ type }: TaxEstimatesHeaderProps): TaxEstimatesHeaderHookResponse => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const formattedYear = formatDate(new Date(year, 0, 1), DateFormat.Year)

  switch (type) {
    case TaxEstimatesHeaderType.Overview:
      return {
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
          year: formattedYear,
        }),
      }
    case TaxEstimatesHeaderType.Estimates:
      return {
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
      }
    case TaxEstimatesHeaderType.Payments:
      return {
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
          year: formattedYear,
        }),
      }
    default:
      return {
        title: '',
        description: '',
      }
  }
}

export const TaxEstimatesHeader = ({ type }: TaxEstimatesHeaderProps) => {
  const { isMobile } = useSizeClass()
  const { title, description } = useTaxEstimatesHeaderHook({ type })

  const commonProps = {
    gap: 'md' as Spacing,
    justify: 'space-between' as const,
    align: 'start' as const,
    fluid: true,
    pie: 'lg' as Spacing,
    className: 'Layer__TaxEstimatesHeader',
    direction: 'row' as const,
  }

  const dynamicProps = isMobile
    ? {
      ...commonProps,
      direction: 'column' as const,
    }
    : commonProps

  return (
    <Stack {...dynamicProps}>
      <ResponsiveDetailHeader title={title} description={description} />
      <HStack justify='end' className='Layer__TaxEstimatesHeader__ComboBoxContainer'>
        <FullYearProjectionComboBox />
      </HStack>
    </Stack>
  )
}
