import { useTranslation } from 'node_modules/react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'

export const TaxOverviewHeader = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  const formattedYear = formatDate(new Date(year, 0, 1), DateFormat.Year)

  const taxableIncomeTitle = tConditional(t, 'taxEstimates:label.taxable_income_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income for {{year}}',
      projected: 'Projected taxable income for {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year: formattedYear,
  })

  const taxableIncomeDescription = tConditional(t, 'taxEstimates:label.taxable_income_estimate_to_date_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income estimate to date for year {{year}}',
      projected: 'Taxable income projection for year {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year: formattedYear,
  })
  return (
    <TaxEstimatesHeader
      title={taxableIncomeTitle}
      description={taxableIncomeDescription}
    />
  )
}
