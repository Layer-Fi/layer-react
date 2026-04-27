import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'
import { TaxDeadlinesCard } from '@components/TaxOverview/TaxDeadlinesCard'

import '@components/TaxOverview/taxOverview.scss'

export const TAX_OVERVIEW_MOBILE_BREAKPOINT = 1200

export const TaxOverview = () => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth < TAX_OVERVIEW_MOBILE_BREAKPOINT

  if (isMobile) {
    return (
      <VStack className='Layer__TaxOverview' gap='md'>
        <TaxEstimatesHeader type={TaxEstimatesHeaderType.Overview} />
        <TaxableIncomeCard />
        <TaxEstimatesSummaryCard />
        <TaxDeadlinesCard />
      </VStack>
    )
  }
  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <HStack gap='md' align='start'>
        <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
          <TaxableIncomeCard />
          <TaxEstimatesSummaryCard />
        </VStack>
        <VStack className='Layer__TaxOverview__SecondaryColumn'>
          <TaxDeadlinesCard />
        </VStack>
      </HStack>
    </VStack>
  )
}
