import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TAX_OVERVIEW_MOBILE_BREAKPOINT } from '@components/TaxOverview/constants'
import { TaxDeadlinesCard } from '@components/TaxOverview/TaxDeadlinesCard'
import { TaxEstimatesSummaryDetailCard } from '@components/TaxOverview/TaxEstimatesSummaryDetailCard'
import { TaxEstimatesTaxableIncomeCard } from '@components/TaxOverview/TaxEstimatesTaxableIncomeCard'

import '@components/TaxOverview/taxOverview.scss'

export const TaxOverview = () => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth < TAX_OVERVIEW_MOBILE_BREAKPOINT

  if (isMobile) {
    return (
      <VStack className='Layer__TaxOverview' gap='md'>
        <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />
        <TaxEstimatesSummaryDetailCard />
        <TaxEstimatesTaxableIncomeCard />
        <TaxDeadlinesCard />
      </VStack>
    )
  }
  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <HStack gap='md' align='start'>
        <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
          <TaxEstimatesSummaryDetailCard />
          <TaxEstimatesTaxableIncomeCard />
        </VStack>
        <VStack className='Layer__TaxOverview__SecondaryColumn'>
          <TaxDeadlinesCard />
        </VStack>
      </HStack>
    </VStack>
  )
}
