import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'

import '@components/TaxOverview/taxOverview.scss'

import { TaxDeadlinesCard, type TaxDeadlinesCardProps } from './TaxDeadlinesCard'

const TaxOverviewHeader = () => {
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

export type TaxOverviewProps = TaxDeadlinesCardProps

export const TaxOverview = ({ onTaxBannerReviewClick }: TaxOverviewProps) => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth <= 1440
  if (!isMobile) {
    return (
      <VStack className='Layer__TaxOverview' gap='md'>
        <HStack className='Layer__TaxOverview__DesktopLayout' gap='md' align='start'>
          <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
            <TaxableIncomeCard />
            <TaxEstimatesSummaryCard />
          </VStack>
          <VStack className='Layer__TaxOverview__SecondaryColumn'>
            <TaxDeadlinesCard onTaxBannerReviewClick={onTaxBannerReviewClick} />
          </VStack>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard />
      <TaxEstimatesSummaryCard />
      <TaxDeadlinesCard />
    </VStack>
  )
}
