import { useTranslation } from 'react-i18next'

import { type TaxOverviewApiData } from '@schemas/taxEstimates/overview'
import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'

import '@components/TaxOverview/taxOverview.scss'

const TaxOverviewHeader = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const { isDesktop } = useSizeClass()
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
      isMobile={!isDesktop}
    />
  )
}

const TaxOverviewContent = ({ data }: { data: TaxOverviewApiData }) => {
  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard
        totalIncome={data.totalIncome}
        totalDeductions={data.totalDeductions}
      />
    </VStack>
  )
}

export const TaxOverview = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  return (
    <ResponsiveDetailView name='TaxOverview' slots={{ Header: TaxOverviewHeader }}>
      {data && <TaxOverviewContent data={data} />}
    </ResponsiveDetailView>
  )
}
